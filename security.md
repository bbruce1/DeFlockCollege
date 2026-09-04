# Security

Threats specific to this application, and the decision taken on each. This is a
working document, not a certification.

## The largest reduction is holding almost nothing

No database, no accounts, no sessions, no passwords, no analytics profiles. There
is no credential store to breach and no personal data at rest beyond one
irreversible ownership record per chapter.

**Any change that starts storing personal data is a change to the project's risk
profile, not a product decision.**

## Email verification

**Signed links, not tokens in a table.** Laravel's `temporarySignedRoute` carries
the payload and an expiry, HMAC-signed with `APP_KEY`. Nothing is stored between
sending and clicking.

| Risk | Decision |
| --- | --- |
| Link replay after expiry | Short expiry, enforced by the signature |
| Forged links | HMAC over the full URL; `APP_KEY` never leaves `.env` |
| Header injection via the address | Validate as an email before it reaches the mailer |
| Being used as a spam relay | Rate limit per address and per IP on the send endpoint |
| Address enumeration | Identical response whether or not a chapter exists |

## Ownership records

**Never a bare hash of the email.** Email addresses are low entropy and
enumerable: `SHA-256("bob@gatech.edu")` is a dictionary lookup away from being
reversed, so publishing one in a repository would leak exactly the thing it was
meant to protect.

Ownership is stored as **HMAC-SHA256 of the address, keyed with the application
secret**. Without the key it cannot be tested against a guess. The school's
domain is stored in the clear, because it identifies the institution rather than
a person.

## Domain validation

`.edu` and `.org` are the gate, and the check must be on the **registrable
domain**, not a suffix match. `evil-gatech.edu.attacker.com` ends with neither,
but a naive `str_ends_with` on the wrong segment will accept things it should
not. Parse the host, take the last two labels, compare exactly.

## User-supplied values

Everything a creator can set is untrusted input:

| Field | Handling |
| --- | --- |
| School name | Length capped, escaped on output. Never rendered as raw HTML |
| Slug | Strict `[a-z0-9-]` allowlist, reserved names blocked, length capped |
| Bounding box | Four finite numbers, validated ranges, ordering enforced, area capped |
| Social handle | Platform character allowlist, normalised, rendered as text |

**Slugs become filenames**, so path traversal is the sharp edge here. The
allowlist has to run before the value touches any path, and `..`, separators, and
absolute paths must be impossible by construction rather than by escaping.

**Section content is authored, never user-supplied.** The library renders trusted
markup with campus values interpolated as escaped text. A creator cannot inject
markup into a page, which removes stored XSS as a category rather than mitigating
it.

## Outbound requests

The Overpass queries are the only server-initiated network calls, and their
bounding box is user-supplied.

- The endpoint URL is a constant. A user can never influence the host.
- Coordinates are parsed as floats and range-checked before use.
- Query area is capped, so a chapter cannot ask us to fetch a continent.
- Requests carry a timeout, a retry ceiling, and exponential backoff. Being rate
  limited by a free community service is our fault, not theirs.

## Links off the site

Chapter pages link to social accounts we do not control. Every outbound link
carries `rel="noopener nofollow"`, and the page states in its own voice that a
link is not an endorsement and that those accounts are not moderated by anyone
here.

## Secrets

`APP_KEY` and mail credentials live in `.env`, which is gitignored by Laravel's
default and must stay that way. Rotating `APP_KEY` invalidates every outstanding
signed link and every ownership record, so it is a deliberate operation rather
than routine hygiene.

## Standard web protections

CSRF tokens on every state-changing route, provided by the framework and not
disabled. Rate limiting on creation and on verification sends. A content security
policy that permits the tile host and nothing else. HTTPS only in production.

## Removal

Any chapter must be removable within a day, on request, without debate. Fast
removal is what turns a cease-and-desist into an afternoon, and it is the single
control that makes an open creation model defensible.
