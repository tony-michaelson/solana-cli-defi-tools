import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Command } from 'commander';
import { LiquidityPoolInfo } from '../lib/raydium/util/pools.js';
export declare function getLiquidityPoolInfo(ammId: PublicKey, serumVaultSigner: PublicKey, payer: Keypair, connection: Connection, serumProgramId: PublicKey, raydiumProgramId: PublicKey): Promise<LiquidityPoolInfo>;
export declare function addRaydiumCommands(program: Command): void;
//# sourceMappingURL=raydium.d.ts.map