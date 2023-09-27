import { PublicKey, TokenAmount } from '@solana/web3.js'

export interface MarketAccountsBalance {
  tokenA: {
    publicKey: PublicKey
    balance: TokenAmount | null
  }
  tokenB: {
    publicKey: PublicKey
    balance: TokenAmount | null
  }
}
