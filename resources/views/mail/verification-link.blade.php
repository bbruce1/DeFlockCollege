<x-mail::message>
# {{ $isEdit ? 'Edit your chapter' : 'One click and it exists' }}

@if ($isEdit)
Somebody asked to edit the **{{ $schoolName }}** chapter. If that was you, open
the link below. If it was not, ignore this: nothing changes until the link is used.
@else
Somebody asked to start a chapter for **{{ $schoolName }}**. If that was you,
open the link below and you will be building it inside a minute.
@endif

<x-mail::button :url="$url">
{{ $isEdit ? 'Edit the chapter' : 'Start the chapter' }}
</x-mail::button>

This link works for {{ $minutesValid }} minutes and once it expires you can just
ask for another. There is no account and no password, because proving this
address is the whole thing we need.

If you did not ask for this, nothing has happened and you can delete this email.

Thanks,<br>
DeFlock Campus
</x-mail::message>
