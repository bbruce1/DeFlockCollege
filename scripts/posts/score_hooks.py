#!/usr/bin/env python3
"""
Scores post ideas for how hard they stop a scroll, before anybody draws them.

    python3 scripts/posts/score_hooks.py candidates.json [--rounds 3] [--rubric funny|clarity]

candidates.json is a list of:

    {"id": "mom", "hook": "YOUR MOM", "photo": "Flock camera on a suburban pole",
     "payoff": "ACTUALLY: A POLE", "caption": "Your mom has the prom pics..."}

`--rubric clarity` asks a narrower question about slide 1 alone: would a
stranger scrolling past know this is about cameras tracking them, before any
caption or swipe? It reports what they would think it's about and a clearer
hook. A bait that nobody can place is not a bait, it's just a picture.

Each candidate is rated by Jev Router on OpenRouter several times and the
ratings averaged, because a single pass swings by two or three points. The
router hands the request to whichever model it picks, and those models grade
on very different curves (the same idea can score 7 from one and 4 from
another), so every score is also broken down by the model that gave it. Compare
ideas within one batch, never across batches, and treat the numbers as a second
opinion: a 7 here is "better than the 5s", not "will get likes".

Reads OPENROUTER_TYPESAFE_API_KEY from the environment, or from .env.
"""

import argparse
import json
import os
import re
import statistics
import sys
import urllib.request
from pathlib import Path

ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "typesafe/jev-router"
KEY_NAME = "OPENROUTER_TYPESAFE_API_KEY"
TIMEOUT_SECONDS = 180

# Averaged into the headline score. Risk is reported, never averaged in: an
# idea that scores well by being dangerous should look dangerous, not good.
AXES = ["stop_scroll", "funny", "surprise", "edge", "payoff_lands"]

RUBRIC = """You are the harshest critic on a college meme page's team. The page opposes
automated license plate reader cameras (Flock Safety and others) around campus.
Audience: 18-22 year olds scrolling Instagram fast; they follow sports and meme
accounts like @polymarketsports. Most ideas are mid; score like it.

For each candidate you get the slide-1 hook, what the photo shows, the payoff
on the swipe, and the caption. Rate 1-10:
- stop_scroll: would a thumb stop on slide 1 alone?
- funny: would they actually laugh or send it to the group chat?
- surprise: does the swipe overturn what slide 1 set up? 1 = no twist.
- edge: does it feel a little dangerous to post? 10 = spicy but defensible.
- payoff_lands: does the reveal make sense instantly, without the caption?
Also:
- risk: none | low | medium | high (defamation, vandalism, harassment, gets reported)
- spoils_bait: true if slide 1 already gives away the payoff
- why: one blunt line, max 15 words
- punch_up: a sharper slide-1 hook, max 4 words, that keeps the bait (never reveal the payoff)

Return ONLY a JSON array, one object per candidate, each with "id" and the fields above."""

CLARITY_AXES = ["gets_topic", "hook_strength", "wants_swipe"]

CLARITY_RUBRIC = """You are a college student scrolling Instagram fast. You see ONLY slide 1 of a
post: a photo and a few words on it. No caption, no account name, no swipe.
Most people cannot recognise a license plate reader camera by sight; they see
"a camera on a pole" at best, or just "a pole".

The page opposes license plate reader cameras (Flock Safety) around campus.
For each candidate you get what the photo shows and the words on slide 1.
Rate 1-10, harshly:
- gets_topic: from slide 1 alone, would you get that this is about being watched,
  tracked or photographed by cameras? A bait may hide the punchline, but it
  must still point at surveillance. 1 = no idea, 10 = instantly obvious.
- hook_strength: are the words a real hook, or vague filler that means nothing
  on its own (e.g. a lone "FOUND")?
- wants_swipe: would you swipe to see slide 2?
Also:
- reads_as: what you'd think the post is about, max 10 words, honestly
- fix: a better slide-1 hook, max 4 words, that points at being tracked and
  keeps any bait (e.g. "FOUND" -> "FOUND YOU")

Return ONLY a JSON array, one object per candidate, each with "id" and the fields above."""

RUBRICS = {
    "funny": (RUBRIC, AXES),
    "clarity": (CLARITY_RUBRIC, CLARITY_AXES),
}


def load_key() -> str:
    if os.environ.get(KEY_NAME):
        return os.environ[KEY_NAME]

    env = Path(".env")
    if env.exists():
        match = re.search(rf'^{KEY_NAME}="?([^"\n]+)"?', env.read_text(), re.MULTILINE)
        if match:
            return match.group(1)

    sys.exit(f"{KEY_NAME} is not set in the environment or .env.")


def rate_once(key: str, rubric: str, candidates: list[dict]) -> tuple[str, list[dict]]:
    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": rubric},
            {"role": "user", "content": json.dumps(candidates)},
        ],
    }
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )

    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        reply = json.load(response)

    text = reply["choices"][0]["message"]["content"]
    # Some routed models wrap JSON in a code fence despite being told not to.
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())

    try:
        ratings = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError(f"{reply.get('model')} did not return JSON: {text[:200]!r}") from error

    model = reply.get("model", "unknown")
    print(f"  rated by {model}", file=sys.stderr)
    return model, ratings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("candidates", type=Path)
    parser.add_argument("--rounds", type=int, default=3)
    parser.add_argument("--rubric", choices=sorted(RUBRICS), default="funny")
    args = parser.parse_args()
    rubric, axes_names = RUBRICS[args.rubric]

    candidates = json.loads(args.candidates.read_text())
    ids = [candidate["id"] for candidate in candidates]

    if len(set(ids)) != len(ids):
        sys.exit("Every candidate needs a unique id.")

    key = load_key()
    rounds = [rate_once(key, rubric, candidates) for _ in range(args.rounds)]

    results = []
    for candidate in candidates:
        rated = [(model, r) for model, batch in rounds for r in batch if r.get("id") == candidate["id"]]
        ratings = [r for _, r in rated]
        if not ratings:
            print(f"No rating came back for {candidate['id']}.", file=sys.stderr)
            continue

        axes = {axis: statistics.mean(float(r.get(axis, 0)) for r in ratings) for axis in axes_names}
        by_model: dict[str, list[float]] = {}
        for model, r in rated:
            by_model.setdefault(model, []).append(statistics.mean(float(r.get(axis, 0)) for axis in axes_names))

        results.append({
            "id": candidate["id"],
            "hook": candidate.get("hook"),
            "score": round(statistics.mean(axes.values()), 1),
            "by_model": {model: round(statistics.mean(scores), 1) for model, scores in by_model.items()},
            **{axis: round(value, 1) for axis, value in axes.items()},
            "risk": max((r.get("risk", "none") for r in ratings), key=["none", "low", "medium", "high"].index),
            "spoils_bait": sum(bool(r.get("spoils_bait")) for r in ratings) > len(ratings) / 2,
            # Whatever free-text fields the rubric asks for (why, punch_up,
            # reads_as, fix), one per rating.
            **{
                field: [r.get(field) for r in ratings]
                for field in ("why", "punch_up", "reads_as", "fix")
                if any(r.get(field) for r in ratings)
            },
        })

    results.sort(key=lambda result: result["score"], reverse=True)

    for result in results:
        flags = " ".join(filter(None, [
            f"risk:{result['risk']}" if result["risk"] not in ("none", "low") else "",
            "spoils-bait" if result["spoils_bait"] else "",
        ]))
        models = ", ".join(f"{name.split('/')[-1]} {score}" for name, score in result["by_model"].items())
        print(f"{result['score']:>4}  {result['id']:<28} {result['hook'] or '':<30} [{models}] {flags}")

    print(json.dumps(results, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
