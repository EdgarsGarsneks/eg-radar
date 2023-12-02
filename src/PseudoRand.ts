export class PseudoRand {

    constructor(private seed: number) { }

    // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    public random(): number {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    public randomBetween(min: number, max: number): number {
        return min + this.random() * (max - min);
    }

}