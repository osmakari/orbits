import Body from "./body";
import Entity, { Vector2 } from "./entity";
import Inputs from "./inputs";
import Level from "./level";
import Rocket from "./rocket";
import UI from "./ui";

export enum OrbitsState {
    GAME,
    FAILSCREEN,
    WINSCREEN
}

export interface RenderOptions {
    cameraPosition: Vector2;
    cameraSize: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}

export default class Orbits {
    // Canvas
    private static canvas: HTMLCanvasElement;

    // Context
    private static ctx: CanvasRenderingContext2D;

    // Camera position
    private static cameraPosition = { x: 0, y: 0 };
    // Camera size
    private static cameraSize = 10;

    private static lastFrameTime = Date.now();

    public static state: OrbitsState = OrbitsState.GAME;

    public static init() {
        // Get canvas
        Orbits.canvas = document.getElementById('orbits-canvas') as HTMLCanvasElement;
        // Get context
        // @ts-ignore Context may be null, so ignore this for ease of use of ctx
        Orbits.ctx = Orbits.canvas.getContext('2d');

        Orbits.ctx.imageSmoothingEnabled = false;
        Orbits.ctx.imageSmoothingQuality = 'high';

        // Update canvas size
        Orbits.updateCanvasSize();

        // Add event listener to update canvas size
        window.addEventListener('resize', Orbits.updateCanvasSize);

        // Init inputs
        Inputs.init(Orbits.canvas);

        // Load level
        Level.load('levels/level3.json');

        // Start loop
        Orbits.update();
    }

    private static updateCanvasSize() {
        Orbits.canvas.width = window.innerWidth;
        Orbits.canvas.height = window.innerHeight;
    }

    private static update() {
        const now = Date.now();
        for (let ent of Entity.entities) {
            ent.update((now - Orbits.lastFrameTime) / 1000);
        }
        Orbits.lastFrameTime = now;

        if(Orbits.state === OrbitsState.GAME) {
            if(Level.currentLevel) {
                if(Level.currentLevel.tasks.every(t => t.data.completed)) {
                    Orbits.endGame(true);
                }
            }
        }

        // Render
        Orbits.render();

        if(Inputs.isKeyPressed('r')) {
            Level.load(Level.currentLevel?.path || 'levels/level1.json');
        }

        // Reset inputs
        Inputs.update();


        // Loop
        requestAnimationFrame(Orbits.update);
    }

    private static render() {
        // Clear canvas
        Orbits.ctx.clearRect(0, 0, Orbits.canvas.width, Orbits.canvas.height);

        const options: RenderOptions = {
            cameraPosition: Orbits.cameraPosition,
            cameraSize: Orbits.cameraSize,
            canvas: Orbits.canvas,
            ctx: Orbits.ctx
        };

        // Render entities
        Entity.entities.forEach(e => e.render({
            ...options,
            eScreenPosition: {
                x: (e.position.x - Orbits.cameraPosition.x) * Orbits.cameraSize + Orbits.canvas.width / 2,
                y: (Orbits.cameraPosition.y - e.position.y) * Orbits.cameraSize + Orbits.canvas.height / 2
            },
            eScreenSize: {
                x: e.size.x * Orbits.cameraSize,
                y: e.size.y * Orbits.cameraSize
            }
        }));

        switch (Orbits.state) {
            case OrbitsState.GAME:
                if (Level.currentLevel) {
                    // Render UI
                    UI.renderTasks({
                        cameraPosition: Orbits.cameraPosition,
                        cameraSize: Orbits.cameraSize,
                        canvas: Orbits.canvas,
                        ctx: Orbits.ctx
                    }, Level.currentLevel.tasks);
                }
                break;
            case OrbitsState.FAILSCREEN:
                UI.renderFailScreen(options);
                break;
            case OrbitsState.WINSCREEN:
                UI.renderWinScreen(options);
                break;
        }
    }

    public static endGame (win: boolean) {
        if(Orbits.state === OrbitsState.GAME)
            Orbits.state = win ? OrbitsState.WINSCREEN : OrbitsState.FAILSCREEN;

        if(!win) {
            // Destroy rocket
            const rocket = Entity.entities.find(e => e instanceof Rocket) as Rocket;
            if(rocket) rocket.destroy();
        }
    }
}

window.addEventListener('load', Orbits.init);