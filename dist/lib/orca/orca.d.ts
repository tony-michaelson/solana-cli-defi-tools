import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { TokenSwap } from '@solana/spl-token-swap';
import { Network } from '@orca-so/sdk';
import { OrcaPool } from '@orca-so/sdk/dist/public/index.js';
export declare function findTokenSwapNonce(programId: PublicKey, tokenSwap: TokenSwap, nonce?: number): Promise<number>;
export declare function tokenSwapToOrcaPool(connection: Connection, network: Network, payer: Keypair, tokenSwap: TokenSwap): Promise<OrcaPool>;
//# sourceMappingURL=orca.d.ts.map