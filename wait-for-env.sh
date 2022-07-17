#!/bin/sh

set -e

FILE=.env.local

if test -f "$FILE"; then
  >&2 echo "Find old $FILE file, removing it"
  rm $FILE
fi

>&2 echo "Waiting for $FILE..."

until test -f "$FILE"; do
  sleep 1
done

>&2 echo "Find $FILE file"
exec "$@"