# Posts

Every post a chapter is handed lives in `resources/js/Posts/sets/`, one family
per file, and the photos it draws on live here, one folder per family. Adding a
family is dropping a file into `sets/` and a folder in here; nothing shared has
to change. Every chapter gets every post in its own colours.

## Photos

- Every slide is a real photograph with words over it. No text on a flat colour.
- Fetch from Wikimedia Commons with the script, which refuses anything not
  freely reusable and records the credit in `credits.json`:

      python3 scripts/posts/fetch_commons.py "File:<exact title>" public/posts/<family>/<name>.jpg

  Put the line it prints in the slide's `credit`.
- The one exception is an executive's portrait, taken from their own company's
  press or leadership page, beside words that person said in public. Credit the
  company and add the entry to `credits.json` by hand.
- No identifiable private people. Nothing about anybody's body or looks.
- Delete any photo you stop using, and its `credits.json` entry.

## Slide 1

Slide 1 is the post for most people who see it, so it has to work with no
caption and no swipe.

- **Somebody who has never heard of Flock should get that it's about cameras
  watching them.** Say "plate camera" or "camera" in the tag, or show one in
  the photo. "Flock" on its own means nothing to most students.
- The hook is short: about 16 characters for `hook()`, 26 for `shout()`. A lone
  word that means nothing without context ("FOUND") is not a hook; "FOUND YOU"
  is.
- A bait can hide the punchline but must still point at being watched:
  "Still watches you park" over "CREEPY EX".
- News: slide 1 is the tag (`Flock cameras · Place · Mon YYYY`) and a gut
  reaction ("HOLY S\*\*\*", "WHAT TF", "LET'S GOOO"), swears asterisked, over a
  Flock camera. The headline goes on slide 2.
- Words never cover the camera. Top tag and bottom hook is the default; use
  `focus` to keep the subject in frame.

## Voice

Captions read like a guy running a meme page typed them on his phone:

- 1 to 3 short lowercase lines, then any `source:` line, then the address.
- At most one slang word and one or two emojis. No colon set-ups, arrows or
  lists, and no slang tacked onto every line.
- Casual, not sloppy: real apostrophes ("there's", "can't"), "though" not
  "tho", and no filler "lol", "bro", "fr" or "btw".
- One plain line explains the bait. The slides carry the facts.
- No em dashes anywhere in a post, slides and alt text included, except inside
  a verbatim quote.

Slide notes are just as casual, and short: 25 words at most.

## Facts

- Numbers come only from the chapter (`readersWithinMile`, `readersInState`,
  `stateName`) and print only when known. Never a nought, never a guess.
- Anything beyond the plain facts of what a plate reader does (it photographs
  every car, reads the plate, keeps the time and place) needs a live source.
  Put the URL in a comment beside it and in the caption.
- Quotes are character for character. News keeps the source's own verbs:
  "markets" is not "sells".
- No vandalism bait. Every post that mentions touching a camera lands on
  emailing the officials who decide.

## Checking

    python3 scripts/posts/score_hooks.py ideas.json --rubric funny
    python3 scripts/posts/score_hooks.py slide1.json --rubric clarity
    npx tsc --noEmit && npm run build

The scorer ranks ideas against each other; it is a second opinion, not a
verdict. Then look at every slide at http://127.0.0.1:8010/social/<post-id>?chapter=gatech
and in a second school's colours.
