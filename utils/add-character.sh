CURRENT=$(cat characters.json)

read -p "Characters Name: " NAME

NEWFILE=$(echo $CURRENT | jq \
    --arg name $NAME \
    '. + [{ name: $name, pfp: "", comics: [] }]'
)
echo -E "$NEWFILE" > characters.json