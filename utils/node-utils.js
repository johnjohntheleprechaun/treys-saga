// CONSTANT DECLARATIONS
const scalingModifier = .005;
const minScale = .05

// GLOBAL VARIABLE DECLARATION
let scale = 1;
let offsetX = 0;
let offsetY = 0;

/**
 * The callback for the ResizeObserver. Adjusts the node sizes of all the elements. Probably shouldn't use this anywhere else, but techincally you could
 * @param {any[]} entries 
 */
function adjustElementPositions(entries) {
    for (const entry of entries) {
        entry.target.adjustPos();
    }
}

/**
 * List all of the existing character nodes
 */
function* getAllCharacters() {
    for (const element of document.body.children) {
        if (element instanceof CharacterNode) {
            yield element;
        }
    }
}

/**
 * Unfocuses all of the character nodes.
 */
function unfocusAll() {
    for (const character of getAllCharacters()) {
        character.unfocusNode();
    }
}

/**
 * Set the scale for all the nodes
 * @param {number} scale A percentage. 0 = 0%, 1 = 100%.
 */
function setScale(newScale) {
    let targetScale = Math.max(newScale, minScale);
    // scale is set with styles so that the comic embed elements will also scale properly
    document.body.style.transform = `scale(${targetScale})`;
    scale = targetScale;
}

/**
 * Set the offset for all ComicNode objects under the body element.
 * @param {number} x 
 * @param {number} y 
 */
function setOffset(x, y) {
    for (const element of document.body.children) {
        if (element instanceof DisplayNode) {
            element.setOffset(x, y);
        }
    }
}

/**
 * Display the nodes evenly in a circle. Optionally around a center node.
 * @param {DisplayNode[]} nodes a list of nodes to set positions for
 * @param {number} radius the radius
 */
function displayCircle(nodes, radius, center = undefined) {
    const spacing = (2 * Math.PI) / nodes.length;
    const offsetX = center ? center.targetPos[0] : 0;
    const offsetY = center ? center.targetPos[1] : 0;

    for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i];

        // set child position to a point around the circle
        const xPos = Math.cos(spacing * i) * radius + offsetX;
        const yPos = Math.sin(spacing * i) * radius + offsetY;
        child.moveTo(xPos, yPos);
    }
}

/**
 * populates levels based on params like increase per level
 */
function populateLevels(nodes, levelCounts = [1, 6], levelIncrement = 6) {
    let i = 1; // current character being placed
    const levels = [[nodes[0]]];
    while (i < nodes.length) {
        levels.push([]);
        // get current level count
        let levelCount;
        if (levels.length > levelCounts.length) {
            levelCount = levelCounts[levelCounts.length - 1] + levelIncrement * (levels.length - levelCounts.length);
        } else {
            levelCount = levelCounts[levels.length-1];
        }
        // add as many as can fit
        for (let j = 0; j < levelCount && i + j < nodes.length; j++) {
            levels[levels.length-1].push(nodes[i + j]);
        }
        i += levelCount;
    }
    return levels;
}

/**
 * Create an element with an actually usable script. This is neccessary because scripts inserted with either innerHTML or cloneNode will not be executed. security bs... smh
 * @param {string} htmlContent 
 * @returns {HTMLDivElement}
 */
function createUsableEmbed(htmlContent) {
    const baseDiv = document.createElement("div");
    baseDiv.classList.add("test");
    baseDiv.innerHTML = htmlContent;
    // copy script properties
    const scriptChild = baseDiv.querySelector("script");
    const script = document.createElement("script");
    for (const attribute of scriptChild.attributes) {
        script.setAttribute(attribute.name, attribute.value);
    }
    // enforce dark mode
    const quoteChild = baseDiv.querySelector("blockquote");
    quoteChild.setAttribute("data-embed-theme", "dark");
    scriptChild.remove();
    baseDiv.appendChild(script);
    return baseDiv;
}
