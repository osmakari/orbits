
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
