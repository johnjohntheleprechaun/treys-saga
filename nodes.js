class ComicNode extends HTMLDivElement {
    constructor () {
        super();
        this.classList.add("comic-node");
        this.addEventListener("click", this.toggleFocus);
        this.targetPos = [0,0];
        resizeObserver.observe(this);
    }

    moveTo(x, y) {
        this.setPos(x, y);
    }
    setPos(x, y) {
        const bounds = this.parentElement.getBoundingClientRect();
        this.style.position = "absolute";
        this.style.left = `${x + (bounds.width / 2) - (this.offsetWidth / 2)}px`;
        this.style.top = `${y + (bounds.height / 2) - (this.offsetHeight / 2)}px`;
        this.targetPos = [x, y];
    }
    adjustPos() {
        this.moveTo(this.targetPos[0], this.targetPos[1]);
    }
    toggleFocus() {
        if (focused === this) {
            this.unfocusNode();
        } else {
            this.focusNode();
        }
    }
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
    unfocusNode() {
        if (focused === this) {
            focused = undefined;
        }
    }
    dim() {
        this.style.filter = "brightness(25%)";
    }
    undim() {
        this.style.filter = "";
    }
}
customElements.define("comic-node", ComicNode, { extends: "div" });
class Comic extends ComicNode { // A Tree
    /**
     * 
     * @param {string[]} frames A list of image links that are the comic frames
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
class Character extends ComicNode {
    /**
     * 
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

    focusNode() {
        if (super.focusNode()) {
            return; // already focused
        }
        // ensure all other chars are hidden
        for (const character of characters) {
            if (character !== this) {
                character.unfocusNode();
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

    unfocusNode() {
        super.unfocusNode();
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
 * 
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