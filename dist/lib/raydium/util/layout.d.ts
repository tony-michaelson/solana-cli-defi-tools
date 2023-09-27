/// <reference types="bn.js" />
/// <reference types="@solana/web3.js" />
/// <reference types="@solana/spl-token/node_modules/@solana/web3.js" />
/// <reference types="@pythnetwork/client/node_modules/@solana/web3.js" />
import { GetStructureSchema } from '../marshmellow/buffer-layout.js';
export declare const LIQUIDITY_STATE_LAYOUT_V4: import("../marshmellow/index.js").Structure<import("bn.js") | import("@solana/web3.js").PublicKey, "", {
    status: import("bn.js");
    nonce: import("bn.js");
    maxOrder: import("bn.js");
    depth: import("bn.js");
    baseDecimal: import("bn.js");
    quoteDecimal: import("bn.js");
    state: import("bn.js");
    resetFlag: import("bn.js");
    minSize: import("bn.js");
    volMaxCutRatio: import("bn.js");
    amountWaveRatio: import("bn.js");
    baseLotSize: import("bn.js");
    quoteLotSize: import("bn.js");
    minPriceMultiplier: import("bn.js");
    maxPriceMultiplier: import("bn.js");
    systemDecimalValue: import("bn.js");
    minSeparateNumerator: import("bn.js");
    minSeparateDenominator: import("bn.js");
    tradeFeeNumerator: import("bn.js");
    tradeFeeDenominator: import("bn.js");
    pnlNumerator: import("bn.js");
    pnlDenominator: import("bn.js");
    swapFeeNumerator: import("bn.js");
    swapFeeDenominator: import("bn.js");
    baseNeedTakePnl: import("bn.js");
    quoteNeedTakePnl: import("bn.js");
    quoteTotalPnl: import("bn.js");
    baseTotalPnl: import("bn.js");
    quoteTotalDeposited: import("bn.js");
    baseTotalDeposited: import("bn.js");
    swapBaseInAmount: import("bn.js");
    swapQuoteOutAmount: import("bn.js");
    swapBase2QuoteFee: import("bn.js");
    swapQuoteInAmount: import("bn.js");
    swapBaseOutAmount: import("bn.js");
    swapQuote2BaseFee: import("bn.js");
    baseVault: import("@solana/web3.js").PublicKey;
    quoteVault: import("@solana/web3.js").PublicKey;
    baseMint: import("@solana/web3.js").PublicKey;
    quoteMint: import("@solana/web3.js").PublicKey;
    lpMint: import("@solana/web3.js").PublicKey;
    openOrders: import("@solana/web3.js").PublicKey;
    marketId: import("@solana/web3.js").PublicKey;
    marketProgramId: import("@solana/web3.js").PublicKey;
    targetOrders: import("@solana/web3.js").PublicKey;
    withdrawQueue: import("@solana/web3.js").PublicKey;
    lpVault: import("@solana/web3.js").PublicKey;
    owner: import("@solana/web3.js").PublicKey;
    pnlOwner: import("@solana/web3.js").PublicKey;
}>;
export declare type LiquidityStateLayoutV4 = typeof LIQUIDITY_STATE_LAYOUT_V4;
export declare type LiquidityStateLayout = LiquidityStateLayoutV4;
export declare type LiquidityStateV4 = GetStructureSchema<LiquidityStateLayoutV4>;
export declare type LiquidityState = LiquidityStateV4;
export declare const LIQUIDITY_VERSION_TO_STATE_LAYOUT: {
    [version: number]: LiquidityStateLayout;
};
//# sourceMappingURL=layout.d.ts.map