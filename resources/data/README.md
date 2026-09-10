# Officials directory

`officials.json` maps a state code to the offices a chapter page asks students
to write to. It is read when a page is requested, not baked into chapter files,
so adding a state fixes every existing chapter in that state at once.

```json
"GA": {
  "lookupUrl": "https://www.legis.ga.gov/find-my-legislator",
  "officials": [
    {
      "name": "Jane Doe",
      "title": "State Representative, District 58",
      "email": "jane.doe@house.ga.gov",
      "url": "https://www.legis.ga.gov/members/house/1234",
      "scope": "state"
    }
  ]
}
```

`email` and `url` are both optional, and `scope` is `state` or `city`.

**Only add an address that has been checked against the office's own published
page.** A wrong recipient makes a student look careless to the one person the
chapter needed to persuade, and one invented contact discredits every real one.
Where no address is held, the page opens the letter with the subject and body
filled in and the student addresses it from `lookupUrl` — so an empty
`officials` array degrades to a working action rather than a dead button.
