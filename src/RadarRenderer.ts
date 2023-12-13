import { EgRadar, Ring } from "./EgRadar";
import { RadarConfig } from "./types/RadarConfig";
import { RadarEntry } from "./types/RadarEntry";
import { Sector } from "./types/Sector";
import * as d3 from "d3";
import { toCartesian } from "./Utils";

export class RadarRenderer {
    private svg: any;
    private tooltip: any;
    private svgId?: string;
    private config: RadarConfig;

    constructor(private radar: EgRadar) {
        this.config = radar.config;
        this.setupCallbacks();
    }

    public render(svgId: string) {
        this.svg = d3.select("#" + svgId)
        this.svgId = svgId;

        this.svg.style("background-color", this.radar.style.background)
            .attr("width", this.config.width + 20)
            .attr("height", this.config.width + 20)

        let radar = this.svg.append("g")
        radar.attr("transform", "translate(" + this.config.width / 2 + "," + this.config.width / 2 + ")")

        this.renderGrid(radar);
        this.renderEntries(radar)
        this.initTooltip(radar);
    }

    private renderGrid(radar: any) {
        let grid = radar.append("g")
        this.renderSectors(grid);
        this.renderRings(grid);
    }

    private renderSectors(grid: any) {
        let sectors = this.radar.sectors;
        let legend = grid.append("g")

        for (const sector of sectors) {
            let line = toCartesian(this.config.width / 2 + 10, sector.startAngle);
            this.drawLine(grid, 0, 0, line.x, line.y, this.radar.style.lineColor);

            if (this.radar.style.sectors?.showLabels) {
                this.drawSectorLabel(legend, sector);
            }
        }
    }

    private renderRings(grid: any) {
        let rings = this.radar.rings;
        let ringLabels = grid.append("g").attr("id", "ringLabels_" + this.svgId)

        for (const ring of rings) {
            this.renderRingLine(grid, ring);

            if (this.radar.style.rings?.showLabels) {
                if (this.radar.style.rings?.showCurvedLabels) {
                    this.renderCurvedRingLabel(ringLabels, ring);
                } else {
                    this.renderRingLabel(ringLabels, ring);
                }
            }
        }
    }

    private renderRingLine(grid: any, ring: Ring) {
        grid.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", ring.r)
            .style("fill", "none")
            .style("stroke", this.radar.style.lineColor)
            .style("stroke-width", 1)

        if (this.radar.style.rings?.showBackground) {
            grid.append("g")
                .append("path")
                .style("fill", ring.color)
                .style("opacity", 0.1)
                .attr("d", d3.arc()
                    ({
                        startAngle: 0,
                        endAngle: Math.PI * 2,
                        innerRadius: ring.r,
                        outerRadius: this.radar.getRingRadius(ring.id + 1)
                    })
                )

        }
    }

    private renderRingLabel(grid: any, ring: Ring) {
        grid.append("text")
            .text(ring.label)
            .attr("y", -ring.r - 25)
            .attr("text-anchor", "middle")
            .style("fill", ring.color ?? "black")
            .style("opacity", 0.4)
            .style("font-family", this.radar.style.font)
            .style("font-size", `${this.radar.style.rings?.fontSize}px`)
            .style("font-weight", "bold")
            .style("pointer-events", "none")
            .style("user-select", "none");
    }

    private renderCurvedRingLabel(grid: any, ring: Ring) {
        this.renderTextOnRingLine(
            grid,
            this.radar.getRingRadius(ring.id + 0.4),
            Math.PI,
            2 * Math.PI,
            ring.label,
            {
                color: ring.color!,
                fontSize: this.radar.style.rings?.fontSize!,
                opacity: 0.4
            }
        );
    }

    private renderEntries(radar: any) {
        radar.append("g").selectAll(".blip")
            .data(this.radar.entries)
            .enter()
            .append("g")
            .style("cursor", "pointer")
            .attr("id", (d: any) => "blip" + d.id)
            .attr("class", "blip")
            .attr("transform", (entry: RadarEntry) => { return "translate(" + entry.point.x + "," + entry.point.y + ")"; })
            .on("mouseover", (d: any, entry: RadarEntry) => this.radar.hoverEntry(entry))
            .on("mouseout", (d: any, entry: RadarEntry) => this.radar.hoverEntryOut(entry))
            .on("click", (d: any, entry: RadarEntry) => this.radar.selectEntry(entry))
            .each((entry: RadarEntry) => {
                let blip: any = this.svg.select("#blip" + entry.id);

                if (entry.moved > 0 || entry.moved < 0) {
                    this.renderBlipWithChange(blip, entry);
                } else {
                    this.renderBlipNoChange(blip, entry);
                }

                this.renderBlipLabel(blip, entry);
            })
    }

    private renderBlipWithChange(blip: any, entry: RadarEntry) {
        // Draw a triangle that would be inside circle with radius 1.5r (for readability). -5 so that triangle is not squashed
        let h = 3 * this.radar.style.blips!.r! * 1.5 / 2 - 5;
        let a = 3 * this.radar.style.blips!.r! * 1.5 / Math.sqrt(3);
        // Triangle points facing up
        let left = { x: -a / 2, y: h / 2 };
        let right = { x: a / 2, y: h / 2 };
        let top = { x: 0, y: -h / 2 - 5 };
        // Draw triangle and invert y values if entry.moved is pointed down
        blip.append("path")
            .attr("d",
                ["M",
                    left.x,
                    left.y * entry.moved,
                    right.x,
                    right.y * entry.moved,
                    top.x,
                    top.y * entry.moved,
                    "z"].join(" "))
            .style("fill", entry.color);
    }

    private renderBlipNoChange(blip: any, entry: RadarEntry) {
        blip.append("circle")
            .attr("r", this.radar.style.blips!.r)
            .attr("fill", entry.color);
    }

    private renderBlipLabel(blip: any, entry: RadarEntry) {
        blip.append("text")
            .text(entry.id + 1)
            .attr("y", 3)
            .attr("text-anchor", "middle")
            .style("fill", this.radar.style.blips?.textColor)
            .style("font-family", this.radar.style.font)
            .style("font-size", this.radar.style.blips!.fontSize)
            .style("pointer-events", "none")
            .style("user-select", "none");
    }

    private initTooltip(radar: any) {
        this.tooltip = radar.append("g")
            .attr("id", "blipTooltip")
            .style("opacity", 0)

        this.tooltip.append("rect")
            .attr("rx", 4)
            .attr("ry", 4)
            .style("fill", this.radar.style.tooltip?.background)
            .style("opacity", 1)

        this.tooltip.append("text")
            .text("")
            .style("font-family", this.radar.style.font)
            .style("font-size", `${this.radar.style.tooltip?.fontSize}px`)
            .style("fill", this.radar.style.tooltip?.textColor)
            .style("pointer-events", "none")
            .style("user-select", "none");
    }

    private drawLine(grid: any, x1: number, y1: number, x2: number, y2: number, color?: string) {
        grid.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .style("stroke", color ?? 'black')
            .style("stroke-width", 1);
    }

    private drawSectorLabel(legend: any, sector: Sector) {
        let labelRad = this.radar.getRingRadius(this.radar.rings.length + 1) * 0.9
        let legendLabel = legend.append("g").attr("id", "legendText" + sector.id + "_" + this.svgId)

        this.renderTextOnRingLine(
            legendLabel,
            labelRad,
            sector.startAngle,
            sector.endAngle,
            sector.label,
            {
                color: this.radar.style.sectors?.textColor!,
                fontSize: this.radar.style.sectors?.fontSize!,
                opacity: 1
            }
        );
    }

    private renderTextOnRingLine(
        element: any,
        r: number,
        startAngle: number,
        endAngle: number,
        text: string,
        options: { color: string, fontSize: number, opacity: number }
    ) {
        let arcStart = toCartesian(r, startAngle);
        let arcEnd = toCartesian(r, endAngle);

        let refId = this.svgId + "_" + r + "_" + startAngle + "_" + endAngle;

        element.append("path")
            .attr("id", "path_" + refId)
            .attr("d", ["M", arcStart.x, arcStart.y, "A", r, r, 1, 0, 1, arcEnd.x, arcEnd.y].join(" "))
            .style("fill", "none")

        element.append("text")
            .append("textPath")
            .style("font-family", this.radar.style.font)
            .attr("id", "text_" + refId)
            .attr("xlink:href", "#path_" + refId)
            .style("text-anchor", "middle")
            .attr("startOffset", "50%")
            .text(text)
            .attr("fill", options.color)
            .attr("font-weight", "bold")
            .attr("font-size", `${options.fontSize}px`)
            .style("opacity", options.opacity ?? 1)
            .style("pointer-events", "none")
            .style("user-select", "none");
    }

    private setBlipOpacity(entry: RadarEntry, opacity: number) {
        if (entry) {
            this.svg.select("#blip" + entry.id)
                .style("opacity", opacity)
        }
    }

    private highlightSector(sector: Sector) {
        if (this.radar.style.sectors?.highlight) {
            this.svg.selectAll(".blip").style("opacity", (entry: any) => !sector || sector.id == entry.sector?.id ? 1 : 0.3);

            if (this.radar.style.sectors?.showLabels) {
                for (let i = 0; i < this.radar.sectors.length; i++) {
                    this.svg.select("#legendText" + i + "_" + this.svgId)
                        .style("opacity", !sector || sector.id == i ? 1 : 0.3);
                }
            }
        }
    }

    private showTooltip(entry: RadarEntry) {
        if (entry && this.radar.style.tooltip?.enabled) {
            let offset = 5;
            this.tooltip.style("opacity", 1);
            let text = this.tooltip.select("text").text((entry.id + 1) + ". " + entry.label)
            let bbox = (text.node() as SVGAElement).getBBox();
            if (bbox) {
                text.attr("transform", `translate(${offset}, ${(bbox.height + this.radar.style?.tooltip?.fontSize! + offset) / 2})`)
                this.tooltip.attr("transform", `translate(${entry.point.x + this.radar.style?.tooltip?.fontSize! / 2 + offset}, ${entry.point.y + offset})`)
                this.tooltip.select("rect")
                    .attr("width", bbox.width + offset * 2)
                    .attr("height", bbox.height + offset * 2)
            }
        }
    }

    private hideTooltip() {
        this.tooltip.style("opacity", 0);
        this.tooltip.select("text").text("");
    }

    private highlightEntry(entry: RadarEntry) {
        this.setBlipOpacity(entry, 0.5);
        this.showTooltip(entry);
    }

    private unhighlightEntry(entry: RadarEntry) {
        this.hideTooltip();
        if (!this.radar.selectedSector || this.radar.selectedSector?.id === entry.sector?.id) {
            this.setBlipOpacity(entry, 1);
        } else {
            this.setBlipOpacity(entry, 0.3);
        }
    }

    private setupCallbacks() {
        this.radar.addEventListener('sectorSelect', (sector: Sector) => this.highlightSector(sector));
        this.radar.addEventListener('entrySelect', (entry: RadarEntry) => entry && this.highlightSector(entry.sector));
        this.radar.addEventListener('entryHover', (entry: RadarEntry) => this.highlightEntry(entry));
        this.radar.addEventListener('entryHoverOut', (entry: RadarEntry) => this.unhighlightEntry(entry));
    }

}