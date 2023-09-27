#!/bin/bash

export KEY_DIR=$1

export PAYER_KEYFILE=$KEY_DIR/LGNDSCoQfZZDZDBtVLgXvmJpqzRjRBcXSxwkSZjp3wN.json

# SOL/USDC
export SWAP_ID="EsQTxmmQDJhnYfpKZxDtUEv5PZbJzUDi8YTgQXaA5JPN"

jest --testPathPattern orca.test.ts --detectOpenHandles