CURRENT=$(cat characters.json)

while true; do
read -p "Characters Name: " NAME
read -p "Character Description: " DESCRIPTION

NEWFILE=$(echo $CURRENT | jq \
    --arg name "$NAME" \
    --arg desc "$DESCRIPTION" \
    '. + [{ name: $name, description: $desc, pfp: "", comics: [] }]'
)
echo -E "$NEWFILE" > characters.json
CURRENT=$NEWFILE
done;