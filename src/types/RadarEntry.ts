import { Ring } from "./Ring";
import { Sector } from "./Sector";

export interface RadarEntry {
    id: number;
    label: string;
    color: string;
    ring: Ring;
    sector: Sector;
    moved: number;
    point: { x: number, y: number };
    data?: any;
}