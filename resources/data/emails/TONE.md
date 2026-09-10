# Register: concern, not demand

Every letter in this library currently reads as an instruction issued to an
official. It should read as a student who is genuinely worried telling someone
what worries them, and asking.

This is a rewrite of **register only**. The argument in each letter stays, the
angle stays, the ask stays. What changes is the posture of the person writing.

## The distinction

| Demand | Concern |
| --- | --- |
| Remove the readers. Approve none in future. | I would like to see them come down, and I hope you will not approve more. |
| Tell me the annual cost. | I have not been able to find what this costs each year, and I would like to know. |
| The council must hold a hearing. | A public hearing would help, and I hope you will call for one. |
| You need to answer this. | I would be grateful for an answer, even a short one. |
| This is unacceptable. | This worries me more than anything else about it. |

The ask does not get weaker. "I would like the readers around campus removed,
and no new ones installed" is exactly as clear as an imperative, and far harder
to dismiss.

## What concern actually sounds like

- **Say what worries you, in the first person.** "What bothers me is that the
  record outlasts the reason for it." A stated worry invites a reply; an
  instruction invites a filing.
- **Leave room for the recipient to disagree.** "If there is an argument for
  keeping them that I have not understood, I would genuinely like to hear it."
- **Ask, do not instruct.** "I hope you will", "I would be grateful if", "I am
  asking you to", "would you consider".
- **Own the limits of your standing.** The sender is one student with one
  letter, not a campaign. Saying so is disarming and true.
- **Keep it warm at the close.** Thanking somebody for reading costs nothing.

## What to avoid, still

- Servility. Not begging, not apologising for writing, not "I know you are very
  busy and I am sorry to bother you." Concerned is not meek.
- Passive vagueness. "It would be appreciated if steps were taken" says nothing.
  Concern is specific and first-person.
- Padding. If softening a letter adds thirty words of throat-clearing, cut
  something else. Stay inside the length limits.
- Every letter opening the same way. Worry is not one sentence; it has as many
  entry points as certainty does.

## Everything in SPEC.md still binds

Read `SPEC.md` first and keep every rule in it: the placeholder table, no
invented figures, no anecdotes, no campus detail, unique subjects and bodies,
`Dear {{officialName}},` opening, no banned phrases, no em dashes.

Two rules from the build gate that letters must also satisfy:

1. **Every letter must contain the word "student"**, identifying the sender.
2. **No letter may contain the word "demand"**, and none may accuse the
   recipient of having failed, refused, ignored, allowed or permitted anything,
   threaten them electorally, or be sarcastic at their expense. The build
   rejects any letter that does.
