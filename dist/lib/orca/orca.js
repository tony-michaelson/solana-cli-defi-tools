import { PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ORCA_TOKEN_SWAP_ID } from '../constants.js';
import { Percentage } from '@orca-so/sdk';
import { OrcaPoolImpl } from '@orca-so/sdk/dist/model/orca/pool/orca-pool.js';
export async function findTokenSwapNonce(programId, tokenSwap, nonce = 255) {
    const _next = nonce
        ? findTokenSwapNonce(programId, tokenSwap, nonce - 1)
        : nonce;
    try {
        const authorityGuess = await PublicKey.createProgramAddress([tokenSwap.tokenSwap.toBuffer(), Buffer.from([nonce])], programId);
        return tokenSwap.authority.equals(authorityGuess) ? nonce : _next;
    }
    catch (err) {
        if (err instanceof TypeError) {
            throw err;
        }
        return _next;
    }
}
export async function tokenSwapToOrcaPool(connection, network, payer, tokenSwap) {
    const programId = ORCA_TOKEN_SWAP_ID[network];
    const nonce = await findTokenSwapNonce(programId, tokenSwap);
    if (!nonce) {
        throw ('Unable to determine nonce for TokenSwap authority: ' +
            tokenSwap.authority.toString() +
            ', ' +
            'ProgramID: ' +
            programId.toString() +
            ', ' +
            'Network: ' +
            network.toString());
    }
    const mintA = new Token(connection, tokenSwap.mintA, TOKEN_PROGRAM_ID, payer);
    const mintB = new Token(connection, tokenSwap.mintB, TOKEN_PROGRAM_ID, payer);
    const mintLP = new Token(connection, tokenSwap.poolToken, TOKEN_PROGRAM_ID, payer);
    const poolTokenDecimals = (await mintLP.getMintInfo()).decimals;
    const tokenA = Object.freeze({
        tag: 'tokenA',
        name: 'tokenA',
        mint: mintA.publicKey,
        scale: (await mintA.getMintInfo()).decimals,
    });
    const tokenB = Object.freeze({
        tag: 'tokenB',
        name: 'tokenB',
        mint: mintB.publicKey,
        scale: (await mintB.getMintInfo()).decimals,
    });
    const amp = tokenSwap.curveType === 2 ? 100 : undefined;
    const customConfig = Object.freeze({
        address: tokenSwap.tokenSwap,
        nonce: nonce,
        authority: tokenSwap.authority,
        poolTokenMint: tokenSwap.poolToken,
        poolTokenDecimals: poolTokenDecimals,
        feeAccount: tokenSwap.feeAccount,
        tokenIds: [mintA.publicKey.toString(), mintB.publicKey.toString()],
        tokens: {
            [mintA.publicKey.toString()]: {
                ...tokenA,
                addr: tokenSwap.tokenAccountA,
            },
            [mintB.publicKey.toString()]: {
                ...tokenB,
                addr: tokenSwap.tokenAccountB,
            },
        },
        curveType: tokenSwap.curveType,
        amp: amp,
        feeStructure: {
            traderFee: Percentage.fromFraction(tokenSwap.tradeFeeNumerator, tokenSwap.tradeFeeDenominator),
            ownerFee: Percentage.fromFraction(tokenSwap.ownerTradeFeeNumerator, tokenSwap.ownerTradeFeeDenominator),
        },
    });
    return new OrcaPoolImpl(connection, network, customConfig);
}
