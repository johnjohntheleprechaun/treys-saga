let resizeObserver = new ResizeObserver(adjustElementPos);
/**
 * The currently focused node.
 * @type {ComicNode}
 */
let focused;
/**
 * A list of all the characters.
 * @type {Character[]}
 */
let characters = [];

/**
 * @type {Comic}
 */
let displayedComic;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

/**
 * This is the base node class, it contains functions like focusing, movement, etc.
 */
class ComicNode extends HTMLDivElement {
    constructor () {
        super();
        this.classList.add("comic-node");
        this.addEventListener("click", this.toggleFocus);
        this.targetPos = [0,0];
        this.offset = [0, 0];
        resizeObserver.observe(this);
    }

    /**
     * Move a node to a position. Will later contain the animation code.
     * @param {number} x the x position, in pixels
     * @param {number} y the y position, in pixels
     */
    moveTo(x, y) {
        this.setPos(x, y);
    }
    /**
     * Set a nodes position. No animation.
     * @param {number} x the x position, in pixels
     * @param {number} y the y position, in pixels
     */
    setPos(x, y) {
        const bounds = this.parentElement.getBoundingClientRect();
        console.log(bounds)
        this.style.position = "absolute";
        const newX = x + (bounds.width / 2) - (this.offsetWidth / 2);
        const newY = y + (bounds.height / 2) - (this.offsetHeight / 2);
        console.log(scale);
        this.style.left = `${newX}px`;
        this.style.top = `${newY}px`;
        this.targetPos = [x, y];
    }
    setOffset(x, y) {
        this.offset = [x, y];
        this.adjustPos();
    }
    /**
     * Re-adjust the node position, like after the element has changed size.
     */
    adjustPos() {
        this.setPos(
            (this.targetPos[0] + this.offset[0] / scale),
            (this.targetPos[1] + this.offset[1] / scale)
        );
    }
    /**
     * Toggle whether the node is focused or not.
     */
    toggleFocus() {
        if (focused === this) {
            this.unfocusNode();
        } else {
            this.focusNode();
        }
    }
    /**
     * Focus the node. Returns `true` if it's already focused.
     * @returns {boolean}
     */
    focusNode() {
        if (focused === this) {
            console.log("already focused");
            return true; // already focused
        }
        else if (focused) {
            focused.unfocusNode();
        }
        if (!this.parentElement) {
            document.body.appendChild(this); // this should be better but honestly I just don't care enough
        }

        focused = this;
    }
    /**
     * Unfocus the node.
     */
    unfocusNode() {
        if (focused === this) {
            focused = undefined;
        }
    }
    /**
     * Darken the node. Like if it's meant to be in the background.
     */
    dim() {
        this.style.filter = "brightness(25%)";
    }
    /**
     * Reset brightness.
     */
    undim() {
        this.style.filter = "";
    }
}
customElements.define("comic-node", ComicNode, { extends: "div" });
/**
 * A comic. When focused it will open the embedded reddit post
 */
class Comic extends ComicNode { // A Tree
    /**
     * Set class list, the display pfp, and create the element for the embedded reddit post
     * @param {string} uuid The uuid of the comic
     */
    constructor (uuid) {
        super();
        this.uuid = uuid;
        this.classList.add("comic");
        // placeholder pfp
        const image = document.createElement("img");
        image.src = "https://placekitten.com/400/400";
        this.appendChild(image);
    }
    /**
     * Open the embedded reddit post
     */
    focusNode() {
        if (displayedComic) {
            displayedComic.unfocusNode();
        }
        displayedComic = this;
        this.children.item(0).style.display = "none"; // hide pfp

        this.embedElement = createUsableEmbed(comicDB[this.uuid].embedCode);
        this.appendChild(this.embedElement);
        
        this.style.width = "500px";
        this.style.height = "fit-content";
        this.style.borderRadius = "20px";
        this.style.zIndex = "1";
        //this.moveTo(0, 0);
    }
    unfocusNode() {
        this.embedElement.style.display = "none";
        this.children.item(0).style.display = "block";
        this.style.width = "80px";
        this.style.height = "80px";
        this.style.zIndex = "0";
        this.style.borderRadius = "100%";
    }
}
customElements.define("comic-element", Comic, { extends: "div" });

/**
 * A character Node. When focused it will display all of it's related comic nodes.
 */
class Character extends ComicNode {
    /**
     * @param {string} pfp a url of the characters display image
     * @param {string[]} comics a list of comic uuids
     */
    constructor (pfp, comics) {
        super();
        const pfpElement = document.createElement("img");
        this.comics = comics;
        pfpElement.src = pfp ? pfp : "https://placekitten.com/200/200";
        this.appendChild(pfpElement);
        this.hidden = false;
    }

    /**
     * Unfocus all the other character nodes and spawn the related comic nodes.
     */
    focusNode() {
        if (super.focusNode()) {
            return; // already focused
        }
        this.undim();
        // ensure all other chars are hidden
        for (const character of characters) {
            if (character !== this) {
                character.unfocusNode();
                character.dim();
                console.log("unfocus");
            }
        }

        // spawn comics for the character
        this.comicElements = [];
        for (const comic of this.comics) {
            const comicElement = new Comic(comic);
            this.parentElement.appendChild(comicElement);
            this.comicElements.push(comicElement);
        }
        // position comics
        displayCircle(this.comicElements, 150, this);
    }
    /**
     * Unfocus this element, and undim all the other character nodes.
     */
    unfocusNode() {
        super.unfocusNode();
        this.undim();
        if (!this.comicElements) {
            return; // wasn't displaying comic nodes
        }
        for (const comic of this.comicElements) {
            resizeObserver.unobserve(comic);
            comic.remove();
        }
    }
}
customElements.define("character-element", Character, { extends: "div" });

/**
 * Display the nodes evenly in a circle. Optionally around a center node.
 * @param {ComicNode[]} nodes a list of nodes to set positions for
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

/**
 * populates levels based on params like increase per level
 */
function populateLevels(levelCounts = [1, 6], levelIncrement = 6) {
    let i = 1; // current character being placed
    const levels = [[characters[0]]];
    while (i < characters.length) {
        levels.push([]);
        // get current level count
        let levelCount;
        if (levels.length > levelCounts.length) {
            levelCount = levelCounts[levelCounts.length - 1] + levelIncrement * (levels.length - levelCounts.length);
        } else {
            levelCount = levelCounts[levels.length-1];
        }
        // add as many as can fit
        for (let j = 0; j < levelCount && i + j < characters.length; j++) {
            levels[levels.length-1].push(characters[i + j]);
        }
        i += levelCount;
    }
    console.log(levels);
    return levels;
}

function unfocusAll() {
    for (const character of characters) {
        character.unfocusNode();
    }
}

function adjustElementPos(entries) {
    for (const entry of entries) {
        entry.target.adjustPos();
    }
}