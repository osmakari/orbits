
export type Vector2 = {
    x: number,
    y: number
};

export type EntityRenderOptions = {
    cameraPosition:     Vector2,
    cameraSize:         number,
    // Center position of the entity in screen coordinates
    eScreenPosition:    Vector2,
    // Size of the entity on the screen
    eScreenSize:        Vector2,
    canvas:             HTMLCanvasElement,
    ctx:                CanvasRenderingContext2D;
};

export const PHYSICS_STEP = 0.02;
export const PHYSICS_TRAJECTORY_BUFFER_SIZE = 5000;

export default class Entity {

    private static idCounter: number = 0;

    public static entities: Entity[] = [];

    id: string = '';

    position: Vector2 = {
        x: 0,
        y: 0
    }

    rotation: number = 0;

    mass: number = 1;

    size: Vector2 = {
        x: 1,
        y: 1
    }

    velocity: Vector2 = {
        x: 0,
        y: 0
    }

    orbitPoints: Vector2[] = [];

    constructor(position?: Vector2, rotation?: number, size?: Vector2, velocity?: Vector2) {
        this.id = `e-${Entity.idCounter++}`;
        if (position) this.position = position;
        if (rotation) this.rotation = rotation;
        if (size) this.size = size;
        if (velocity) this.velocity = velocity;

        this.renderOrbit = this.renderOrbit.bind(this);

        Entity.entities.push(this);
    }

    simulateTrajectory () {
        // This should be overridden
    }

    destroy () {
        Entity.entities = Entity.entities.filter(e => e.id !== this.id);
    }

    update (deltaTime: number) {
        // This should be overridden
    }

    render (options: EntityRenderOptions) {
        // This should be overridden
    }

    renderOrbit (options: EntityRenderOptions, color: string = 'rgba(255, 255, 255, 0.3)') {
        const { ctx, eScreenPosition } = options;

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(eScreenPosition.x, eScreenPosition.y);
        console.log(options);
        this.orbitPoints.forEach(point => {
            const x = (point.x - options.cameraPosition.x) * options.cameraSize + options.canvas.width / 2;
            const y = (options.cameraPosition.y - point.y) * options.cameraSize + options.canvas.height / 2;
            ctx.lineTo(x, y);
        });
        ctx.stroke();

        if (this.orbitPoints.length < PHYSICS_TRAJECTORY_BUFFER_SIZE) {
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
}