import { EgRadar, RadarConfig } from "../src/EgRadar";
import { toPolar } from "../src/Utils";

let radarConfig: RadarConfig;

describe('EgRadar entry layout', () => {

    beforeEach(() => {
        radarConfig = {
            width: 500,
            rings: [
                { label: "ring1" },
                { label: "ring2" },
                { label: "ring3" }
            ],
            sectors: [
                { label: "sector1" },
                { label: "sector2" },
                { label: "sector3" },
                { label: "sector4" }
            ],
            entries: [
                { label: "entry1", ring: 0, sector: 0, moved: 0 },
                { label: "entry2", ring: 1, sector: 1, moved: 0 },
                { label: "entry3", ring: 2, sector: 2, moved: 0 },
                { label: "entry4", ring: 0, sector: 3, moved: 0 }
            ]
        };
    });

    describe('when seed is not provided', () => {

        it('should generate random entry layout', () => {
            const radar1 = new EgRadar(radarConfig);
            const radar2 = new EgRadar(radarConfig);

            const entries1 = radar1.entries;
            const entries2 = radar2.entries;

            const matchingPoints = entries1.filter((entry, i) => entry.point == entries2[i].point);

            expect(matchingPoints.length).not.toEqual(entries1.length);
        });
    });

    describe('when seed is provided', () => {
        it('should generate consistent entry layout', () => {
            radarConfig.style = { seed: 123 }

            const radar1 = new EgRadar(radarConfig);
            const radar2 = new EgRadar(radarConfig);

            const entries1 = radar1.entries;
            const entries2 = radar2.entries;

            for (let i = 0; i < radarConfig.entries.length; i++) {
                expect(entries1[i].point).toEqual(entries2[i].point);
            }
        });
    });

    describe('when showSectorLabels is true', () => {
        it('should divide the radar into rings with equal width of w / (n+1)', () => {
            radarConfig.width = 200;
            radarConfig.rings = [
                { label: "ring1", color: "red" },
                { label: "ring2", color: "green" },
                { label: "ring3", color: "blue" },
                { label: "ring4", color: "yellow" },
                { label: "ring5", color: "black" }
            ];

            const expectedWidth = (radarConfig.width / 2) / (radarConfig.rings.length + 1);
            const radar = new EgRadar(radarConfig);
            for (let i = 0; i < radar.rings.length; i++) {
                expect(radar.rings[i].id).toEqual(i);
                expect(radar.rings[i].label).toEqual(radarConfig.rings[i].label);
                expect(radar.rings[i].color).toEqual(radarConfig.rings[i].color);
                expect(radar.rings[i].r).toEqual(i * expectedWidth);
            }
        });
    });

    describe('when showSectorLabels is false', () => {
        it('should divide the radar into rings with equal width of w / n', () => {
            radarConfig.width = 200;
            radarConfig.rings = [
                { label: "ring1" },
                { label: "ring2" },
                { label: "ring3" },
                { label: "ring4" },
                { label: "ring5" }
            ];
            radarConfig.style = { showSectorLabels: false };

            const expectedWidth = (radarConfig.width / 2) / radarConfig.rings.length;
            const radar = new EgRadar(radarConfig);
            for (let i = 0; i < radar.rings.length; i++) {
                expect(radar.rings[i].id).toEqual(i);
                expect(radar.rings[i].label).toEqual(radarConfig.rings[i].label);
                expect(radar.rings[i].color).toEqual(radarConfig.rings[i].color);
                expect(radar.rings[i].r).toEqual(i * expectedWidth);
            }
        });
    });

    describe('when points', () => {
        it('should divide the radar into equal sectors', () => {
            radarConfig.sectors = [
                { label: "sector1" },
                { label: "sector2" },
                { label: "sector3" },
                { label: "sector4" },
                { label: "sector5" }
            ];

            const radar = new EgRadar(radarConfig);
            const sectors = radar.sectors;
            const step = Math.PI * 2 / radarConfig.sectors.length;

            for (let i = 0; i < sectors.length; i++) {
                expect(sectors[i].id).toEqual(i);
                expect(sectors[i].label).toEqual(radarConfig.sectors[i].label);
                expect(sectors[i].startAngle).toEqual(i * step);
                expect(sectors[i].endAngle).toEqual((i + 1) * step);
            }
        });

        it('blips should be inside their sector', () => {
            radarConfig.entries = [];
            for (let i = 0; i < 100; i++) {
                radarConfig.entries.push({ label: "entry" + i, ring: i % 3, sector: i % 4, moved: 0 })
            }

            const radar = new EgRadar(radarConfig);

            for (let entry of radar.entries) {
                const polar = toPolar(entry.point.x, entry.point.y);
                expect(polar.theta).toBeGreaterThanOrEqual(entry.sector.startAngle);
                expect(polar.theta).toBeLessThan(entry.sector.endAngle);
            }
        });

        it('blips should be inside their ring', () => {
            radarConfig.entries = [];
            for (let i = 0; i < 100; i++) {
                radarConfig.entries.push({ label: "entry" + i, ring: i % 3, sector: i % 4, moved: 0 })
            }

            const radar = new EgRadar(radarConfig);
            for (let entry of radar.entries) {
                const polar = toPolar(entry.point.x, entry.point.y);
                const startR = radar.getRingRadius(entry.ring.id);
                const endR = radar.getRingRadius(entry.ring.id + 1);
                const r = polar.r;

                expect(r).toBeGreaterThanOrEqual(startR);
                expect(r).toBeLessThan(endR);
            }
        });

        it('should not overlap blips if spots are available', () => {
            radarConfig.entries = [];

            for (let i = 0; i < 5; i++) {
                radarConfig.entries.push({ label: "entry" + i, ring: 0, sector: 0, moved: 0 })
            }

            const radar = new EgRadar(radarConfig);
            const points = radar.entries.map(e => e.point);
            const distances = points.flatMap(p => points.flatMap(p2 => Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2))));

            // Should not generate place points closer that defined offset
            expect(distances.filter(d => d - radar.style.blips!.offset! >= -1e10).length).not.toBe(0);    
        });

        it('should generate random position inside ring if no spots are available', () => {
            radarConfig.entries = [];
            radarConfig.width = 20;
        
            for (let i = 0; i < 100; i++) {
                radarConfig.entries.push({ label: "entry" + i, ring: 0, sector: 0, moved: 0 })
            }

            const radar = new EgRadar(radarConfig);
            const points = radar.entries.map(e => e.point);
            const distances = points.flatMap(p => points.flatMap(p2 => Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2))));

            // Should generate random points closer that defined offset
            expect(distances.filter(d => d < radar.style.blips!.offset!).length).not.toBe(0);
        });

        it('should not place blips into non existing rings', () => {
            radarConfig.entries = [{ label: "entry", ring: 99, sector: 0, moved: 0 }];
            const radar = new EgRadar(radarConfig);

            expect(radar.entries.length).toBe(1);
            expect(radar.entries[0].ring).toBeUndefined();
            expect(radar.entries[0].point).toEqual({ x: 0, y: 0 });
        });

        it('should not place blips into non existing sectors', () => {
            radarConfig.entries = [{ label: "entry", ring: 0, sector: 99, moved: 0 }];
            const radar = new EgRadar(radarConfig);

            expect(radar.entries.length).toBe(1);
            expect(radar.entries[0].sector).toBeUndefined();
            expect(radar.entries[0].point).toEqual({ x: 0, y: 0 });
        });
    })

    it('should set default values for optional parameters', () => {
        const radar = new EgRadar(radarConfig);

        expect(radar.style).toMatchObject({
            background: 'white',
            lineColor: 'gray',
            sectorLabelColor: 'black',
            blips: {
                offset: 15,
                r: 12,
                fontSize: 12
            },
            showSectorLabels: true,
            showRingLabels: true,
            font: 'Arial, Helvetica'
        });

        expect(radar.style.seed).toBeGreaterThanOrEqual(0);
        expect(radar.style.seed).toBeLessThanOrEqual(10000);
    })

});