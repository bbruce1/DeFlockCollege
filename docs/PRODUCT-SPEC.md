# Product spec — the generated chapter site

Describes what exists after a student clicks **"Start a campus community,"** names their
school, and finishes onboarding. Intent, not shipped behavior.

## Creation flow

The whole flow is one student, one sitting, roughly twenty minutes.

1. **Click** — "Start a campus community" from the main DeFlock site.
2. **Name the school** — the only required input. Everything downstream is derived from it.
3. **Generate** — the site is built and live on its own subdomain.
4. **Social nudge** — during onboarding, prompt the creator to actually create the
   Instagram and TikTok accounts, with the handles and first posts already drafted. This is
   a nudge, not a gate; a creator who skips it still ends onboarding with a live site.

If step 2 needs more than the school name to succeed, that is a defect in the generator,
not a question to ask the student.

## Subdomain

Each chapter gets its own: `gt.deflock.com`, `asu.deflock.com`.

A distinct subdomain is what makes the chapter feel like it belongs to that campus rather
than being a filtered view of someone else's national site. It is also the thing that gets
pasted into a group chat.

## Pre-loaded local officials

The site ships with the people who actually decide where ALPR cameras go around that
specific campus:

- Campus police
- City council
- Mayor
- State representatives

This is the core value delivered at generation time. A student who wanted to do this alone
would have to find these names and addresses themselves, which is exactly the research
step that stops most people. See the sourcing risk in
[VISION.md](VISION.md#open-questions) — automated sourcing is what keeps the marginal cost
of a campus flat.

## One-click actions

The primary interaction on every chapter site. Each official gets a button that opens a
pre-written email addressed to them:

> "I'm a student at X and I'm concerned about the ALPR cameras around campus…"

Requirements:

- **One click to a composed message.** Opens the student's own mail client with recipient,
  subject, and body already filled. It sends from them, as them.
- **Editable before sending.** Never send on the student's behalf. The student reads it,
  changes what they want, and presses send themselves.
- **Specific to that campus and that official.** A message that could have been sent to any
  official at any school reads like a form letter, because it is one.

## Templated social posts

Drafted posts for Instagram and TikTok, ready to publish, tied to the campus. Paired with
the onboarding nudge above — the templates exist so that "make the accounts" is a
five-minute job rather than a project.

## Non-affiliation

Every chapter site states plainly and visibly that it is **not affiliated with, endorsed
by, or sponsored by** the school it is named for. This is not fine print: it belongs
somewhere a reader sees without looking for it.

The disclaimer is a floor, not a legal opinion. See
[VISION.md](VISION.md#open-questions).

## What to instrument

Chapter count will look good early and mean little. The number that decides whether this
works is **emails actually sent to officials**, per campus, over time. Build the
measurement in with the first version — retrofitting it after a hundred chapters are live
means a hundred chapters of missing data.
