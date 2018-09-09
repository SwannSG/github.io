// CONFIG (add all provinces below) ************************
// POINTS valid shape circle | square | diamond
ws.CONFIG = {
    BIN_SIZE: 2000,
    COLORS: {
        BIN_1: '#fef0d9',
        BIN_2: '#fdcc8a',
        BIN_3: '#fc8d59',
        BIN_4: '#e34a33',
        BIN_5: '#b30000'
    },
    POINTS: {
        a: {0: {shape: 'square', radius: 0.6, fillColor: 'purple', fillOpacity: .5, color: 'purple', weight: 1},
            1: {shape: 'square', radius: 0.6, fillColor: 'orange', fillOpacity: 1, color: 'black', weight: 1},
            2: {shape: 'square', radius: 0.6, fillColor: 'yellow', fillOpacity: 1, color: 'black', weight: 1}},
        b: {0: {shape: 'circle', radius: 0.6, fillColor: 'green', fillOpacity: .5, color: 'green', weight: 1},
            1: {shape: 'circle', radius: 0.6, fillColor: 'blue', fillOpacity: 1, color: 'black', weight: 1},
            2: {shape: 'circle', radius: 0.3, fillColor: 'indigo', fillOpacity: 1, color: 'black', weight: 1}},
        c: {0: {shape: 'diamond', radius: 0.6, fillColor: 'black', fillOpacity: .8, color: 'black', weight: 1},
            1: {shape: 'diamond', radius: 0.3, fillColor: 'gray', fillOpacity: 1, color: 'black', weight: 1},
            2: {shape: 'diamond', radius: 0.3, fillColor: 'pink', fillOpacity: 1, color: 'black', weight: 1}},
    },
    MAP_INITIAL: {latlng: [-28.58, 24.52], zoom: 6},
    DELETE_LOCALSTORAGE: false
}
// end CONFIG ******************************************

// keep track of custom controls added to the map
ws.customControls = [];
// end keep track of custom controls added to the map

// keep a reference to a layer placed on the map
// ws.layer.name 
ws.layers = {};
ws.layers.mapLayer = {}
// end keep a reference to a layer placed on the map

// functionality associated with map Legends
ws.legends = {};
ws.legends.references = {}  // legend references on map
// end functionality associated with map Legends

// functionality for local storage
ws.localStorage = {};
// endfunctionality for local storage