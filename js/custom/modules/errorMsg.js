ws.errorMsg = (msgText) => {

    // remove error msg from DOM (UI event)
    ws.errorMsg.closeErrorMsg = (e) => {
        ws.errorMsg.ref.remove();
    }
    // end remove error msg from DOM

    // show error msg in DOM
    let innerHtml = `<p class="u-center-text">
                        ${msgText}
                    </p>
                    <button class="error-msg__close" onclick= "ws.errorMsg.closeErrorMsg(event)">
                        &#88;
                    </button>`
    ws.errorMsg.ref = document.createElement('div');
    ws.errorMsg.ref.setAttribute('class', 'error-msg');
    ws.errorMsg.ref.innerHTML = innerHtml;
    document.body.appendChild(ws.errorMsg.ref);
    // end show error msg in DOM
}
