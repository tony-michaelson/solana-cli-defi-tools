# ICP Notes

> https://internetcomputer.org/docs/current/developer-docs/quickstart/network-quickstart#confirm-your-developer-identity-and-ledger-account

## Devnet Setup

### Wallet

> 19900d2ea97e8d1c6e505a5f6c680f69a1bfa38cbd047977ced5ddab42cb6d8f

### Create Canister

```bash
$ dfx ledger --network ic create-canister emycp-mpbz3-clfng-gn765-nv4sc-dfrup-eyhbd-vprbu-7i6cx-zpli2-iae --amount 1
Transfer sent at BlockHeight: 3810354
Canister created with id: "vj4dc-2yaaa-aaaak-absja-cai"
```

> vj4dc-2yaaa-aaaak-absja-cai

### Deploy Wallet

```bash
$ dfx identity --network ic deploy-wallet vj4dc-2yaaa-aaaak-absja-cai
Creating a wallet canister on the ic network.
The wallet canister on the "ic" network for user "lucra-devnet" is "vj4dc-2yaaa-aaaak-absja-cai"
```

> vj4dc-2yaaa-aaaak-absja-cai

## Validate Cycles Wallet

```bash
dfx identity --network ic get-wallet
vj4dc-2yaaa-aaaak-absja-cai
```

## Check Balance

```bash
$ dfx wallet --network ic balance
4835923013901 cycles.
```

## Deploy

```bash
$ dfx deploy --network ic
Deploying all canisters.
All canisters have already been created.
Building canisters...
Installing canisters...
Module hash e0df779f65fe44893d8991bef0f9af442bff019b79ec756eface2b58beec236f is already installed.
Uploading assets to asset canister...
Starting batch.
Staging contents of new and changed assets:
  /assets/favicon.ico (15406 bytes) sha 4e8d31b50ffb59695389d94e393d299c5693405a12f6ccd08c31bcf9b58db2d4 is already installed
  /assets/main.css (537 bytes) sha 75ac0c5aea719bb2b887fffbde61867be5c3a9eceab3d75619763c28735891cb is already installed
  /assets/main.css (gzip) (297 bytes) sha 3e7dd285a23a46cb3e5ca1b5ae901572b791a0e365bf61e1e04763af59f1c0cd is already installed
  /assets/logo.png (25397 bytes) sha d17961d77e6d12c358cdd952217635766004004862e95b4f02aa453cecc4d2ff is already installed
  /index.html 1/1 (389 bytes)
  /index.html (gzip) 1/1 (257 bytes)
Committing batch.
Deployed canisters.
URLs:
  Frontend:
    www: https://vo5fw-xaaaa-aaaak-absjq-cai.ic0.app/
```

> https://vo5fw-xaaaa-aaaak-absjq-cai.ic0.app/
