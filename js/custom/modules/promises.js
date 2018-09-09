ws.promises = {}

ws.promises.getFile = (rsrcId) => {
    // rsrcId: url of file to get
    return new Promise((resolve, reject) => {
        fetch(rsrcId)
        .then(rspFromServer =>  {
            if (rspFromServer.ok) {
                resolve(rspFromServer);
            }
            else {
                reject({error: '', rspFromServer: rspFromServer});
            }
        })
        .catch((error) => {
            reject({error: '', rspFromServer: ''})   
            })
        })
}

ws.promises.arrayBuff =  (rspFromServer => {
    // rspFromServer.arrayBuffer: raw data of the zip file
    // resolveValue: zipped data
    return new Promise((resolve, reject) => {
        try {
            let jsZip = new JSZip();
            resolve(jsZip.loadAsync(rspFromServer.arrayBuffer()));
        }
        catch(error) {
            reject({error: error});
        }
    })
})

ws.promises.decodeZippedArrayBuff = (zipData) => {
    // zipData: jsZip data structure
    //      zipData.files = {<filename_1>:{} , <filename_2>:{}, ...}
    //          we only have one filename which we get from Object.keys(zipData.files)[0] 
    //      originalFileData (as string) = zipData.file(<filename>).async('string')
    // resolveValue: text data (original data)
    return new Promise((resolve, reject) => {
        try {
            resolve(zipData.file(Object.keys(zipData.files)[0]).async('string'));
        }
        catch(error) {
            reject({error: error});
        }
    })
}

ws.promises.parseJson = (jsonString) => {
    // resolveValue: jsonObj
    return new Promise( (resolve, reject) => {
        try {
            resolve(JSON.parse(jsonString));
        }
        catch(error) {
            reject({error: error});
        }
    })
}

ws.promises.jsonRsp = (rspFromServer) => {
    // resolveValue: jsonObj
    return new Promise((resolve, reject) => {
        try {
            rspFromServer.json()
            .then(resolve)
        }
        catch(error) {
            reject({error: error});
        }
    })
}

// composite promises
// ws.promises.zipFileToJson = (rsrcId) => {
//     return new Promise((resolve, reject) => {
//         ws.promises.getFile(rsrcId)
//         .then(ws.promises.arrayBuff)
//         .then(ws.promises.decodeZippedArrayBuff)
//         .then(ws.promises.parseJson)
//         .then(resolve)
//         .catch(reject);
//     })
// }

ws.promises.zipFileToJson = (rsrcId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let rspFromServer = await ws.promises.getFile(rsrcId);
            let zipData = await ws.promises.arrayBuff(rspFromServer);
            let jsonString = await ws.promises.decodeZippedArrayBuff(zipData);
            let jsonObj = await ws.promises.parseJson(jsonString);
            return resolve(jsonObj);
        }
        catch (error) {
            return reject(error);
        }
    })
}

// ws.promises.fileToJson = (rsrcId) => {
//     return new Promise((resolve, reject) => {
//         ws.promises.getFile(rsrcId)
//         .then(ws.promises.jsonRsp)
//         .then(resolve)
//         .catch(reject);
//     })
// }

ws.promises.fileToJson = (rsrcId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let rspFromServer = await ws.promises.getFile(rsrcId);
            let jsonObj = await ws.promises.jsonRsp(rspFromServer);
            return resolve(jsonObj);
        }
        catch (error) {
            return reject(error);
        }
    })
}