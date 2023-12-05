# EG-Radar

<img src="radars.PNG" width="888">

eg-radar is a JavaScript library for creating interactive radars inspired by [Thoughtworks](https://www.thoughtworks.com/radar) and [Zalando Tech Radar](https://opensource.zalando.com/tech-radar/) technology radars. It provides many customization options to create radar that fits your needs and style preferences. You can look at [demo technology radar](https://eg-radar-demo.stackblitz.io/) built with eg-radar.


## Installation
Tech radar module can simply be installed using npm:
```sh
$ npm install eg-radar
```

## Usage
To use the module you need to import it in your project:
```javascript
import { EgRadar } from 'eg-radar';
```
Then, create a radar configuration object and pass it to the radar constructor:
```javascript
var radarConfig = {
    width: 700,
    sectors = [
        { "label": "Techniques"              },
        { "label": "Tools"                   },
        { "label": "Platforms"               },
        { "label": "Languages & Frameworks"  },
    ],
    rings = [
        { "label": "ADOPT" , "color": "green" },
        { "label": "TRIAL" , "color": "blue"  },
        { "label": "ASSESS", "color": "orange"},
        { "label": "HOLD"  , "color": "red"   }
    ],
    entries = [
         { "label": "Java",   "sector": 3, "ring": 1, "moved": 0 },
         { "label": "Angular","sector": 3, "ring": 2, "moved": 1 },
         { "label": "React",  "sector": 3, "ring": 2, "moved": -1},
         { "label": "AWS",    "sector": 2, "ring": 0, "moved": 0 }
    ],
    style: {
      showSectorLabels: true
    }
};

let radar = new EgRadar(radarConfig);
```

Finally to render the radar create `<svg>` element and pass element id to the render function:

```html
<svg id="myRadar"></svg>
```
```javascript
radar.render("myRadar")
```

## Radar Configuration
Radar configuration object has following properties:
| Property | Type | Description |
| --- | --- | --- |
| width | number | Width and Height of the radar |
| sectors | array | Array of sector configurations |
| sectors[].label | string | Sector label |
| sectors[].data | any | Custom sector data   |
| rings | array | Array of ring configurations objects |
| rings[].label | string | Ring label |
| rings[].color | string | Ring color |
| entries | array | List of entries to display in radar |
| entries[].label | string | Data label |
| entries[].sector | number | Sector index |
| entries[].ring | number | Ring index |
| entries[].moved | number | Movement direction (1 - up, -1 down, 0 - no change) |
| entries[].data | any | Custom data for your needs|

## Callbacks
Radar configuration object has following callback properties:
| Property | Type | Description |
|----|----|----|
| onSelect | function(entry) | Callback function called when entry is clicked |
| onHover | function(entry) | Callback function called when entry is hovered |
| onHoverOut | function() | Callback function called when hover has ended |

## Style
Radar configuration object has following style properties:
| Property | Type | Description |
|----|----|----|
| style.seed | number | Seed for random number generator to have consistant generations, leave empty for random result |
| style.showSectorLabels | boolean | Show sector labels |
| style.showRingLabels | boolean | Show ring labels |
| style.background | string | Radar background color |
| style.lineColor | string | Radar grid line color |
| style.sectorLabelColor | string | Sector label text color |
| style.blips | object | Blip style configuration |
| style.blips.r | number | Blip radius |
| style.blips.offset | number | Blip distance to be kept from other blips |
| style.blips.fontSize | string | Blip label font size |
| style.tooltip | object | Tooltip style configuration |
| style.tooltip.color | string | Tooltip text color |
| style.tooltip.backgroundColor | string | Tooltip background color |
| style.tooltip.fontSize | number | Tooltip font size |

## Contributions

Contributions are welcome. Please read [CONTRIBUTING.md]() for more information. This project exists thanks to all the people who contribute:


