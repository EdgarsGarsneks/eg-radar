export function toPolar(x: number, y: number) {
    let r = Math.sqrt(x * x + y * y);
    let theta = Math.atan2(y, x);
    return { r: r, theta: theta >= 0 ? theta : theta + 2 * Math.PI };
}

export function toCartesian(r: number, theta: number) {
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);
    return { x: x, y: y };
}