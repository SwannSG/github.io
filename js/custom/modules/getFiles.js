ws.getZipFile = (rsrcId) => {
    return new Promise((resolve, reject) => {
        let jsZip = new JSZip();
        fetch(rsrcId)
        .then(rspFromServer =>  {
            if (rspFromServer.ok) {
                return rspFromServer;
            }
            else {
                return reject(rspFromServer);
            }
        })
        .then(rspFromServer => {
            // rspFromServer.arrayBuffer: raw data of the zip file
            return jsZip.loadAsync(rspFromServer.arrayBuffer())
        })
        .then(zipData => {
            // zipData: jsZip data structure
            //      zipData.files = {<filename_1>:{} , <filename_2>:{}, ...}
            //          we only have one filename which we get from Object.keys(zipData.files)[0] 
            //      originalFileData (as string) = zipData.file(<filename>).async('string')
            return zipData.file(Object.keys(zipData.files)[0]).async('string')
        })
        .then(jsonString => {
            // jsonString: string representation of original JSON, which needs to be parsed 
            return resolve(JSON.parse(jsonString));
        })
        .catch(error => {
            // not sure what this error would look like
            return reject(error);
        })
    })
}



ws.getJsonZipFile = (layerDtl) => {
    return new Promise( (resolve, reject) => {
        let jsZip = new JSZip();
        fetch(layerDtl.rsrcId)
        .then(x =>  {if (x.ok) {
            // x: Response (from server)
            return x;
        }
        else {
            let errorText = `Error downloading <span>${layerDtl.rsrcId}</span>. (${x.statusText} ${x.status})`; 
            ws.errorMsg(errorText);
        } 
        })
        .then(x => {
            // x.arrayBuffer: raw data of the zip file
            return jsZip.loadAsync(x.arrayBuffer())
        })
        .then(x => {
            // x: jsZip data structure
            //      x.files = {<filename_1>:{} , <filename_2>:{}, ...}
            //          we only have one filename which we get from Object.keys(x.files)[0] 
            //      originalFileData (as string) = x.file(<filename>).async('string')
            return x.file(Object.keys(x.files)[0]).async('string')
        })
        .then(x => {
            // x: string representation of original JSON, which needs to be parsed 
            resolve(JSON.parse(x), layerDtl);
        })
        .catch(error => {
            reject(error);
        })
    })
}

ws.getJsonRsrc  = (rsrcId, rsrcName='', eventName='gotJsonRsrcOk') => {
    /*
    download json file, generate event when successfully downloaded
        rsrcId:     url of json file
        rsrcName:   user defined label that can be associated with downloaded data
        eventName:  default name is 'gotJsonRsrcOk'
    Must add associated event handler
        document.body.addEventListener('gotJsonRsrcOk', {event} {
            event.detail.rsrcName:  rsrcName argument value
            event.detail.data:      downloaded json file data
        }         
    */
    fetch(rsrcId)
    .then(x =>  {if (x.ok) {
                    return x.json()
                }
                else {
                    let errorText = `Error downloading <span>${rsrcId}</span>. (${x.statusText} ${x.status})`; 
                    ws.errorMsg(errorText);
                } 
    })
    .then(jsonData => {
        document.body.dispatchEvent(new CustomEvent(
            eventName,
            {detail: {
                rsrcName: rsrcName, 
                data: jsonData
                }
            }));
    })
    .catch(err => {
        console.log(err);
        let errorText = `Error downloading <span>${rsrcId}</span>.`; 
        ws.errorMsg(errorText);
    });
} 

ws.gotJsonRsrcOk = (event) => {
    if (event.detail.rsrcName === 'wardDataGeoJson') {
        ws.wardLayerGeoJson(event.detail.data);
    }
    else if (event.detail.rsrcName === 'wardDataTopoJson') {
        ws.wardLayerTopoJson(event.detail.data);
    }
    else if (event.detail.rsrcName === 'shelterData') {
        ws.sheltersLayer(event.detail.data);
    }
}

ws.gotZipFileOk = (event) => {
    if (event.detail.rsrcName === 'topojson') {
        ws.layerTopoJson(event.detail.data,
                             event.detail.rsrcId);
    }
}





