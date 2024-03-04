
const idCounter = 0;

class Body extends Element {

    mass = 0;

    /**
     * @type {Body | null}
     */
    orbitBody = null;

    tasks = {};

    /**
     * 
     * @param {number} mass 
     * @param {number} size 
     * @param {{x: number, y: number}} position 
     */
    constructor (mass, size, position, id) {
        super(position, { width: size, height: size });
        this.id = id ? id : `body-${idCounter++}`;
        this.mass = mass;

        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
    }

    update (delta) {
        const deltaMp = 0.5;

        this.simulateOrbit();
        if(this.orbitBody !== null) {

            // Calculate orbit relative to the orbit body
            const distanceX = this.position.x - this.orbitBody.position.x;
            const distanceY = this.position.y - this.orbitBody.position.y;
            const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
            const force = this.orbitBody.mass / (distance ** 2);
            const forceX = force * (distanceX / distance);
            const forceY = force * (distanceY / distance);

            this.velocity.x -= forceX * Element.physicsStep * deltaMp;
            this.velocity.y -= forceY * Element.physicsStep * deltaMp;    
        }
        
        this.position.x += this.velocity.x * Element.physicsStep * deltaMp;
        this.position.y += this.velocity.y * Element.physicsStep * deltaMp;

    }

    simulateOrbit() {
        const orbitPoints = [];
        const step = Element.physicsStep;
        const vel = { x: this.velocity.x, y: this.velocity.y };
        const pos = { x: this.position.x, y: this.position.y };

        for (let i = 0; i < Element.simBufferSize; i++) {
            if(this.orbitBody) {
                const distanceX = this.orbitBody.orbitPoints[i].x - pos.x;
                const distanceY = this.orbitBody.orbitPoints[i].y - pos.y;
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
                const force = this.orbitBody.mass / (distance ** 2);
                const forceX = force * (distanceX / distance);
                const forceY = force * (distanceY / distance);

                vel.x += forceX * step;
                vel.y += forceY * step;
                pos.x += vel.x * step;
                pos.y += vel.y * step;

                orbitPoints.push({ x: pos.x, y: pos.y });
            }
            else {
                orbitPoints.push({ x: pos.x, y: pos.y });
            }
            
        }

        this.orbitPoints = orbitPoints;
    }

    renderOrbit(options) {
        const { ctx } = options;
        ctx.strokeStyle = '#555';
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
    }
    

    /**
     * 
     * @param {ElementRenderOptions} options 
     */
    render (options) {
        const { ctx } = options;

        if(this.orbitPoints.length > 0) {
            this.renderOrbit(options);
        }

        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';

        ctx.beginPath();
        const cameraX = (this.position.x - options.cameraPosition.x) * options.cameraSize + options.canvas.width / 2;
        const cameraY = (options.cameraPosition.y - this.position.y) * options.cameraSize + options.canvas.height / 2;
        const cameraWidth = this.size.width * options.cameraSize;

        ctx.arc(cameraX, cameraY, cameraWidth, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        if(this.tasks.orbit) 
            this.renderHalo(options, this.tasks.orbit);

    }

    
    renderHalo (options, task) {
        const { ctx } = options;

        const timeRad = (Date.now() / 10000) % (2 * Math.PI);

        ctx.strokeStyle = task.enterTime ? '#383' : '#555';
        ctx.setLineDash([2, 5]); // Set the line dash pattern to create a dotted line
        ctx.beginPath();
        const cameraX = (this.position.x - options.cameraPosition.x) * options.cameraSize + options.canvas.width / 2;
        const cameraY = (options.cameraPosition.y - this.position.y) * options.cameraSize + options.canvas.height / 2;
        const cameraRadius = options.cameraSize * this.tasks.orbit.radius; 
        ctx.arc(cameraX, cameraY, cameraRadius, timeRad, timeRad + 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]); // Reset the line dash pattern to solid line
    }
}