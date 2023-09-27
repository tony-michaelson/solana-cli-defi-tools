#!/bin/bash

export KEY_DIR=$1

export PAYER_KEYFILE=$KEY_DIR/LGNDSCoQfZZDZDBtVLgXvmJpqzRjRBcXSxwkSZjp3wN.json

# SOL/USDC
export AMM_ID="HVvCUjJZp1nYiEmoR8WJsQbsR2ZxSKoUWu3uELuUMCR6"

jest --testPathPattern raydium.test.ts --detectOpenHandles