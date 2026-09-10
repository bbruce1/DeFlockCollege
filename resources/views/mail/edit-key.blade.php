<x-mail::message>
# Your new edit key

Somebody asked for a new edit key for the **{{ $schoolName }}** chapter, and
proved they control this address.

<x-mail::panel>
{{ $editKey }}
</x-mail::panel>

Save it somewhere you will still have in a year. It is stored only as a one-way
hash, so it cannot be looked up or sent again — only replaced.

**The previous key stopped working.** If you did not ask for this, someone knows
this address created the chapter. Nothing of yours is exposed, and the chapter
cannot be edited without the key above, but do reply and tell us.

To use it, open your chapter and press **Edit** in the bottom-left of the footer.

<x-mail::button :url="$chapterUrl">
Open the {{ $schoolName }} chapter
</x-mail::button>

If the button does not work, the address is:
{{ $chapterUrl }}
</x-mail::message>
