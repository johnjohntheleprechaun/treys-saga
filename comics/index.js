const comics = [];
let comicDB;

window.addEventListener("load", async () => {
    console.log("hello world");
    await loadComics();
});

async function loadComics() {
    comicDB = await fetch("/comics.json").then(a=>a.json());
    for (const key in comicDB) {
        const comic = new ComicNode(key);
        comics.push(comic)
        document.body.appendChild(comic);
    }
    const levels = populateLevels(comics);
    displayLevels(levels);
}