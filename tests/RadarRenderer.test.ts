import * as d3 from "d3";
import { EgRadar, RadarConfig, RadarRenderer, RadarEntry } from "../src/EgRadar";

const getSvgElement = () => elements['#test'];
const getRadarElement = () => getSvgElement()._children[0];
const getGridElement = () => getRadarElement()._children[0];
const getTooltipElement = () => getRadarElement()._children[2];

let elements: any = {};

jest.mock('d3', () => ({
    select: jest.fn().mockImplementation((name: string) => {
        return elements[name];
    })
}));

const mockD3Element = (name: string) => {
    let element: any = {
        _data: [],
        _name: name,
        _children: [],
        _attributes: {},
        _styles: {},
        _text: '',
        _on: {},
        _each: {},
        style: jest.fn(),
        attr: jest.fn(),
        append: jest.fn(),
        selectAll: jest.fn(),
        data: jest.fn(),
        enter: jest.fn(),
        on: jest.fn(),
        each: jest.fn(),
        text: jest.fn(),
        select: jest.fn()
    };

    element.append.mockImplementation((name: string) => {
        const child = mockD3Element(name);
        element._children.push(child);
        return child;
    });

    element.style.mockImplementation((key: any, value: any) => {
        element._styles[key] = value;
        return element;
    });

    element.attr.mockImplementation((key: any, value: any) => {
        element._attributes[key] = value;
        return element;
    });

    element.data.mockImplementation((data: []) => {
        element._data = data;
        return element;
    });

    element.selectAll.mockReturnValue(element);
    element.enter.mockReturnValue(element);
    element.on.mockImplementation((key: any, value: any) => {
        element._on[key] = value;
        return element;
    });
    element.text.mockImplementation((text: string) => {
        element._text = text;
        return element;
    });

    element.each.mockImplementation((callback: any) => {
        element._each = callback;
        return element;
    });

    element.select.mockImplementation((name: string) => {
        const candidates = element._children.filter((child: any) => child._name === name);
        return candidates.length > 0 ? candidates[0] : undefined;
    });

    return element;
}

describe('RadarRenderer', () => {
    let config: RadarConfig;
    let radar: EgRadar;
    let renderer: RadarRenderer;

    const render = () => {
        radar = new EgRadar(config);
        renderer = new RadarRenderer(radar);
        renderer.render('test');
    }

    beforeEach(() => {
        elements = { '#test': mockD3Element('#test') };
        config = {
            width: 500,
            rings: [
                { label: "Ring 1", color: 'red' },
                { label: "Ring 2", color: 'green' },
                { label: "Ring 3", color: 'blue' }
            ],
            sectors: [
                { label: "Sector 1" },
                { label: "Sector 2" },
                { label: "Sector 3" }
            ],
            entries: [
                { label: "Entry 1", ring: 0, sector: 0, moved: 0 },
                { label: "Entry 2", ring: 1, sector: 1, moved: 1 },
                { label: "Entry 3", ring: 2, sector: 2, moved: -1 }
            ],
            style: {
                background: "#123456", lineColor: "#456", sectorLabelColor: "#789",
                blips: { r: 10, fontSize: 10 },
                font: "Arial"
            }
        };
        (d3.select as jest.Mock).mockClear();
    });

    describe('Component initialization', () => {
        it('should select the correct SVG element', () => {
            render();
            expect(d3.select).toHaveBeenCalledWith('#test');
        });

        it('should set the SVG width and height equaly based on config', () => {
            render();
            expect(getSvgElement()._attributes.width).toEqual(config.width + 20);
            expect(getSvgElement()._attributes.height).toEqual(config.width + 20);
        });

        it('should set the SVG background color based on config', () => {
            render();
            expect(getSvgElement()._styles['background-color']).toEqual("#123456");
        });

        it('should center the radar', () => {
            render();
            expect(getRadarElement()._attributes['transform']).toEqual("translate(250,250)");
        });

        it('should initialize tooltip', () => {
            render();
            expectToooltipToBeRenderedCorrectly("", 0);
        });

    });

    describe('Rendering grid elements', () => {

        describe('Render sector elements', () => {
            it('should render 3 sector lines correctly', () => {
                render();

                expectLineToBeDrawnCorrectly(getGridElement()._children[1], 0, 0, 260, 0);
                expectLineToBeDrawnCorrectly(getGridElement()._children[2], 0, 0, -130, 225.166);
                expectLineToBeDrawnCorrectly(getGridElement()._children[3], 0, 0, -130, -225.166);
            });

            it('should render 5 sector lines correctly', () => {
                config.sectors = [
                    { label: "Sector 1" },
                    { label: "Sector 2" },
                    { label: "Sector 3" },
                    { label: "Sector 4" },
                    { label: "Sector 5" }
                ];

                render();

                expectLineToBeDrawnCorrectly(getGridElement()._children[1], 0, 0, 260, 0);
                expectLineToBeDrawnCorrectly(getGridElement()._children[2], 0, 0, 80.34, 247.27);
                expectLineToBeDrawnCorrectly(getGridElement()._children[3], 0, 0, -210.34, 152.82);
                expectLineToBeDrawnCorrectly(getGridElement()._children[4], 0, 0, -210.34, -152.82);
                expectLineToBeDrawnCorrectly(getGridElement()._children[5], 0, 0, 80.34, -247.27);
            });

            it("should render sector labels", () => {
                config.style!.showSectorLabels = true;
                config.style!.showRingLabels = false;

                render();

                const legend = getGridElement()._children[0];
                const paths = legend._children.filter((child: any) => child._name === 'path');
                const labels = legend._children.filter((child: any) => child._name === 'text');

                for (let i = 0; i < paths.length; i++) {
                    const textPath = labels[i]._children[0];
                    expect(paths[i]._attributes['id']).toEqual("legend" + i + "_test");
                    expect(textPath._text).toEqual(config.sectors[i].label);
                    expect(textPath._attributes['id']).toEqual("legendText" + i + "_test");
                    expect(textPath._attributes['xlink:href']).toEqual("#legend" + i + "_test");
                    expect(textPath._attributes['startOffset']).toEqual("50%");
                    expect(textPath._attributes["fill"]).toEqual(config.style?.sectorLabelColor);
                    expect(textPath._attributes["font-weight"]).toEqual("bold");
                    expect(textPath._attributes["font-size"]).toEqual("30px");
                    expect(textPath._styles['text-anchor']).toEqual("middle");
                    expect(textPath._styles['font-family']).toEqual(config.style?.font);
                    expect(textPath._styles['pointer-events']).toEqual("none");
                    expect(textPath._styles['user-select']).toEqual("none");
                }
            });

            it("should not render sector labels", () => {
                config.style!.showSectorLabels = false;
                config.style!.showRingLabels = false;

                render();

                const legend = getGridElement()._children[0];
                const paths = legend._children.filter((child: any) => child._name === 'path');
                const labels = legend._children.filter((child: any) => child._name === 'text');

                expect(paths.length).toEqual(0);
                expect(labels.length).toEqual(0);
            });
        });

        describe('Rendering ring elements', () => {
            it('should render 3 rings correctly without sector labels', () => {
                config.style!.showSectorLabels = false;

                render();

                const rings = getGridElement()._children.filter((child: any) => child._name === 'circle');
                const baseR = 83.33;

                expectRingsToBeDrawnCorrectly(rings, baseR);
            });

            it('should render 3 rings correctly with space for sector labels', () => {
                config.style!.showSectorLabels = true;

                render();

                const rings = getGridElement()._children.filter((child: any) => child._name === 'circle');
                const baseR = 62.5;

                expectRingsToBeDrawnCorrectly(rings, baseR);
            });

            it('should render 5 rings correctly without sector labels', () => {
                config.style!.showSectorLabels = false;
                config.rings = [
                    { label: "Ring 1", color: 'red' },
                    { label: "Ring 2", color: 'green' },
                    { label: "Ring 3", color: 'blue' },
                    { label: "Ring 4", color: 'yellow' },
                    { label: "Ring 5", color: 'black' }
                ];

                render();

                const rings = getGridElement()._children.filter((child: any) => child._name === 'circle');
                const baseR = 50;

                expectRingsToBeDrawnCorrectly(rings, baseR);
            });

            it('should render 5 rings correctly with space for sector labels', () => {
                config.style!.showSectorLabels = true;
                config.rings = [
                    { label: "Ring 1", color: 'red' },
                    { label: "Ring 2", color: 'green' },
                    { label: "Ring 3", color: 'blue' },
                    { label: "Ring 4", color: 'yellow' },
                    { label: "Ring 5", color: 'black' }
                ];

                render();

                const rings = getGridElement()._children.filter((child: any) => child._name === 'circle');
                const baseR = 41.66;

                expectRingsToBeDrawnCorrectly(rings, baseR);
            });

            it("should not render ring labels", () => {
                config.style!.showRingLabels = false;
                render();

                const labels = getGridElement()._children.filter((child: any) => child._name === 'text');

                expect(labels.length).toEqual(0);
            });

            it("should render ring labels correctly", () => {
                config.style!.showRingLabels = true;

                render();

                const labels = getGridElement()._children.filter((child: any) => child._name === 'text');

                expect(labels.length).toEqual(config.rings.length);

                for (let i = 0; i < labels.length; i++) {
                    expect(labels[i]._text).toEqual(config.rings[i].label);
                }
            });

        });

        describe('Rendering radar entries', () => {
            it('should generate proper element id for each entry', () => {
                render();

                const blips = getRadarElement()._children[1];
                const g = blips._children[0];
                const idGenerator = g._attributes['id'];

                radar.entries.forEach((entry: any) => {
                    expect(idGenerator(entry)).toEqual("blip" + entry.id);
                });
            });
            it('should position element to entry location', () => {
                render();

                const blips = getRadarElement()._children[1];
                const g = blips._children[0];
                const transform = g._attributes['transform'];

                radar.entries.forEach((entry: any) => {
                    expect(transform(entry)).toEqual(`translate(${entry.point.x},${entry.point.y})`);
                });
            });

            it('should render entry correctly (moved = 0)', () => {
                render();

                const blips = getRadarElement()._children[1];
                const g = blips._children[0];
                const renderEntry = g._each;
                const entry = radar.entries[0];
                const blip = mockD3Element("#blip" + entry.id)
                elements['#test']._children.push(blip);

                renderEntry(entry);

                const blipLabel = blip._children[1];

                expect(blip._children[0]._name).toEqual('circle');
                expect(blip._children[0]._attributes['r']).toEqual(config.style?.blips?.r);
                expect(blip._children[0]._attributes['fill']).toEqual(entry.color);

                expectBlipLabelToBeRenderedCorrectly(blipLabel, entry);
            })

            it('should render entry correctly (moved = 1)', () => {
                render();

                const blips = getRadarElement()._children[1];
                const g = blips._children[0];
                const renderEntry = g._each;
                const entry = radar.entries[1];
                const blip = mockD3Element("#blip" + entry.id)
                elements['#test']._children.push(blip);

                renderEntry(entry);

                const blipLabel = blip._children[1];

                expect(blip._children[0]._name).toEqual('path');
                expect(blip._children[0]._attributes['d']).toEqual("M -12.99038105676658 8.75 12.99038105676658 8.75 0 -13.75 z");
                expect(blip._children[0]._styles['fill']).toEqual(entry.color);

                expectBlipLabelToBeRenderedCorrectly(blipLabel, entry);
            })

            it('should render entry correctly (moved = -1)', () => {
                render();

                const blips = getRadarElement()._children[1];
                const g = blips._children[0];
                const renderEntry = g._each;
                const entry = radar.entries[2];
                const blip = mockD3Element("#blip" + entry.id)
                elements['#test']._children.push(blip);

                renderEntry(entry);

                const blipLabel = blip._children[1];

                expect(blip._children[0]._name).toEqual('path');
                expect(blip._children[0]._attributes['d']).toEqual("M -12.99038105676658 -8.75 12.99038105676658 -8.75 0 13.75 z");
                expect(blip._children[0]._styles['fill']).toEqual(entry.color);

                expectBlipLabelToBeRenderedCorrectly(blipLabel, entry);
            })

            it('should setup entry data render functions', () => {
                render();

                const blips = getRadarElement()._children[1];
                const g = blips._children[0];

                expect(blips._data).toEqual(radar.entries);
                expect(g._styles['cursor']).toEqual("pointer");

                expect(g._attributes['class']).toBe("blip");
                expect(g._attributes['id']).toBeDefined();
                expect(g._attributes['transform']).toBeDefined();
                expect(g._on['mouseover']).toBeDefined();
                expect(g._on['mouseout']).toBeDefined();
                expect(g._on['click']).toBeDefined();
                expect(g._each).toBeDefined();
            });

        });

    });

    describe('Event handling', () => {
        let entry: RadarEntry;
        let mouseover: Function;
        let mouseout: Function;
        let click: Function;

        beforeEach(() => {
            config.onHover = jest.fn();
            config.onHoverOut = jest.fn();
            config.onSelect = jest.fn();
            render();

            const blips = getRadarElement()._children[1];
            const g = blips._children[0];

            entry = radar.entries[0];
            mouseover = g._on['mouseover'];
            mouseout = g._on['mouseout'];
            click = g._on['click'];

            for (let i = 0; i < config.sectors.length; i++) {
                getSvgElement()._children.push(mockD3Element("#legendText" + i + "_test"));
            }

            const blip = mockD3Element("#blip" + entry.id)
            getSvgElement()._children.push(blip);

            const tooltip = getRadarElement()._children[2];
            const tooltipText = tooltip._children[1];

            tooltipText.node = jest.fn().mockReturnValue({ getBBox: jest.fn().mockReturnValue({ height: 100 }) });
        });

        it('should call radar.onEntryHover when mouseover', () => {
            mouseover({}, entry);

            expect(config.onHover).toHaveBeenCalledWith(entry);
        });

        it('should show tooltip for entry on mouseover event', () => {
            mouseover({}, entry);

            expect(config.onHover).toHaveBeenCalledWith(entry);
            expectToooltipToBeRenderedCorrectly(`${entry.id + 1}. ${entry.label}`, 1);
        });

        it('should call radar.onEntryHoverOut when mouseout', () => {
            mouseout({}, entry);

            expect(config.onHoverOut).toHaveBeenCalledWith(entry);
        });

        it('should hide tooltip for entry on mouseout event', () => {
            mouseout({}, entry);

            expect(config.onHoverOut).toHaveBeenCalledWith(entry);
            expectToooltipToBeRenderedCorrectly("", 0);
        });

        it('should call radar.onEntrySelect when click', () => {
            click({}, entry);

            expect(config.onSelect).toHaveBeenCalledWith(entry);
        });

        it('should highlight sector on click event', () => {
            click({}, entry);

            expect(config.onSelect).toHaveBeenCalledWith(entry);

            expect(getSvgElement()._children[1]._styles['opacity']).toEqual(1);
            expect(getSvgElement()._children[2]._styles['opacity']).toEqual(0.3);
            expect(getSvgElement()._children[3]._styles['opacity']).toEqual(0.3);
        });

    });

    function expectRingsToBeDrawnCorrectly(rings: any, baseR: number) {
        for (let i = 0; i < rings.length; i++) {
            expect(rings[i]._attributes.cx).toEqual(0);
            expect(rings[i]._attributes.cy).toEqual(0);
            expect(rings[i]._attributes.r).toBeCloseTo(baseR * i, 1);
            expect(rings[i]._styles.stroke).toEqual(config.style?.lineColor);
        }
    }

    function expectLineToBeDrawnCorrectly(lineElement: any, x1: number, y1: number, x2: number, y2: number) {
        expect(lineElement._attributes['x1']).toBeCloseTo(x1);
        expect(lineElement._attributes['y1']).toBeCloseTo(y1);
        expect(lineElement._attributes['x2']).toBeCloseTo(x2);
        expect(lineElement._attributes['y2']).toBeCloseTo(y2);
        expect(lineElement._styles['stroke-width']).toBeCloseTo(1);
        expect(lineElement._styles['stroke']).toBe(config.style?.lineColor ?? "black");
    }

    function expectToooltipToBeRenderedCorrectly(text: string, opacity: number) {
        const tooltip = getTooltipElement();
        const tooltipRect = tooltip._children[0];
        const tooltipText = tooltip._children[1];

        expect(tooltip._attributes['id']).toEqual("blipTooltip");
        expect(tooltip._styles['opacity']).toEqual(opacity);

        expect(tooltipRect._name).toEqual("rect");
        expect(tooltipRect._attributes['rx']).toEqual(4);
        expect(tooltipRect._attributes['ry']).toEqual(4);
        expect(tooltipRect._styles['opacity']).toEqual(1);

        expect(tooltipText._name).toEqual("text");
        expect(tooltipText._text).toEqual(text);
        expect(tooltipText._styles['font-family']).toEqual(config.style?.font);
        expect(tooltipText._styles['font-size']).toEqual("15px");
        expect(tooltipText._styles['fill']).toEqual("white");
        expect(tooltipText._styles['pointer-events']).toEqual("none");
        expect(tooltipText._styles['user-select']).toEqual("none");
    }

    function expectBlipLabelToBeRenderedCorrectly(blipLabel: any, entry: any) {
        expect(blipLabel._name).toEqual('text');
        expect(blipLabel._text).toEqual(entry.id + 1);

        expect(blipLabel._attributes['y']).toEqual(3);
        expect(blipLabel._attributes['text-anchor']).toEqual("middle");
        expect(blipLabel._styles['fill']).toEqual("#fff");
        expect(blipLabel._styles['font-family']).toEqual(config.style?.font);
        expect(blipLabel._styles['font-size']).toEqual(config.style?.blips?.fontSize);
        expect(blipLabel._styles['pointer-events']).toEqual("none");
        expect(blipLabel._styles['user-select']).toEqual("none");
    }
});

