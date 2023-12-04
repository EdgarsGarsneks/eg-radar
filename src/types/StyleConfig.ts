export interface StyleConfig {
    showSectorLabels?: boolean;
    showRingLabels?: boolean;
    lineColor?: string;
    background?: string;
    font?: string;
    sectorLabelColor?: string;
    blips?: {
        r?: number;
        offset?: number;
        fontSize?: number;
    },
    tooltip?: {
        background?: string;
        fontColor?: string;
        fontSize?: number;
    }
    seed?: number;
}