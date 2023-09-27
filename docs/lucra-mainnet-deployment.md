# Boot

## ENV Vars

```bash
export KEY_DIR=~/Projects/lucra/keys
export CREATOR_KEYFILE="${KEY_DIR}/LG17eUJqvjhtEYtK6KSjgWx7NbW91Qotm47LR7xreUr.json"
export CREATOR_AUTHORITY_PK="LG17eUJqvjhtEYtK6KSjgWx7NbW91Qotm47LR7xreUr"
export PAYER_KEYFILE=${CREATOR_KEYFILE}
```

## Deploy Lucra Program

> Before deployment, edit `constants.rs` and ensure proper pubkeys are set for oracles etc.

```bash
$ solana -k ${CREATOR_KEYFILE} program deploy ./dist/program/lucra.so --program-id ~/Projects/lucra/keys/LCP4AgomX2WFz772u4QnQ5tGqiKbQyG5NK3XuMKD4ct.json

Program Id: LCP4AgomX2WFz772u4QnQ5tGqiKbQyG5NK3XuMKD4ct
```

## Initialize Lucra Program

> This command assumes the --payer keyfile is the account owner of any mints that need to be transferred to the program. The intent of this command is to ensure the mints are owned by the program by either being created for it or having authority transferred.

> For devnet, `--fundStableATA 100000000000000000` was added to provide ample MATA for setting up pools.

```bash
$ lucra-cli lucra initialize 1000000000 300 0 604800 0 0 0 0 1000000000000 1000000000000 100000000000000000

programStateKey: BD9CvXY2m575DsxPt6APdzYuK3gxfWuSgcwKUmv3ABeS
programArbKey: FDiYtr6stfVmqer4jK8RDYQmhmdzuY2cqKgRRnDQtgUV
programStakeKey: G4o3VZdMZASTd82R9EUA8NjGqNzDujFoytHCgBVNxiJm
msolAccountKey: 26ZzB3AEmQ1ccYUGK9J9icpJFLeLzuAjxiNhYxkf1xXM
arbCofferKey: 2EkwQAnaP7HKATw1sSu7UTmLgBEPQw55JW3g1NbWMFce
rewardAccountKey: 8iXbJDZ4B2xF1b4nV1RicFAuQ1WJ1fvUpznGySQGJVZ8
stakeTreasuryAccountKey: 272jDn6m24V3zFM2m1vuRaXecxsWACTCx3763CJLx4Wy
mintStableKey: 6jm1hFuCtHEKEzchVoJ1AiKjnfijy4rr6uF7ZMSPBekg
mintProtocolKey: 7A1T9eRQuxmkKNTrj5r9okDUNmRtWNwcyiE3ZRahHAE7
mintStakedProtocolKey: BmyZ11s9r62YZfVnpS14zchA2n8CVKqJFxssEEPeZZnj
mintOracleRewardKey: 3o7bxsnMRGXiwX7Ds2oHpKoTborfoJN4VFj8L3w2spx9
arbFundKey: BtPwEB7X3UUvoKgmcQAK5MLzrezLoCt8ZnaSG5E938qD
wsolHoldingVaultKey: J7sn2yvJHoRNw797qcDPrGRcbETxMZVkCe2rqd21sJJ3
mataHoldingVaultKey: 8QKLAPQVdFfvoTgtoyc7JciSZAeg9E9gZgZXgGLxwwd4
lucraHoldingVaultKey: HZHPQsmHUvLA14SibFkavEQVjbyqb9AkEm9vfQpATDci
----------------------------------------
Creator Authority:      LG17eUJqvjhtEYtK6KSjgWx7NbW91Qotm47LR7xreUr
----------------------------------------
Lucra Mint Created: 7A1T9eRQuxmkKNTrj5r9okDUNmRtWNwcyiE3ZRahHAE7
Created Stake Treasury Token Account: 272jDn6m24V3zFM2m1vuRaXecxsWACTCx3763CJLx4Wy
Minted  200000000000000000  tokens to: 272jDn6m24V3zFM2m1vuRaXecxsWACTCx3763CJLx4Wy
txid: 2gRCKR9F4zRohnDXyZVoTbiR6V6G9XgUuLKRpXuzVTLjBQk9Zfpi1cwe4VDefJSEcQTyJ2A7HZMWZkp3VNVtZRHT
Created Team Token Account: EZU4e1feSL1XA7DmfqBnK5SF8eaqX1qcdM4BsxxeYJqR
Minted  150000000000000000  tokens to: EZU4e1feSL1XA7DmfqBnK5SF8eaqX1qcdM4BsxxeYJqR
txid: ZtMPibLTnt3FEfgS8AFwfD6zaAjGq2ToPAXyEXf3gXUnzr7yffd2wCp1o2dK9P5p3j86cVkSqYz31QKV1FRRFzj
Created Treasury Token Account: AJtP1cr6aR9WLUX239uf5iTaVbUA4rToF95G15XMYbdQ
Minted  150000000000000000  tokens to: AJtP1cr6aR9WLUX239uf5iTaVbUA4rToF95G15XMYbdQ
txid: 5487o189gfiVeAxW1NRFpFEow4yLetgNcXoYcisMH3dye39YssDt6B52MpSAGn4Boy5H7bQXbt8RYqqQyffgR2oB
Created LP Bonds Token Account: HPNWrC5j6qFh2q7Cu1QnY1ckvvrBpYLnNKe8JJPViKav
Minted  500000000000000000  tokens to: HPNWrC5j6qFh2q7Cu1QnY1ckvvrBpYLnNKe8JJPViKav
txid: ar8ZJBWvVTgw8PXuoRsdHEH7Nxs2HyGLGFN8eLRYJGv1tPV2u3JrhB2z9vJwNXukiLC4bEpwtsTwyXe3AvE3eFe
Mata Mint Created: 6jm1hFuCtHEKEzchVoJ1AiKjnfijy4rr6uF7ZMSPBekg
Created MATA ATA: EHE6djTxF7uwHVtWkFueoamthAA5fpTXr171MShvTf3e
Mint Authority Is To Be Transferred to ProgramId: LCP4AgomX2WFz772u4QnQ5tGqiKbQyG5NK3XuMKD4ct
Mint Authority Is To Be Transferred to ProgramId: LCP4AgomX2WFz772u4QnQ5tGqiKbQyG5NK3XuMKD4ct
Token Account Owner Is To Be Transferred to ProgramId: LCP4AgomX2WFz772u4QnQ5tGqiKbQyG5NK3XuMKD4ct
success 4uXjEfB4JMXBm3mbexRt42npXkEVW7szxhTDZ56ZrcUYzbMm922WDwzfE8TaSh5mTqvb5BhhtgCYLSd2hYr1Joj1
success V4ADyD1oPPyesgAEjrgKNhAnQ1WHFZa2HbwMz2Ct6jpefPrL3SciMb3VndkbsyeaPhyVKMLqw1Ji716BafoDSN6
success 5SKZrJ62X3aMPpXUf3YZ3A7fzfQS2TJZR8JX7RUGjEj7gAbk1XGwxo2MfVgRRJNHmZ4cUFHDKiW6GQiB4vwHqU26
success r61XpoBe5vc2wndYyFmc3Ehsw9sr7TmJM4L7xHSdKYmLA3iHBEgnqexAk4LNeUTUa3Sbs5A6NQrdHMcxWpekEqr
[{"name":"mata","pda":"6rWNnvAtW4QhcR3GWN9KUtbaBTVwQpzCtqShYdddmDZo","bumpSeed":255},{"name":"lucra","pda":"35HASX9Q1dgbZqvH6NojwJu1kcbVTufgXf8raK98FqJA","bumpSeed":254}]
[{"name":"oracleReward","pda":"3Z29ZjesyUUZKAEM9vWUUWoYSShvNkLb2QU2C1piC7vg","bumpSeed":255},{"name":"arbCoffer","pda":"FAixRJkKPrVMhDX3yHShS2mB13Ca4ZsLvxtfRWiZCwiy","bumpSeed":253},{"name":"rewardVault","pda":"5zxjQva3hbJ2qKvGDhewPQgWCentqcUinHgD8fwpWFFz","bumpSeed":255},{"name":"stLucra","pda":"8KaNu4kzWdTUV9MKEDHkzjTxToHx8myCMQMMv1X5WzrQ","bumpSeed":255}]
[{"name":"msolVault","pda":"43Nb8GYCH9KNXyPin5QWFREFwmLZrrBEwKbhfSy3Y34q","bumpSeed":255},{"name":"stakingTreasury","pda":"5tLAexUVVB1z1Tpy9W6iZaYQjDvNBUoSnfvKSXpv9gDT","bumpSeed":255},{"name":"arbFund","pda":"4Lkc2CpEr1SQqR72pEej55Co65Qbuh84RMA5a52JCHym","bumpSeed":255},{"name":"wsolHoldingVault","pda":"HvJbaQxGBwa86MKPAUyd8KVzKnjB48Z4ufDPgSSzDgW6","bumpSeed":255},{"name":"mataHoldingVault","pda":"CejKbxRdbVFiHY9PifAGetf8Lh4Yxew35i7EvJnEyHLb","bumpSeed":253}]
[{"name":"lucraHoldingVault","pda":"8A7r4VQ2wKBy7tnbg11eXyEp83vj158wNDA3h3tgcm6p","bumpSeed":251}]
```

```json
[
  {
    "name": "mata",
    "pda": "6rWNnvAtW4QhcR3GWN9KUtbaBTVwQpzCtqShYdddmDZo",
    "bumpSeed": 255
  },
  {
    "name": "lucra",
    "pda": "35HASX9Q1dgbZqvH6NojwJu1kcbVTufgXf8raK98FqJA",
    "bumpSeed": 254
  },
  {
    "name": "oracleReward",
    "pda": "3Z29ZjesyUUZKAEM9vWUUWoYSShvNkLb2QU2C1piC7vg",
    "bumpSeed": 255
  },
  {
    "name": "arbCoffer",
    "pda": "FAixRJkKPrVMhDX3yHShS2mB13Ca4ZsLvxtfRWiZCwiy",
    "bumpSeed": 253
  },
  {
    "name": "rewardVault",
    "pda": "5zxjQva3hbJ2qKvGDhewPQgWCentqcUinHgD8fwpWFFz",
    "bumpSeed": 255
  },
  {
    "name": "stLucra",
    "pda": "8KaNu4kzWdTUV9MKEDHkzjTxToHx8myCMQMMv1X5WzrQ",
    "bumpSeed": 255
  },
  {
    "name": "msolVault",
    "pda": "43Nb8GYCH9KNXyPin5QWFREFwmLZrrBEwKbhfSy3Y34q",
    "bumpSeed": 255
  },
  {
    "name": "stakingTreasury",
    "pda": "5tLAexUVVB1z1Tpy9W6iZaYQjDvNBUoSnfvKSXpv9gDT",
    "bumpSeed": 255
  },
  {
    "name": "arbFund",
    "pda": "4Lkc2CpEr1SQqR72pEej55Co65Qbuh84RMA5a52JCHym",
    "bumpSeed": 255
  },
  {
    "name": "wsolHoldingVault",
    "pda": "HvJbaQxGBwa86MKPAUyd8KVzKnjB48Z4ufDPgSSzDgW6",
    "bumpSeed": 255
  },
  {
    "name": "mataHoldingVault",
    "pda": "CejKbxRdbVFiHY9PifAGetf8Lh4Yxew35i7EvJnEyHLb",
    "bumpSeed": 253
  },
  {
    "name": "lucraHoldingVault",
    "pda": "8A7r4VQ2wKBy7tnbg11eXyEp83vj158wNDA3h3tgcm6p",
    "bumpSeed": 251
  }
]
```

## ENV Vars

```bash
export MATA_MINT=6jm1hFuCtHEKEzchVoJ1AiKjnfijy4rr6uF7ZMSPBekg
export LUCRA_MINT=7A1T9eRQuxmkKNTrj5r9okDUNmRtWNwcyiE3ZRahHAE7
export LUCRA_TREASURY=AJtP1cr6aR9WLUX239uf5iTaVbUA4rToF95G15XMYbdQ
export BOND_TREASURY=HPNWrC5j6qFh2q7Cu1QnY1ckvvrBpYLnNKe8JJPViKav
```

## Create Oracle

```bash
$ lucra-cli lucra createOracle \
--market SolUsdc \
--oracleKP ${KEY_DIR}/oBmAVqghFe2uxfWwCt1xn1G7coaphb7Fi2ggwsiJcpM.json \
--serumMarket 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6 \
--raydiumAMMID 58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2 \
--orcaSwap EGZ7tiLeH62TPV1gL8WwbXGzEPa9zmcpVnnkPKKnrE2U \
--baseMint So11111111111111111111111111111111111111112 \
--quoteMint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
--payer ${CREATOR_KEYFILE} \
-n mainnet-beta

success 4d4nTWa5jfXQFULmcXweNBPRX8uP1dc7FuGxPJDEoyWf4koxuV1Mvgipzoh4gZrYg8teyKeQP7s6453DxRkJuQAp
```
