/**
 * This is the base node class, it contains functions like focusing, movement, etc.
 */
class ComicNode extends HTMLDivElement {
    constructor () {
        super();
        this.classList.add("comic-node");
        this.addEventListener("click", this.toggleFocus);
        this.targetPos = [0,0];
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
        this.style.position = "absolute";
        this.style.left = `${x + (bounds.width / 2) - (this.offsetWidth / 2)}px`;
        this.style.top = `${y + (bounds.height / 2) - (this.offsetHeight / 2)}px`;
        this.targetPos = [x, y];
    }
    /**
     * Re-adjust the node position, like after the element has changed size.
     */
    adjustPos() {
        this.moveTo(this.targetPos[0], this.targetPos[1]);
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
        this.classList.add("comic");
        // placeholder pfp
        const image = document.createElement("img");
        image.src = "https://placekitten.com/400/400";
        this.appendChild(image);

        this.embedElement = createUsableEmbed(comicDB[uuid].embedCode);
        this.embedElement.style.display = "none";
        this.appendChild(this.embedElement);
    }
    /**
     * Open the embedded reddit post
     */
    focusNode() {
        if (super.focusNode()) {
            return; // already focused
        }
        this.children.item(0).style.display = "none"; // hide pfp
        
        this.style.width = "fit-content";
        this.style.height = "fit-content";
        this.style.borderRadius = "0px";
        this.embedElement.style.display = "block";
        //this.moveTo(0, 0);
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
        pfpElement.src = pfp;
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
        // ensure all other chars are hidden
        for (const character of characters) {
            if (character !== this) {
                character.unfocusNode();
                character.dim();
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
        for (const character of characters) {
            character.undim();
        }
        if (!this.comicElements) {
            return; // wasn't displaying comic nodes
        }
        for (const comic of this.comicElements) {
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