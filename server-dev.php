<?php

/**
 * Router for PHP's built-in server during development.
 *
 * Laravel's own `artisan serve` script writes its request log to stdout, and
 * when a browser disconnects mid-response that write fails and PHP prints a
 * "Broken pipe" notice into the *next* response body. Serving through this
 * instead keeps that out of the page. Flags like display_errors also reach this
 * process directly, which they do not when `artisan serve` spawns its own.
 */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$file = __DIR__.'/public'.$path;

// Let the built-in server hand back real files (assets, build output) itself.
if ($path !== '/' && is_file($file)) {
    return false;
}

$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/public/index.php';

require __DIR__.'/public/index.php';
