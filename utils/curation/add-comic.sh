CURRENT=$(cat comics.json)
UUID=$(cat /proc/sys/kernel/random/uuid)

if echo "$CURRENT" | grep -q $1; then
    echo "$1 already in list"
    exit
fi

EMBED=$(curl -s https://www.reddit.com/oembed?url=$1)
echo "$UUID"
NEWFILE=$(echo $CURRENT | jq \
    --arg uuid $UUID \
    --arg url $1 \
    --argjson embed "$EMBED" \
    '. + {($uuid): {title: $embed.title, url: $url, embedCode: $embed.html}}'
)
echo -E "$NEWFILE" > comics.json