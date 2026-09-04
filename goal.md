# Goal

Starting a chapter against automated plate readers should cost one student and
twenty minutes, and it should cost exactly that at the two hundredth school as it
did at the first.

## The flow

```
1. Verify      enter a school email, .edu or .org, and click the link we send
2. Name        the domain identifies the school; name it if we do not know it
3. Frame       draw a box around your campus on a map
4. Generate    a page is built from real map data and a randomised template
5. Connect     attach Instagram and TikTok as the chapter's point of contact
```

Nothing in that list routes through us. No approval, no meeting, no roster.

### 1. Verify

Creation requires an email at a `.edu` or `.org` domain. We send a signed link;
clicking it proves control of the address.

This gates **creation only**. Sending the outreach emails on a finished chapter
page requires nothing at all: no account, no address, no click. That split is the
point. Verification stops an outside interest claiming a campus they have no
connection to, while leaving the action itself open to a grad student on a
personal address, a parent, or a resident who lives beside the cameras.

### 2. Name

**The verified domain is the school's identity.** `gatech.edu` is Georgia Tech and
we know that. `stalbansschool.org` is a high school we have never heard of, so we
ask the creator to name it. A curated list of institutions was never going to
cover K-12, and the domain does the work instead.

### 3. Frame

The creator pans a plain world map to their campus and drags a box, locked to the
page's aspect ratio so what they frame is what renders. Those four numbers drive
every query the chapter needs.

Automatic derivation was tried and rejected: it fails silently, and a wrong frame
looks plausible to everyone except the person who walks the campus daily.

### 4. Generate

The box is queried against OpenStreetMap for two things: the street network, and
every node tagged `man_made=surveillance` with `surveillance:type=ALPR`. That is
the same data DeFlock maps into, so no separate API is required.

The page is then assembled from a library of components, chosen by a seed derived
from the school's name. Two campuses never get the same page. Sections are only
offered when they are **true of that campus**, so variation says something real
rather than decorating.

A fixed spine never varies:

```
Hero            identical wording on every chapter in the network
Officials       the offices that can remove the readers
Instagram       immediately after, always
...             seeded sections
No vandalism    always
Not affiliated  always
```

### 5. Connect

Instagram and TikTok are the chapter's only channel. **There is no messaging, no
forum, and no comments on the site**, deliberately: a communication surface is a
moderation obligation, and moderation does not scale to two hundred campuses run
by nobody.

The accounts belong to the creator. They can announce meetings, organise, and
post whatever they judge right. Every chapter page states plainly that those
accounts are run by students, are not associated with the school, and are not run
by DeFlock.

## Ownership

Recorded in the chapter's own file, locally. No database, no login, no session.

To edit a chapter later, request another link at the same address. Proving the
email again is the whole mechanism, which means there is no password to lose and
no account to compromise.

If somebody tries to create a chapter that already exists, they are told so and
sent to it, with a way to make contact if they believe it is abandoned.

## What is deliberately absent

- No database
- No accounts, logins, sessions, or passwords
- No messaging, comments, or forums
- No approval step before a chapter goes live
- No meetings, chartering, faculty advisor, or roster
- No sending on a student's behalf

## Scope

Colleges and high schools. The domain gate covers both, and `.org` exists in it
precisely so K-12 is not excluded.

## The ask

**Removal of the readers, and a ban on new installations.** Not audits, not
retention limits, not transparency reports. Through elected officials and votes,
never vandalism.

Both of those are conditions of being listed by DeFlock, and both appear on every
chapter page rather than in a policy document nobody reads.
