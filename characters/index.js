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

window.addEventListener("click", event => {
    console.log(event);
    if (event.target === document.body || event.target === document.documentElement) {
        console.log("hello");
        unfocusAll();
    }
});

let scale = 1;
const scalingModifier = .001;
const minScale = .05
window.addEventListener("wheel", event => {
    console.log(event.deltaY);
    setScale(scale - event.deltaY * scalingModifier);
});
/**
 * Set the scale for all the nodes
 * @param {number} scale A percentage. 1 = 100%
 */
function setScale(newScale) {
    if (newScale >= minScale) {
        document.body.style.transform = `scale(${scale})`;
        scale = newScale;
    }
}
function setOffset(x, y) {

}

async function populate() {
    comicDB = await fetch("/comics.json").then(a=>a.json());
    characterDB = await fetch("/characters.json").then(a=>a.json());
    for (const charTemplate of characterDB) {
        const character = new Character(charTemplate.pfp, charTemplate.comics);
        characters.push(character);
    }
    //document.body.innerHTML = comicDB["fb9e408e-3771-4d3a-b042-ebde2d14aaad"].embedCode;
}

