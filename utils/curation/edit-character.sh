CHARACTERS=$(cat characters.json)

if [ $2 = "--add-comic" ]; then
    echo "$CHARACTERS" | jq \
    --arg name "$1" \
    --arg comic "$3" \
    'map(if .name == $name and (.comics | index($comic) | not) then .comics += [$comic] else . end)' \
    > characters.json
fi