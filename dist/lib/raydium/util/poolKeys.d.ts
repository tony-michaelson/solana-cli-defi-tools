import { Connection, PublicKey } from '@solana/web3.js';
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';
export declare function fetchPoolKeys(connection: Connection, poolId: PublicKey, programId?: PublicKey, serumProgramId?: PublicKey, version?: number, serumVersion?: number, marketVersion?: number): Promise<LiquidityPoolKeysV4>;
//# sourceMappingURL=poolKeys.d.ts.map