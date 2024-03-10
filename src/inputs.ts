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
        window.addEventListener('mousedown', Inputs.onMouseDown, false);
        window.addEventListener('mouseup', Inputs.onMouseUp, false);

        window.addEventListener('keydown', Inputs.onKeyDown, false);
        window.addEventListener('keyup', Inputs.onKeyUp, false);

    }

    public static update () {
        // Set key/mouse flags
        Inputs.mouseClickFlags = {...Inputs.mouseButtons};
        Inputs.keyClickFlags = {...Inputs.keys};
    }

    public static isKeyDown (key: string) {
        return Inputs.keys[key];
    }

    public static isKeyPressed (key: string) {
        return Inputs.keys[key] && !Inputs.keyClickFlags[key];
    }

    public static isMouseDown (button: number) {
        return Inputs.mouseButtons[button];
    }

    public static isMousePressed (button: number) {
        return Inputs.mouseButtons[button] && !Inputs.mouseClickFlags[button];
    }

    private static onMouseMove (e: MouseEvent) {
        Inputs.mousePosition = { x: e.clientX, y: e.clientY };
    }

    private static onMouseDown (e: MouseEvent) {
        Inputs.mouseButtons[e.button] = true;
    }

    private static onMouseUp (e: MouseEvent) {
        Inputs.mouseButtons[e.button] = false;
    }

    private static onKeyDown (e: KeyboardEvent) {
        Inputs.keys[e.key] = true;
    }

    private static onKeyUp (e: KeyboardEvent) {
        Inputs.keys[e.key] = false;
    }
}