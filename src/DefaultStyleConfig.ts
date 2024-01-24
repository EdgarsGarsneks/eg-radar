import { StyleConfig } from "./EgRadar";

/**
 * Default style configuration values that will be used if not provided.
 */
export let DEFAULT_STYLE_CONFIG: StyleConfig = {
    background: "#00000000",
    lineColor: "gray",
    font: "Arial, Helvetica",
    blips: {
        r: 12,
        offset: 15,
        fontSize: 12,
        textColor: "white"
    },
    tooltip: {
        enabled: true,
        background: "black",
        textColor: "white",
        fontSize: 15
    },
    rings: {
        showLabels: true,
        showCurvedLabels: true,
        showBackground: false,
        fontSize: 30
    },
    sectors: {
        showLabels: true,
        highlight: true,
        textColor: "black",
        fontSize: 30
    },
    seed: Math.random() * 1000
}