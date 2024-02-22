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


window.addEventListener("load", async () => {
    console.log("hello world");
    document.body.addEventListener("click", event => {
        if (event.target === document.body) {
            unfocusAll();
        }
    });
    await populate();
    
    for (const character of characters) {
        document.body.appendChild(character);
    }
    levels = populateLevels();
    for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        console.log(level);
        displayCircle(level, 125*(i))
    }
});

async function populate() {
    comicDB = await fetch("/comics.json").then(a=>a.json());
    characterDB = await fetch("/characters.json").then(a=>a.json());
    for (const charTemplate of characterDB) {
        const character = new Character(charTemplate.pfp, charTemplate.comics);
        characters.push(character);
    }
    //document.body.innerHTML = comicDB["fb9e408e-3771-4d3a-b042-ebde2d14aaad"].embedCode;
}

