import { Command } from 'commander';
import { Option } from '../lib/types.js';
export declare function createATAAccount(mintKey: string, ownerKey: string, option: Option): Promise<void>;
export declare function transferTokens(mintStr: string, fromStr: string, amountStr: string, toStr: string, option: Option): Promise<void>;
export declare function addTokenCommands(program: Command): void;
//# sourceMappingURL=token.d.ts.map