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
 * The default size of nodes.
 */
const nodeSize = 80;
/**
 * The padding between nodes.
 */
const padding = 20;
let comicDB;
let characterDB;
let levels = [];
let resizeObserver = new ResizeObserver(adjustElementPos);

window.addEventListener("load", async () => {
    console.log("hello world");
    await populate();
    
    for (const character of characters) {
        document.body.appendChild(character);
    }
    levels = populateLevels();
    for (const level of levels) {
        displayCircle(level.slice(1), level[0]);
    }
});

function adjustElementPos(entries) {
    for (const entry of entries) {
        entry.target.adjustPos();
    }
}

function populateLevels() {
    let r = nodeSize + padding; // current radius to be filled
    let i = 1; // current character being placed
    const levels = [[0, characters[0]]];
    while (i < characters.length) {
        let c = 2 * Math.PI * r; // circumference
        levels.push([r]);
        // figure out how many can fit
        const maxCount = Math.floor(c / (nodeSize / 2 + padding * Math.PI));
        // add as many as can fit
        for (let j = 0; j < maxCount && i + j < characters.length; j++) {
            levels[levels.length-1].push(characters[i + j]);
        }
        i += maxCount;
        r += nodeSize + padding;
    }
    return levels;
}

async function populate() {
    comicDB = await fetch("comics.json").then(a=>a.json());
    characterDB = await fetch("characters.json").then(a=>a.json());
    for (const charTemplate of characterDB) {
        const character = new Character(charTemplate.pfp, charTemplate.comics);
        characters.push(character);
    }
    //document.body.innerHTML = comicDB["fb9e408e-3771-4d3a-b042-ebde2d14aaad"].embedCode;
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
    scriptChild.remove();
    baseDiv.appendChild(script);
    return baseDiv;s
}