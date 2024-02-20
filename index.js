let perspectives = [];
window.addEventListener("load", () => {
    console.log("hello world");
    displayCircle();
});
window.addEventListener("resize", displayCircle);

function displayCircle() {
    const circleContainer = document.getElementById("circle-container");
    const spacing = (2 * Math.PI) / (circleContainer.childElementCount - 1);
    const radius = circleContainer.clientWidth / 2 - circleContainer.children.item(0).offsetWidth / 2 - 40;
    // position first child
    const first = circleContainer.children.item(0);
    first.addEventListener("click", () => growToCenter(0));
    placeRelative(first, circleContainer, 0, 0);

    for (let i = 1; i < circleContainer.childElementCount; i++) {
        const child = circleContainer.children.item(i);
        child.addEventListener("click", () => growToCenter(i));
        // set child position to a point around the circle
        const xPos = Math.cos(spacing * i-1) * radius;
        const yPos = Math.sin(spacing * i-1) * radius;
        placeRelative(child, circleContainer, xPos, yPos);
    }
}

function growToCenter(childIndex) {
    console.log(`child ${childIndex} clicked`);
    // calculate center pos of div
    const container = document.getElementById("circle-container");
    const bounds = container.getBoundingClientRect();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    // animate selected child
    const selected = container.children.item(childIndex);
    selected.style.zIndex = "1";
    selected.animate(
        {
            left: [ selected.style.left, `${bounds.x}px` ],
            top: [ selected.style.top, `${bounds.y}px` ],
            width: [ selected.style.width, `${bounds.width}px` ],
            height: [ selected.style.height, `${bounds.height}px` ],
            borderRadius: [ "100%", "0%" ]
        },
        { duration: 50, fill: "forwards"}
    )
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