ws.layers.pointToLayerStyle = (styleObj) => {
    let localStyleObj = Object.create(styleObj);
    localStyleObj.radius = ws.map.getZoom()*localStyleObj.radius
    return localStyleObj
}

ws.layers.addLayer = (data, layerDtl) => {
    // data: topoJson, geojson
    let geojsonData, layer, styleObj;
    if (layerDtl.fileFormat==='topojson') {    
        let key = Object.keys(data.objects)[0]
        geojsonData = topojson.feature(data, data.objects[key]);
    }
    else {
        geojsonData = data;
    }

    if (layerDtl.layerType==='chloropleth') {
        // chloropleth layer styles
        if (layerDtl.layerStyle==='default') {
            // map area
            styleObj = {style: ws.layers.styleFeature};
        }
        // create layer
        layer = L.geoJSON(geojsonData, styleObj );
    }

    else if (layerDtl.layerType==='point') {

        if (layerDtl.pointLayerStyle.shape==='circle') {
            let styleObj = ws.layers.pointToLayerStyle(layerDtl.pointLayerStyle);
            layer = L.geoJSON(geojsonData, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, styleObj)
                        .bindPopup(feature.properties.name);
                }
            })
        }
        else if (layerDtl.pointLayerStyle.shape==='square') {
            let styleObj = ws.layers.pointToLayerStyle(layerDtl.pointLayerStyle);
            styleObj.shape = 'square'
            layer = L.geoJSON(geojsonData, {
                pointToLayer: function(feature, latlng) {
                    return L.shapeMarker(latlng, styleObj)
                        .bindPopup(feature.properties.name);
                }
            })
        }
        else if (layerDtl.pointLayerStyle.shape==='diamond') {
            let styleObj = ws.layers.pointToLayerStyle(layerDtl.pointLayerStyle);
            styleObj.shape = 'diamond'
            layer = L.geoJSON(geojsonData, {
                pointToLayer: function(feature, latlng) {
                    return L.shapeMarker(latlng, styleObj)
                        .bindPopup(feature.properties.name);
                }
            })
        }
    }

    layer.addTo(ws.map);
    // track layers added to map
    ws.layers.mapLayer[layerDtl.rsrcId] = {layer: layer,
         layerType: layerDtl.layerType,
         radius: layerDtl.pointLayerStyle ? layerDtl.pointLayerStyle.radius : 'none'};

}

// used to style ward areas with fill color based on female population size
ws.layers.styleFeature = (feature) => {

    let getFillColor = (n) => {
        // n --> no of woman in ward
        let BIN_SIZE = ws.CONFIG.BIN_SIZE;
        if (n > BIN_SIZE * 4) {return ws.CONFIG.COLORS.BIN_5;}
        else if (n > BIN_SIZE * 3) {return ws.CONFIG.COLORS.BIN_4;}
        else if (n > BIN_SIZE * 2) {return ws.CONFIG.COLORS.BIN_3; }
        else if (n > BIN_SIZE * 1) {return ws.CONFIG.COLORS.BIN_2}
        else {return ws.CONFIG.COLORS.BIN_1}
    }

    return {
        fillColor: getFillColor(feature.properties.females),
        fillOpacity: .7,
        weight: 1,
        opacity: .8,
        color: 'black',
    }
}


