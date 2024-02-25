import subprocess
import json

characters = json.load(open("characters.json"))

comic_url = input("Comic url: ")
output = subprocess.run(["bash", "utils/curation/add-comic.sh", comic_url], capture_output=True)
new_uuid = output.stdout.decode()[:-1]
print(new_uuid)

while True:
    # character associations
    character = input("\nAdd character association (or [d] to finish): ")
    if character in ["", "d"]:
        break
    
    # search for existing characters
    matches = []
    print()
    for char in characters:
        if character.lower() in char["name"].lower():
            matches.append(char)
    if len(matches) == 0:
        for char in characters:
            if character.lower() in char["description"].lower():
                matches.append(char)
    
    if len(matches) == 0:
        add = input("No matches found. Would you like to create one? (y/n) ")
        continue
    
    for i, match in enumerate(matches):
        print(f"""({i + 1})  {match["name"]} | {match["description"]}""")
    print(f"""({len(matches) + 1})  --Cancel--\n""")
    index = input("Which character would you like to add? ")

    

    char_name = matches[int(index)-1]["name"]
    subprocess.run(["bash", "utils/curation/edit-character.sh", char_name, "--add-comic", new_uuid])