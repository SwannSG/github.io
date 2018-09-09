ws.btnGetDataClicked = (event) => {

    if (window.getComputedStyle(document.getElementsByClassName('user-select')[0]).display==='none') {
        // do nothing
        return;
    }

    let turnSpinnerOn = () => {
        document.getElementsByClassName('vertical-menu__download')[0].setAttribute('style',
        "display: none;");
       document.getElementsByClassName('vertical-menu__spinner')[0].setAttribute('style',
        "display: inline-block;");
    }

    let turnSpinnerOff = () => {
        document.getElementsByClassName('vertical-menu__download')[0].setAttribute('style',
        "display: inline-block;");
       document.getElementsByClassName('vertical-menu__spinner')[0].setAttribute('style',
        "display: none;");
    }

    turnSpinnerOn();
  
    let readUIselectorValues = () => {
        let layersToFetch = [];
        for (let el of document.getElementsByClassName('user-select__group-1')) {
            let layerDtl = {rsrcId:'', legendTitle: '',
                        fileType: '',  fileFormat: '',
                        layerType: '', layerStyle: '',
                        selectedOption: ''
                        }
            layerDtl.layerType = el.getAttribute('data-layer-type');
            layerDtl.layerStyle = el.getAttribute('data-layer-style');
            layerDtl.rsrcId = el.getElementsByTagName('select')[0].value;

            for (let option of el.getElementsByTagName('select')[0].getElementsByTagName('option')) {
                if (option.selected) {
                    layerDtl.selectedOption = option.text;
                    break;
                }
            }

            layerDtl.legendTitle = el.getElementsByTagName('input')[0].value;
            layerDtl.fileType = layerDtl.rsrcId.split('.').pop();
            if (layerDtl.fileType==='zip') {
                layerDtl.fileFormat =  layerDtl.rsrcId.split('.')[layerDtl.rsrcId.split('.').length-2]
            }
            else {
                layerDtl.fileFormat = layerDtl.fileType
            }
            layersToFetch.push(layerDtl);
        }
        // remove None selections
        layersToFetch = layersToFetch.filter((item) => {if (item.rsrcId!='None') {return item}})
        

        
        // add point legend style details
        // mark layers if they already are on the map
        //  point layers are always re-rendered
        //  chloropleth layers are not re-rendered if they already exsist on map
        let temp = {};
        let count = 0;
        for (let each of layersToFetch) {
            
            if (each.layerType==='point') {
                if (temp.hasOwnProperty(each.selectedOption)) {
                    each.pointLayerStyle = ws.CONFIG.POINTS[each.layerStyle][temp[each.selectedOption].count];
                }
                else {
                    temp[each.selectedOption] = {}
                    temp[each.selectedOption].count = count;
                    each.pointLayerStyle = ws.CONFIG.POINTS[each.layerStyle][temp[each.selectedOption].count]; 
                    count = count + 1
                }
            }

            else if (each.layerType==='chloropleth') {
                // nothing yet
            }
        }
        return layersToFetch;
    }

    let removeLayers = (layersToFetch) => {
        // remove layers from map

        let lookup = {}
        for (let each of layersToFetch) {
            lookup[each.rsrcId] = true;
        }

        for (let rsrcId in ws.layers.mapLayer) {
            if (ws.layers.mapLayer[rsrcId].layerType==='point') {
                // always remove point layers
                ws.map.removeLayer(ws.layers.mapLayer[rsrcId].layer);
                delete ws.layers.mapLayer[rsrcId];
            }
            else if (ws.layers.mapLayer[rsrcId].layerType==='chloropleth') {
                if (lookup[rsrcId]) {
                    // don't delete chloropleth layer will be re-used
                    layersToFetch.filter(item => {
                        if (item.rsrcId===rsrcId) {
                            return item;
                        }
                    })[0].onMap = true;
                }
                else {
                    ws.map.removeLayer(ws.layers.mapLayer[rsrcId].layer);
                    delete ws.layers.mapLayer[rsrcId];
                }
            }
        }
    }

    let addLayerPromise = (layerDtl) => {
        return new Promise( async (resolve, reject) => {
            let jsonString = '';
            let jsonObj = {};
            let dbKeys = [];
            dbKeys = await ws.idb.keys()
            if (layerDtl.fileType==='zip') {
                try {
                    if (dbKeys.includes(layerDtl.rsrcId)) {
                        // get jsonObj from local storage
                        jsonObj = await ws.idb.get(layerDtl.rsrcId);
                        console.log(layerDtl.rsrcId, 'data from localStore')
                    }
                    else {
                        jsonObj = await ws.promises.zipFileToJson(layerDtl.rsrcId);    
                        ws.idb.set(layerDtl.rsrcId, jsonObj);
                        console.log(layerDtl.rsrcId, 'data from server')
                    }
                    ws.layers.addLayer(jsonObj, layerDtl);
                    return resolve({layerDtl: layerDtl, state:'done'});
                }
                catch (error) {
                    return reject(error);
                }
            }
            else {
                try {
                    if (dbKeys.includes(layerDtl.rsrcId)) {
                        // get jsonObj from local storage
                        jsonObj = await ws.idb.get(layerDtl.rsrcId);
                        console.log(layerDtl.rsrcId, 'data from localStore')
                    }
                    else {
                        jsonObj = await ws.promises.fileToJson(layerDtl.rsrcId);
                        ws.idb.set(layerDtl.rsrcId, jsonObj);
                        console.log(layerDtl.rsrcId, 'data from server')
                    }
                    ws.layers.addLayer(jsonObj, layerDtl);
                    return resolve({layerDtl: layerDtl, state:'done'});
                }
                catch (error) {
                    return reject(error);
                }
            }
        }
    )} 

    let makeLegend = (layersToFetch) => {

        for (let item in ws.legends.references) {
            // remove existing legend
            ws.map.removeControl(ws.legends.references[item])
        }

        let pointLegend = {};
        let chloroplethLegend = {};
        for (let each of layersToFetch) {
            if (each.layerType==='point') {
                let rowObj = {label:'', backgroundColor: '', borderColor: '', shape:''};
                rowObj.label = each.legendTitle;
                rowObj.backgroundColor = each.pointLayerStyle.fillColor;
                rowObj.borderColor = each.pointLayerStyle.color;
                rowObj.shape = each.pointLayerStyle.shape;
                if (pointLegend.hasOwnProperty(each.selectedOption)) {
                    pointLegend[each.selectedOption].push(rowObj)
                }
                else {
                    pointLegend[each.selectedOption] = [rowObj];
                }
            }
            else if (each.layerType==='chloropleth') {
                chloroplethLegend[each.legendTitle] = each.layerStyle
            }
        }


        // sort point labels in alphabetical order
        for (let item in pointLegend) {
            pointLegend[item] = pointLegend[item].sort((a,b) => {
                if (a.label < b.label) {return -1;}
                if (a.label > b.label) {return 1;}
                return 0
            })
        }

        // now add to map
        for (let item in chloroplethLegend) {
            ws.legends.references[item] = ws.legends.createLegend('bottomright',
                ws.legends.createChloroLegend(item, chloroplethLegend[item]));
        }

        for (let item in pointLegend) {
            ws.legends.references[item] = ws.legends.createLegend('bottomright', 
                ws.legends.createLegend_c(item, pointLegend[item]), item.shape);
        }
    }


    // read UI
    let layersToFetch = readUIselectorValues();

    // remove some layers from existing map
    removeLayers(layersToFetch);
    
    // create legend
    makeLegend(layersToFetch);

    let addLayersPromises = [];
    for (let layerDtl of layersToFetch) {
        if (layerDtl.onMap) {
            // layer already on map. Do nothing.
        }
        else {
            // add layer to map
            addLayersPromises.push(addLayerPromise(layerDtl))
        }
    }

    Promise.all(addLayersPromises)
    .then(() => {
        for (let item in ws.layers.mapLayer) {
            if (ws.layers.mapLayer[item].layerType==='point') {
                try {
                    ws.layers.mapLayer[item].layer.bringToFront();
                }
                catch(error) {
                    console.log(error);
                    // just carry on
                }
            }
        }
        turnSpinnerOff();
        // hide UI selection
        document.getElementsByClassName('user-select')[0].setAttribute('style','display:none;');
    })
    .catch((error) => {
        console.log(error);
        if (!error.rspFromServer.ok) {
            // file not available on server
            // show screen message
            let rsrcId = error.rspFromServer.url.split('/').pop();
            ws.errorMsg(`${rsrcId} not found. Update UIdata.json.`);    
        }
    });
}

