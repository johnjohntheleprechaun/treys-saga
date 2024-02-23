let mouseButton = -1;

window.addEventListener("click", event => {
    if (event.target === document.body || event.target === document.documentElement) {
        unfocusAll();
    }
});
window.addEventListener("mousemove", event => {
    if (mouseButton === -1) {
        return;
    }
    if (event.target === document.body || event.target === document.documentElement || mouseButton === 1) {
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