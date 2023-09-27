import { initializeAccount } from '@project-serum/serum/lib/token-instructions.js';
// @ts-ignore without ts ignore, yarn build will failed
import { Token } from '@solana/spl-token';
import { Account, PublicKey, SystemProgram, Transaction, TransactionInstruction, } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, RENT_PROGRAM_ID, SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID, } from './ids.js';
import { ACCOUNT_LAYOUT, MINT_LAYOUT } from './layouts.js';
import { TOKENS } from './tokens.js';
export const web3Config = {
    strategy: 'speed',
    rpcs: [
        { url: 'https://raydium.rpcpool.com', weight: 50 },
        { url: 'https://raydium.genesysgo.net', weight: 30 },
        { url: 'https://solana-api.projectserum.com', weight: 10 },
        { url: 'https://solana-api.tt-prod.net', weight: 10 },
    ],
};
// export const commitment: Commitment = 'processed'
export const commitment = 'confirmed';
// export const commitment: Commitment = 'finalized'
export async function findProgramAddress(seeds, programId) {
    const [publicKey, nonce] = await PublicKey.findProgramAddress(seeds, programId);
    return { publicKey, nonce };
}
export async function createAmmAuthority(programId) {
    return await findProgramAddress([
        new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8')),
    ], programId);
}
export async function createAssociatedId(infoId, marketAddress, bufferKey) {
    const { publicKey } = await findProgramAddress([infoId.toBuffer(), marketAddress.toBuffer(), Buffer.from(bufferKey)], infoId);
    return publicKey;
}
export async function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
    const { publicKey } = await findProgramAddress([
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
    ], ASSOCIATED_TOKEN_PROGRAM_ID);
    return publicKey;
}
export async function findAssociatedStakeInfoAddress(poolId, walletAddress, programId) {
    const { publicKey } = await findProgramAddress([
        poolId.toBuffer(),
        walletAddress.toBuffer(),
        Buffer.from('staker_info_v2_associated_seed'),
    ], programId);
    return publicKey;
}
export async function createTokenAccountIfNotExist(connection, account, owner, mintAddress, lamports, transaction, signer) {
    let publicKey;
    if (account) {
        publicKey = new PublicKey(account);
    }
    else {
        publicKey = await createProgramAccountIfNotExist(connection, account, owner, TOKEN_PROGRAM_ID, lamports, ACCOUNT_LAYOUT, transaction, signer);
        transaction.add(initializeAccount({
            account: publicKey,
            mint: new PublicKey(mintAddress),
            owner,
        }));
    }
    return publicKey;
}
export async function createAssociatedTokenAccountIfNotExist(account, owner, mintAddress, transaction, atas = []) {
    let publicKey;
    if (account) {
        publicKey = new PublicKey(account);
    }
    const mint = new PublicKey(mintAddress);
    // @ts-ignore without ts ignore, yarn build will failed
    const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner, true);
    if ((!publicKey || !ata.equals(publicKey)) &&
        !atas.includes(ata.toBase58())) {
        transaction.add(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, ata, owner, owner));
        atas.push(ata.toBase58());
    }
    return ata;
}
export async function createAtaSolIfNotExistAndWrap(connection, account, owner, transaction, signers, amount) {
    let publicKey;
    if (account) {
        publicKey = new PublicKey(account);
    }
    const mint = new PublicKey(TOKENS.WSOL.mintAddress);
    // @ts-ignore without ts ignore, yarn build will failed
    const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner, true);
    if (!publicKey) {
        const rent = await Token.getMinBalanceRentForExemptAccount(connection);
        transaction.add(SystemProgram.transfer({
            fromPubkey: owner,
            toPubkey: ata,
            lamports: amount + rent,
        }), Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, ata, owner, owner));
    }
    else {
        const rent = await Token.getMinBalanceRentForExemptAccount(connection);
        const wsol = await createTokenAccountIfNotExist(connection, null, owner, TOKENS.WSOL.mintAddress, amount + rent, transaction, signers);
        transaction.add(Token.createTransferInstruction(TOKEN_PROGRAM_ID, wsol, ata, owner, [], amount), Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, wsol, owner, owner, []));
    }
}
export async function createProgramAccountIfNotExist(connection, account, owner, programId, lamports, layout, transaction, signer) {
    let publicKey;
    if (account) {
        publicKey = new PublicKey(account);
    }
    else {
        const newAccount = new Account();
        publicKey = newAccount.publicKey;
        transaction.add(SystemProgram.createAccount({
            fromPubkey: owner,
            newAccountPubkey: publicKey,
            lamports: lamports ??
                (await connection.getMinimumBalanceForRentExemption(layout.span)),
            space: layout.span,
            programId,
        }));
        signer.push(newAccount);
    }
    return publicKey;
}
export async function createAssociatedTokenAccount(tokenMintAddress, owner, transaction) {
    const associatedTokenAddress = await findAssociatedTokenAddress(owner, tokenMintAddress);
    const keys = [
        {
            pubkey: owner,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: owner,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: tokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSTEM_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: RENT_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
    ];
    transaction.add(new TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    }));
    return associatedTokenAddress;
}
export async function getFilteredProgramAccounts(connection, programId, filters) {
    // @ts-ignore
    const resp = await connection._rpcRequest('getProgramAccounts', [
        programId.toBase58(),
        {
            commitment: connection.commitment,
            filters,
            encoding: 'base64',
        },
    ]);
    if (resp.error) {
        throw new Error(resp.error.message);
    }
    // @ts-ignore
    return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
        publicKey: new PublicKey(pubkey),
        accountInfo: {
            data: Buffer.from(data[0], 'base64'),
            executable,
            owner: new PublicKey(owner),
            lamports,
        },
    }));
}
// getMultipleAccounts
export async function getMultipleAccounts(connection, publicKeys, commitment) {
    const keys = [];
    let tempKeys = [];
    publicKeys.forEach((k) => {
        if (tempKeys.length >= 100) {
            keys.push(tempKeys);
            tempKeys = [];
        }
        tempKeys.push(k);
    });
    if (tempKeys.length > 0) {
        keys.push(tempKeys);
    }
    const accounts = [];
    const resArray = {};
    await Promise.all(keys.map(async (key, index) => {
        const res = await connection.getMultipleAccountsInfo(key, commitment);
        resArray[index] = res;
    }));
    Object.keys(resArray)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach((itemIndex) => {
        const res = resArray[parseInt(itemIndex)];
        for (const account of res) {
            accounts.push(account);
        }
    });
    return accounts.map((account, idx) => {
        if (account === null) {
            return null;
        }
        return {
            publicKey: publicKeys[idx],
            account,
        };
    });
}
export async function sendTransaction(connection, wallet, transaction, signers = []) {
    const txid = await connection.sendTransaction(transaction, signers, { skipPreflight: true, preflightCommitment: commitment });
    return txid;
}
export function mergeTransactions(transactions) {
    const transaction = new Transaction();
    transactions
        .filter((t) => t !== undefined)
        .forEach((t) => {
        transaction.add(t);
    });
    return transaction;
}
function throwIfNull(value, message = 'account not found') {
    if (value === null) {
        throw new Error(message);
    }
    return value;
}
export async function getMintDecimals(connection, mint) {
    const { data } = throwIfNull(await connection.getAccountInfo(mint), 'mint not found');
    const { decimals } = MINT_LAYOUT.decode(data);
    return decimals;
}
export async function getFilteredTokenAccountsByOwner(connection, programId, mint) {
    // @ts-ignore
    const resp = await connection._rpcRequest('getTokenAccountsByOwner', [
        programId.toBase58(),
        {
            mint: mint.toBase58(),
        },
        {
            encoding: 'jsonParsed',
        },
    ]);
    if (resp.error) {
        throw new Error(resp.error.message);
    }
    return resp.result;
}
