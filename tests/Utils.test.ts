import { toCartesian, toPolar } from "../src/Utils";

describe('Common utility functions', () => {

    it('should convert cartesian to polar coordinates', () => {
        let point = { x: 12, y: 5 };
        let polar = toPolar(point.x, point.y);

        expect(polar.r).toBeCloseTo(13);
        expect(polar.theta).toBeCloseTo(0.3944);
    })

    it('should convert polar to cartesian coordinates', () => {
        let polar = { r: 13, theta: 0.3944 };
        let point = toCartesian(polar.r, polar.theta);

        expect(point.x).toBeCloseTo(12);
        expect(point.y).toBeCloseTo(5);
    })

    it('should not return negative angles', () => {
        let pointQ1 = { x: 1, y: 0 };
        let pointQ2 = { x: 0, y: 1 };
        let pointQ3 = { x: -1, y: 0 };
        let pointQ4 = { x: 0, y: -1 };

        expect(toPolar(pointQ1.x, pointQ1.y).theta).toBeCloseTo(0);
        expect(toPolar(pointQ2.x, pointQ2.y).theta).toBeCloseTo(Math.PI / 2);
        expect(toPolar(pointQ3.x, pointQ3.y).theta).toBeCloseTo(Math.PI);
        expect(toPolar(pointQ4.x, pointQ4.y).theta).toBeCloseTo(3 * Math.PI / 2);
    })

})