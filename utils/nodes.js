/**
 * @type {ResizeObserver}
 */
let resizeObserver;
window.addEventListener("load", _ => { resizeObserver = new ResizeObserver(adjustElementPositions) });
/**
 * The currently focused node.
 * @type {DisplayNode}
 */
let focused;
/**
 * @type {ComicNode}
 */
let displayedComic;



/**
 * This is the base node class, it contains functions like focusing, movement, etc.
 */
class DisplayNode extends HTMLDivElement {
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
     * Set a nodes absolute position. No animation.
     * @param {number} x the x position, in pixels
     * @param {number} y the y position, in pixels
     */
    setPos(x, y) {
        const bounds = this.parentElement.getBoundingClientRect();
        this.style.position = "absolute";
        const newX = x + (bounds.width / scale / 2) - (this.offsetWidth / 2);
        const newY = y + (bounds.height / scale / 2) - (this.offsetHeight / 2);
        this.style.left = `${newX}px`;
        this.style.top = `${newY}px`;
        this.targetPos = [x, y];
    }
    /**
     * Set the nodes display offset. The absolute position will not change.
     * @param {number} x 
     * @param {number} y 
     */
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
customElements.define("comic-node", DisplayNode, { extends: "div" });
/**
 * A comic. When focused it will open the embedded reddit post
 */
class ComicNode extends DisplayNode {
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
    /**
     * Close the embedded reddit post
     */
    unfocusNode() {
        if (!this.embedElement) {
            return;
        }
        this.embedElement.style.display = "none";
        this.children.item(0).style.display = "block";
        this.style.width = "80px";
        this.style.height = "80px";
        this.style.zIndex = "0";
        this.style.borderRadius = "100%";
    }
}
customElements.define("comic-element", ComicNode, { extends: "div" });

/**
 * A character Node. When focused it will display all of it's related comic nodes.
 */
class CharacterNode extends DisplayNode {
    /**
     * @param {string} pfp a url of the characters display image
     * @param {string[]} comics a list of comic uuids
     */
    constructor (pfp, comics) {
        super();
        const pfpElement = document.createElement("img");
        this.comics = comics;
        pfpElement.src = pfp !== "" ? "/pfps/" + pfp : "https://placekitten.com/200/200";
        this.appendChild(pfpElement);
        this.hidden = false;
    }

    /**
     * Unfocus and dim all the other character nodes and spawn the related comic nodes.
     */
    focusNode() {
        if (super.focusNode()) {
            return; // already focused
        }
        this.undim();
        // ensure all other characters are hidden
        for (const character of getAllCharacters()) {
            if (character !== this) {
                character.unfocusNode();
                character.dim();
            }
        }

        // spawn comics for the character
        this.comicElements = [];
        for (const comic of this.comics) {
            const comicElement = new ComicNode(comic);
            this.parentElement.appendChild(comicElement);
            this.comicElements.push(comicElement);
        }
        // position comics
        displayCircle(this.comicElements, 150, this);
    }
    /**
     * Remove the comic nodes spawned by this node
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
customElements.define("character-element", CharacterNode, { extends: "div" });