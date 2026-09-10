# Outreach email templates

One JSON file per angle, merged into `library.json` at build time. Every entry
is a complete letter a student can send to one public official with a single
click, with placeholders filled in from real chapter data.

## Schema

```json
[
  {
    "id": "fiscal-001",
    "angle": "fiscal",
    "subject": "Cost of the plate reader contract around {{shortName}}",
    "body": "Dear {{officialName}},\n\n..."
  }
]
```

## Placeholders — the only campus-specific content permitted

| Placeholder | Example |
| --- | --- |
| `{{officialName}}` | Jane Doe |
| `{{officialTitle}}` | Councilmember, District 3 |
| `{{role}}` | City council |
| `{{school}}` | Georgia Institute of Technology |
| `{{shortName}}` | Georgia Tech |
| `{{city}}` | Atlanta |
| `{{state}}` | Georgia |
| `{{readersWithinMile}}` | 52 |
| `{{readersInState}}` | 9,846 |

`{{readersWithinMile}}` and `{{readersInState}}` come from OpenStreetMap and are
real counts. Every other number you might reach for is not available, so it must
not appear.

## Hard rules

1. **Invent nothing.** No statistics, percentages, dollar figures, dates, study
   findings, court cases, news reports, or quotations. If a claim would need a
   citation, it cannot appear. The only numbers permitted are the two
   placeholders above.
2. **No stories or anecdotes.** Never "I was walking to class when…", never a
   described incident, never a hypothetical victim. These letters are read by
   staff who discount anything that reads as invented.
3. **Nothing personal about the campus.** No building names, streets,
   intersections, departments, events, or local history. The placeholders are
   the whole of the local content.
4. **The ask is always the same**, in your own construction: remove the
   automated license plate readers around campus, and install no new ones.
5. **No false authority.** The sender is a student, not an expert, a lawyer, or
   a representative of the school. Never claim the school endorses this.
6. **Every subject and every body must be unique** across the entire library.

## Register

Write like a literate constituent who is annoyed but not rude, and who expects
to be read by a staffer with sixty seconds. Vary sentence length. Vary how the
letter opens and closes — most letters should not open by stating who you are.

Banned as openings or filler, because they mark a letter as unread boilerplate:
"I hope this email finds you well", "I am writing to express", "As a concerned
citizen", "In today's digital age", "I am reaching out", "Let me be clear",
"Now more than ever", "It is worth noting that", "In conclusion".

Avoid em dashes. Avoid the "It's not X, it's Y" construction. Avoid tricolons
("faster, cheaper, and safer"). Do not begin consecutive sentences with the same
word.

## Shape

- Subject: 4 to 12 words. Concrete. No exclamation marks.
- Body: 90 to 170 words, plain text, `\n\n` between paragraphs.
- Open `Dear {{officialName}},` and close with a line that asks for a reply or a
  position. Do not sign a name; the sender's mail client supplies that.
