# Vision

## The goal

Make the cost of a new campus chapter approximately zero, and keep it there.

Traditional campus organizing has a per-school cost that never falls: someone has to
recruit a core, charter with student government, find a faculty advisor, book rooms,
schedule meetings, and hold the thing together week after week. Two hundred campuses
means two hundred separate long-running efforts. The ceiling is the number of hours the
organizers have.

DeFlockCollege replaces that with a generator. A student picks their school; the site
builds their chapter. Two hundred campuses means two hundred clicks.

## The user's first sixty seconds

1. Lands on the DeFlock site, clicks **"Start a campus community."**
2. Names their school.
3. The site is generated — subdomain, local officials, pre-written outreach, social templates.
4. They send an email to a real decision-maker.

Step 4 happens before they have joined anything, committed to anything, or told anyone.

## Why this spreads

**The marginal cost of a campus is flat.** One student, twenty minutes. That number does
not rise with the 200th school, because nothing about school 200 requires more of us than
school 1 did.

**Nothing routes through us.** No approval queue, no onboarding call, no intake form that
a human has to read. Growth is not capped by any organizer's calendar — which means it is
not capped by our attention, our funding, or our burnout.

**It travels the way students already send things.** One person sends a link to a friend
at another school, and that friend has a chapter live the same day. This is the existing
behavior of the audience; we are not asking them to adopt a new one.

**Density compounds within a state.** Once a few schools in a state are up, the rest is
basically a group chat away — and state reps start hearing from students at multiple
campuses in their state rather than one.

**The first action is below the threshold of identity.** This is the core insight. Joining
a movement requires deciding you are the kind of person who joins movements. Clicking a
button that opens a pre-written email does not. A student can act first and decide what it
meant later. Most organizing gets this backwards: it asks for the identity commitment
before it offers anything to do.

## What we are betting on

That the binding constraint on this kind of civic action is **friction, not conviction** —
that there are far more students who object to ALPR cameras around their campus than
students willing to run a club about it, and that the gap between those two numbers is
made almost entirely of logistics we can delete.

If that bet is wrong, chapters will generate and then go silent, and the number that
matters — emails actually sent to officials — will stay flat while the chapter count
climbs. **Chapter count is a vanity metric.** Instrument for the real one from day one.

## Open questions

These are unresolved and affect architecture. They are recorded here rather than assumed.

- **Domain and project relationship.** The spec uses `deflock.com` subdomains. The
  established DeFlock ALPR-mapping project lives at `deflock.me`. Whether DeFlockCollege
  is part of that project, sanctioned by it, or independent determines what domain we can
  actually use and what name is defensible. Settle this before building anything that
  hard-codes a hostname.
- **Where officials data comes from.** Pre-loading campus police, city council, mayor, and
  state reps for hundreds of campuses is the one part of this that does *not* have flat
  marginal cost unless it is sourced automatically. If a human has to research each
  school, the whole thesis breaks. This is the highest-risk unknown in the project.
- **Whether generated outreach gets read.** Identical form emails are easy for an office
  to filter and discount. There is a real tension between "pre-written so it takes one
  click" and "individual enough that it counts." Worth testing early, since the answer may
  reshape the core interaction.
- **Legal review.** Non-affiliation disclaimers are necessary but not obviously
  sufficient — using school names in subdomains and page titles should be reviewed by
  someone qualified. Nothing in this repository is legal advice.
