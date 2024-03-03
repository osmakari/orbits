
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
let controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
    r: false
}

let lastControls = { ...controls };

let lastUpdate = 0;

let endScreen = false;
let winScreen = false;

let currentLevel = 'level1';

function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initInputs() {

    window.addEventListener('click', event => {
        handleLevelSelectMenuClick(event.clientX, event.clientY);
    });

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
            case 'r':
                controls.r = true;
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
            case 'r':
                controls.r = false;
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

function init() {
    canvas = document.getElementById('orbits-canvas');
    ctx = canvas.getContext('2d');

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    initInputs();

    loadLevel(currentLevel);

    lastUpdate = Date.now();
    update();
}

function onKill() {
    // Reload
    const rocket = elements.findIndex(e => e instanceof Rocket);
    elements.splice(rocket, 1);
    endScreen = true;

    // Go through all tasks and reset tasks
    elements.filter(e => e instanceof Body).forEach(body => {
        Object.keys(body.tasks).forEach(taskName => {
            const task = body.tasks[taskName];
            task.completed = false;
            task.enterTime = null;
        });
    });
}

function onWin() {
    const rocket = elements.findIndex(e => e instanceof Rocket);
    elements.splice(rocket, 1);
    winScreen = true;
}

function loadLevel(level) {
    elements = [];
    endScreen = false;
    winScreen = false;

    fetch(`levels/${level}.json`)
        .then(response => response.json())
        .then(data => {
            const orbits = {};
            currentLevel = level;
            data.level.bodies.forEach(body => {
                const b = new Body(body.mass || 1, body.radius || 1, body.position || { x: 0, y: 0 }, body.id);
                if (body.orbits) {
                    orbits[b.id] = body.orbits;
                }
                b.velocity = body.velocity || { x: 0, y: 0 };
                if (body.tasks) {
                    b.tasks = body.tasks;
                }
            });

            if (data.level.player) {
                const player = data.level.player;
                const rct = new Rocket(player.position || { x: 0, y: 0 }, { width: 0.5, height: 0.75 });
                rct.velocity = player.velocity || { x: 0, y: 0 };
                rct.rotation = player.rotation || 0;
            }

            Object.keys(orbits).forEach(bodyId => {
                const body = elements.find(e => e.id === bodyId);
                if (body) {
                    const orbitBody = elements.find(e => e.id === orbits[bodyId]);
                    body.orbitBody = orbitBody;
                }
            });
        });
}

function update() {
    const now = Date.now();

    if (controls.r && !lastControls.r) {
        loadLevel(currentLevel);
        endScreen = false;
    }

    elements.forEach(element => {
        element.handleInput(controls);
        element.update((now - lastUpdate) / 1000);
    });
    lastUpdate = now;

    render();
    requestAnimationFrame(update);

    // Check if all tasks are completed
    let allTasksCompleted = true;
    if (elements.length === 0)
        allTasksCompleted = false;

    elements.filter(e => e instanceof Body).forEach(body => {
        Object.keys(body.tasks).forEach((taskName, index) => {
            const task = body.tasks[taskName];

            if (!task.completed) {
                allTasksCompleted = false;
            }
        });
    });

    if (allTasksCompleted && !winScreen) {
        onWin();
    }

    lastControls = { ...controls };
}

function render() {

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

function renderUI(options) {

    renderLevelSelectMenu();
    renderControls();

    let tasks = [];

    elements.filter(e => e instanceof Body).forEach(body => {
        Object.keys(body.tasks).forEach(taskName => {
            const task = body.tasks[taskName];
            tasks.push({...task, type: taskName});
        });
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

    tasks.forEach((task, index) => {
        ctx.font = '12px monospace';
        const x = 15;
        
        const lines = getLines(ctx, task.info, 120);
        const y = 40 + (20 * lines.length) * index;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y + 15 * i);
        }

        switch (task.type) {
            case 'orbit':
                if (task.completed) {
                    ctx.font = 'bold 18px monospace';
                    ctx.fillText('\u2713', 152, y + 7);
                }
                else if (task.enterTime) {
                    const time = Date.now() - task.enterTime;
                    const seconds = time / 1000;
                    const left = task.time - seconds;
                    const timeString = `${left.toFixed(1)}s`;
                    ctx.fillText(timeString, 145, y + 15 * (lines.length / 2));
                }
                break;
        }
    });

    if (endScreen) {
        renderKillScreen(options);
    }

    if (winScreen) {
        renderWinScreen(options);
    }
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

function renderKillScreen(options) {
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('You died', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px monospace';
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);

    ctx.globalCompositeOperation = 'source-over';
}

function renderWinScreen(options) {
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('You win', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px monospace';
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);

    ctx.globalCompositeOperation = 'source-over';
}

const levels = [
    'level1',
    'level2',
    'level3',
    'level4',
];

const levelBoxSize = 25;
const levelBoxSpacing = 5;


function renderLevelSelectMenu() {

    const menuHeight = levelBoxSize + levelBoxSpacing * 2;
    const menuWidth = (levelBoxSize + levelBoxSpacing) * levels.length - levelBoxSpacing;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = canvas.height - menuHeight - 10;

    ctx.font = '12px monospace';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    levels.forEach((level, index) => {
        const levelBoxX = menuX + index * (levelBoxSize + levelBoxSpacing) + levelBoxSpacing;
        const levelBoxY = menuY + levelBoxSpacing;
        const levelBoxText = (index + 1).toString();

        ctx.strokeStyle = 'white';
        ctx.strokeRect(levelBoxX, levelBoxY, levelBoxSize, levelBoxSize);

        ctx.fillStyle = 'white';
        ctx.fillText(levelBoxText, levelBoxX + levelBoxSize / 2, levelBoxY + levelBoxSize / 2);
    });
}

function handleLevelSelectMenuClick(x, y) {

    const menuHeight = levelBoxSize + levelBoxSpacing * 2;
    const menuWidth = (levelBoxSize + levelBoxSpacing) * levels.length - levelBoxSpacing;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = canvas.height - menuHeight - 10;
    
    levels.forEach((level, index) => {
        const levelBoxX = menuX + index * (levelBoxSize + levelBoxSpacing) + levelBoxSpacing;
        const levelBoxY = menuY + levelBoxSpacing;

        if (x > levelBoxX && x < levelBoxX + levelBoxSize && y > levelBoxY && y < levelBoxY + levelBoxSize) {
            loadLevel(level);
        }
    });
}

function renderControls () {
    // Draw controls on the bottom right corner
    ctx.font = '12px monospace';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('w/up arrow: Boost', canvas.width - 10, canvas.height - 10);
    ctx.fillText('a/left arrow: Rotate left', canvas.width - 10, canvas.height - 25);
    ctx.fillText('d/right arrow: Rotate right', canvas.width - 10, canvas.height - 40);
    ctx.fillText('s: change pro/retrograde lock', canvas.width - 10, canvas.height - 55);
    ctx.fillText('space: lock pro/retrograde', canvas.width - 10, canvas.height - 70);
    ctx.fillText('r: Restart', canvas.width - 10, canvas.height - 85);
}

window.onload = init;