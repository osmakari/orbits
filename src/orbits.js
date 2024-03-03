
/**
 * @type {HTMLCanvasElement}
 */
let canvas = null;

/**
 * @type {CanvasRenderingContext2D}
 */
let ctx = null;

/**
 * @type {Element[]}
 */
let elements = [];

/**
 * @typedef {{
 *  up: boolean,
 *  down: boolean,
 *  left: boolean,
 *  right: boolean,
 *  space: boolean
 * }} ControlInputs
 */

/**
 * @type {ControlInputs}
 */
const controls = {
    up: false,
    down: false,
    space: false
}

let lastUpdate = 0;

function updateCanvasSize () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initInputs () {
    window.addEventListener('keydown', event => {
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                controls.up = true;
                break;
            case 'ArrowDown':
            case 's':
                controls.down = true;
                break;
            case 'ArrowLeft':
            case 'a':
                controls.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                controls.right = true;
                break;
            case ' ':
                controls.space = true;
                break;
        }
    });

    window.addEventListener('keyup', event => {
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                controls.up = false;
                break;
            case 'ArrowDown':
            case 's':
                controls.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
                controls.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                controls.right = false;
                break;
            case ' ':
                controls.space = false;
                break;
        }
    });
    
    window.addEventListener('touchstart', event => {
        event.preventDefault();
        const touch = event.touches[0];
        if (touch.clientX < window.innerWidth / 2) {
            controls.left = true;
        } else {
            controls.right = true;
        }
    });

    window.addEventListener('touchend', event => {
        event.preventDefault();
        const touch = event.touches[0];
        if (touch.clientX < window.innerWidth / 2) {
            controls.left = false;
        } else {
            controls.right = false;
        }
    });
}

function init () {
    canvas = document.getElementById('orbits-canvas');
    ctx = canvas.getContext('2d');

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    initInputs();

    loadLevel('level1');

    lastUpdate = Date.now();
    update();
}

function onKill () {
    // Reload
    loadLevel('level1');
}

function loadLevel (level) {
    elements = [];
    
    fetch(`levels/${level}.json`)
        .then(response => response.json())
        .then(data => {
            const orbits = { };
            data.level.bodies.forEach(body => {
                const b = new Body(body.mass || 1, body.radius || 1, body.position || { x: 0, y: 0 }, body.id);
                if(body.orbits) {
                    orbits[b.id] = body.orbits;
                }
                b.velocity = body.velocity || { x: 0, y: 0 };
                if(body.tasks) {
                    b.tasks = body.tasks;
                }
            });

            if(data.level.player) {
                const player = data.level.player;
                const rct = new Rocket(player.position || { x: 0, y: 0 }, { width: 0.5, height: 0.75});
                rct.velocity = player.velocity || { x: 0, y: 0 };
                rct.rotation = player.rotation || 0;
            }
            
            Object.keys(orbits).forEach(bodyId => {
                const body = elements.find(e => e.id === bodyId);
                if(body) {
                    const orbitBody = elements.find(e => e.id === orbits[bodyId]);
                    body.orbitBody = orbitBody;
                }
            });
        });
}

function update () {
    const now = Date.now();
    elements.forEach(element => {
        element.handleInput(controls);
        element.update((now - lastUpdate) / 1000);
    });
    lastUpdate = now;

    render();
    requestAnimationFrame(update);
}

function render () {

    const options = {
        canvas,
        ctx,
        cameraPosition: { x: 0, y: 0 },
        cameraSize: 10
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
        element.render(options);
    });

    renderUI(options);
}

function renderUI (options) {
    let tasks = { };

    elements.filter(e => e instanceof Body).forEach(body => {
        tasks = { ...tasks, ...body.tasks };
    });

    const boxWidth = 170;
    const boxHeight = Object.keys(tasks).length * 52;

    ctx.font = '12px monospace';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.strokeRect(10, 10, boxWidth, boxHeight);
    ctx.fillText('Tasks', 15, 20);

    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(10 + boxWidth, 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(140, 10);
    ctx.lineTo(140, 10 + boxHeight);
    ctx.stroke();

    Object.keys(tasks).forEach((taskName, index) => {
        const task = tasks[taskName];
        const x = 15;
        const y = 40 + 20 * index;

        const lines = getLines(ctx, task.info, 120);
        
        for(let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y + 15 * i);
        }

        switch(taskName) {
            case 'orbit':
                if(task.completed) {
                    ctx.font = 'bold 18px monospace';
                    ctx.fillText('\u2713', 152, y + 7);
                }
                else if(task.enterTime) {
                    const time = Date.now() - task.enterTime;
                    const seconds = time / 1000;
                    const left = task.time - seconds;
                    const timeString = `${left.toFixed(1)}s`;
                    ctx.fillText(timeString, 145, y + 15 * (lines.length / 2));
                }
                break;
        }
    });
}

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

window.onload = init;