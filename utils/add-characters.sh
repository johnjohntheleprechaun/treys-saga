CURRENT=$(cat characters.json)

while true; do
read -p "Characters Name: " NAME

NEWFILE=$(echo $CURRENT | jq \
    --arg name "$NAME" \
    '. + [{ name: $name, pfp: "", comics: [] }]'
)
echo -E "$NEWFILE" > characters.json
CURRENT=$NEWFILE
done;