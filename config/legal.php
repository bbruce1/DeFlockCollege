<?php

declare(strict_types=1);

/*
 * Named parties in the terms and privacy policy.
 *
 * These belong in configuration rather than in the page text because they are
 * the parts a lawyer changes, and because they differ between whoever is
 * running an instance and where they are running it from.
 */
return [
    // The person or entity that operates this deployment and is party to the terms.
    'operator' => env('LEGAL_OPERATOR', 'DeFlock Campus'),

    // The law the terms are read under, and where disputes are heard.
    'jurisdiction' => env('LEGAL_JURISDICTION', 'the State of Georgia, United States'),
];
