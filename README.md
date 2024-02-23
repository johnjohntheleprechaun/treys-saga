# The Saga of Trey

Trey's saga originally began with [a comic](https://www.reddit.com/r/comics/comments/1asz8c3/trey/) created by [u/davecontra](https://www.reddit.com/user/davecontra/). Completely unintentionally, this comic evolved into a whole beautiful multiverse of comics, with many different perspectives, and nearly every one created by a different person. Like so many others, I've really enjoyed reading all the creative takes people have on the story, so I decided to attempt to create a website to capture the whole Trey multiverse. Huge thanks to [u/fyxr](https://www.reddit.com/user/fyxr/) for gathering so many comics on [this post](https://www.reddit.com/r/comics/comments/1avuap5/the_trey_saga/), it was massively helpful to build the initial comic database.

## Contributions
Want to help contribute to the project? Great! Head on over to the issues tab to find something to help with, or help curate the databases of comics/characters. If you decide to contribute changes, clone this repo and create a pull request. Pull requests that modify the databases should be on the db-updates branch, and pull requests that change code should be made on the dev branch. I'll review it as soon as I have time.
### Database curation guidelines
Databases are stored in `comics.json` and `characters.json`. You can either add to them directly (as long as you match the database schemas), or use one of the bash scripts provided in `utils/`.  
- Do not change any comic UUIDs, as the character database uses them to reference comics. 
- Store character pfps in `/pfps`
- Store comic thumbnails in `/thumbnails`
- Try to avoid similar images across the pfps and thumbnails (e.g. use one boat picture for the boat's character pfp, and a different perspective of the same boat for a boat comic)

### Documentation
All code contributions should be thoroughly documented with [jsdoc](https://jsdoc.app/) annotations. I'm currently still working on documenting the code I've written. If you want to help with that, feel free to make a pull request just like any other contribution, but I'm making docs my priority for now so it's probably not necessary.
