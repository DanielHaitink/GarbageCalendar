export type GarbageType = 'restafval' | 'gft' | 'papier' | 'plastic' | 'glas' | 'kca' | 'kerstbomen' | 'ander';

export const GarbageTypes = {
    RESTAFVAL: 'restafval' as const,
    GFT: 'gft' as const,
    PAPIER: 'papier' as const,
    PLASTIC: 'plastic' as const,
    GLAS: 'glas' as const,
    KCA: 'kca' as const,
    KERSTBOMEN: 'kerstbomen' as const,
    ANDERS: 'ander' as const,
};

export interface GarbagePickup {
    id: string;
    type: GarbageType;
    dateString: string;
    date: Date;
    placement: string;
    description: string;
}

export interface Address {
    postcode: string;
    number: string;
    suffix?: string;
}

export interface GarbageData {
    address: Address;
    pickups: GarbagePickup[];
    lastUpdated: string;
}
