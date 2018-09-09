// https://github.com/tsayen/dom-to-image

ws.domToImage = {}

ws.domToImage.saveMap = async (event) => {

    console.log('save map');

    // briefly remove zoom
    ws.toggleMapZoomControlDisplay()

    let blob;
    let styleObj = {}


    let computedStyle = window.getComputedStyle(document.getElementsByClassName('main')[0])
    styleObj.height = Math.ceil(computedStyle.height);
    styleObj.width = Math.ceil(computedStyle.width);
    styleObj.bgcolor = 'red';
    styleObj.quality = 1;
   
    try {
        blob = await domtoimage.toJpeg(document.getElementsByClassName('main')[0], styleObj);
    }
    catch (error) {
        console.log(error);
    }
    const a = document.createElement('a');
    a.href = 'data:image/png' + blob;
    a.setAttribute('download', 'map.jpg')
    a.click();

    delete blob;
    delete a;

    // add zoom back to map
    ws.toggleMapZoomControlDisplay()
}

ws.domToImage.setQuality = () => {
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

    let uiObj = {} 
    for (each of layersToFetch) {
        if (each.rsrcId.indexOf('merged')>=0) {
            uiObj.merged = each.selectedOption;
        }
        else if (each.rsrcId.indexOf('police')>=0) {
            uiObj.police = each.selectedOption;
        }
        else if (each.rsrcId.indexOf('clinic')>=0) {
            uiObj.clinic = each.selectedOption;
        }
        else if (each.rsrcId.indexOf('shelter')>=0) {
            uiObj.shelter = each.selectedOption;
        }
    }
    return uiObj;
}