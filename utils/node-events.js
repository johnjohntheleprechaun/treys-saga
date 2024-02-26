let mouseButton = -1;

window.addEventListener("click", event => {
    if (event.target === document.body || event.target === document.documentElement || event.target.id === "node-container") {
        console.log(event.target.id);
        unfocusAll();
    }
});
window.addEventListener("mousemove", event => {
    if (mouseButton === -1) {
        return;
    }
    if (
        event.target === document.body ||
        event.target === document.documentElement ||
        event.target.id === "node-container" ||
        (mouseButton === 1 && event.target.classList && !event.target.classList.contains("embed-container") && event.target.nodeName !== "IFRAME")
    ) {
        //console.log(event.target);
        setOffset(offsetX + event.movementX, offsetY + event.movementY);
    }
});
window.addEventListener("mousedown", e => {
    e.preventDefault();
    mouseButton = e.button
    
});
window.addEventListener("mouseup", _ => { mouseButton = -1 });
window.addEventListener("wheel", event => {
    setScale(scale - event.deltaY * scalingModifier);
});