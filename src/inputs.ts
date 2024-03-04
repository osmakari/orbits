import { Vector2 } from "./entity";

export default class Inputs {

    public static mousePosition: Vector2 = { x: 0, y: 0 };

    private static mouseButtons: {[key: number]: boolean} = {};
    private static keys: {[key: string]: boolean} = {};

    // Flags for mouse/key click or key press
    private static mouseClickFlags: {[key: number]: boolean} = {};
    private static keyClickFlags: {[key: string]: boolean} = {};

    public static init (canvas: HTMLCanvasElement) {
        window.addEventListener('mousemove', Inputs.onMouseMove);
        window.addEventListener('mousedown', Inputs.onMouseDown);
        window.addEventListener('mouseup', Inputs.onMouseUp);

        window.addEventListener('keydown', Inputs.onKeyDown);
        window.addEventListener('keyup', Inputs.onKeyUp);

    }

    public static update () {
        // Reset flags
        Inputs.mouseClickFlags = {};
        Inputs.keyClickFlags = {};
    }

    public static isKeyDown (key: string) {
        return Inputs.keys[key];
    }

    public static isKeyPressed (key: string) {
        return Inputs.keyClickFlags[key];
    }

    public static isMouseDown (button: number) {
        return Inputs.mouseButtons[button];
    }

    public static isMousePressed (button: number) {
        return Inputs.mouseClickFlags[button];
    }

    private static onMouseMove (e: MouseEvent) {
        Inputs.mousePosition = { x: e.clientX, y: e.clientY };
    }

    private static onMouseDown (e: MouseEvent) {
        Inputs.mouseButtons[e.button] = true;
        Inputs.mouseClickFlags[e.button] = true;
    }

    private static onMouseUp (e: MouseEvent) {
        Inputs.mouseButtons[e.button] = false;
    }

    private static onKeyDown (e: KeyboardEvent) {
        Inputs.keys[e.key] = true;
        Inputs.keyClickFlags[e.key] = true;
    }

    private static onKeyUp (e: KeyboardEvent) {
        Inputs.keys[e.key] = false;
    }
}