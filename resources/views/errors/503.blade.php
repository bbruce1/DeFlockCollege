{{--
    Normally a 503 is drawn by the Inertia error page like any other. This one
    is for `php artisan down --render="errors::503"`, which renders it once
    ahead of time so it is served even while a deploy has the framework and the
    built assets half replaced.
--}}
@extends('errors.standalone')

@section('code', '503')
@section('title', 'Down for a moment')
@section('message', 'The site is briefly unavailable, most likely being updated. Nothing is broken on your side and nothing has been lost. Try again shortly.')
