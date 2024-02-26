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
class MovableDiv extends HTMLDivElement {
    constructor () {
        super();
        this.targetPos = [0,0];
        this.offset = [0,0];
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
     * @param {boolean} absolute Whether to position abosulute, or centered in the parent
     */
    setPos(x, y, absolute) {
        this.targetPos = [x, y, absolute];
        if (absolute) {
            this.style.left = `${x}px`;
            this.style.top = `${y}px`;
            return;
        }
        const bounds = this.parentElement.getBoundingClientRect();
        this.style.position = "absolute";
        const newX = x + (bounds.width / scale / 2) - (this.offsetWidth / 2);
        const newY = y + (bounds.height / scale / 2) - (this.offsetHeight / 2);
        this.style.left = `${newX}px`;
        this.style.top = `${newY}px`;
        this.targetPos = [x, y, absolute];
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
}
customElements.define("movable-div", MovableDiv, { extends: "div" });
class DisplayNode extends MovableDiv {
    constructor () {
        super();
        this.classList.add("comic-node");
        this.addEventListener("click", this.toggleFocus);
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
customElements.define("display-node", DisplayNode, { extends: "div" });
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
        this.pfp = document.createElement("img");
        this.pfp.src = "https://placekitten.com/400/400";
        this.appendChild(this.pfp);
        // exit button
        this.exit = new MovableDiv();
        this.exit.innerText = "EXIT";
        this.exit.style.color = "white";
        this.exit.style.zIndex = "-1"; // a temporary solution
        this.exit.addEventListener("click", e => {
            e.stopPropagation();
            this.unfocusNode();
        })
        this.appendChild(this.exit);
    }
    /**
     * Open the embedded reddit post
     */
    focusNode() {
        if (displayedComic === this) {
            console.log("focus");
            return;
        }
        if (displayedComic) {
            displayedComic.unfocusNode();
        }
        displayedComic = this;
        this.pfp.style.display = "none"; // hide pfp
        this.exit.style.display = "block";
        this.exit.setPos(20, 20, true);
        console.log(this.exit.targetPos);

        this.embedElement = createUsableEmbed(comicDB[this.uuid].embedCode);
        this.appendChild(this.embedElement);
        this.embedElement.moveTo(0, 0);

        this.style.borderRadius = "0px";
        this.style.width = "100%";
        this.style.height = "100%";
        this.style.zIndex = "1";
        this.unfocusedPos = this.targetPos;
        this.moveTo(0, 0);
    }
    /**
     * Close the embedded reddit post
     */
    unfocusNode() {
        if (!this.embedElement) {
            return;
        }
        displayedComic = undefined;
        this.embedElement.style.display = "none";
        this.pfp.style.display = "block";
        this.style.width = "80px";
        this.style.height = "80px";
        this.style.zIndex = "0";
        this.style.borderRadius = "100%";
        this.moveTo(this.unfocusedPos[0], this.unfocusedPos[1]);
    }
}
customElements.define("comic-node", ComicNode, { extends: "div" });

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
        const levels = populateLevels(this.comicElements, true);
        displayLevels(levels, 150, this);
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
customElements.define("character-node", CharacterNode, { extends: "div" });