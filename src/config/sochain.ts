import axios from 'axios';

import { fixUTXO, fixUTXOs, sortUTXOs } from '../utils/utxo';
import { DEFAULT_TIMEOUT } from './timeout';
import { SoChainTX, SoChainUTXO, UTXO } from '../interfaces';

const fetchUTXO =
  (network: string) =>
  async (txHash: string, vOut: number): Promise<UTXO> => {
    const url = `https://sochain.com/api/v2/get_tx/${network}/${txHash}`;
    const response = await axios.get<{
      readonly data: SoChainTX;
    }>(url, { timeout: DEFAULT_TIMEOUT });

    const tx = response.data.data;

    return fixUTXO(
      {
        txHash: tx.txid,
        amount: parseInt(tx.outputs[vOut].value, 10),
        // scriptPubKey: tx.script_hex,
        vOut,
        confirmations: tx.confirmations,
      },
      8
    );
  };

const fetchUTXOs =
  (network: string) =>
  async (address: string, confirmations: number): Promise<UTXO[]> => {
    const url = `https://sochain.com/api/v2/get_tx_unspent/${network}/${address}/${confirmations}`;
    const response = await axios.get<{
      readonly data: { readonly txs: readonly SoChainUTXO[] };
    }>(url, { timeout: DEFAULT_TIMEOUT });

    return fixUTXOs(
      response.data.data.txs.map((utxo) => ({
        txHash: utxo.txid,
        amount: utxo.value,
        // scriptPubKey: utxo.script_hex,
        vOut: utxo.output_no,
        confirmations: utxo.confirmations,
      })),
      8
    )
      .filter(
        (utxo) => confirmations === 0 || utxo.confirmations >= confirmations
      )
      .sort(sortUTXOs);
  };

const fetchTXs =
  (network: string) =>
  async (address: string, confirmations: number = 0): Promise<UTXO[]> => {
    const url = `https://sochain.com/api/v2/get_tx_received/${network}/${address}/${confirmations}`;
    const response = await axios.get<{
      readonly data: { readonly txs: readonly SoChainUTXO[] };
    }>(url, { timeout: DEFAULT_TIMEOUT });

    return fixUTXOs(
      response.data.data.txs.map((utxo) => ({
        txHash: utxo.txid,
        amount: utxo.value,
        // scriptPubKey: utxo.script_hex,
        vOut: utxo.output_no,
        confirmations: utxo.confirmations,
      })),
      8
    )
      .filter(
        (utxo) => confirmations === 0 || utxo.confirmations >= confirmations
      )
      .sort(sortUTXOs);
  };

const broadcastTransaction =
  (network: string) =>
  async (txHex: string): Promise<string> => {
    const response = await axios.post<{
      status: 'success';
      data: {
        network: string;
        txid: string; // Hex without 0x
      };
    }>(
      `https://sochain.com/api/v2/send_tx/${network}`,
      { tx_hex: txHex },
      { timeout: DEFAULT_TIMEOUT }
    );

    return response.data.data.txid;
  };

export const Sochain = {
  fetchUTXOs,
  broadcastTransaction,
  fetchUTXO,
  fetchTXs,
};
