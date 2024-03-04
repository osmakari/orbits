
/**
 * @typedef {{
 *  cameraPosition: { x: number, y: number },
 *  cameraSize: number,
 *  canvas: HTMLCanvasElement,
 *  ctx: CanvasRenderingContext2D
 * }} ElementRenderOptions
 */

function a2rad (angle) {
    return (angle * Math.PI) / 180;
}

function rad2a (radians) {
    return (radians * 180) / Math.PI;
}

function normalize (vector) {
    const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    return { x: vector.x / length, y: vector.y / length };
}

class Element {

    position = { x: 0, y: 0};
    rotation = 0;
    size = { width: 0, height: 0 };
    velocity = { x: 0, y: 0 };

    /**
     * @type {{x: number, y: number}[]}
     */
    orbitPoints = [];

    id = "";

    static physicsStep = 0.016;

    static simBufferSize = 1000;

    /**
     * 
     * @param {{x: number, y: number}} position
     * @param {{width: number, height: number}} size
     */
    constructor (position, size) {

        this.position = position;
        this.size = size;

        this.render = this.render.bind(this);

        elements.push(this);
    }

    /**
     * 
     * @param {ElementRenderOptions} options 
     */
    render (options) {
        // This should be overridden
    }

    /**
     * 
     * @param {number} delta 
     */
    update (delta) {
        // This should be overridden
    }


    /**
     * 
     * @param {ControlInputs} inputs 
     */
    handleInput (inputs) {
        // This should be overridden
    }

}