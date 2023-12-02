import { PseudoRand } from "../src/PseudoRand";

describe('Pseudo random number generator', () => {

    it('should generate the same sequence of numbers for a given seed', () => {
        let seed = 123;

        let rand1 = new PseudoRand(seed);
        let rand2 = new PseudoRand(seed);

        for (let i = 0; i < 100; i++) {
            expect(rand1.random()).toEqual(rand2.random());
        }
    });

    it('should generate different sequences of numbers for different seeds', () => {
        let rand1 = new PseudoRand(123);
        let rand2 = new PseudoRand(456);

        for (let i = 0; i < 100; i++) {
            expect(rand1.random()).not.toEqual(rand2.random());
        }
    });

    it('should generate numbers between 0 and 1', () => {
        let rand = new PseudoRand(123);

        for (let i = 0; i < 1000; i++) {
            let n = rand.random();
            expect(n).toBeGreaterThanOrEqual(0);
            expect(n).toBeLessThanOrEqual(1);
        }
    });

    it('should generate numbers in given range', () => {
        let rand = new PseudoRand(123);

        for (let i = 0; i < 1000; i++) {
            let n = rand.randomBetween(10, 20);
            expect(n).toBeGreaterThanOrEqual(10);
            expect(n).toBeLessThanOrEqual(20);
        }
    })

});