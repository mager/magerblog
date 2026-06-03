#!/bin/bash
# Scaffold a new micro-post into src/content/notes/.
#
# Usage:
#   scripts/new-note.sh [--title "..."] [--link URL] [--link-text "..."] \
#                       [--tags "a,b"] [--draft] "body markdown..."
#
# Body can also come from stdin:
#   echo "body" | scripts/new-note.sh --link https://x.com
#
# Prints the path of the created file. Title is optional — that's the point of
# a notes feed. Slug is derived from the title, else the link host, else date.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$REPO/src/content/notes"
DATE="$(date +%F)"

title="" link="" link_text="" tags="" draft="" body=""

while [ $# -gt 0 ]; do
	case "$1" in
		--title)     title="$2"; shift 2 ;;
		--link)      link="$2"; shift 2 ;;
		--link-text) link_text="$2"; shift 2 ;;
		--tags)      tags="$2"; shift 2 ;;
		--draft)     draft="true"; shift ;;
		*)           body="$1"; shift ;;
	esac
done

# Body from stdin if not passed as an argument (and stdin isn't a tty).
if [ -z "$body" ] && [ ! -t 0 ]; then
	body="$(cat)"
fi

slugify() {
	echo "$1" | tr '[:upper:]' '[:lower:]' \
		| sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' \
		| cut -c1-50
}

if [ -n "$title" ]; then
	stub="$(slugify "$title")"
elif [ -n "$link" ]; then
	host="$(echo "$link" | sed -E 's#https?://(www\.)?([^/]+).*#\2#')"
	stub="$(slugify "$host")"
else
	stub="note"
fi

file="$DIR/${DATE}-${stub}.md"
# Avoid clobbering an existing note created the same day.
n=2
while [ -e "$file" ]; do
	file="$DIR/${DATE}-${stub}-${n}.md"
	n=$((n + 1))
done

mkdir -p "$DIR"
{
	echo "---"
	[ -n "$title" ] && printf 'title: "%s"\n' "${title//\"/\\\"}"
	printf 'pubDate: "%s"\n' "$DATE"
	[ -n "$link" ] && printf 'link: "%s"\n' "$link"
	[ -n "$link_text" ] && printf 'linkText: "%s"\n' "${link_text//\"/\\\"}"
	if [ -n "$tags" ]; then
		printf 'tags: ['
		IFS=',' read -ra arr <<< "$tags"
		for i in "${!arr[@]}"; do
			t="$(echo "${arr[$i]}" | sed -E 's/^ +| +$//g')"
			[ "$i" -gt 0 ] && printf ', '
			printf '"%s"' "$t"
		done
		printf ']\n'
	fi
	[ -n "$draft" ] && echo 'draft: true'
	echo "---"
	echo ""
	echo "$body"
} > "$file"

echo "$file"
