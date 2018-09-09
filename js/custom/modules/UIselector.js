// UI to select layers

// get UI select config data
ws.getUIselectData = () => {
    fetch('data/UIdata.json')
    .then(x =>  {if (x.ok) {
                    return x.json()
                }
                else {
                    console.log('ws.getUIselectData error getting data')
                }
    })
    .then(jsonData => {
        ws.UIdata = jsonData;
        document.body.insertBefore(ws.createUserSelect(ws.UIdata),
            document.getElementsByClassName('main')[0]);
    })
    .catch(err => {
        console.log(err);
    });
}


ws.createUserSelect = (uidata) =>  {
    // create user select panel
    let el = document.createElement('div');
    el.setAttribute('class', 'user-select');
    el.setAttribute('style', 'display: none;')
    el.addEventListener('change', (event) => {
        let inputTextId = event.target.options[event.target.selectedIndex].getAttribute('data-input-id');
        let defaultInputTextValue = event.target.options[event.target.selectedIndex].getAttribute('data-legend');
        document.getElementById(inputTextId).value = defaultInputTextValue;
    });

    let elements = ws.createUI_1(uidata);
    for (let each of elements) {
        el.appendChild(each);
    }
    return el;
}

ws.createUI_1 = (uidata) => {

    let elements = [];
    let result = ``;
    let el;
    for (let [i, each] of uidata.entries()) {
        el = document.createElement('div');
        el.setAttribute('class', "user-select__group-1");
        el.setAttribute('data-layer-type', each.layerType);
        el.setAttribute('data-layer-style', each.layerStyle);
        let dropdown = ws.createDropdown(each, i);
        let legend = ws.createLegendTitle(each, i);
        let selectGroup =   `<div class="user-select__dropdown">
                                ${dropdown}
                            </div>
                            <div class="user-select__legend">
                                ${legend}
                            </div>`
        result = result + selectGroup
        el.innerHTML = result;
        elements.push(el);
        result = ``;
    }
    return elements;
}

ws.createDropdown = (x, index) => {
    // x UIdata[n] obj, index int
    let dropdownListHtml = ws.createDropdownList(x.dropdownList, index);
    let label =     `<label for="select-${index}" class="user-select__label">${x.selectorLabel}:</label>`;
    let select =    `<select name="data-source" class="user-select__select" id="select-${index}">
                        ${dropdownListHtml}
                    </select>`;
     return label + select
}

ws.createDropdownList = (x, index) => {
    // x dropdownList obj
    // add a None option
    x.unshift({resource: {"id": "None", "display": "None", "legendTitle": ""}});
    let result = ``;
    let temp = ``;
    for (let each of x) {
        temp = `<option value="${each.resource.id}" data-legend="${each.resource.legendTitle}" data-input-id="text-${index}">${each.resource.display}</option>`;
        result = result + temp;
    }
    return result;
}

ws.createLegendTitle = (x, index) => {
    // x UIdata[n] obj, index int
    let result =    `<label for="text-${index}" class="user-select__label">Legend title:</label>
                     <input name="title" type="text" class="user-select__input" id="text-${index}">`
    return result;
}

