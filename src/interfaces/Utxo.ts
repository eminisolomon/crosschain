export interface UTXO {
  readonly txHash: string; // hex string without 0x prefix
  readonly vOut?: number;
  readonly amount: number; // in sats
  readonly scriptPubKey?: string; // hex string without 0x prefix
  readonly confirmations: number;
  readonly block?: number;
}
