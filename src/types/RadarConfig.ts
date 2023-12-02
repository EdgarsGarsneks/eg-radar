import { RadarEntry } from "./RadarEntry";
import { StyleConfig } from "./StyleConfig";

export interface RadarConfig {
    width: number;
    sectors: { label: string, data?: any }[];
    rings: { label: string, color?: string }[];
    entries: { label: string, ring: number, sector: number, moved: number }[];
    style?: StyleConfig;
    onHover?: (entry: RadarEntry) => void;
    onHoverOut?: (entry: RadarEntry) => void;
    onSelect?: (entry: RadarEntry) => void;
}