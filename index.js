let perspectives = [];
window.addEventListener("load", () => {
    console.log("hello world");
    displayCircle();
});
window.addEventListener("resize", displayCircle);

function displayCircle() {
    const circleContainer = document.getElementById("circle-container");
    const spacing = (2 * Math.PI) / circleContainer.childElementCount;
    const radius = circleContainer.clientWidth / 2 - circleContainer.children.item(0).offsetWidth / 2;
    for (let i = 0; i < circleContainer.childElementCount; i++) {
        const child = circleContainer.children.item(i);
        // set child position to a point around the circle
        const xPos = Math.cos(spacing * i) * radius;
        const yPos = Math.sin(spacing * i) * radius;
        placeRelative(child, circleContainer, xPos, yPos);
    }
}

function placeRelative(a, b, x, y) {
    const bounds = b.getBoundingClientRect();
    const relX = bounds.x + (bounds.width / 2);
    const relY = bounds.y + (bounds.height / 2);
    //console.log(bounds, relX, relY);
    placeCentered(a, relX + x, relY + y);
}

function placeCentered(element, x, y) {
    placeElement(
        element,
        x - (element.offsetWidth / 2),
        y - (element.offsetHeight / 2)
    )
}

function placeElement(element, x, y) {
    element.style.position = "absolute";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}