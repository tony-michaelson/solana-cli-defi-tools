// node --loader ts-node/esm ./liquidity/Raydium/createAmm.ts
// set type: module in package.json
import { Transaction, PublicKey, Account, TransactionInstruction, SYSVAR_RENT_PUBKEY, SystemProgram, } from '@solana/web3.js';
import { Market as MarketSerum } from '@project-serum/serum';
import { Token } from '@solana/spl-token';
import { throwIfNull } from './util/errors.js';
// @ts-ignore
import { struct, u8, nu64 } from 'buffer-layout';
import { createAmmAuthority, createAssociatedId, getMintDecimals, getMultipleAccounts, commitment, sendTransaction, getFilteredTokenAccountsByOwner, findAssociatedTokenAddress, } from './util/web3.js';
import { ACCOUNT_LAYOUT, getBigNumber, MINT_LAYOUT } from './util/layouts.js';
import { AMM_ASSOCIATED_SEED, ASSOCIATED_TOKEN_PROGRAM_ID, COIN_VAULT_ASSOCIATED_SEED, LP_MINT_ASSOCIATED_SEED, OPEN_ORDER_ASSOCIATED_SEED, PC_VAULT_ASSOCIATED_SEED, SYSTEM_PROGRAM_ID, TARGET_ASSOCIATED_SEED, TEMP_LP_TOKEN_ASSOCIATED_SEED, TOKEN_PROGRAM_ID, WITHDRAW_ASSOCIATED_SEED, } from './util/ids.js';
import BigNumber from 'bignumber.js';
import { TOKENS } from './util/tokens.js';
import { transfer } from './util/swap.js';
import { closeAccount, initializeAccount, } from '@project-serum/serum/lib/token-instructions.js';
import { logPubKey, logBumpSeed } from '../util.js';
export async function createAmm(conn, wallet, market, serumProgramId, userInputBaseValue, userInputQuoteValue, startTime, raydiumProgramId) {
    const transaction = new Transaction();
    const signers = [wallet];
    const owner = wallet.publicKey;
    const { publicKey, nonce } = await createAmmAuthority(raydiumProgramId);
    const ammAuthority = publicKey;
    logPubKey('ammAuthority', ammAuthority);
    logBumpSeed('nonce', nonce);
    const ammId = await createAssociatedId(raydiumProgramId, market.address, AMM_ASSOCIATED_SEED);
    logPubKey('ammId', ammId);
    const poolCoinTokenAccount = await createAssociatedId(raydiumProgramId, market.address, COIN_VAULT_ASSOCIATED_SEED);
    logPubKey('poolCoinTokenAccount', poolCoinTokenAccount);
    const poolPcTokenAccount = await createAssociatedId(raydiumProgramId, market.address, PC_VAULT_ASSOCIATED_SEED);
    logPubKey('poolPcTokenAccount', poolPcTokenAccount);
    const lpMintAddress = await createAssociatedId(raydiumProgramId, market.address, LP_MINT_ASSOCIATED_SEED);
    logPubKey('lpMintAddress', lpMintAddress);
    const poolTempLpTokenAccount = await createAssociatedId(raydiumProgramId, market.address, TEMP_LP_TOKEN_ASSOCIATED_SEED);
    logPubKey('poolTempLpTokenAccount', poolTempLpTokenAccount);
    const ammTargetOrders = await createAssociatedId(raydiumProgramId, market.address, TARGET_ASSOCIATED_SEED);
    logPubKey('ammTargetOrders', ammTargetOrders);
    const poolWithdrawQueue = await createAssociatedId(raydiumProgramId, market.address, WITHDRAW_ASSOCIATED_SEED);
    logPubKey('poolWithdrawQueue', poolWithdrawQueue);
    const ammOpenOrders = await createAssociatedId(raydiumProgramId, market.address, OPEN_ORDER_ASSOCIATED_SEED);
    logPubKey('ammOpenOrders', ammOpenOrders);
    let accountSuccessFlag = false;
    let accountAllSuccessFlag = false;
    const multipleInfo = await getMultipleAccounts(conn, [lpMintAddress], commitment);
    if (multipleInfo.length > 0 && multipleInfo[0] !== null) {
        const tempLpMint = MINT_LAYOUT.decode(multipleInfo[0]?.account.data);
        if (getBigNumber(tempLpMint.supply) === 0) {
            accountSuccessFlag = true;
        }
        else {
            accountAllSuccessFlag = true;
        }
    }
    else {
        accountSuccessFlag = false;
    }
    transaction.add(preInitialize(raydiumProgramId, ammTargetOrders, poolWithdrawQueue, ammAuthority, lpMintAddress, market.baseMintAddress, market.quoteMintAddress, poolCoinTokenAccount, poolPcTokenAccount, poolTempLpTokenAccount, market.address, owner, nonce));
    if (!accountSuccessFlag) {
        const txid = await sendTransaction(conn, wallet, transaction, signers);
        console.log('txid', txid);
        let txidSuccessFlag = 0;
        await conn.onSignature(txid, function (_signatureResult, _context) {
            if (_signatureResult.err) {
                txidSuccessFlag = -1;
            }
            else {
                txidSuccessFlag = 1;
            }
        });
        const timeAwait = new Date().getTime();
        let outOfWhile = false;
        while (!outOfWhile) {
            if (txidSuccessFlag !== 0) {
                outOfWhile = true;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (txidSuccessFlag !== 1) {
            throw new Error('create tx1 error');
        }
    }
    const ammKeys = {
        ammId,
        ammAuthority,
        poolCoinTokenAccount,
        poolPcTokenAccount,
        lpMintAddress,
        ammOpenOrders,
        ammTargetOrders,
        poolWithdrawQueue,
        poolTempLpTokenAccount,
        nonce,
    };
    if (!accountAllSuccessFlag) {
        await initAmm(conn, wallet, market, raydiumProgramId, serumProgramId, 
        // ammId,
        ammKeys, userInputBaseValue, userInputQuoteValue, poolCoinTokenAccount, poolPcTokenAccount, lpMintAddress, startTime);
    }
    return ammId.toBase58();
}
async function initAmm(conn, wallet, market, ammProgramId, dexProgramId, 
// ammKeypair: PublicKey,
ammKeys, userInputBaseValue, userInputQuoteValue, poolCoinTokenAccount, poolPcTokenAccount, lpMintAddress, startTime) {
    const baseMintDecimals = new BigNumber(await getMintDecimals(conn, market.baseMintAddress));
    const quoteMintDecimals = new BigNumber(await getMintDecimals(conn, market.quoteMintAddress));
    const coinVol = new BigNumber(10)
        .exponentiatedBy(baseMintDecimals)
        .multipliedBy(userInputBaseValue);
    const pcVol = new BigNumber(10)
        .exponentiatedBy(quoteMintDecimals)
        .multipliedBy(userInputQuoteValue);
    const transaction = new Transaction();
    const signers = [wallet];
    const owner = wallet.publicKey;
    const baseTokenAccount = await getFilteredTokenAccountsByOwner(conn, owner, market.baseMintAddress);
    const quoteTokenAccount = await getFilteredTokenAccountsByOwner(conn, owner, market.quoteMintAddress);
    const baseTokenList = baseTokenAccount.value.map((item) => {
        if (item.account.data.parsed.info.tokenAmount.amount >= getBigNumber(coinVol)) {
            return item.pubkey;
        }
        return null;
    });
    const quoteTokenList = quoteTokenAccount.value.map((item) => {
        if (item.account.data.parsed.info.tokenAmount.amount >= getBigNumber(pcVol)) {
            return item.pubkey;
        }
        return null;
    });
    let baseToken = null;
    for (const item of baseTokenList) {
        if (item !== null) {
            baseToken = item;
        }
    }
    let quoteToken = null;
    for (const item of quoteTokenList) {
        if (item !== null) {
            quoteToken = item;
        }
    }
    if ((baseToken === null &&
        market.baseMintAddress.toString() !== TOKENS.WSOL.mintAddress) ||
        (quoteToken === null &&
            market.quoteMintAddress.toString() !== TOKENS.WSOL.mintAddress)) {
        throw new Error('no money');
    }
    const destLpToken = await findAssociatedTokenAddress(owner, lpMintAddress);
    const destLpTokenInfo = await conn.getAccountInfo(destLpToken);
    if (!destLpTokenInfo) {
        transaction.add(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, lpMintAddress, destLpToken, owner, owner));
    }
    if (market.baseMintAddress.toString() === TOKENS.WSOL.mintAddress) {
        const newAccount = new Account();
        transaction.add(SystemProgram.createAccount({
            fromPubkey: owner,
            newAccountPubkey: newAccount.publicKey,
            lamports: parseInt(coinVol.toFixed()) + 1e7,
            space: ACCOUNT_LAYOUT.span,
            programId: TOKEN_PROGRAM_ID,
        }));
        transaction.add(initializeAccount({
            account: newAccount.publicKey,
            mint: new PublicKey(TOKENS.WSOL.mintAddress),
            owner,
        }));
        transaction.add(transfer(newAccount.publicKey, poolCoinTokenAccount, owner, parseInt(coinVol.toFixed())));
        transaction.add(closeAccount({
            source: newAccount.publicKey,
            destination: owner,
            owner,
        }));
        signers.push(newAccount);
    }
    else {
        if (baseToken) {
            console.log('Transfer:', parseInt(pcVol.toFixed()).toString(), 'To: poolCoinTokenAccount');
            transaction.add(transfer(new PublicKey(baseToken), poolCoinTokenAccount, owner, parseInt(coinVol.toFixed())));
        }
    }
    if (market.quoteMintAddress.toString() === TOKENS.WSOL.mintAddress) {
        const newAccount = new Account();
        transaction.add(SystemProgram.createAccount({
            fromPubkey: owner,
            newAccountPubkey: newAccount.publicKey,
            lamports: parseInt(pcVol.toFixed()) + 1e7,
            space: ACCOUNT_LAYOUT.span,
            programId: TOKEN_PROGRAM_ID,
        }));
        transaction.add(initializeAccount({
            account: newAccount.publicKey,
            mint: new PublicKey(TOKENS.WSOL.mintAddress),
            owner,
        }));
        transaction.add(transfer(newAccount.publicKey, poolPcTokenAccount, owner, parseInt(pcVol.toFixed())));
        transaction.add(closeAccount({
            source: newAccount.publicKey,
            destination: owner,
            owner,
        }));
        signers.push(newAccount);
    }
    else {
        if (quoteToken) {
            console.log('Transfer:', parseInt(pcVol.toFixed()).toString(), 'To: poolPcTokenAccount');
            transaction.add(transfer(new PublicKey(quoteToken), poolPcTokenAccount, owner, parseInt(pcVol.toFixed())));
        }
    }
    transaction.add(initialize(ammProgramId, ammKeys.ammId, ammKeys.ammAuthority, ammKeys.ammOpenOrders, ammKeys.lpMintAddress, market.baseMintAddress, market.quoteMintAddress, ammKeys.poolCoinTokenAccount, ammKeys.poolPcTokenAccount, ammKeys.poolWithdrawQueue, ammKeys.ammTargetOrders, destLpToken, ammKeys.poolTempLpTokenAccount, dexProgramId, market.address, owner, ammKeys.nonce, startTime));
    const txid = await sendTransaction(conn, wallet, transaction, signers);
    console.log('txid', txid);
    let txidSuccessFlag = 0;
    await conn.onSignature(txid, function (_signatureResult, _context) {
        if (_signatureResult.err) {
            txidSuccessFlag = -1;
        }
        else {
            txidSuccessFlag = 1;
        }
    });
    const timeAwait = new Date().getTime();
    let outOfWhile = false;
    while (!outOfWhile) {
        if (txidSuccessFlag !== 0) {
            outOfWhile = true;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (txidSuccessFlag !== 1) {
        throw new Error('Transaction failed');
    }
}
export function initialize(ammProgramId, ammId, ammAuthority, ammOpenOrders, lpMintAddress, coinMint, pcMint, poolCoinTokenAccount, poolPcTokenAccount, poolWithdrawQueue, ammTargetOrders, poolLpTokenAccount, poolTempLpTokenAccount, serumProgramId, serumMarket, owner, nonce, startTime) {
    const dataLayout = struct([u8('instruction'), u8('nonce'), nu64('startTime')]);
    const keys = [
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: ammId, isSigner: false, isWritable: true },
        { pubkey: ammAuthority, isSigner: false, isWritable: false },
        { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
        { pubkey: lpMintAddress, isSigner: false, isWritable: true },
        { pubkey: coinMint, isSigner: false, isWritable: true },
        { pubkey: pcMint, isSigner: false, isWritable: true },
        { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
        { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
        { pubkey: poolLpTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
        { pubkey: serumProgramId, isSigner: false, isWritable: false },
        { pubkey: serumMarket, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
        instruction: 0,
        nonce,
        startTime,
    }, data);
    return new TransactionInstruction({
        keys,
        programId: ammProgramId,
        data,
    });
}
export function preInitialize(programId, ammTargetOrders, poolWithdrawQueue, ammAuthority, lpMintAddress, coinMintAddress, pcMintAddress, poolCoinTokenAccount, poolPcTokenAccount, poolTempLpTokenAccount, market, owner, nonce) {
    const dataLayout = struct([u8('instruction'), u8('nonce')]);
    const keys = [
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
        { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
        { pubkey: ammAuthority, isSigner: false, isWritable: false },
        { pubkey: lpMintAddress, isSigner: false, isWritable: true },
        { pubkey: coinMintAddress, isSigner: false, isWritable: false },
        { pubkey: pcMintAddress, isSigner: false, isWritable: false },
        { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
        { pubkey: market, isSigner: false, isWritable: false },
        { pubkey: owner, isSigner: true, isWritable: false },
    ];
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
        instruction: 10,
        nonce,
    }, data);
    return new TransactionInstruction({
        keys,
        programId,
        data,
    });
}
// @ts-ignore
export class Market extends MarketSerum {
    constructor() {
        super(...arguments);
        this.baseVault = null;
        this.quoteVault = null;
        this.requestQueue = null;
        this.eventQueue = null;
        this.bids = null;
        this.asks = null;
        this.baseLotSize = 0;
        this.quoteLotSize = 0;
        this.quoteMint = null;
        this.baseMint = null;
    }
    static async load(connection, address, options = {}, programId) {
        const { owner, data } = throwIfNull(await connection.getAccountInfo(address), 'Market not found');
        if (!owner.equals(programId)) {
            throw new Error('Address not owned by program: ' + owner.toBase58());
        }
        const decoded = this.getLayout(programId).decode(data);
        if (!decoded.accountFlags.initialized ||
            !decoded.accountFlags.market ||
            !decoded.ownAddress.equals(address)) {
            throw new Error('Invalid market');
        }
        const [baseMintDecimals, quoteMintDecimals] = await Promise.all([
            getMintDecimals(connection, decoded.baseMint),
            getMintDecimals(connection, decoded.quoteMint),
        ]);
        const market = new Market(decoded, baseMintDecimals, quoteMintDecimals, options, programId);
        market._decoded = decoded;
        market.baseLotSize = decoded.baseLotSize;
        market.quoteLotSize = decoded.quoteLotSize;
        market.baseVault = decoded.baseVault;
        market.quoteVault = decoded.quoteVault;
        market.requestQueue = decoded.requestQueue;
        market.eventQueue = decoded.eventQueue;
        market.bids = decoded.bids;
        market.asks = decoded.asks;
        market.quoteMint = decoded.quoteMint;
        market.baseMint = decoded.baseMint;
        return market;
    }
}
