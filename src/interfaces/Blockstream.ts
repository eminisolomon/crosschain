export interface BlockstreamUTXO<vout = number> {
  status:
    | {
        confirmed: false;
      }
    | {
        confirmed: true;
        block_height: number;
        block_hash: string;
        block_time: number;
      };
  txid: string;
  value: number;
  vout: vout; // vout is a number for utxos, or an array of utxos for a tx
}

export interface BlockstreamTX
  extends BlockstreamUTXO<
    Array<{
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address: string;
      value: number; // e.g. 1034439
    }>
  > {
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: any;
    scriptsig: string;
    scriptsig_asm: string;
    is_coinbase: false;
    sequence: number;
  }>;
  size: number;
  weight: number;
  fee: number;
}
