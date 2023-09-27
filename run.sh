#!/usr/bin/env bash

ARGS=$*
STDERR_FILE="./.stderr"
STDOUT_FILE="./.stdout"

node --loader ts-node/esm ./src/lucra-util.ts ${ARGS} 2>$STDERR_FILE >$STDOUT_FILE

if [ $? -eq 0 ]
then
    cat $STDOUT_FILE
else
    cat $STDERR_FILE
fi

rm $STDERR_FILE
rm $STDOUT_FILE