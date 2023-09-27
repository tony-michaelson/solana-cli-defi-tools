import { Connection, PublicKey } from '@solana/web3.js'
import {
  Liquidity,
  LIQUIDITY_PROGRAM_ID_V4,
  Market,
  SERUM_PROGRAM_ID_V3,
  LiquidityPoolKeysV4,
} from '@raydium-io/raydium-sdk'
import { getMintDecimals } from './web3.js'

export async function fetchPoolKeys(
  connection: Connection,
  poolId: PublicKey,
  programId: PublicKey = LIQUIDITY_PROGRAM_ID_V4,
  serumProgramId: PublicKey = SERUM_PROGRAM_ID_V3,
  version: number = 4,
  serumVersion: number = 3,
  marketVersion: number = 3
): Promise<LiquidityPoolKeysV4> {
  const account = await connection.getAccountInfo(poolId)
  const { state: LiquidityStateLayout } = Liquidity.getLayouts(version)

  //@ts-ignore
  const fields = LiquidityStateLayout.decode(account.data)
  const {
    baseMint,
    quoteMint,
    lpMint,
    openOrders,
    targetOrders,
    baseVault,
    quoteVault,
    marketId,
    baseDecimal,
    quoteDecimal,
  } = fields

  let withdrawQueue, lpVault
  if (Liquidity.isV4(fields)) {
    withdrawQueue = fields.withdrawQueue
    lpVault = fields.lpVault
  } else {
    withdrawQueue = PublicKey.default
    lpVault = PublicKey.default
  }

  const associatedPoolKeys = await Liquidity.getAssociatedPoolKeys({
    version,
    marketVersion,
    marketId,
    baseMint,
    quoteMint,
    baseDecimals: baseDecimal.toNumber(),
    quoteDecimals: quoteDecimal.toNumber(),
    programId,
    marketProgramId: serumProgramId,
  })

  const lpDecimals = await getMintDecimals(connection, lpMint)

  const poolKeys = {
    id: poolId,
    baseMint,
    quoteMint,
    lpMint,
    version,
    programId,
    baseDecimals: baseDecimal.toNumber(),
    quoteDecimals: quoteDecimal.toNumber(),
    lpDecimals,

    authority: associatedPoolKeys.authority,
    openOrders,
    targetOrders,
    baseVault,
    quoteVault,
    withdrawQueue,
    lpVault,
    marketVersion: serumVersion,
    marketProgramId: serumProgramId,
    marketId,
    marketAuthority: associatedPoolKeys.marketAuthority,
  }

  const marketInfo = await connection.getAccountInfo(marketId)
  const { state: MARKET_STATE_LAYOUT } = Market.getLayouts(marketVersion)
  //@ts-ignore
  const market = MARKET_STATE_LAYOUT.decode(marketInfo.data)

  const {
    baseVault: marketBaseVault,
    quoteVault: marketQuoteVault,
    bids: marketBids,
    asks: marketAsks,
    eventQueue: marketEventQueue,
  } = market

  // const poolKeys: LiquidityPoolKeys;
  return {
    ...poolKeys,
    ...{
      marketBaseVault,
      marketQuoteVault,
      marketBids,
      marketAsks,
      marketEventQueue,
    },
  }
}
