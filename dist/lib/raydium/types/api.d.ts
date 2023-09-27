export interface PricesData {
    [key: string]: number;
}
export interface InfoData {
    tvl: number;
    volume24h: number;
    totalvolume: number;
}
export interface PairData {
    name: string;
    liquidity: number;
}
export interface Rpc {
    url: string;
    weight: number;
}
export interface ConfigData {
    success: boolean;
    strategy: 'speed' | 'weight';
    rpcs: Rpc[];
}
export interface EpochInfo {
}
export interface CampaignInfo {
    data: {
        user: {
            referral: string;
            address: string;
            created_at: number;
            updated_at: number;
            point: number;
            referral_by: null | string;
            reward?: {
                first: number;
                refer: number;
                luck: number;
            };
        };
        tasks: {
            [K: string]: {
                finished: false;
                enabled: false;
                key: string;
                created_at: number;
                updated_at: number;
                point: number;
            };
        };
    };
    campaign_info: {
        start: number;
        end: number;
    };
}
declare type CampaignWinners = {
    owner: string;
    count: number;
}[];
export interface RouterInfoItem {
    middle_coin: string;
    route: {
        type: string;
        id: string;
        amountA: number;
        amountB: number;
        mintA: string;
        mintB: string;
    }[];
}
export interface RouterInfo {
    message: string;
    data: {
        amm: {
            type: string;
            id: string;
            amountA: number;
            amountB: number;
        }[];
        serum: {
            type: string;
            id: string;
            asks: {
                price: number;
                value: number;
            }[];
            bids: {
                price: number;
                value: number;
            }[];
        }[];
        routes: RouterInfoItem[];
    };
}
export interface NuxtApiInstance {
    getPrices: () => Promise<PricesData>;
    getInfo: () => Promise<InfoData>;
    getPairs: () => Promise<PairData[]>;
    getConfig: () => Promise<ConfigData>;
    getEpochInfo: (rpc: string) => Promise<EpochInfo>;
    getCompaign: (param: {
        /** @default 1 */
        campaignId?: number;
        address: string;
        referral?: string;
    }) => Promise<CampaignInfo>;
    postCompaign: (param: {
        /** @default 1 */
        campaignId?: number;
        address: string;
        task: string;
        result?: string;
        sign?: string;
    }) => Promise<CampaignInfo>;
    getCompaignWinners: (param: {
        campaignId: number;
    }) => Promise<CampaignWinners>;
}
export {};
//# sourceMappingURL=api.d.ts.map