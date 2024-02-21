let perspectives = [];
/**
 * @type {ComicNode}
 */
let focused;
window.addEventListener("load", () => {
    console.log("hello world");
    const testChar = new Character(
        "https://placekitten.com/400/400",
        [["https://placekitten.com/300/300"], ["https://placekitten.com/300/300"], ["https://placekitten.com/300/300"]]
    );
    document.body.appendChild(testChar);
    testChar.moveTo(0, 0);
    testChar.focusNode();
});
//window.addEventListener("resize", displayCircle);


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
            borderRadius: [ "100%", "0%" ],
            justifyContent: [ "space-around", "space-around" ]
        },
        { duration: 1000, fill: "forwards"}
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