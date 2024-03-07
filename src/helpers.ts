
/**
 * Transforms an angle in degrees to radians
 * @param angle 
 * @returns 
 */
export function deg2rad (angle: number) {
    return (angle * Math.PI) / 180;
}

/**
 * Transforms an angle in radians to degrees
 * @param radians 
 * @returns 
 */
export function rad2deg (radians: number) {
    return (radians * 180) / Math.PI;
}


export function getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
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

