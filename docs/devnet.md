## Create Saber LP for PROTOCOL STABLE/USDF

> The stable mint here is controlled by my key `LGNDS*` as I transferred the initial protocol's stable coint mint to the program.

### Create Mint

```bash
lucra-util-cli token mint create ${CREATOR_AUTHORITY_PK} 2 --keyfile=/Users/tony/Projects/lucra/keys/vanities_3/Cihwu2vJS1aC47qqDbeb87yrA54XxvRFJXRQ682S9rem.json
txid: 5mzs3G9WvvwHf1ermS7NazXruj2uQ2h1r2EF9Aj1zvpxBMm5vvm2SA2k8rQT5HQMDDnbqGt72U4BtuHLRgrSEKei
Mint Address: Cihwu2vJS1aC47qqDbeb87yrA54XxvRFJXRQ682S9rem
```

### MintTo ATA

```bash
$ lucra-util-cli token createATA Cihwu2vJS1aC47qqDbeb87yrA54XxvRFJXRQ682S9rem ${CREATOR_AUTHORITY_PK}
Associated Token Account Account: 4JdzoJdp1zdxprS8UYSW7KcwXFzHuAGKe2h4BUsPJDRr

$ lucra-util-cli token mint mintTo Cihwu2vJS1aC47qqDbeb87yrA54XxvRFJXRQ682S9rem 4JdzoJdp1zdxprS8UYSW7KcwXFzHuAGKe2h4BUsPJDRr 10000000000
Mint Decimals: 2
Amount To Mint (after shifting by mint decimal places): 1000000000000
Account Balance: 0
Minted 10000000000 to: 4JdzoJdp1zdxprS8UYSW7KcwXFzHuAGKe2h4BUsPJDRr
Account Balance: 10000000000
```

### Create Pool

```bash
$ lucra-util-cli saber createPool Cihwu2vJS1aC47qqDbeb87yrA54XxvRFJXRQ682S9rem 100000 USDFCbtaLoNWzatEY6yMSStQFpbdREuzq1YCpmahkfo 100000
Swap Account: 9yDJwRwUF34kiDDsLcsYUZJbbPKg82BQYH55S6Rumwtu
TxSig: 2RxR1wxw4hc59j7dQ1HQjZjmsVKnqKtKLfTWsj3KJub6CkB5FBtmU2kLpGoK6o1ArEXTH2LZAaS9nQPiYPs6MdwE
```

## Create Bond System for Saber

```bash
$ lucra-cli bond createBondSystem 9 1 1 1000000 1000000 1000000 \
 --poolType 'SABER' \
 --lpMint uf4MT2Zg656Mju29KKd9PMCYwweqqsdtJrKrowyNUvP \
 --poolStateAcct 9yDJwRwUF34kiDDsLcsYUZJbbPKg82BQYH55S6Rumwtu \
 --treasuryPyth J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
 --basePyth 5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7 \
 --quotePyth 5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7

bondSystemAcctKP 6W1Z2aoCAWsqXomcQsv6mQi6LdNtCk9pC7bdzpTaM2M

[{"name":"vault","pda":"7WC3AnwidS1ktvrimpcGBsVtFZGZovabcnDmaEgepFAZ","bumpSeed":255},{"name":"treasury","pda":"5kekQzG4CEHWu7NbakQmuV739wnbufZoULP8NpkKGFTU","bumpSeed":252}]
success 3oDSDkn2DpGy9g4QEdNp5VV4ksDHi3noDNCmnENXcun3LVDKW3vDEQTRQobAHYThRmeM7kAVoMYCgKyAXt8ofT2v
```

```json
[
  {
    "name": "vault",
    "pda": "7WC3AnwidS1ktvrimpcGBsVtFZGZovabcnDmaEgepFAZ",
    "bumpSeed": 255
  },
  {
    "name": "treasury",
    "pda": "5kekQzG4CEHWu7NbakQmuV739wnbufZoULP8NpkKGFTU",
    "bumpSeed": 252
  }
]
```

> Fund Treasury

```bash
$ lucra-util-cli token transfer CoKYLnajPe92E12tCJwuUkByyJ268PNwK2igrdvnJnAB 9DEas4bSVRaVFfCgK3UvVNC8QfbdvvcvrxoviBsjrczE 1000 57YuUgJjKazUczzGQf3BBDzMtdztwbWnZTwhyZ1GT9ti
amount: 1000
shiftedAmount: 1000000000000
txid: 4BSzxjTthDD8R1ruGoD5Y76UfaknA8d4YyuvHk3tnqwaYWoCTXn9PkPm5Jp3jqYW8HK3V1mHwjSQKpMGYTHzowjn
```

> Start Bond System

```bash
$ lucra-cli bond startBondSystem 6W1Z2aoCAWsqXomcQsv6mQi6LdNtCk9pC7bdzpTaM2M
txid: jTXusVemqTt8SUXAnNnotwAveWwU4kzofZJsPszgbAM8XBTBPTxz9Zb5UH64EELzBQqMKn3Z9sghSQcsBcD73tU
```

## Buy Saber Bond

> Verify LP Token Balance

```bash
$ lucra-util-cli token getATA uf4MT2Zg656Mju29KKd9PMCYwweqqsdtJrKrowyNUvP
ATA Address: DNz7pgLfTchrQo8BmgJ16T5BD8LQjx9L8bPBKhAXrenf
Balance: 2000
```

> Buy Bond

```bash
$ lucra-cli bond buyBond DNz7pgLfTchrQo8BmgJ16T5BD8LQjx9L8bPBKhAXrenf 1 --bondSystem MATA_USDC_SABER
txid: 5JYDKaqGeXEPSa5UXCdgqFFfjTSedUu2cXAN8o4LQsquPKfxCJj1tmot3SUqZozLGnSYeCSGUbtsaxVGYkm59Jdz
```

> Exercise

```bash
$ lucra-cli bond exerciseBond CBUzbuyoy8QbNgBpefSQ4HVXJVzfXM8ZQedxwvYJHJ3R GP1rvGnZHumU2aJFaQ8CcACgp1jR41vefa6bAuBsKG8T --bondSystem MATA_USDC_SABER
success 5ANcN9CvfYJsK24YiTLsC582NNx4YG7hUL3h5hoa64zjrEWsDDCzG1kMGQAyf8iH8ZDXbcVpnMc9YVLB82YakgfD
```

## List Market for Sol/USDF

```bash
$ ./target/release/crank https://api.devnet.solana.com list-market ${CREATOR_KEYFILE} DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY --coin-mint SoLAhoNCn98XFxv7jdAeRmNGh9wWvSH4cLsU7LR1Rsx --pc-mint USDFCbtaLoNWzatEY6yMSStQFpbdREuzq1YCpmahkfo --coin-lot-size 100000000 --pc-lot-size 100
Listed market: MarketPubkeys {
    market: AGDQ3J2fGnu12ZZEVbzHm8KHspJ8gNk19udHz2CepkDU,
    req_q: 2Mnfz5mimNfywjqRp12nmHPSURQv6cat68TJ47mYEEfU,
    event_q: J9423GYgD1ScYCPCs9iHaXkGFKhiGDmfZDfYHXPtuR6a,
    bids: 2WAHCTAgCEPwrLPYfJbrbN3iywU6He31euj2yYjTXvrG,
    asks: HKuMRSzFdMtP3FQGSojbNYqXCaq2KRqCTunmWoorZKT2,
    coin_vault: GRqsAKq8jJuBdnUXBmUP3HjtPLkmFvtbHdgWp2ohXysC,
    pc_vault: DzKv6CVcDPhSddc8ttspqXEhWdUtVvK5rbKFH9G3g93q,
    vault_signer_key: 524QNo3tf5JNo8EUhJZrq1qF3BNSt11eTSvPitiJ6zyF,
}
```

## Create Raydium Pool for Sol/USDF

> Price of $51.19

```bash
$ lucra-util-cli raydium createPool AGDQ3J2fGnu12ZZEVbzHm8KHspJ8gNk19udHz2CepkDU 186853 9564894
const ammAuthority = new PublicKey('DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh')
const nonce = 254
const ammId = new PublicKey('4e7xHVoRVDZfG4MhthCshnFfWt3PSgvywVwPo5oZBtgi')
const poolCoinTokenAccount = new PublicKey('EhxD8UxW3CbZiYi9vrGKAcgH8x3WBXJ9vKL5oFVCKXGN')
const poolPcTokenAccount = new PublicKey('46ch62qok3NxKyrDtQPRrPb1ppfYNVGCroALPdjesa1q')
const lpMintAddress = new PublicKey('9ca2FBew46NEp22ZAnHTxSQFUiDyJhvksEChRZy9gHUu')
const poolTempLpTokenAccount = new PublicKey('2yWpkqc7MLL52rm46D5DZ5uurD1hsc6xPA2YPAzz3jqD')
const ammTargetOrders = new PublicKey('DUr6DMGDqbqfKSE5QJkzjzbJTjpzXmDGRsgpcUNdXRpt')
const poolWithdrawQueue = new PublicKey('TLBqiaVuXQJcgnRPFjZJYS3mVSoP3YFPTXd6418u4vi')
const ammOpenOrders = new PublicKey('CA5wDYUEbnQZan7mokqbxfsADp9mdNfewoEWgH6qBVeE')
txid 3NXMpKHAoPr3byus7CWrJDUgG8st3BdXBLMo8XjnSMvHEMyXs99JtUgvDyjZiLJt1mMp9mAsqPYmWP3nj2s38P6Q
Transfer: 9564894000000 To: poolCoinTokenAccount
Transfer: 9564894000000 To: poolPcTokenAccount
txid 4Exnfo8htbxRH5oKURYCmooyBxDSPuque5QYzzkKZyy9Gf9jvxxayxYH6Jv1foSkjHSJJChJArqcB5vTaYpnmE52
AmmID: 4e7xHVoRVDZfG4MhthCshnFfWt3PSgvywVwPo5oZBtgi
```

## Create Orca Pool for Sol/USDF

```bash
$ lucra-util-cli orca createPool SoLAhoNCn98XFxv7jdAeRmNGh9wWvSH4cLsU7LR1Rsx BZNfkTgzh1CwP76yPCjCDMh2nNnZ4r2NHEHLwv16TVXM USDFCbtaLoNWzatEY6yMSStQFpbdREuzq1YCpmahkfo Yqe31jAbSUj2SAhDGsf9BAxUCY6j8vc3MZXCHdVPXYJ

ProgramId: 3xQ8SWv2GaFXXpHZNqkXsdxq5DZciHBz6ZFoPPfbFd7U
Swap Account:            DvNRtxXGJjCbSr9xumKRiPPufmAnuAhNqy1kktQboEnu
Authority:               9wUXUhA8UrbfDvnS5XNqXCnbJfFsza4aNv2nfzG7mjd5 Nonce: 255
LP Token Mint:           E4a1n6jma9KtJbNcfY6H2T1BMFonm2Z4VrDatLwbpBjR
LP Token Account:        4d7sbhPiUsgw4Yn2iitveLwhZjmfGMj3ddZEi1RhoXoP
LP Fee Account:          J174mXHwk1dAZmLBXkmts9RgcW2mMfj8T4Ppbxi53tfB
Swap Initialized: DvNRtxXGJjCbSr9xumKRiPPufmAnuAhNqy1kktQboEnu
```

## Create Oracle

```bash
$ ./run.sh lucra createOracle 0 --oracleKP ~/Projects/lucra/keys/vanities_3/oJYoCD9LqARHARxTaLZ8yDzjfGtFocQe4K5THhJ6e5e.json --serumMarket AGDQ3J2fGnu12ZZEVbzHm8KHspJ8gNk19udHz2CepkDU --raydiumAMMID 4e7xHVoRVDZfG4MhthCshnFfWt3PSgvywVwPo5oZBtgi --orcaSwap DvNRtxXGJjCbSr9xumKRiPPufmAnuAhNqy1kktQboEnu --baseMint SoLAhoNCn98XFxv7jdAeRmNGh9wWvSH4cLsU7LR1Rsx --quoteMint USDFCbtaLoNWzatEY6yMSStQFpbdREuzq1YCpmahkfo --payer ${CREATOR_KEYFILE}
success 3CinetckngdQ7N8WMrxLQHXK2wbZ3Ush732hoU1z8pRJjMfxSErYLvXDC3nmqs3rFez3d5MXS2U5Pwzwawa6kwkE
```
