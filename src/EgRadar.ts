import { RadarRenderer } from "./RadarRenderer";
import { PseudoRand } from "./PseudoRand";
import { RadarConfig } from "./types/RadarConfig";
import { RadarEntry } from "./types/RadarEntry";
import { Ring } from "./types/Ring";
import { Sector } from "./types/Sector";
import { StyleConfig } from "./types/StyleConfig";
import { toPolar, toCartesian, pipe } from "./Utils";
import { all } from "deepmerge";


const DEFAULT_CONFIG: StyleConfig = {
    showSectorLabels: true,
    showRingLabels: true,
    background: "#00000000",
    lineColor: "gray",
    sectorLabelColor: "black",
    font: "Arial, Helvetica",
    blips: {
        r: 12,
        offset: 15,
        fontSize: 12
    },
    tooltip: {
        background: "black",
        color: "white",
        fontSize: 15
    },
    seed: Math.random() * 1000
}

export class EgRadar {
    private _rings: Ring[] = [];
    private _sectors: Sector[] = [];
    private _entries: RadarEntry[] = [];
    private _renderer?: RadarRenderer;
    private _styleConfig: StyleConfig;

    private _selectedSector?: Sector;
    private _selectedEntry?: RadarEntry;
    private _selectedRing?: Ring;
    private rand: PseudoRand;

    public onEntrySelect!: Function;
    public onSectorSelect!: Function;
    public onEntryHover!: Function;
    public onEntryHoverOut!: Function;

    constructor(private _config: RadarConfig) {
        // TODO: Not doing a deep merge here
        this._styleConfig = { ...DEFAULT_CONFIG, ..._config.style };
        this.rand = new PseudoRand(this._styleConfig.seed!);

        this.initRings();
        this.initSectors();
        this.initEntries();
        this.spreadEntries();
        this.initCallbacks();
    }

    public get rings(): Ring[] { return this._rings; }
    public get sectors(): Sector[] { return this._sectors; }
    public get entries(): RadarEntry[] { return this._entries; }
    public get config(): RadarConfig { return this._config; }
    public get style(): StyleConfig { return this._styleConfig; }

    public get selectedSector(): Sector | undefined { return this._selectedSector; }
    public get selectedEntry(): RadarEntry | undefined { return this._selectedEntry; }
    public get selectedRing(): Ring | undefined { return this._selectedRing; }

    public render(svgId: string) {
        this._renderer = new RadarRenderer(this);
        this._renderer.render(svgId);
    }

    private selectSector(sector: Sector) {
        this._selectedSector = sector;
    }

    private selectEntry(entry: RadarEntry) {
        this._selectedEntry = entry
        this._selectedRing = entry.ring;
        this.selectSector(entry.sector);
    }

    private initRings() {
        this._rings = new Array<Ring>(this.config.rings.length);

        for (let i = 0; i < this.rings.length; i++) {
            const ringRadius = this.getRingRadius(i);

            this.rings[i] = {
                ...this.config.rings[i],
                id: i,
                r: ringRadius
            };
        }
    }

    private initSectors() {
        this._sectors = new Array<Sector>(this.config.sectors.length);

        const start = 0;
        const step = (Math.PI * 2) / this.sectors.length;

        for (let sector = 0; sector < this.sectors.length; sector++) {
            const theta = start + sector * step;
            const startAngle = theta;
            const endAngle = theta + step;

            this.sectors[sector] = {
                ...this.config.sectors[sector],
                id: sector,
                startAngle: startAngle,
                endAngle: endAngle
            };
        }
    }

    private initEntries() {
        this._entries = this.sortEntries(this.config.entries)
            .map((entry, index) => this.createRadarEntry(entry, index));
    }

    private sortEntries(entries: { sector: number, ring: number }[]) {
        return entries.sort(function (a: any, b: any) {
            if (a.sector === b.sector) {
                return a.ring - b.ring;
            }
            return a.sector - b.sector;
        });
    }

    private createRadarEntry(entry: any, index: number) {
        return {
            id: index,
            label: entry.label,
            ring: this.rings[entry.ring],
            sector: this.sectors[entry.sector],
            moved: entry.moved,
            point: { x: 0, y: 0 },
            color: this.rings[entry.ring]?.color ?? 'black',
            data: entry
        };
    }

    private spreadEntries() {
        const grid = this.generateGrid();
        for (let entry of this.entries) {
            const { ring, sector } = entry;
            if (ring && sector) {
                const availableGridSpots = grid[sector.id][ring.id];

                if (availableGridSpots.length == 0) {
                    entry.point = this.getRandomPointInRing(sector, ring);
                } else {
                    entry.point = this.getRandomGridPoint(availableGridSpots);
                }

            }
        }
    }

    private getRandomGridPoint(availableSpots: Array<{ x: number, y: number }>) {
        const i = Math.floor(availableSpots.length * this.rand.random());

        return availableSpots.splice(i, 1)[0];
    }


    public getRingRadius(ring: number) {
        const ringCount = this._styleConfig.showSectorLabels ? this.rings.length + 1 : this.rings.length;
        const ringWidth = (this.config.width / 2) / ringCount;

        return ring * ringWidth;
    }

    private generateGrid(): Array<Array<Array<{ x: number, y: number }>>> {
        const grid: Array<Array<Array<{ x: number, y: number }>>> =
            this.sectors.map(() => this.rings.map(() => []));

        const w: number = this.config.width;
        const blipRadius: number = this._styleConfig.blips!.offset!;

        for (let x = -w / 2; x < w / 2; x += blipRadius) {
            for (let y = -w / 2; y < w / 2; y += blipRadius) {
                const polar = toPolar(x, y);
                const ring = this.getRingByRadius(polar.r);
                const sector = this.getSectorByAngle(polar.theta);

                if (ring != -1 && sector != -1) {
                    grid[sector][ring].push(toCartesian(polar.r, polar.theta));
                }
            }
        }
        return grid;
    }

    private getSectorByAngle(angle: number) {
        for (let i = 0; i < this.sectors.length; i++) {
            if (angle >= this.sectors[i].startAngle && angle <= this.sectors[i].endAngle) {
                return i;
            }
        }
        return -1;
    }

    private getRingByRadius(radius: number) {
        for (let i = 0; i < this.rings.length; i++) {
            if (radius <= this.getRingRadius(i + 1)) {
                return i;
            }
        }
        return -1;
    }

    private getRandomPointInRing(sector: Sector, ring: Ring): { x: number, y: number } {
        const theta = this.rand.randomBetween(sector.startAngle, sector.endAngle);
        const r = this.rand.randomBetween(ring.r, this.getRingRadius(ring.id + 1));

        return toCartesian(r, theta);
    }

    private initCallbacks() {
        this.onEntrySelect = pipe(
            (entry: RadarEntry) => this.selectEntry.call(this, entry),
            (entry: RadarEntry) => this.config.onSelect?.call(this, entry)
        );

        this.onSectorSelect = (sector: Sector) => this.selectSector.call(this, sector);
        this.onEntryHover = (entry: RadarEntry) => this.config.onHover?.call(this, entry);
        this.onEntryHoverOut = (entry: RadarEntry) => this.config.onHoverOut?.call(this, entry);
    }

}

export { RadarRenderer } from "./RadarRenderer";
export { RadarConfig } from "./types/RadarConfig";
export { RadarEntry } from "./types/RadarEntry";
export { Ring } from "./types/Ring";
export { Sector } from "./types/Sector";
export { StyleConfig } from "./types/StyleConfig";