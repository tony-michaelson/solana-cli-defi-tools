# Solana Defi Util CLI

CLI utilities to support Lucra

# Quick start

```bash
yarn install
yarn build
npm i -g ./
solana-defi-cli --help
```

# Usage

```
Usage: solana-defi-cli [options] [command]

Options:
  -h, --help      display help for command

Commands:
  raydium
  orca
  token
  saber
  help [command]  display help for command
```

# Example Accounts (devnet)

```
Orca ConstantProduct Swap Account:    EG6YXWgbP7vQxcwM28DpnjHLzr3ojdDXHHFhNFavwHR6
Saber Stable Swap Account:            bxbyLwUxDfsPSguVwVNm2tuFq3yjgYEWbPGP2HmHSXT
Serum Market:                         EzhA7r59XmjA7ydEWRvLNAss6a4qqPikpDYQaL2L1azr
Raydium AmmID:                        5RigoUuMmWV2UUp5kgvkvG4zpu1i3gNAFRtiWhk7SFda
```

# Development

Use `run.sh` to test in development

```bash
bash-3.2$ ./run.sh --help
```

# List a Serum Market

> Listing a market should be done by using their cli included in their DEX repo

[https://github.com/project-serum/serum-dex/tree/master/dex#using-the-crank-client-utility](https://github.com/project-serum/serum-dex/tree/master/dex#using-the-crank-client-utility)

### example:

```bash
crank-list-market

USAGE:
    crank list-market [OPTIONS] <payer> <dex-program-id> --coin-mint <coin-mint> --pc-mint <pc-mint>

ARGS:
    <payer>
    <dex-program-id>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
        --coin-lot-size <coin-lot-size>
    -c, --coin-mint <coin-mint>
        --pc-lot-size <pc-lot-size>
    -p, --pc-mint <pc-mint>

bash-3.2$ ./crank https://api.devnet.solana.com list-market vYUsALKEsJgHsm4joJVcYgqUAY7dNub.json DSgVaEKXbXqHzVdPrEVESBgxmroY --coin-mint EQYLiNRvKGqJyCB1Pwr5ihyqPB4A --pc-mint enS9HR1767SobhULX6cr9X837JK
```

# TODO

- Patch market.js to remove useFeeDiscountPubkey lookup
- Add test suite after other (and more pressing) projects are completed
- Refactoring
