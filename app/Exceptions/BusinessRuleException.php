<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class BusinessRuleException extends Exception
{
    public function __construct(
        string $message,
        public readonly int $statusCode = 400,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
