CURRENT=$(cat comics.json)
UUID=$(cat /proc/sys/kernel/random/uuid)
EMBED=$(curl -s https://www.reddit.com/oembed?url=$1)
NEWFILE=$(echo $CURRENT | jq \
    --arg uuid $UUID \
    --argjson embed "$EMBED" \
    '. + {($uuid): {title: $embed.title, embedCode: $embed.html}}'
)

echo "added comic { $UUID }"
echo -E "$NEWFILE" > comics.json