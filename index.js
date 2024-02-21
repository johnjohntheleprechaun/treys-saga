let perspectives = [];
/**
 * @type {ComicNode}
 */
let focused;
/**
 * @type {Character[]}
 */
let characters = [];

const nodeSize = 80;
const padding = 20;
let levels = []

window.addEventListener("load", () => {
    console.log("hello world");
    populate(50, 3);
    // calculate how many per circumference
    
    for (const character of characters) {
        document.body.appendChild(character);
    }
    console.log(characters);
    levels = populateLevels();
    for (const level of levels) {
        displayCircle(level.slice(1), level[0]);
    }
});

function populateLevels() {
    let r = nodeSize + padding; // current radius to be filled
    let i = 1; // current character being placed
    const levels = [[0, characters[0]]];
    while (i < characters.length) {
        let c = 2 * Math.PI * r; // circumference
        levels.push([r]);
        // figure out how many can fit
        const maxCount = Math.floor(c / (nodeSize / 2 + padding * Math.PI));
        console.log(maxCount, i)
        // add as many as can fit
        for (let j = 0; j < maxCount && i + j < characters.length; j++) {
            levels[levels.length-1].push(characters[i + j]);
        }
        i += maxCount;
        r += nodeSize + padding;

        console.log(levels, r, i);
    }
    console.log(levels);
    return levels;
}

function populate(charCount, comicCount) {
    for (let i = 0; i < charCount; i++) {
        const comics = [];
        for (let j = 0; j < comicCount; j++) {
            comics.push(["https://placekitten.com/300/300", "https://placekitten.com/300/300", "https://placekitten.com/300/300"]);
        }
        characters.push(new Character("https://placekitten.com/500/500", comics));
    }
}