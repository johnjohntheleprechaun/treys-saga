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

window.addEventListener("load", async () => {
    const characters = await populate();
    nodeContainer = document.getElementById("node-container");
    
    for (const character of characters) {
        nodeContainer.appendChild(character);
    }
    levels = populateLevels(characters);
    displayLevels(levels);
});

async function populate() {
    comicDB = await fetch("/comics.json").then(a=>a.json());
    characterDB = await fetch("/characters.json").then(a=>a.json());
    const characters = [];
    for (const charTemplate of characterDB) {
        const character = new CharacterNode(charTemplate.pfp, charTemplate.comics);
        characters.push(character);
    }
    return characters;
    //document.body.innerHTML = comicDB["fb9e408e-3771-4d3a-b042-ebde2d14aaad"].embedCode;
}

