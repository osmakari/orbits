import Body from "./body";
import Entity from "./entity";
import Inputs from "./inputs";
import Rocket from "./rocket";

// Canvas
let canvas: HTMLCanvasElement;

// Context
let ctx: CanvasRenderingContext2D;

// Camera position
let cameraPosition = { x: 0, y: 0 };
// Camera size
let cameraSize = 10;

let lastFrameTime = Date.now();

// Updates canvas size
function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function init () {

    // Get canvas
    canvas = document.getElementById('orbits-canvas') as HTMLCanvasElement;
    // Get context
    // @ts-ignore Context may be null, so ignore this for ease of use of ctx
    ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'high';

    // Update canvas size
    updateCanvasSize();

    // Add event listener to update canvas size
    window.addEventListener('resize', updateCanvasSize);

    // Init inputs
    Inputs.init(canvas);

    const b = new Body({ x: 0, y: 0 }, 0, { x: 5, y: 5 });

    b.mass = 100;

    const r = new Rocket({ x: -30, y: 20 }, 0, { x: 0.5, y: 0.75 });

    r.velocity = { x: 2, y: 0.2 };

    // Start loop
    update();
}

function update () {
    
    const now = Date.now();
    for(let ent of Entity.entities) {
        ent.update((now - lastFrameTime) / 1000);
    }
    lastFrameTime = now;
    
    // Render
    render();

    // Reset inputs
    Inputs.update();

    // Loop
    requestAnimationFrame(update);
}

function render () {
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render entities
    Entity.entities.forEach(e => e.render({
        cameraPosition,
        cameraSize,
        eScreenPosition: {
            x: (e.position.x - cameraPosition.x) * cameraSize + canvas.width / 2,
            y: (cameraPosition.y - e.position.y) * cameraSize + canvas.height / 2
        },
        eScreenSize: {
            x: e.size.x * cameraSize,
            y: e.size.y * cameraSize
        },
        canvas,
        ctx
    }));
}

window.addEventListener('load', init);