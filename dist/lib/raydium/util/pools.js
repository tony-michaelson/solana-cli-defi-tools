import { cloneDeep } from 'lodash-es';
// @ts-ignore
import SERUM_MARKETS from '@project-serum/serum/lib/markets.json';
/**
 * Get pool use two mint addresses

 * @param {string} coinMintAddress
 * @param {string} pcMintAddress

 * @returns {LiquidityPoolInfo | undefined} poolInfo
 */
export function getPoolByTokenMintAddresses(coinMintAddress, pcMintAddress) {
    const pool = LIQUIDITY_POOLS.find((pool) => (pool.coin.mintAddress === coinMintAddress &&
        pool.pc.mintAddress === pcMintAddress) ||
        (pool.coin.mintAddress === pcMintAddress &&
            pool.pc.mintAddress === coinMintAddress));
    if (pool) {
        return cloneDeep(pool);
    }
    return pool;
}
export function getPoolListByTokenMintAddresses(coinMintAddress, pcMintAddress, ammIdOrMarket) {
    const pool = LIQUIDITY_POOLS.filter((pool) => {
        if (coinMintAddress && pcMintAddress) {
            if (((pool.coin.mintAddress === coinMintAddress &&
                pool.pc.mintAddress === pcMintAddress) ||
                (pool.coin.mintAddress === pcMintAddress &&
                    pool.pc.mintAddress === coinMintAddress)) &&
                [4, 5].includes(pool.version) &&
                pool.official) {
                return !(ammIdOrMarket !== undefined &&
                    pool.ammId !== ammIdOrMarket &&
                    pool.serumMarket !== ammIdOrMarket);
            }
        }
        else {
            return !(ammIdOrMarket !== undefined &&
                pool.ammId !== ammIdOrMarket &&
                pool.serumMarket !== ammIdOrMarket);
        }
        return false;
    });
    if (pool.length > 0) {
        return cloneDeep(pool);
    }
    else {
        return cloneDeep(LIQUIDITY_POOLS.filter((pool) => {
            if (coinMintAddress && pcMintAddress) {
                if (((pool.coin.mintAddress === coinMintAddress &&
                    pool.pc.mintAddress === pcMintAddress) ||
                    (pool.coin.mintAddress === pcMintAddress &&
                        pool.pc.mintAddress === coinMintAddress)) &&
                    [4, 5].includes(pool.version)) {
                    return !(ammIdOrMarket !== undefined &&
                        pool.ammId !== ammIdOrMarket &&
                        pool.serumMarket !== ammIdOrMarket);
                }
            }
            else {
                return !(ammIdOrMarket !== undefined &&
                    pool.ammId !== ammIdOrMarket &&
                    pool.serumMarket !== ammIdOrMarket);
            }
            return false;
        }));
    }
}
export function getLpMintByTokenMintAddresses(coinMintAddress, pcMintAddress, version = [3, 4, 5]) {
    const pool = LIQUIDITY_POOLS.find((pool) => ((pool.coin.mintAddress === coinMintAddress &&
        pool.pc.mintAddress === pcMintAddress) ||
        (pool.coin.mintAddress === pcMintAddress &&
            pool.pc.mintAddress === coinMintAddress)) &&
        version.includes(pool.version));
    if (pool) {
        return pool.lp.mintAddress;
    }
    return null;
}
export function getLpListByTokenMintAddresses(coinMintAddress, pcMintAddress, ammIdOrMarket, version = [4, 5]) {
    const pool = LIQUIDITY_POOLS.filter((pool) => {
        if (coinMintAddress && pcMintAddress) {
            if (((pool.coin.mintAddress === coinMintAddress &&
                pool.pc.mintAddress === pcMintAddress) ||
                (pool.coin.mintAddress === pcMintAddress &&
                    pool.pc.mintAddress === coinMintAddress)) &&
                version.includes(pool.version) &&
                pool.official) {
                return !(ammIdOrMarket !== undefined &&
                    pool.ammId !== ammIdOrMarket &&
                    pool.serumMarket !== ammIdOrMarket);
            }
        }
        else {
            return !(ammIdOrMarket !== undefined &&
                pool.ammId !== ammIdOrMarket &&
                pool.serumMarket !== ammIdOrMarket);
        }
        return false;
    });
    if (pool.length > 0) {
        return pool;
    }
    else {
        return LIQUIDITY_POOLS.filter((pool) => {
            if (coinMintAddress && pcMintAddress) {
                if (((pool.coin.mintAddress === coinMintAddress &&
                    pool.pc.mintAddress === pcMintAddress) ||
                    (pool.coin.mintAddress === pcMintAddress &&
                        pool.pc.mintAddress === coinMintAddress)) &&
                    version.includes(pool.version)) {
                    return !(ammIdOrMarket !== undefined &&
                        pool.ammId !== ammIdOrMarket &&
                        pool.serumMarket !== ammIdOrMarket);
                }
            }
            else {
                return !(ammIdOrMarket !== undefined &&
                    pool.ammId !== ammIdOrMarket &&
                    pool.serumMarket !== ammIdOrMarket);
            }
            return false;
        });
    }
}
export function getPoolByLpMintAddress(lpMintAddress) {
    const pool = LIQUIDITY_POOLS.find((pool) => pool.lp.mintAddress === lpMintAddress);
    if (pool) {
        return cloneDeep(pool);
    }
    return pool;
}
export function getAddressForWhat(address) {
    for (const pool of LIQUIDITY_POOLS) {
        for (const [key, value] of Object.entries(pool)) {
            if (key === 'lp') {
                if (value.mintAddress === address) {
                    return {
                        key: 'lpMintAddress',
                        lpMintAddress: pool.lp.mintAddress,
                        version: pool.version,
                    };
                }
            }
            else if (value === address) {
                return {
                    key,
                    lpMintAddress: pool.lp.mintAddress,
                    version: pool.version,
                };
            }
        }
    }
    return {};
}
export function isOfficalMarket(marketAddress) {
    for (const market of SERUM_MARKETS) {
        if (market.address === marketAddress && !market.deprecated) {
            return true;
        }
    }
    for (const pool of LIQUIDITY_POOLS) {
        if (pool.serumMarket === marketAddress && pool.official === true) {
            return true;
        }
    }
    return false;
}
export const LIQUIDITY_POOLS = [];
