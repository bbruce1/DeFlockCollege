#!/usr/bin/env python3
"""
Fetches a photograph from Wikimedia Commons for a post, with its licence.

    python3 scripts/posts/fetch_commons.py "File:Flock Safety camera.jpg" public/posts/core/camera.jpg

Downloads a 1600px rendition (plenty for a 1080px square) and appends the
author, licence and source to public/posts/credits.json, keyed by the path the
post will use. It refuses anything whose licence is not clearly reusable,
because a post built on a lifted photo is the one that gets the account
reported instead of the cameras removed.

Prints the credit line to put on the slide.
"""

import fcntl
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://commons.wikimedia.org/w/api.php"
AGENT = "deflock-campus/1.0 (post artwork; contact via deflock.school)"
WIDTH = 1600

# Commons answers 429 when several people fetch at once. Back off and retry
# rather than fail, and never work around it by changing the user agent.
RETRIES = 6
BACKOFF_SECONDS = 15

# Free to reuse, with or without attribution. Anything else is refused.
ALLOWED = re.compile(r"^(CC0|Public domain|PD|CC BY(-SA)? [0-9.]+|CC BY(-SA)?)", re.IGNORECASE)


def get(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": AGENT})

    for attempt in range(1, RETRIES + 1):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == RETRIES:
                raise
            wait = int(error.headers.get("Retry-After") or BACKOFF_SECONDS * attempt)
            print(f"Rate limited by Commons; retrying in {wait}s ({attempt}/{RETRIES}).", file=sys.stderr)
            time.sleep(wait)

    raise RuntimeError(f"Could not fetch {url} after {RETRIES} attempts.")


def strip(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value or "")).strip()


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2

    title, destination = sys.argv[1], Path(sys.argv[2])

    if not title.startswith("File:"):
        title = "File:" + title

    query = urllib.parse.urlencode({
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size",
        "iiurlwidth": WIDTH,
        "format": "json",
    })
    pages = json.loads(get(f"{API}?{query}"))["query"]["pages"]
    page = next(iter(pages.values()))

    if "imageinfo" not in page:
        print(f"Not found on Commons: {title}", file=sys.stderr)
        return 1

    info = page["imageinfo"][0]
    meta = info.get("extmetadata", {})
    licence = strip(meta.get("LicenseShortName", {}).get("value", ""))
    author = strip(meta.get("Artist", {}).get("value", "")) or "Unknown"

    if not ALLOWED.match(licence):
        print(f"Refused: licence '{licence}' is not clearly reusable.", file=sys.stderr)
        return 1

    source = info.get("thumburl") or info["url"]
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(get(source))

    # Keyed by the URL path the post uses, e.g. /posts/core/camera.jpg.
    key = "/" + str(destination).split("public/", 1)[-1]
    credits_path = Path("public/posts/credits.json")
    credits_path.touch(exist_ok=True)

    # Read, add and write under one lock: two fetches finishing together
    # would otherwise each write back a file missing the other's entry.
    with credits_path.open("r+") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        text = handle.read()
        credits = json.loads(text) if text.strip() else {}
        credits[key] = {
            "title": title,
            "author": author,
            "licence": licence,
            "source": info.get("descriptionurl", ""),
        }
        handle.seek(0)
        handle.truncate()
        handle.write(json.dumps(credits, indent=2, sort_keys=True) + "\n")

    short_author = author if len(author) <= 28 else author[:27] + "…"
    print(f"Photo: {short_author} / {licence}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
