import { cloneDeep } from 'lodash-es'

// @ts-ignore
import SERUM_MARKETS from '@project-serum/serum/lib/markets.json'

import { TokenInfo } from './tokens.js'

export interface LiquidityPoolInfo {
  name: string
  coin: TokenInfo
  pc: TokenInfo
  lp: TokenInfo

  version: number
  programId: string

  ammId: string
  ammAuthority: string
  ammOpenOrders: string
  ammTargetOrders: string
  ammQuantities: string

  poolCoinTokenAccount: string
  poolPcTokenAccount: string
  poolWithdrawQueue: string
  poolTempLpTokenAccount: string

  serumProgramId: string
  serumMarket: string
  serumBids?: string
  serumAsks?: string
  serumEventQueue?: string
  serumCoinVaultAccount: string
  serumPcVaultAccount: string
  serumVaultSigner: string

  official: boolean

  status?: number
  currentK?: number

  fees?: {
    swapFeeNumerator: number
    swapFeeDenominator: number
  }
}

/**
 * Get pool use two mint addresses

 * @param {string} coinMintAddress
 * @param {string} pcMintAddress

 * @returns {LiquidityPoolInfo | undefined} poolInfo
 */
export function getPoolByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string
): LiquidityPoolInfo | undefined {
  const pool = LIQUIDITY_POOLS.find(
    (pool) =>
      (pool.coin.mintAddress === coinMintAddress &&
        pool.pc.mintAddress === pcMintAddress) ||
      (pool.coin.mintAddress === pcMintAddress &&
        pool.pc.mintAddress === coinMintAddress)
  )

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export function getPoolListByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  ammIdOrMarket: string | undefined
): LiquidityPoolInfo[] {
  const pool = LIQUIDITY_POOLS.filter((pool) => {
    if (coinMintAddress && pcMintAddress) {
      if (
        ((pool.coin.mintAddress === coinMintAddress &&
          pool.pc.mintAddress === pcMintAddress) ||
          (pool.coin.mintAddress === pcMintAddress &&
            pool.pc.mintAddress === coinMintAddress)) &&
        [4, 5].includes(pool.version) &&
        pool.official
      ) {
        return !(
          ammIdOrMarket !== undefined &&
          pool.ammId !== ammIdOrMarket &&
          pool.serumMarket !== ammIdOrMarket
        )
      }
    } else {
      return !(
        ammIdOrMarket !== undefined &&
        pool.ammId !== ammIdOrMarket &&
        pool.serumMarket !== ammIdOrMarket
      )
    }
    return false
  })
  if (pool.length > 0) {
    return cloneDeep(pool)
  } else {
    return cloneDeep(
      LIQUIDITY_POOLS.filter((pool) => {
        if (coinMintAddress && pcMintAddress) {
          if (
            ((pool.coin.mintAddress === coinMintAddress &&
              pool.pc.mintAddress === pcMintAddress) ||
              (pool.coin.mintAddress === pcMintAddress &&
                pool.pc.mintAddress === coinMintAddress)) &&
            [4, 5].includes(pool.version)
          ) {
            return !(
              ammIdOrMarket !== undefined &&
              pool.ammId !== ammIdOrMarket &&
              pool.serumMarket !== ammIdOrMarket
            )
          }
        } else {
          return !(
            ammIdOrMarket !== undefined &&
            pool.ammId !== ammIdOrMarket &&
            pool.serumMarket !== ammIdOrMarket
          )
        }
        return false
      })
    )
  }
}

export function getLpMintByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  version = [3, 4, 5]
): string | null {
  const pool = LIQUIDITY_POOLS.find(
    (pool) =>
      ((pool.coin.mintAddress === coinMintAddress &&
        pool.pc.mintAddress === pcMintAddress) ||
        (pool.coin.mintAddress === pcMintAddress &&
          pool.pc.mintAddress === coinMintAddress)) &&
      version.includes(pool.version)
  )

  if (pool) {
    return pool.lp.mintAddress
  }

  return null
}

export function getLpListByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  ammIdOrMarket: string | undefined,
  version = [4, 5]
): LiquidityPoolInfo[] {
  const pool = LIQUIDITY_POOLS.filter((pool) => {
    if (coinMintAddress && pcMintAddress) {
      if (
        ((pool.coin.mintAddress === coinMintAddress &&
          pool.pc.mintAddress === pcMintAddress) ||
          (pool.coin.mintAddress === pcMintAddress &&
            pool.pc.mintAddress === coinMintAddress)) &&
        version.includes(pool.version) &&
        pool.official
      ) {
        return !(
          ammIdOrMarket !== undefined &&
          pool.ammId !== ammIdOrMarket &&
          pool.serumMarket !== ammIdOrMarket
        )
      }
    } else {
      return !(
        ammIdOrMarket !== undefined &&
        pool.ammId !== ammIdOrMarket &&
        pool.serumMarket !== ammIdOrMarket
      )
    }
    return false
  })
  if (pool.length > 0) {
    return pool
  } else {
    return LIQUIDITY_POOLS.filter((pool) => {
      if (coinMintAddress && pcMintAddress) {
        if (
          ((pool.coin.mintAddress === coinMintAddress &&
            pool.pc.mintAddress === pcMintAddress) ||
            (pool.coin.mintAddress === pcMintAddress &&
              pool.pc.mintAddress === coinMintAddress)) &&
          version.includes(pool.version)
        ) {
          return !(
            ammIdOrMarket !== undefined &&
            pool.ammId !== ammIdOrMarket &&
            pool.serumMarket !== ammIdOrMarket
          )
        }
      } else {
        return !(
          ammIdOrMarket !== undefined &&
          pool.ammId !== ammIdOrMarket &&
          pool.serumMarket !== ammIdOrMarket
        )
      }
      return false
    })
  }
}

export function getPoolByLpMintAddress(
  lpMintAddress: string
): LiquidityPoolInfo | undefined {
  const pool = LIQUIDITY_POOLS.find(
    (pool) => pool.lp.mintAddress === lpMintAddress
  )

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export function getAddressForWhat(address: string) {
  for (const pool of LIQUIDITY_POOLS) {
    for (const [key, value] of Object.entries(pool)) {
      if (key === 'lp') {
        if (value.mintAddress === address) {
          return {
            key: 'lpMintAddress',
            lpMintAddress: pool.lp.mintAddress,
            version: pool.version,
          }
        }
      } else if (value === address) {
        return {
          key,
          lpMintAddress: pool.lp.mintAddress,
          version: pool.version,
        }
      }
    }
  }

  return {}
}

export function isOfficalMarket(marketAddress: string) {
  for (const market of SERUM_MARKETS) {
    if (market.address === marketAddress && !market.deprecated) {
      return true
    }
  }

  for (const pool of LIQUIDITY_POOLS) {
    if (pool.serumMarket === marketAddress && pool.official === true) {
      return true
    }
  }

  return false
}

export const LIQUIDITY_POOLS: LiquidityPoolInfo[] = []
