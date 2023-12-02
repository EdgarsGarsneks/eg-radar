export interface StyleConfig {
    seed?: number;
    background?: string;
    lineColor?: string;
    font?: string;
    blips?: {
        r?: number;
        offset?: number;
        fontSize?: number;
        textColor?: string;
    },
    rings?: {
        fontSize?: number;
        showLabels?: boolean;
        showCurvedLabels?: boolean;
        showBackground?: boolean;
    },
    sectors?: {
        fontSize?: number;
        textColor?: string;
        showLabels?: boolean;
        highlight?: boolean;
    },
    tooltip?: {
        enabled?: boolean;
        background?: string;
        textColor?: string;
        fontSize?: number;
    }
}