#!/bin/bash

if [ "$BOT_ENV" = "production" ]; then
    echo "Using .env.prod"
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env.prod | xargs)
else
    echo "Using .env.dev"
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env.dev | xargs)
fi
export TOKEN=$(grep TELEGRAM_API_TOKEN .env.dev | cut -d '=' -f2- | xargs)
echo "TOKEN is: '$TOKEN'"

python bot.py
