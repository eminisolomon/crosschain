export interface SoChainUTXO {
  txid: string; // hex string without 0x prefix
  value: number; // satoshis
  script_asm: string;
  script_hex: string; // hex string without 0x prefix
  output_no: number;
  confirmations: number;
  time: number;
}

export interface SoChainTX {
  network: string; // "BTC";
  txid: string; // "756548eb92505a7214b66faa8d1a77116e92d81d40b8d5a5c997dd83d1efb53b";
  blockhash: string | null;
  confirmations: number; // 0;
  time: number; // 1600217073;
  inputs: Array<{
    input_no: number; // 0;
    value: string; // "0.06498884";
    address: string; // "1JHKKk18HD6bgy4FKkJaVxCZpBx3hhRocf";
    type: 'pubkeyhash';
    script: string; // "3045022100dccc5915d63e50506c962179cd11e78e94d86b1c6815daf1ad8362e75543196a022053285e92aa92dce92745d59c5a6cafd349c4657f5c1007ca31592fda63c9437d01 0363dd6554e3d3263df30c24beaf3f4fb5b2db3d0679d92615fb2e67d697648085";
    witness: null;
    from_output: {
      txid: string; // "229833c1bb68984721dba4ccfcfb092ec8ea000fd96de300baa49a2009ae5def";
      output_no: number; // 1;
    };
  }>;
  outputs: Array<{
    output_no: 0;
    value: string; // "0.00980175";
    address: string; // "19Hb9HH2QK5v38NAwQuEmLwngu5HJqqRjm";
    type: 'pubkeyhash';
    script: string; // "OP_DUP OP_HASH160 5ae429a0a453e9d3e4e350717569315092e1f917 OP_EQUALVERIFY OP_CHECKSIG";
  }>;
  tx_hex: string;
  size: number;
  version: 1;
  locktime: 0;
}
