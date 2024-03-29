import Body from "./body";
import Entity, { EntityRenderOptions, PHYSICS_STEP, PHYSICS_TRAJECTORY_BUFFER_SIZE, Vector2 } from "./entity";
import Inputs from "./inputs";
import { OrbitTaskData } from "./level";
import Orbits, { OrbitsState } from "./orbits";


export default class Rocket extends Entity {

    
    private pointDirection (dir: number, delta: number) {
        const angle = Math.atan2(this.velocity.x * dir, this.velocity.y * dir);
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

    override update (deltaTime: number) {

        const deltaMp = deltaTime / PHYSICS_STEP * 2;
        const step = PHYSICS_STEP;

        Entity.entities.forEach(ent => {
            if (ent instanceof Body) {
                const distanceX = ent.position.x - this.position.x;
                const distanceY = ent.position.y - this.position.y;
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
                const force = ent.mass / (distance ** 2);
                const forceX = force * (distanceX / distance);
                const forceY = force * (distanceY / distance);

                this.velocity.x += forceX * step * deltaMp;
                this.velocity.y += forceY * step * deltaMp;
            }
        });

        // Disable inputs on screens
        if(Orbits.state === OrbitsState.GAME) {
            if (Inputs.isKeyDown('ArrowLeft') || Inputs.isKeyDown('a')) {
                this.rotation -= 120 * deltaTime;
            }
            else if (Inputs.isKeyDown('ArrowRight') || Inputs.isKeyDown('d')) {
                this.rotation += 120 * deltaTime;
            }
    
            if (Inputs.isKeyDown(' ')) {
                const thrust = 1;
                const directionVector = {
                    x: Math.sin((Math.PI / 180) * this.rotation),
                    y: Math.cos((Math.PI / 180) * this.rotation),
                }
                this.velocity.x += thrust * directionVector.x * step * deltaMp;
                this.velocity.y += thrust * directionVector.y * step * deltaMp;
            }
    
            if(Inputs.isKeyDown('s')) {
                this.pointDirection(-1, deltaTime);
            }
            else if(Inputs.isKeyDown('w')) {
                this.pointDirection(1, deltaTime);
            }
        }


        this.position.x += this.velocity.x * step * deltaMp;
        this.position.y += this.velocity.y * step * deltaMp;

        for(let ent of Entity.entities) {
            if (ent instanceof Body) {
                // Calculate distance between rocket and body
                // If the distance is less than the body's size, the rocket has crashed
                const distanceX = ent.position.x - this.position.x;
                const distanceY = ent.position.y - this.position.y;
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
                if(distance < ent.size.x) {
                    Orbits.endGame(false)
                    break;
                }
                
                // Check tasks
                if(ent.tasks) {
                    for(let t in ent.tasks) {
                        const task = ent.tasks[t];
                        if(task.completed)
                            continue;

                        if(t === 'orbit') {
                            const orbitTask: OrbitTaskData = task as OrbitTaskData;
                            if(distance < orbitTask.radius) {
                                if(!orbitTask.enterTime) {
                                    orbitTask.enterTime = Date.now();
                                }
                                else {
                                    if(Date.now() - orbitTask.enterTime > orbitTask.time) {
                                        task.completed = true;
                                    }
                                }
                            }
                            else {
                                orbitTask.enterTime = undefined;
                            }
                        }
                    }
                }
            }
        }
        
        this.rotation = this.rotation % 360;

        this.simulateTrajectory();
    }

    override render (options: EntityRenderOptions) {
        const { ctx, eScreenPosition, eScreenSize } = options;

        this.renderOrbit(options, 'rgba(255, 255, 255, 1)');

        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';

        ctx.save();
        ctx.translate(eScreenPosition.x, eScreenPosition.y);
        ctx.rotate((Math.PI / 180) * this.rotation);
        ctx.beginPath();
        ctx.moveTo(-eScreenSize.x / 2, eScreenSize.y / 2);
        ctx.lineTo(eScreenSize.x / 2, eScreenSize.y / 2);
        ctx.lineTo(0, -eScreenSize.y / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    override simulateTrajectory () {
        const orbitPoints: Vector2[] = [];
        const step = PHYSICS_STEP;
        const vel = { x: this.velocity.x, y: this.velocity.y };
        const pos = { x: this.position.x, y: this.position.y };

        for (let i = 0; i < PHYSICS_TRAJECTORY_BUFFER_SIZE; i++) {
            let exit = false;
            for(let ent of Entity.entities) {
                if (ent instanceof Body) {
                    let px = ent.position.x;
                    let py = ent.position.y;

                    if(ent.orbitPoints.length > i) {
                        px = ent.orbitPoints[i].x;
                        py = ent.orbitPoints[i].y;
                    }
                    
                    const distanceX = px - pos.x;
                    const distanceY = py - pos.y;
                    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

                    if(distance < ent.size.x) {
                        exit = true;
                        break;
                    }

                    const force = ent.mass / (distance ** 2);
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

}