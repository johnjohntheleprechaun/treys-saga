CURRENT=$(cat characters.json)
if [ $# = 1 ]; then
    COMIC="$1"
fi
read -p "Characters Name: " NAME
read -p "Character Description: " DESCRIPTION

NEWFILE=$(echo "$CURRENT" | jq \
    --arg name "$NAME" \
    --arg desc "$DESCRIPTION" \
    --arg comic "$COMIC" \
    '. + [{ name: $name, description: $desc, pfp: "", comics: [$comic] }]'
)
echo -E "$NEWFILE" > characters.json
CURRENT=$NEWFILE