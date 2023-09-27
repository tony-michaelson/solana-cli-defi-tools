import { PublicKey } from '@solana/web3.js';
import * as commander from 'commander';
export declare const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey;
export declare const ORCA_TOKEN_SWAP_ID: {
    devnet: PublicKey;
    'mainnet-beta': PublicKey;
};
export declare const SABER_SWAP_SLIPPAGE = 0.01;
export declare const RPC_SERVERS: {
    devnet: string;
    testnet: string;
    'mainnet-beta': string;
    'mainnet-beta-nobody': string;
};
export declare type NETWORK_NAME = 'mainnet-beta' | 'mainnet-beta-nobody' | 'devnet' | 'testnet';
export declare const NETWORK_TO_CHAINID: Record<NETWORK_NAME, number>;
export declare const networkOption: commander.Option;
export declare const payerOption: commander.Option;
export declare const keyfileOption: commander.Option;
export declare const quoteOnlyOption: commander.Option;
export declare const noFeesOption: commander.Option;
export declare const swapDirectionOption: commander.Option;
export declare const tokenTypeOption: commander.Option;
//# sourceMappingURL=constants.d.ts.map