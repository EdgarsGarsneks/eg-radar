export interface StyleConfig {
    background?: string;
    lineColor?: string;
    font?: string;
    blips?: {
        r?: number;
        offset?: number;
        fontSize?: number;
        textColor?: string;
    },
    tooltip?: {
        background?: string;
        textColor?: string;
        fontSize?: number;
    },
    rings?: {
        showLabels?: boolean;
        showCurvedLabels?: boolean;
        showBackground?: boolean;
        fontSize?: number;
    },
    sectors?: {
        showLabels?: boolean;
        textColor?: string;
        fontSize?: number;
    }
    seed?: number;
}