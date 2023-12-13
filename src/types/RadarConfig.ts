import { StyleConfig } from "./StyleConfig";

export interface RadarConfig {
    width: number;
    sectors: { label: string, data?: any }[];
    rings: { label: string, color?: string }[];
    entries: { label: string, ring: number, sector: number, moved: number, data?: any }[];
    style?: StyleConfig;
}