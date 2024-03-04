
class Rocket extends Element {

    lastFrameInputs = {
        up: false,
        down: false,
        left: false,
        right: false,
        space: false,
    }
    inputs = {
        up: false,
        down: false,
        left: false,
        right: false,
        space: false,
    }

    isPlayer = true;

    playerName = '';

    pointingPrograde = true;

    constructor(position, size) {
        super(position, size);

        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    /**
     * 
     * @param {ControlInputs} inputs 
     */
    handleInput(inputs) {
        if(!this.isPlayer)
            return;

        this.inputs = inputs;
    }

    rotateProRetrograde(delta) {
        const angle = Math.atan2(this.pointingPrograde ? this.velocity.x : -this.velocity.x, this.pointingPrograde ? this.velocity.y : -this.velocity.y);
        const targetAngle = (angle * 180) / Math.PI;
        const rotationSpeed = 120; // adjust the rotation speed as desired
        const maxRotationDelta = rotationSpeed * delta;
        let angleDelta = targetAngle - this.rotation;

        if (angleDelta > 180) {
            angleDelta -= 360;
        } else if (angleDelta < -180) {
            angleDelta += 360;
        }

        const rotationDirection = Math.sign(angleDelta);
        const rotationAmount = rotationDirection * Math.min(Math.abs(angleDelta), maxRotationDelta);
        this.rotation += rotationAmount;
    }

    update(delta) {
        const deltaMp = 0.5;

        elements.forEach(element => {
            if (element instanceof Body) {
                const distanceX = element.position.x - this.position.x;
                const distanceY = element.position.y - this.position.y;
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
                const force = element.mass / (distance ** 2);
                const forceX = force * (distanceX / distance);
                const forceY = force * (distanceY / distance);

                this.velocity.x += forceX * Element.physicsStep * deltaMp;
                this.velocity.y += forceY * Element.physicsStep * deltaMp;
            }
        });

        if (this.inputs.left) {
            this.rotation -= 120 * delta;
        }
        else if (this.inputs.right) {
            this.rotation += 120 * delta;
        }

        if (this.inputs.up) {
            const thrust = 1;
            const directionVector = {
                x: Math.sin((Math.PI / 180) * this.rotation),
                y: Math.cos((Math.PI / 180) * this.rotation),
            }
            this.velocity.x += thrust * directionVector.x * Element.physicsStep * deltaMp;
            this.velocity.y += thrust * directionVector.y * Element.physicsStep * deltaMp;
        }

        if(this.inputs.down && !this.lastFrameInputs.down) {
            this.pointingPrograde = !this.pointingPrograde;
        }

        this.position.x += this.velocity.x * Element.physicsStep * deltaMp;
        this.position.y += this.velocity.y * Element.physicsStep * deltaMp;

        for(let element of elements) {
            if (element instanceof Body) {
                // Calculate distance between rocket and body
                // If the distance is less than the body's size, the rocket has crashed
                const distanceX = element.position.x - this.position.x;
                const distanceY = element.position.y - this.position.y;
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
                if(distance < element.size.width) {
                    onKill();
                    break;
                }

                // Check tasks
                if(element.tasks) {
                    for(let t in element.tasks) {
                        const task = element.tasks[t];
                        if(task.completed)
                            continue;

                        if(t === 'orbit') {
                            if(distance < task.radius) {
                                if(!task.enterTime) {
                                    task.enterTime = Date.now();
                                }
                                else {
                                    if(Date.now() - task.enterTime > task.time * 1000) {
                                        task.completed = true;
                                    }
                                }
                            }
                            else {
                                task.enterTime = undefined;
                            }
                        }
                    }
                }
            }
        }

        if (this.inputs.space) {
            this.rotateProRetrograde(delta);
        }

        this.rotation = this.rotation % 360;

        this.lastFrameInputs = { ...this.inputs };
    }

    simulateOrbit() {
        const orbitPoints = [];
        const step = Element.physicsStep;
        const vel = { x: this.velocity.x, y: this.velocity.y };
        const pos = { x: this.position.x, y: this.position.y };

        for (let i = 0; i < Element.simBufferSize; i++) {
            let exit = false;
            for(let element of elements) {
                if (element instanceof Body) {
                    let px = element.position.x;
                    let py = element.position.y;

                    if(element.orbitPoints.length > i) {
                        px = element.orbitPoints[i].x;
                        py = element.orbitPoints[i].y;
                    }
                    
                    const distanceX = px - pos.x;
                    const distanceY = py - pos.y;
                    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

                    if(distance < element.size.width) {
                        exit = true;
                        break;
                    }

                    const force = element.mass / (distance ** 2);
                    const forceX = force * (distanceX / distance);
                    const forceY = force * (distanceY / distance);

                    vel.x += forceX * step;
                    vel.y += forceY * step;
                    
                }
            }

            if(exit) 
                break;

            orbitPoints.push({ x: pos.x, y: pos.y });
            pos.x += vel.x * step;
            pos.y += vel.y * step;
        }
        
        this.orbitPoints = orbitPoints;
    }

    renderOrbit(options) {
        if(this.orbitPoints.length === 0)
            return;

        const { ctx } = options;
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        this.orbitPoints.forEach((point, index) => {
            const cameraX = (point.x - options.cameraPosition.x) * options.cameraSize + options.canvas.width / 2;
            const cameraY = (options.cameraPosition.y - point.y) * options.cameraSize + options.canvas.height / 2;
            if (index === 0) {
                ctx.moveTo(cameraX, cameraY);
            } else {
                ctx.lineTo(cameraX, cameraY);
            }
        });
        ctx.stroke();

        if (this.orbitPoints.length < Element.simBufferSize) {
            const lastPoint = this.orbitPoints[this.orbitPoints.length - 1];
            const cameraX = (lastPoint.x - options.cameraPosition.x) * options.cameraSize + options.canvas.width / 2;
            const cameraY = (options.cameraPosition.y - lastPoint.y) * options.cameraSize + options.canvas.height / 2;
            const markerSize = 5;

            ctx.strokeStyle = '#F00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cameraX - markerSize, cameraY - markerSize);
            ctx.lineTo(cameraX + markerSize, cameraY + markerSize);
            ctx.moveTo(cameraX - markerSize, cameraY + markerSize);
            ctx.lineTo(cameraX + markerSize, cameraY - markerSize);
            ctx.stroke();
        }
    }

    /**
     * 
     * @param {ElementRenderOptions} options 
     */
    render(options) {
        const { ctx } = options;
        const { width, height } = this.size;

        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';

        const cameraX = (this.position.x - options.cameraPosition.x) * options.cameraSize + options.canvas.width / 2;
        const cameraY = (options.cameraPosition.y - this.position.y) * options.cameraSize + options.canvas.height / 2;
        const cameraWidth = width * options.cameraSize;
        const cameraHeight = height * options.cameraSize;

        const pivotX = cameraX + cameraWidth / 2;
        const pivotY = cameraY + cameraHeight / 2;

        ctx.save();
        ctx.translate(pivotX - cameraWidth / 2, pivotY - cameraHeight / 2);
        ctx.rotate((Math.PI / 180) * this.rotation);
        ctx.beginPath();
        ctx.moveTo(-cameraWidth / 2, cameraHeight / 2);
        ctx.lineTo(cameraWidth / 2, cameraHeight / 2);
        ctx.lineTo(0, -cameraHeight / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();


        this.simulateOrbit();
        this.renderOrbit(options);

        // Draw player name
        ctx.font = '8px monospace';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'center';
        ctx.fillText(this.playerName, cameraX + cameraWidth / 2, cameraY - 10);

        this.renderUI(options);
    }

    renderUI (options) {

        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.lineWidth = 2;
        
        ctx.fillStyle = this.pointingPrograde ? 'white' : '#333';
        ctx.strokeStyle = this.pointingPrograde ? 'white' : '#333';
        ctx.fillText('PRO', options.canvas.width - 50, 23, 70);
        ctx.strokeRect(options.canvas.width - 85, 10, 70, 20);


        ctx.fillStyle = !this.pointingPrograde ? 'white' : '#333';
        ctx.strokeStyle = !this.pointingPrograde ? 'white' : '#333';
        ctx.fillText('RETRO', options.canvas.width - 50, 45, 70);
        ctx.strokeRect(options.canvas.width - 85, 32, 70, 20);
    }
}