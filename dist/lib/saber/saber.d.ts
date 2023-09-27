import { Token } from '@solana/spl-token';
import { Connection, Keypair, Signer, TransactionInstruction } from '@solana/web3.js';
import saber from '@saberhq/stableswap-sdk';
import { NETWORK_NAME } from '../constants.js';
export declare function printSaberPoolATABalances(connection: Connection, tokenSwap: saber.StableSwap, payer: Keypair): Promise<void>;
export declare function executeInstruction(connection: Connection, instruction: TransactionInstruction, beforeTransaction: () => void, afterTransaction: () => void, signers: Signer[], payer: Keypair): Promise<void>;
export declare function initializeStableSwap(connection: Connection, payer: Keypair, swapAccount: Keypair, transferInstructions: TransactionInstruction[], initSwapInstruction: saber.InitializeSwapInstruction): Promise<void>;
export declare function getExchange(connection: Connection, networkName: NETWORK_NAME, mintA: Token, mintB: Token, mintLP: Token, tokenSwap: saber.StableSwap): Promise<saber.IExchangeInfo>;
//# sourceMappingURL=saber.d.ts.map