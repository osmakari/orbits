import Entity, { EntityRenderOptions, PHYSICS_STEP, PHYSICS_TRAJECTORY_BUFFER_SIZE, Vector2 } from "./entity";
import { OrbitTaskData } from "./level";

export default class Body extends Entity {

    orbitBody: Body | null = null;

    override update (deltaTime: number) {

        const deltaMp = deltaTime / PHYSICS_STEP * 2;

        if(this.orbitBody !== null) {

            // Calculate orbit relative to the orbit body
            const distanceX = this.position.x - this.orbitBody.position.x;
            const distanceY = this.position.y - this.orbitBody.position.y;
            const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
            const force = this.orbitBody.mass / (distance ** 2);
            const forceX = force * (distanceX / distance);
            const forceY = force * (distanceY / distance);

            this.velocity.x -= forceX * PHYSICS_STEP * deltaMp;
            this.velocity.y -= forceY * PHYSICS_STEP * deltaMp;    
        }
        
        this.position.x += this.velocity.x * PHYSICS_STEP * deltaMp;
        this.position.y += this.velocity.y * PHYSICS_STEP * deltaMp;

        this.simulateTrajectory();
    }

    override render (options: EntityRenderOptions) {
        const { ctx, eScreenPosition, eScreenSize } = options;

        if(this.orbitPoints.length > 0) {
            this.renderOrbit(options);
        }

        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';

        ctx.beginPath();
        ctx.arc(eScreenPosition.x, eScreenPosition.y, eScreenSize.x, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        
        if(this.tasks.orbit) 
            this.renderHalo(options, this.tasks.orbit as OrbitTaskData);
    }

    renderHalo (options: EntityRenderOptions, task: OrbitTaskData) {
        const { ctx } = options;

        const timeRad = (Date.now() / 10000) % (2 * Math.PI);

        ctx.strokeStyle = task.enterTime ? '#383' : '#555';
        ctx.setLineDash([2, 5]); // Set the line dash pattern to create a dotted line
        ctx.beginPath();
        const cameraX = (this.position.x - options.cameraPosition.x) * options.cameraSize + options.canvas.width / 2;
        const cameraY = (options.cameraPosition.y - this.position.y) * options.cameraSize + options.canvas.height / 2;
        const cameraRadius = options.cameraSize * task.radius; 
        ctx.arc(cameraX, cameraY, cameraRadius, timeRad, timeRad + 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]); // Reset the line dash pattern to solid line
    }

    override simulateTrajectory () {
        const orbitPoints: Vector2[] = [];
        const step = PHYSICS_STEP;
        const vel = { x: this.velocity.x, y: this.velocity.y };
        const pos = { x: this.position.x, y: this.position.y };

        for (let i = 0; i < PHYSICS_TRAJECTORY_BUFFER_SIZE; i++) {
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

}