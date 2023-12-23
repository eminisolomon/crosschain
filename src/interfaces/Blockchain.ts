export interface BlockchainTransaction {
  txid: string; // "550b293355f5274e513c65f846311fd5817d13bcfcd492ab94ff2725ba94f21e"
  size: number; // 124
  version: number; // 1
  locktime: number; // 0
  fee: number; // 0
  inputs: [
    {
      coinbase: boolean; // true
      txid: string; // "0000000000000000000000000000000000000000000000000000000000000000"
      output: number; // 4294967295
      sigscript: string; // "03e3b9162f696d2f"
      sequence: number; // 4294967295
      pkscript: null;
      value: null;
      address: null;
      witness: unknown[];
    },
  ];
  outputs: [
    {
      address: string; // "bchtest:qp7k5sm9dcmvse2rgmkj2ktylm9fgqcnv5kp2hrs0h"
      pkscript: string; // "76a9147d6a43656e36c8654346ed255964feca9403136588ac"
      value: number; // 39062500
      spent: boolean; // false
      spender: null;
    },
    {
      address: null;
      pkscript: string; // "6a14883805620000000000000000faee4177fe240000"
      value: number; // 0
      spent: boolean; // false
      spender: null;
    },
  ];
  block: {
    height?: number; // 1489379
    position?: number; // 0
    mempool?: number;
  };
  deleted: boolean; // false
  time: number; // 1646186011
  rbf: boolean; // false
  weight: number; // 496
}
