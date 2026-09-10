<x-mail::message>
# {{ $isEdit ? 'Edit your chapter' : 'Start your chapter' }}

@if ($isEdit)
Somebody asked to edit the **{{ $schoolName }}** chapter. If that was you, open
the address below. If it was not, ignore this: nothing changes until it is used.
@else
Somebody asked to start a chapter for **{{ $schoolName }}**. If that was you,
open the address below and you will be building it inside a minute.
@endif

<x-mail::button :url="$url">
{{ $isEdit ? 'Edit the chapter' : 'Start the chapter' }}
</x-mail::button>

If that button does not work, copy this address into your browser:

{{ $url }}

It works for {{ $minutesValid }} minutes, and when it expires you can ask for
another. There is no account and no password, because proving this address is
the only thing we need.

If you did not ask for this, nothing has happened and you can delete this email.
Nobody can act on your address without opening the link above.

Thanks,<br>
DeFlock Campus
</x-mail::message>
