import subprocess
import json
import sys

characters = json.load(open("characters.json"))

if (len(sys.argv) < 2):
    took_input = True
    comic_url = input("Comic url: ")
else:
    took_input = False
    comic_url = sys.argv[1]

output = subprocess.run(["bash", "utils/curation/add-comic.sh", comic_url], capture_output=True)
output_str = output.stdout.decode()[:-1]

if ("already in list" in output_str):
    quit()
if not took_input:
    print("New comic: " + comic_url)
    subprocess.call(["xdg-open", comic_url])
new_uuid = output_str
print(new_uuid)

while True:
    # character associations
    character = input("\nAdd character association (or [d] to finish): ")
    if character in ["", "d"]:
        if not took_input:
            print("\n")
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
    print(index, len(matches))
    if int(index)-1 == len(matches):
        continue

    char_name = matches[int(index)-1]["name"]
    subprocess.run(["bash", "utils/curation/edit-character.sh", char_name, "--add-comic", new_uuid])