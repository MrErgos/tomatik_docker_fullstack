#!/bin/bash

if [ "$FLASK_ENV" = "production" ]; then
    echo "Using .env.prod"
    export $(grep -v '^#' .env.prod | xargs)
else
    echo "Using .env.dev"
    export $(grep -v '^#' .env.dev | xargs)
fi

cd /app

python App.py