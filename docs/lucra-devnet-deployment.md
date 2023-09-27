# Boot

## ENV Vars

```bash
export KEY_DIR=~/Projects/lucra/keys
export CREATOR_KEYFILE="${KEY_DIR}/LGNDSCoQfZZDZDBtVLgXvmJpqzRjRBcXSxwkSZjp3wN.json"
export CREATOR_AUTHORITY_PK="LGNDSCoQfZZDZDBtVLgXvmJpqzRjRBcXSxwkSZjp3wN"
export PAYER_KEYFILE=${CREATOR_KEYFILE}
```

## Deploy Lucra Program

> Before deployment, edit `constants.rs` and ensure proper pubkeys are set for oracles etc.

```bash
$ cargo build-bpf --features=devnet --manifest-path=./programs/lucra/Cargo.toml  --bpf-out-dir=dist/program
$ solana -k ${CREATOR_KEYFILE} program deploy ./dist/program/lucra.so --program-id ~/Projects/lucra/keys/LCu6pNvyoBkwCHYL6PbMLintScmZFrkDdbq1D7KZ4ay.json

Program Id: LCu6pNvyoBkwCHYL6PbMLintScmZFrkDdbq1D7KZ4ay
```

## Initialize Lucra Program

> This command assumes the --payer keyfile is the account owner of any mints that need to be transferred to the program. The intent of this command is to ensure the mints are owned by the program by either being created for it or having authority transferred.

> For devnet, `--fundStableATA 100000000000000000` was added to provide ample MATA for setting up pools.

```bash
$ lucra-cli lucra initialize 1000000000 300 0 604800 0 0 0 0 1000000000000 1000000000000 100000000000000000 --fundStableATA 300
programStateKey: 2YfXn3DtkqygeWEu7eyNhy2kxEo5okHfGqc1jdaEdjQY
programArbKey: 3LwCrhTUFiTpPBxsWuBKa9L5PjXx9XmtGMfgC375wkxt
programStakeKey: FNScp8vZTARvznj7c3jBCbwu9K1evtCDmVCTqwJk6Pod
msolAccountKey: E1hGcV7zfeLqVt8HLNdBNWY5zc1xsPGq8RNx8iFBKaeX
arbCofferKey: 2oguSsLk2arMv7EwrbyAvEzatxfrVLc8Pi5NE9nX8cTJ
rewardAccountKey: ErDgjrNsJesATNHwTziN6ZjFHKdzEGeFXMCM7P3oB4sa
stakeTreasuryAccountKey: CVsPHseSX4bxS7NYTny2BLS1FQ1dU6iCcB7ePrp5s8rC
mintStableKey: GEJhW88oZMuBZ1iz9B8ZzybDquvjDrD7x1BvG6s6Fejz
mintProtocolKey: KnbSvjdXNqnAyQ98WGBgV5vRN7SpdzA5wqUpBqC7vSV
mintStakedProtocolKey: AaMok81xdPKs2E2GsphkLPkoCXMBKQYio1rqZwmdJaxc
mintOracleRewardKey: C2uKLhUjsueHg2H9si72YqDgt1zD1bG8pfWooiQA1Zyx
arbFundKey: FEmQsLuDKZa4T2Cz6MnmNNNCA6DPASXi5BHLt6EWAsgV
wsolHoldingVaultKey: CMmuTJJVUwbgtRx7HK3mxtdZaJDKLk6zeFac1HnvBwLJ
mataHoldingVaultKey: GgXHEUtKKr2Hzz5y8PS4EDDHcGcE4SdHesQF1Xa2GUj6
lucraHoldingVaultKey: Dcnku16Nv1TQSt5qfvoSKaJHRrkRnZVpLZjcn39HSy7v
----------------------------------------
Creator Authority:      LGNDSCoQfZZDZDBtVLgXvmJpqzRjRBcXSxwkSZjp3wN
----------------------------------------
Lucra Mint Created: KnbSvjdXNqnAyQ98WGBgV5vRN7SpdzA5wqUpBqC7vSV
Created Team Token Account: Avq2gZ2owKYcajJnQtHUwtRQZaL25bmxFAt7ND86Rjdg
Minted  150000000000000000  tokens to: Avq2gZ2owKYcajJnQtHUwtRQZaL25bmxFAt7ND86Rjdg
txid: eQwhAYL1WBExFqvSGDN1fMrnD5SzcTwFYBKHypagdjrMW2Brqxw3wUUS1W1fumdog4TRteemxotAfgFRGX49XXJ
Created Treasury Token Account: 8qrPGhpPsfwcUD8jWboU8kw9RaF4wfg2bk4tqsRjhynM
Minted  150000000000000000  tokens to: 8qrPGhpPsfwcUD8jWboU8kw9RaF4wfg2bk4tqsRjhynM
txid: 3BPPwqmxkhD6ZWMh5t68fX1Hi3fcy7oswDJFGffpXxheCQEeVQrzZA9ymkQKkN9u74EPWskDMCfNeQ8uitXgeEm5
Created LP Bonds Token Account: 68QCaDUj42Xue216td8BDV1JmkANZxYd69wQAVS68Tom
Minted  700000000000000000  tokens to: 68QCaDUj42Xue216td8BDV1JmkANZxYd69wQAVS68Tom
txid: 2KXQcvecKFPdEr5YqcA8jY3Zez1kU8zn56EKRqx414M9YvtbCqMAzmKdiViZAjfpXxizTLgh4w2Sh17st3Z7zwKU
Mata Mint Created: GEJhW88oZMuBZ1iz9B8ZzybDquvjDrD7x1BvG6s6Fejz
Created MATA ATA: 3ZzRMopF2pUjGMjuQkMhhb8x6HLphG9URroNfJK35reV
Minted  300000000  tokens to: 3ZzRMopF2pUjGMjuQkMhhb8x6HLphG9URroNfJK35reV
txid: 3WeoRNoWMmmJNNgemRrEHQd435zURn74RtSJQGN2qT7BwQwJjvakXmCEjHH9ATNyfQmz5otDGENbxCda2e1phAfv
Mint Authority Is To Be Transferred to ProgramId: LCu6pNvyoBkwCHYL6PbMLintScmZFrkDdbq1D7KZ4ay
Mint Authority Is To Be Transferred to ProgramId: LCu6pNvyoBkwCHYL6PbMLintScmZFrkDdbq1D7KZ4ay
success 5BMCiSC9DfdccurQpvUTjG9XakwzJD39VfbEt7AsoZNMQzzb7LurhkyrGKKcjkiQ4WR3KW56e8kn4wfQJtHA1RuJ
success 3CRxGgiXG7EGydtVnve3vSABAWRJk23ExyXjQfQCRrrcx2oEgKzyyDciyy9vrnAZGoj7xHQFdm3FmBjA8AZR3yjG
success 4tViYLjzehXwMs1u6xK1QrFWFDevryfRNogjZLsNcJH7QpELMcM2qJ3HVT5dtjcGdmEnTBSXCQMyDfdxcfpPneTg
success 5D3CXoRzNHJWMnrf5JbKSQg9WA3JavgmqiS4BabN7mdLA5Z7SiNJAJkTdeUAXDP71AACRiDZBGa4kZqxVTTvkH5M
[{"name":"mata","pda":"7At9oxsowHqy1xFQeMcvevmFdg1YQPt9f8H59QqnqEwq","bumpSeed":255},{"name":"lucra","pda":"7FMCVnHthbMikg2wxnHtAG2EJiAJfEwfTRyp14ct3WYK","bumpSeed":255}]
[{"name":"oracleReward","pda":"Ds2V9BeuFEeCifmg3FTzqozg4vEjySnbgD7NBxSCDGh8","bumpSeed":255},{"name":"arbCoffer","pda":"51nZzsEQ3pjGH3sp33wVJa3Nw67ke2JgnKZqJPYwaAtR","bumpSeed":255},{"name":"rewardVault","pda":"GjWXrP5VpWDFXs92mndeNS9ZyaCQVpYPq9kATN4csE8n","bumpSeed":255},{"name":"stLucra","pda":"7QazMHZAKKbiG769QWLsFNNeZw1YnSM3jGaXBat9Qx6g","bumpSeed":254}]
[{"name":"msolVault","pda":"7u8crB1SQqaL4n5wtRX9yw62GLF9MQon3Tk9pdrTAZ8Z","bumpSeed":255},{"name":"arbFund","pda":"9VUVmsjc5f374eVBpbLg4LxrnsbeqtoenhqjyW66zpDD","bumpSeed":254},{"name":"wsolHoldingVault","pda":"8taNY5pVGhNyZwiSJtQffpD3PF5QigBNSvx3kkp8kUkw","bumpSeed":255}]
[{"name":"lucraHoldingVault","pda":"2sP9tW2UtJ5LXRnY3CRrdpTehi8jFCNx7AmYUzpw24da","bumpSeed":251},{"name":"mataHoldingVault","pda":"8HMv3HuXTVXMskSDSdYrWTPGr4zomWo869w1HCBMgomn","bumpSeed":254}]
```

```json
[
  {
    "name": "mata",
    "pda": "7At9oxsowHqy1xFQeMcvevmFdg1YQPt9f8H59QqnqEwq",
    "bumpSeed": 255
  },
  {
    "name": "lucra",
    "pda": "7FMCVnHthbMikg2wxnHtAG2EJiAJfEwfTRyp14ct3WYK",
    "bumpSeed": 255
  },
  {
    "name": "oracleReward",
    "pda": "Ds2V9BeuFEeCifmg3FTzqozg4vEjySnbgD7NBxSCDGh8",
    "bumpSeed": 255
  },
  {
    "name": "arbCoffer",
    "pda": "51nZzsEQ3pjGH3sp33wVJa3Nw67ke2JgnKZqJPYwaAtR",
    "bumpSeed": 255
  },
  {
    "name": "rewardVault",
    "pda": "GjWXrP5VpWDFXs92mndeNS9ZyaCQVpYPq9kATN4csE8n",
    "bumpSeed": 255
  },
  {
    "name": "stLucra",
    "pda": "7QazMHZAKKbiG769QWLsFNNeZw1YnSM3jGaXBat9Qx6g",
    "bumpSeed": 254
  },
  {
    "name": "msolVault",
    "pda": "7u8crB1SQqaL4n5wtRX9yw62GLF9MQon3Tk9pdrTAZ8Z",
    "bumpSeed": 255
  },
  {
    "name": "arbFund",
    "pda": "9VUVmsjc5f374eVBpbLg4LxrnsbeqtoenhqjyW66zpDD",
    "bumpSeed": 254
  },
  {
    "name": "wsolHoldingVault",
    "pda": "8taNY5pVGhNyZwiSJtQffpD3PF5QigBNSvx3kkp8kUkw",
    "bumpSeed": 255
  },
  {
    "name": "lucraHoldingVault",
    "pda": "2sP9tW2UtJ5LXRnY3CRrdpTehi8jFCNx7AmYUzpw24da",
    "bumpSeed": 251
  },
  {
    "name": "mataHoldingVault",
    "pda": "8HMv3HuXTVXMskSDSdYrWTPGr4zomWo869w1HCBMgomn",
    "bumpSeed": 254
  }
]
```

## ENV Vars

```bash
export MATA_MINT=GEJhW88oZMuBZ1iz9B8ZzybDquvjDrD7x1BvG6s6Fejz
export LUCRA_MINT=KnbSvjdXNqnAyQ98WGBgV5vRN7SpdzA5wqUpBqC7vSV
export LUCRA_TREASURY=8qrPGhpPsfwcUD8jWboU8kw9RaF4wfg2bk4tqsRjhynM
export BOND_TREASURY=68QCaDUj42Xue216td8BDV1JmkANZxYd69wQAVS68Tom
```

## Create an ATA for the Mata Mint

> check if ATA exists first

```bash
lucra-util-cli token getATA ${MATA_MINT} ${CREATOR_AUTHORITY_PK}
```

> if it does not exist then;

```bash
$ lucra-util-cli token createATA ${MATA_MINT} ${CREATOR_AUTHORITY_PK}
ATA Address: 3ZzRMopF2pUjGMjuQkMhhb8x6HLphG9URroNfJK35reV
```

```bash
export MATA_ATA=3ZzRMopF2pUjGMjuQkMhhb8x6HLphG9URroNfJK35reV
```

## Create an ATA for the Lucra Mint

```bash
$ lucra-util-cli token createATA ${LUCRA_MINT} ${CREATOR_AUTHORITY_PK}
ATA Address: FGqwio56M59B715i8uGq8SVsBs1cMUHGWaU94DYX1o5d
```

```bash
export LUCRA_ATA=FGqwio56M59B715i8uGq8SVsBs1cMUHGWaU94DYX1o5d
```

## Transfer Tokens from Treasury into ATA

```bash
$ lucra-util-cli token transfer ${LUCRA_MINT} ${LUCRA_TREASURY} 500 ${LUCRA_ATA}
amount: 500
shiftedAmount: 500000000000
txid: 5pozCmwn859hranJHpLSFETDYTBmSmNsBqGRGf6b5amYfLed4i9s8RzjV1ECpPRctYRnmUWm7fMa2MSNaUKZ8r3H
```

## Create 6 Decimal USDC Mint & ATA with 100B

```bash
$ lucra-util-cli token mint create ${CREATOR_AUTHORITY_PK} 6 --keyfile ${KEY_DIR}/USDCHdL2zd9fbJKcLssUnzGBeTAgfZzWDBC3uohgpRa.json --createUserATA 100000000000
Associated Token Account:        2gHSRoTq5frkGGHdXieHAYBZdgM3ATxVMfRpzD47pirX
```

# Setup For SOL/USDC Oracle

## List Serum Market for SoL/USDC

```bash
$ ./target/release/crank https://api.devnet.solana.com list-market ${CREATOR_KEYFILE} DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY --coin-mint So11111111111111111111111111111111111111112 --pc-mint USDCHdL2zd9fbJKcLssUnzGBeTAgfZzWDBC3uohgpRa --coin-lot-size 100000000 --pc-lot-size 100
Listed market: MarketPubkeys {
    market: 2fUkPik49XussDNvGk642RcC153ptd7mgHh7iZgFjz96,
    req_q: HgtNuEviuuQtBeTjeFbgqkYhQdfBwPK8U47WPFD1i6w8,
    event_q: jVfC1fKTh3TiKHf8h6cTM483EaPpstUbHApEj2j5sgM,
    bids: 8UAeLfyJHKRAmNRJuGLpppTMQEqMBPtjeSei1NeJ5r54,
    asks: 87SHLuyxewCkg288eh3S9TTPNJXJhW3RL5Ag2vxUhVNQ,
    coin_vault: 2SqRPX9nVJ1Totw1HKNEdn58NfzQAauvdz5m9N9QBPmM,
    pc_vault: D4HuLf9PcvsikwZmkMFfk2dmk4EuqWMiDTuEDyHjdbGS,
    vault_signer_key: EWUUCQw9BCA9tn8aQosaBkAB4HH458Ts4EnPsU1jGmqf,
}
```

## Create Raydium LP for Sol/USDC

```bash
$ lucra-util-cli raydium createPool 2fUkPik49XussDNvGk642RcC153ptd7mgHh7iZgFjz96 50 50
const ammAuthority = new PublicKey('DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh')
const nonce = 254
const ammId = new PublicKey('HVvCUjJZp1nYiEmoR8WJsQbsR2ZxSKoUWu3uELuUMCR6')
const poolCoinTokenAccount = new PublicKey('FWfhwLBLVLsucVANWuD66B412J27aBSKhzfEdUPQNJwx')
const poolPcTokenAccount = new PublicKey('2g2MKv1nf6GBXbwvmmj3vDWdYo4cNafVaLiap5vvik11')
const lpMintAddress = new PublicKey('5jVMduoojpcHEccVQds24T6BTY7sZqiFvNXWhCkzsP1T')
const poolTempLpTokenAccount = new PublicKey('9meRhs1AJx63oVNxbssGgAV8DFHvz75RhCKDCaj3ZWNh')
const ammTargetOrders = new PublicKey('L5agTmx3kXPYotDNkN8MnrNFma1uUB2V2z4qCeNXdkn')
const poolWithdrawQueue = new PublicKey('CqfiGPpg8g9NnPwy1cxvWuAHi1FwjGcBV8wtVKTSTfp7')
const ammOpenOrders = new PublicKey('8LuQTUg9MfDrqiPMgukgpvZCaRvFpE6JbeN1zSYjjzTh')
txid 3pBnbZm5k4t6ie3dBtAAMtnEQRXdcXNfj6JHCaXMpWeq6R9BB2Su1EZCp1u7GJrM2sysbFaGHFRp4GpEJaP1EVoe
Transfer: 50000000 To: poolPcTokenAccount
txid 66kfGcoYU7VUzTPgEXyF6AaLrNrR6yiFLzKkQUXFvK3NQ7NGoLm9dxsfyL4rSs65BSBJmhXcPDGogMhTGL5QDPuS
AmmID: HVvCUjJZp1nYiEmoR8WJsQbsR2ZxSKoUWu3uELuUMCR6
```

## Create Orca Pool for Sol/USDC

```bash
$ lucra-util-cli orca createPool So11111111111111111111111111111111111111112 EPwK3Cg6ZGVe8PJudYTV8Kz3sWHZ1Sp6qoJP9VCxreH7 USDCHdL2zd9fbJKcLssUnzGBeTAgfZzWDBC3uohgpRa 2gHSRoTq5frkGGHdXieHAYBZdgM3ATxVMfRpzD47pirX

ProgramId: 3xQ8SWv2GaFXXpHZNqkXsdxq5DZciHBz6ZFoPPfbFd7U
Swap Account:            6FwMvbWLGnAJTdsrmTsg9HRpt3DNhKNVG1c8VZ1qbEZ7
Authority:               2v7inR1tfwJSed98vDWE6CdFk1R2ChNfj6FhhPQ4Bzza Nonce: 254
LP Token Mint:           ECK1GhiVPszdFzE2rtgdst3efeMPHEX9LRRomVdH143C
LP Token Account:        FDW8Q872GDEEfZWjULA72UZUKr2Mg1t5heTCX7r4b8RH
LP Fee Account:          28VmdteWvcs6ddTYBi5Nu1Eb87scAxFNMTnDJfQrna6s
Swap Initialized: 6FwMvbWLGnAJTdsrmTsg9HRpt3DNhKNVG1c8VZ1qbEZ7
```

## Create Oracle

```bash
$ lucra-cli oracle createOracle 6 1 2 \
--oracleKP ${KEY_DIR}/o6JD3jPKU5UcbJGrecRCqAcdrK8F51pdYKEjurP3RDS.json \
--baseMint So11111111111111111111111111111111111111112 \
--quoteMint USDCHdL2zd9fbJKcLssUnzGBeTAgfZzWDBC3uohgpRa \
--payer ${CREATOR_KEYFILE} \
--rewardMint ${KEY_DIR}/ormNChs7MTrG5atK2JXjbaxoczxsthYLtjCybmbeAHd.json \
--treasury ${KEY_DIR}/ortFsCRA2VntRTYAaFrsrizQU19ZUjr4sBpugtH1tM2.json

Reward Mint Created: ormNChs7MTrG5atK2JXjbaxoczxsthYLtjCybmbeAHd
txid: 416k189ZCaDr4eQvnyt9VJvf1UBDZw64C87WifEEG4tsGcJ1rnGPSn63aGLYu9j89piq5V8BrnZummSHnTqMFhzH
Created treasury token account:  ortFsCRA2VntRTYAaFrsrizQU19ZUjr4sBpugtH1tM2
Successfully transferred mata to the treasury:  5EPzgq4cvTy1mizounLYBQXmPHyaioMzp1mAZUret1A1CqbYp6nwccJps6DDwSaCyFXsPgFgs1juFEke6ZrvL3Fk
success jEwYih32DacsUdhJeVprXfnLZ4NsSrL1iZHDuMw3BuKzQyoNBKBixcW7vGFv4nvFSSRb6WoJiRdH5HSjtCbXqkR
```

## Add Price Sources

```bash
$ lucra-cli oracle addPriceSource 1 HVvCUjJZp1nYiEmoR8WJsQbsR2ZxSKoUWu3uELuUMCR6 1 -or SOL_USDC
success 5SfD9sJ6S7cTkr7KSJNqM3qwLpHrQguiSQ1ktWkC8dmy8etmgoas2ctjJQBSNokrgTnr5E3ivyxiKkKbHH2F2YEH

$ lucra-cli oracle addPriceSource 1 6FwMvbWLGnAJTdsrmTsg9HRpt3DNhKNVG1c8VZ1qbEZ7 3 -or SOL_USDC
success qaSofF1zPp5pQFCT99vFnEdoghrkcAhN6ChVCYT2HkWhiDNptEvC5xz8eYzBBVE8AKyxfLnrVh6dqL9Utt4hK54
```

# Setup For SOL/USDT Oracle

## Create 6 Decimal USDT Mint & ATA with 100B

```bash
$ lucra-util-cli token mint create ${CREATOR_AUTHORITY_PK} 6 --keyfile ${KEY_DIR}/USDTgvXsaf7fQLhq4XcDYHDmimS3iKaqNbj74Dib8Md.json --createUserATA 100000000000
Associated Token Account:        43ZzEHkFeEitgqqZQ76HkmDhK1RZ2SrB7yQJKkPWxtPF
```

## List Serum Market for Sol/USDT

```bash
$ ./target/release/crank https://api.devnet.solana.com list-market ${CREATOR_KEYFILE} DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY --coin-mint So11111111111111111111111111111111111111112 --pc-mint USDTgvXsaf7fQLhq4XcDYHDmimS3iKaqNbj74Dib8Md --coin-lot-size 100000000 --pc-lot-size 100
Listed market: MarketPubkeys {
    market: 8ch4NpSNUw95vKy5GEZFgxNZqdxnsKtHxuWAd9amDvYM,
    req_q: 3PSvZU6GAb5QSsPqzZCgw1f887NUC5KAwkN32uNMdDPG,
    event_q: 69NYoH5a9sZBjUGjyWLjGYwmCoS8YpbG8bQN2NFRVG5d,
    bids: 4mqC2x73a3mfp4g2iQNnaYAts5M1o8opRu7nQHwLgjjv,
    asks: CFq1w6ub3T3awmqpvEZW7iwjAdL7kjnQqvReuFk4vZq2,
    coin_vault: E1JFDLY9ZLwqP5dZkTLpynwXxFPide7Wi7hPPuYvMv9J,
    pc_vault: B1aJ1ngLcqpvdvzz7A9vbRp36aUQwk1eS39JB9U17zqC,
    vault_signer_key: 3UDec8kQTCid4c1HxjTPiSKPDvKzooNid6MDHsU2889L,
}
```

## Create Raydium LP for Sol/USDT

> Price of $45.22 (pull quantities of pool vaults for current price)

```bash
$ lucra-util-cli raydium createPool 8ch4NpSNUw95vKy5GEZFgxNZqdxnsKtHxuWAd9amDvYM 50 50
const ammAuthority = new PublicKey('DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh')
const nonce = 254
const ammId = new PublicKey('JBp27pDbVogzRNsvUXwmLcrk5rk9mMqRdb67a8WoPv5i')
const poolCoinTokenAccount = new PublicKey('Fhda5tbm7oTePKSis42Smr45XFfyhbC5ftM5DUMRnDjo')
const poolPcTokenAccount = new PublicKey('GmPvjZMD4TSkBoAu95by9ZSYHSPAmFXCCARhHX3a6zdp')
const lpMintAddress = new PublicKey('HP4KVCcRERdSnrsRqYfJVL9FRx3QdZyceutmoZa1eJZf')
const poolTempLpTokenAccount = new PublicKey('GyFHyB6EZBNtbbh41giyJEAC6Zkqv2tkt9p4k9Ja2oet')
const ammTargetOrders = new PublicKey('53opu4nXYVzm4Zo3AGnUGoG9KoJoQW32ePBQkCeVDWur')
const poolWithdrawQueue = new PublicKey('BPjCBz9c7ceKfjCF9J6n6tfThB1itCJSDkCJHc57XNix')
const ammOpenOrders = new PublicKey('GUHKB9a7tGEEfkBMdAJ6zrMddvGQoCzALx9aDJKmTMSU')
txid 5zZBphFJKtfoW9PTngxnmVXPDL6Db1kmu9Ve6yz7RrsRJzqgeEbQ9QNkXv9m6mTkfSs1Uu5CNrZkxCqE99WuNzQc
Transfer: 50000000 To: poolPcTokenAccount
txid wcWsLq7Qm46RxvXxMwex4oAkpPs78EEzBXge76WQSrUZvRLYLx4vckuGLfAjTkXDW4n6fYqFMix5AUqmJhJbz2c
AmmID: JBp27pDbVogzRNsvUXwmLcrk5rk9mMqRdb67a8WoPv5i
```

## Create Orca Pool for Sol/USDT

```bash
$ lucra-util-cli orca createPool So11111111111111111111111111111111111111112 EPwK3Cg6ZGVe8PJudYTV8Kz3sWHZ1Sp6qoJP9VCxreH7 USDTgvXsaf7fQLhq4XcDYHDmimS3iKaqNbj74Dib8Md 43ZzEHkFeEitgqqZQ76HkmDhK1RZ2SrB7yQJKkPWxtPF

ProgramId: 3xQ8SWv2GaFXXpHZNqkXsdxq5DZciHBz6ZFoPPfbFd7U
Swap Account:            2nskMBef2WiZD1NUhiMaL1aQLVt1BeURPDod54RBT9zo
Authority:               9EzqNW5KsVkfzL6TV8WWNe6YVW4zSp4YEZwN45bcQA2B Nonce: 255
LP Token Mint:           DrqhKJhHs6fJ75qkYqvWxrNX8RQscbXnRMXG7FDKz5nG
LP Token Account:        8fBVBZzn2oCbboknbhNzfLwjXbpEdgZZNUUbNd2bfG99
LP Fee Account:          94stY1spUEiVfbFgkWrD6R65vBDBKNYhsTTizcq2phmq
Swap Initialized: 2nskMBef2WiZD1NUhiMaL1aQLVt1BeURPDod54RBT9zo
```

## Create Oracle

```bash
$ lucra-cli oracle createOracle 6 1 2 \
--oracleKP ${KEY_DIR}/oJKV8GkHiZ2ZPxWvNqX42E82phqkqRw1S6tbb6hXRaA.json \
--baseMint So11111111111111111111111111111111111111112 \
--quoteMint USDTgvXsaf7fQLhq4XcDYHDmimS3iKaqNbj74Dib8Md \
--payer ${CREATOR_KEYFILE} \
--rewardMint ${KEY_DIR}/ormzQkbSyeYcZrCFnC9wVHyrx5wDa7vGU8LHPiB2pJF.json \
--treasury ${KEY_DIR}/ortP8s8rmxexqDT1TeEg9UWER7sg4LXjNkhsdzeUTDH.json

Reward Mint Created: ormzQkbSyeYcZrCFnC9wVHyrx5wDa7vGU8LHPiB2pJF
txid: 4xJnxxMWWRAaA2G3pXQz8R7MgaJQwPi9d2J52dF9paXnvqybxBL368Z8kkyLA27EseF5yTvATuFt6aehvAB8zJna
Created treasury token account:  ortP8s8rmxexqDT1TeEg9UWER7sg4LXjNkhsdzeUTDH
Successfully transferred mata to the treasury:  33k4u4BmdJtCkUvzGi4hAvMiXNgWY4R3RLeganHxKQ8uJ6dE78t9RtppWgC2drhLMyp3bEcaR4XndtHVKVq9wJHR
success xikUUP9QG9Xi76HuaAFcWe7EU7omKeg5fkKpm5fYtzfBjWqeG1qs6MSEJ1V8NNXzTAijrahyqNaDguNTxrVG87z
```

## Add Price Sources

```bash
$ lucra-cli oracle addPriceSource 1 JBp27pDbVogzRNsvUXwmLcrk5rk9mMqRdb67a8WoPv5i 1 -or SOL_USDT
success AgWgEMSH5tHqc9k49MmrSjhNTwnQCLkfcKVNpmYquH2ryiUswvKmGxWN3xLBc7V8vzmbLSLnaUQg924mxSnvJKN

$ lucra-cli oracle addPriceSource 1 2nskMBef2WiZD1NUhiMaL1aQLVt1BeURPDod54RBT9zo 3 -or SOL_USDT
success fSsquHHMpAgdwgGm49oK4s3QjG7Uk6UccQVpgGZJ1G7scbnnico7eS2dm5eH5FKcQBxVqeU8FDboxM61QuTN6Pi
```

# Setup For Lucra/SOL Oracle

## List Serum Market Lucra/SOL

> Proper lot sizes tbd

```bash
$ ./target/release/crank https://api.devnet.solana.com list-market ${CREATOR_KEYFILE} DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY --coin-mint ${LUCRA_MINT} --pc-mint So11111111111111111111111111111111111111112 --coin-lot-size 10000000 --pc-lot-size 10000

Listed market: MarketPubkeys {
    market: EDSShLzZzkmSDbjHnbJFU8JpKCYFPFMY8oCmWvzULwnF,
    req_q: 8zvLqg77Uya2tNkmzEZ9L4SjFkBJyZWDa2HhAdMvYhYe,
    event_q: H1ukC8XPm2FLzBQwTq23WnfezuawYPeYeNNGGmJxjosj,
    bids: CpUFn6yvhdDfZKdSxiTr4ZeZiwkcmJE8Z3r4PPKWMWtZ,
    asks: 93MBa9AucDfwCDj8fcrwZeAAbcmFPqfytVd5RwmERihr,
    coin_vault: 5KH8tbmdNRKshuUTGVt5diqLZK1Vj8UqwU655STfJC3E,
    pc_vault: Aihp7kBUzEMXKsSnxR2j6oXqxxErFgXmzy6dHrZ5j6nG,
    vault_signer_key: DgfwvNYJ8bK6N1X2wByZ1GnDBLQVjWbc1de6USwNyiPf,
}
```

## Create Raydium LP for Lucra/SOL

> Price of $450

```bash
$ lucra-util-cli raydium createPool EDSShLzZzkmSDbjHnbJFU8JpKCYFPFMY8oCmWvzULwnF 50 50

const ammAuthority = new PublicKey('DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh')
const nonce = 254
const ammId = new PublicKey('iqwQ4XpSxUwJ4Dj7VJCnk5dajy3fgMZuVGftCwD87Ti')
const poolCoinTokenAccount = new PublicKey('8gUE42T5tHo2deXLZNECRvqLJUp67h6NWBG2xPWhue6Y')
const poolPcTokenAccount = new PublicKey('93Vc2P9JQHba9yytzTqtbypghqa7EzQzLibXFr2onuQf')
const lpMintAddress = new PublicKey('9dz1eBYPTXvQHFPTF9L3qRSasPPMMCbyMofRmRc6Y1xs')
const poolTempLpTokenAccount = new PublicKey('GUDg44sP5YDaecA8g3CBnbzQ9489tx52frfqoR7GDCzC')
const ammTargetOrders = new PublicKey('H1McovL2yr2zBg9tYHLWzqM5QE2sAxQAeTaGjriBpHfr')
const poolWithdrawQueue = new PublicKey('9tC9HLrmc95KYViHN8Kv2Nbj76WAgsGdajb1Bk3nC44Q')
const ammOpenOrders = new PublicKey('2EkKhzhpomzvvYtZ4JsS2i8LXcECWiVBMFSjFfqWDtXX')
txid 3Q3TZjocmVMVrCafFqvXfftRvWuWvjsjr5hQ7EcSTYSU4zaTur7h1TvizJr1p2kD6BenqsBetFbm63HURADT6WX8
Transfer: 50000000000 To: poolCoinTokenAccount
txid 4Q33LUW5No7zkyVdtSx9qXTbwwHiHNqEWczety5F8LWE1gqF3WXvhnY7TKFu6ZM2qMrptiV7wtbxTz4bankN12uf
AmmID: iqwQ4XpSxUwJ4Dj7VJCnk5dajy3fgMZuVGftCwD87Ti
```

## Create Orca Pool for Lucra/SOL

```bash
$ lucra-util-cli orca createPool ${LUCRA_MINT} ${LUCRA_ATA} So11111111111111111111111111111111111111112 EPwK3Cg6ZGVe8PJudYTV8Kz3sWHZ1Sp6qoJP9VCxreH7

ProgramId: 3xQ8SWv2GaFXXpHZNqkXsdxq5DZciHBz6ZFoPPfbFd7U
Swap Account:            HmVBPAR6hBch4zbj6hnboCqgeKF2AQkDa7bc2SL54fBp
Authority:               4MpFpU1Lm3UriTrdGtEbJvmfBZV3MihWLCxsxH9jVW6h Nonce: 254
LP Token Mint:           3Aj4RuoU4Q9NyaEPparRjffNKEzAkt9xu7zYywShveXZ
LP Token Account:        34SiMc6JW2pQxWCzGrx63TuVdwhcXzx3NN7JEym7rogi
LP Fee Account:          FdhVeQNi4aKs5YiCgYCszXPNqSahX17ZNWrqS5weFC7d
Swap Initialized: HmVBPAR6hBch4zbj6hnboCqgeKF2AQkDa7bc2SL54fBp
```

## Create Lucra/SOL Oracle

```bash
$ lucra-cli lucra createOracle \
--market LucraSol \
--oracleKP ${KEY_DIR}/ouxWX8BuguuhrXfLzxRBHBRNPTSUwdgkWTwJmR6hgCi.json \
--serumMarket EDSShLzZzkmSDbjHnbJFU8JpKCYFPFMY8oCmWvzULwnF \
--raydiumAMMID iqwQ4XpSxUwJ4Dj7VJCnk5dajy3fgMZuVGftCwD87Ti \
--orcaSwap HmVBPAR6hBch4zbj6hnboCqgeKF2AQkDa7bc2SL54fBp \
--baseMint ${LUCRA_MINT} \
--quoteMint So11111111111111111111111111111111111111112 \
--payer ${CREATOR_KEYFILE}
success 2e15dUEN5B7SeoQa3BqeeWidSKbCKiDh16UBLU9B3NxUxABpFTZykVKGbHKGy4GfPCsNxP2yVp7AvAVtDprSgpsM
```

# Enable Mata Loans

```bash
$ lucra-cli lucra updateState 1000000000 300 0 1 0 0 0 1000000000000 1000000000000 100000000000000000 550000 5500
success 4C4n2VpF6zHWrnrHkkdK7b16f7aAJ1yt3bRwbDfJ5Rt4sPhEH8HZnTjn7Ada23KNvhkCecJSDysxpSrRF9LJogsH
```

# Create a Loan

```bash
$ lucra-cli lucra createLoan 2
success 29KN25YR73Jyxo6MTxYYYwzZ814GK7rMHhWHfM1BtLKM2m8nZ3RVTcstmeuXMMosJ89N4diRrE6YdvZw69Nn92Am
```

# Setup For SOL/MATA Oracle

## List Serum Market SOL/MATA

> lot sized copied from mainnet-beta (9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT) which has the same decimals for the sol/usdc(6) mints as our sol/mata(6) mints.

```bash
$ ./target/release/crank https://api.devnet.solana.com list-market ${CREATOR_KEYFILE} DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY --coin-mint So11111111111111111111111111111111111111112 --pc-mint ${MATA_MINT} --coin-lot-size 100000000 --pc-lot-size 100

Listed market: MarketPubkeys {
    market: E57VHAr3nRtJRK8Doib8WtfPT6uHsE6c5FSMfjXjUF1g,
    req_q: 7yjHc5A2pGanUSi9SjpQi6pXCkUryMDhToVGikthP47m,
    event_q: 9MrQ8wiU427LRUaRfCg7CxPsm51Cy3QEk25HaryBxShP,
    bids: 6iLjY6dbNdY8fRckcmHhDrb6x4z929fLb5afw4r3omA5,
    asks: 74DueTcToHkScV3fBPNroGuJEQD9gwSzXM9nDBVtB7DX,
    coin_vault: 3rxkMoJbcNXGhS1rDSQd6w9bmffPmqnJFdbhuxbuxgh6,
    pc_vault: EHYCvjg2qGkcfzBF8CUxaXsgA5BV77hSFrm2RQM5bX5k,
    vault_signer_key: AohHq9JR5m49M7U19DqoSSLGLSsq1ak7JTa1P3iLJjwx,
}
```

## Create Raydium LP for SOL/MATA

> Price of $51.18

```bash
$ lucra-util-cli raydium createPool E57VHAr3nRtJRK8Doib8WtfPT6uHsE6c5FSMfjXjUF1g 1 13

const ammAuthority = new PublicKey('DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh')
const nonce = 254
const ammId = new PublicKey('ADrmye5mFj9yUKQFAybHvk9y8zamdRFkc5AaiezdfG72')
const poolCoinTokenAccount = new PublicKey('5Z5qTadB2wX8grmWfbT8Hs97S91jgXvboKmMLN7obHPR')
const poolPcTokenAccount = new PublicKey('GwYdPQgr6twfHmhMqjCFMPu1Ny8qCitcQUyZbRrpuMyX')
const lpMintAddress = new PublicKey('31mv33TjUCtuotLkCWhKvyFd3BzwjJ7nbpgLW9JV5xLP')
const poolTempLpTokenAccount = new PublicKey('EcDYrDueo2Lfpbmm4SjbD2833dQz3KiQroC9BoAcnXsq')
const ammTargetOrders = new PublicKey('6RR3QSt1t5bcSMNzBxooys3dF7wWsFk3C77KZT9H7Fym')
const poolWithdrawQueue = new PublicKey('AiBb15WdUngDXsgqHdkFrCMoExzsN6jVjQ9GRcz6DE69')
const ammOpenOrders = new PublicKey('7EQbhyutcHGNnJctc8fYs6oHdLKDxd1zfcrLgxFfyEkR')
txid 552CRskDSr2hsHD521hnb544insxNAt5y5YnmN65BYcHEnr2f1N664vErCWi9sAwauoebKyMGziFWbr4sSKPbmRy
Transfer: 13000000 To: poolPcTokenAccount
txid C2DhGHeoxGEZmNnLDS11JT3QnTqqfhuPGUsToxmufABYGXnHBiGqmC9xsBTLNnY9MAfbZVMJW6qkXkm94gmcWjL
AmmID: ADrmye5mFj9yUKQFAybHvk9y8zamdRFkc5AaiezdfG72
```

## Create Orca Pool for SOL/MATA

```bash
$ lucra-util-cli orca createPool So11111111111111111111111111111111111111112 EPwK3Cg6ZGVe8PJudYTV8Kz3sWHZ1Sp6qoJP9VCxreH7 ${MATA_MINT} ${MATA_ATA}

ProgramId: 3xQ8SWv2GaFXXpHZNqkXsdxq5DZciHBz6ZFoPPfbFd7U
Swap Account:            2T9Csiqxm7cYhGKNvkhQNyGaUo1y9YiJm9xPPm58ymFL
Authority:               ABqQirHdqkmsk4z37FiiNS2Q94wXHeuK7qx8E7S1iHgV Nonce: 254
LP Token Mint:           cT4sdEAWZPjpYKLgtTijkZweJ6RogrJtngff7LwHvgx
LP Token Account:        B313y2n1xgfDnwXvJXaNYW1RuxeMznTqstXyoqiasnP5
LP Fee Account:          BszRNNFx8guBNxiuHrcZZ1ewPvoC2Snc8n6HasthGs2m
Swap Initialized: 2T9Csiqxm7cYhGKNvkhQNyGaUo1y9YiJm9xPPm58ymFL
```

## Create SOL/MATA Oracle

```bash
$ lucra-cli lucra createOracle \
--market MataSol \
--oracleKP ${KEY_DIR}/oVmf1NDUdsKB35hjZdpeCz3TkAr3CUuvKVws5nN8kZ1.json \
--serumMarket E57VHAr3nRtJRK8Doib8WtfPT6uHsE6c5FSMfjXjUF1g \
--raydiumAMMID ADrmye5mFj9yUKQFAybHvk9y8zamdRFkc5AaiezdfG72 \
--orcaSwap 2T9Csiqxm7cYhGKNvkhQNyGaUo1y9YiJm9xPPm58ymFL \
--baseMint So11111111111111111111111111111111111111112 \
--quoteMint ${MATA_MINT} \
--payer ${CREATOR_KEYFILE}
success 2bGjgrC2tJ6AGmS9Q5v57mqx2NMQfXUR9gpVopFkAkRYUQUc3QTowxfgYQAiKqcbyvzZDzCBp1sw4sfG4GTNpeHF
```

# Price History

## Create Price History

```bash
$ lucra-cli lucra createPriceHistory --priceHistoryKP ${KEY_DIR}/pYVZSidHAnvyQrKUuWfzzhu1FMvXWDG3VV71HgK1bgB.json
success 31QQ1bxEK7sBmsUEXW5U4Ryzmfrv36GrC7oAkShGAJXE3uJ5hhmMXRM4vHPczv14PP5rgXy99zdEmykMpPvkkMp7
```

# Create Bond Systems

## Create Bond System for Raydium SOL/MATA

```bash
$ lucra-cli bond createBondSystem 9 604800 604800 1000000 1000000 1000000 \
 --baseMint So11111111111111111111111111111111111111112 \
 --quoteMint ${MATA_MINT} \
 --poolType 'RAYDIUM' \
 --lpMint 31mv33TjUCtuotLkCWhKvyFd3BzwjJ7nbpgLW9JV5xLP \
 --poolStateAcct ADrmye5mFj9yUKQFAybHvk9y8zamdRFkc5AaiezdfG72 \
 --treasuryOracle ouxWX8BuguuhrXfLzxRBHBRNPTSUwdgkWTwJmR6hgCi \
 --baseOracle oVmf1NDUdsKB35hjZdpeCz3TkAr3CUuvKVws5nN8kZ1 \
 --quoteOracle oVmf1NDUdsKB35hjZdpeCz3TkAr3CUuvKVws5nN8kZ1

bondSystemAcctKP AKP3rPoFvgeuGtumKodBWnNF4jLTYe1fryF5TeX9zfdv

[{"name":"vault","pda":"2wB4Mg1NcVbiLCrb8FUgpavPhW7tz4dnEaerWpYUjvgD","bumpSeed":254},{"name":"treasury","pda":"7phUdb6BDrHdyQRBULeQgvxr19NsKtnWKcHqv7z7UV21","bumpSeed":255}]

success 3VRYSEUUpTNhTtVbvzJXhzGGPEE2zMbNue4qGyG2FwNDbghoHf8tu38CoWVP6GPg5pDdfRb14xtMgXkx6R9fhtHR
```

```json
[
  {
    "name": "vault",
    "pda": "2wB4Mg1NcVbiLCrb8FUgpavPhW7tz4dnEaerWpYUjvgD",
    "bumpSeed": 254
  },
  {
    "name": "treasury",
    "pda": "7phUdb6BDrHdyQRBULeQgvxr19NsKtnWKcHqv7z7UV21",
    "bumpSeed": 255
  }
]
```

> Fund Treasury

```bash
$ lucra-util-cli token transfer ${LUCRA_MINT} ${BOND_TREASURY} 10000 oky9m2gHazaZELv4R3AYbGyoWbK2Qv6UWJs6iU7MNYz
amount: 10000
shiftedAmount: 10000000000000
txid: 3JJJFdH1E4NKRdSjRGUyyTHs7dqPbVStEaX3xuuyiLLTKYLfujArdsSXDv6XhTk2Kz153ta4vjfKrmqu21CQVN52
```

> Start Bond System

```bash
$ lucra-cli bond startBondSystem AKP3rPoFvgeuGtumKodBWnNF4jLTYe1fryF5TeX9zfdv
txid: 4jeBkTEHTWrPNmsjKgH9UpAsLn9YQJio3YQ5xS2BHdfJNdGy2tkJzxA7GveDNwS1W2QC1u3R3keL24VaRdg4SmiW
```

## Deposit into Raydium SOL/MATA LP

> if the quote amount is lower than base amount \* price then you'll hit a slippage limit error

```bash
$ lucra-util-cli raydium deposit ADrmye5mFj9yUKQFAybHvk9y8zamdRFkc5AaiezdfG72 15 300 AohHq9JR5m49M7U19DqoSSLGLSsq1ak7JTa1P3iLJjwx
LP Deposit TXID: 4SerKdpanjXJhGxWtf4MFunKNZWLjaoyqwE9Eu5sjcvRCHTXNHZYakEyNSCGWydE3xLQ8wuREqgyGs2a4vRgpzLf
```

> Balances

```bash
$ lucra-util-cli raydium showPoolATABalances ADrmye5mFj9yUKQFAybHvk9y8zamdRFkc5AaiezdfG72

Base Token ATA: EPwK3Cg6ZGVe8PJudYTV8Kz3sWHZ1Sp6qoJP9VCxreH7
Balance: 127.410982203
Quote Token ATA: 4aTWnXr34PzZEmjoqqN2khz3pWAyjtwPrV5CqYsj1yD1
Balance: 12.665885
LP Token ATA: 4xE1Cukb7gyHmGUofUzKT3bDRRPUoqwCsmvUTR9U1VTw
Balance: 1
```

## Buy Raydium Bond

```bash
$ lucra-cli bond buyBond 4xE1Cukb7gyHmGUofUzKT3bDRRPUoqwCsmvUTR9U1VTw 1 --bondSystem SOL_MATA_RAYDIUM

txid: 5FXRooGWVVJ2PcFJG7Ffbpy8vkmiKJpGvHa1juowLKU8fmcYFavyBShqZjKwLC69SeuWNh3Fcx8bp8not6owsqtF
```

## Create Bond System for Orca LUCRA/SOL LP

```bash
$ lucra-cli bond createBondSystem 9 604800 604800 1000000 1000000 1000000 \
--baseMint ${LUCRA_MINT} \
--quoteMint So11111111111111111111111111111111111111112 \
--poolType 'TOKEN_SWAP' \
--lpMint 3Aj4RuoU4Q9NyaEPparRjffNKEzAkt9xu7zYywShveXZ \
--poolStateAcct HmVBPAR6hBch4zbj6hnboCqgeKF2AQkDa7bc2SL54fBp \
--treasuryOracle ouxWX8BuguuhrXfLzxRBHBRNPTSUwdgkWTwJmR6hgCi \
--baseOracle ouxWX8BuguuhrXfLzxRBHBRNPTSUwdgkWTwJmR6hgCi \
--quoteOracle ouxWX8BuguuhrXfLzxRBHBRNPTSUwdgkWTwJmR6hgCi

bondSystemAcctKP 7B9kvcS4kMyeGp3F24VPyaXr5RmnXiNhPjohszZ6R9Ws

[{"name":"vault","pda":"9Rr3VgwcDxBNWetdTrix6sSUDxUGH6zqP8KXA7CWepw4","bumpSeed":255},{"name":"treasury","pda":"A3VRYfvYvGB2GMjaPGmSSrHzJtxtobzncDibHHkCX9ay","bumpSeed":255}]
success 2EbzXN4UR9B7VYYkv87Eyka5ghS4JfETJCTb46gnq5hpjw81QSMhSAy8QEVw5adANwCZukBq56UQTH8GJ5DNtyNb
```

```json
[
  {
    "name": "vault",
    "pda": "9Rr3VgwcDxBNWetdTrix6sSUDxUGH6zqP8KXA7CWepw4",
    "bumpSeed": 255
  },
  {
    "name": "treasury",
    "pda": "A3VRYfvYvGB2GMjaPGmSSrHzJtxtobzncDibHHkCX9ay",
    "bumpSeed": 255
  }
]
```

> Fund Treasury

```bash
$ lucra-util-cli token transfer ${LUCRA_MINT} ${BOND_TREASURY} 100000 5bQjKqYC8NCNUnaW7Ft5uxCeff9rWnV5hU1cbHVAsQvz
amount: 10000
shiftedAmount: 10000000000000
txid: 2iHysWLzqxaMLpA5nBTofor3XQhY5R5tnvZzHyqDjeCtt7WVcX4VkZTGcHdA2oimn5WQ1kykYbi4Mea5TZqTRTEG
```

> Start Bond System

```bash
$ lucra-cli bond startBondSystem 7B9kvcS4kMyeGp3F24VPyaXr5RmnXiNhPjohszZ6R9Ws
txid: s9YHRDPJyJH3BhEVcTpXKoJJPHTq3KyKx9jxtf2K1qtV9WpYPRhVwAfAag36ketvh95tBy5K4sooatdBzmwm6BC
```

## Buy Orca Bond

> Make sure you have ATAs for base/quote token mints with balances and an ATA for the LP token mint

```bash
$ lucra-util-cli orca showPoolATAs HmVBPAR6hBch4zbj6hnboCqgeKF2AQkDa7bc2SL54fBp
Mint A:          DjuM9Twvyzwqguq96cofg6gBCNvGz7P2sAbcy8FZsEc2
ATA A:           C8eQUKEgpLmBKa4yRfYLJKHVbqUwVzTK388hqpHEA8ZP
Balance:         498

Mint B:          So11111111111111111111111111111111111111112
ATA B:           EPwK3Cg6ZGVe8PJudYTV8Kz3sWHZ1Sp6qoJP9VCxreH7
Balance:         127.410982203

Mint LP:         3Aj4RuoU4Q9NyaEPparRjffNKEzAkt9xu7zYywShveXZ
ATA LP:          3sqVAT7G1F49wWnewQMPdLYrLfVCc8CrEQevPnLPb4MV
Balance:         0
```

> Get a Deposit Quote

```bash
$ lucra-util-cli orca deposit HmVBPAR6hBch4zbj6hnboCqgeKF2AQkDa7bc2SL54fBp 1000 -q
--- DEPOSIT QUOTE ---
GIVE:
TOKEN A:        1000
TOKEN B:        0.997998997

RECEIVE
LP Tokens:      9970019.95
--- / DEPOSIT QUOTE ---
```

> Finish Deposit

```bash
$ lucra-util-cli orca deposit HmVBPAR6hBch4zbj6hnboCqgeKF2AQkDa7bc2SL54fBp 1000
--- DEPOSIT QUOTE ---
GIVE:
TOKEN A:        1000
TOKEN B:        1.991016964

RECEIVE
LP Tokens:      19890279.36
--- / DEPOSIT QUOTE ---
Pool deposited: 5KyrGNL49RyF6bpM8wuQjbANN176VkZ5m6Kr4DobLAynweD1CzZ5EGW6RsXYu6V7yPzuPbfc7njG1bUeptFthYFC
```

> Buy Bond

```bash
$ lucra-cli bond buyBond 3sqVAT7G1F49wWnewQMPdLYrLfVCc8CrEQevPnLPb4MV 1000 --bondSystem LUCRA_SOL_ORCA
txid: TbfwET3TFzWBtoqtA99jmwLRyPM7VfPC5uGpdsXPG4v3qxikMoEo6uh3AvdJg38VsXUDEcyXZGLuDqomVtVtRgu
```
