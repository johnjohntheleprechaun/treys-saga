CURRENT=$(cat comics.json)
UUID=$(cat /proc/sys/kernel/random/uuid)
EMBED=$(curl -s https://www.reddit.com/oembed?url=$1)
echo "$EMBED\n\n\n"
NEWFILE=$(echo $CURRENT | jq \
    --arg uuid $UUID \
    --arg url $1 \
    --argjson embed "$EMBED" \
    '. + {($uuid): {title: $embed.title, url: $url, embedCode: $embed.html}}'
)
echo -E "$NEWFILE" > comics.json