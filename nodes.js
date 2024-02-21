class ComicNode extends HTMLDivElement {
    constructor () {
        super();
        this.classList.add("comic-node");
        this.addEventListener("click", this.focusNode);
    }

    moveTo(x, y) {
        const bounds = this.parentElement.getBoundingClientRect();
        this.style.position = "absolute";
        this.style.left = `${x + (bounds.width / 2) - (this.offsetWidth / 2)}px`;
        this.style.top = `${y + (bounds.height / 2) - (this.offsetHeight / 2)}px`;
    }
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
        console.log("focused node")
    }
    unfocusNode() {

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
        this.embedElement = createUsableEmbed(comicDB[uuid].embedCode);
        this.embedElement.style.display = "none";
        this.appendChild(this.embedElement);
    }
    focusNode() {
        if (super.focusNode()) {
            return; // already focused
        }
        console.log("focus comic");
        this.moveTo(0, 0);
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
        console.log("focus character");
        // ensure all other chars are hidden
        for (const character of characters) {
            if (character !== this) {
                character.hide();
            }
        }

        // move character image to the center
        this.moveTo(0, 0);

        // spawn comics for the character
        this.comicElements = [];
        for (const comic of this.comics) {
            const comicElement = new Comic(comic);
            console.log(comic, comicElement);
            this.parentElement.appendChild(comicElement);
            this.comicElements.push(comicElement);
        }
        // position comics
        displayCircle(this.comicElements, 200);
    }

    unfocusNode() {
        for (const comic of this.comicElements) {
            comic.remove();
        }
    }
    hide() {
        return; 
    }
}
customElements.define("character-element", Character, { extends: "div" });

/**
 * 
 * @param {ComicNode[]} nodes a list of nodes to set positions for
 * @param {number} radius the radius
 */
function displayCircle(nodes, radius) {
    const spacing = (2 * Math.PI) / nodes.length;

    for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i];

        // set child position to a point around the circle
        const xPos = Math.cos(spacing * i) * radius;
        const yPos = Math.sin(spacing * i) * radius;
        child.moveTo(xPos, yPos);
    }
}