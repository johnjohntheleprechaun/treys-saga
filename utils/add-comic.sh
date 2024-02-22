CURRENT=$(cat comics.json)
UUID=$(cat /proc/sys/kernel/random/uuid)
EMBED=$(curl -s https://www.reddit.com/oembed?url=$1)
echo "$EMBED\n\n\n"
NEWFILE=$(echo $CURRENT | jq \
    --arg uuid $UUID \
    --argjson embed "$EMBED" \
    '. + {($uuid): {title: $embed.title, embedCode: $embed.html}}'
)
echo -E "$NEWFILE" > comics.json