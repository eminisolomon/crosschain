import BigNumber from 'bignumber.js';
import { UTXO } from '../interfaces';

/**
 * Sort UTXOs in descending order by amount, confirmations, and hash.
 *
 * @param a - First UTXO
 * @param b - Second UTXO
 * @returns A negative value to represent that 'a' should come before 'b' or a
 * positive value to represent that 'b' should come before 'a'.
 */
export const sortUTXOs = (a: UTXO, b: UTXO): number => {
  const amountDiff = b.amount - a.amount;

  if (amountDiff !== 0) {
    return amountDiff;
  }

  const confirmationDiff = a.confirmations - b.confirmations;

  if (confirmationDiff !== 0) {
    return confirmationDiff;
  }

  return a.txHash.localeCompare(b.txHash);
};

/**
 * Convert a readable value to the value in the smallest unit.
 *
 * @param value - Value in the readable representation, e.g., `0.0001` BTC.
 * @param decimals - The number of decimals to shift by, e.g., 8.
 * @returns The converted value.
 */
export const fixValue = (value: number, decimals: number): number =>
  new BigNumber(value)
    .multipliedBy(new BigNumber(10).exponentiatedBy(decimals))
    .decimalPlaces(0)
    .toNumber();

/**
 * Convert the value of a UTXO to the smallest unit.
 *
 * @param utxo - The UTXO to fix.
 * @param decimals - The number of decimals to shift by, e.g., 8.
 * @returns The UTXO with the fixed value.
 */
export const fixUTXO = ({ amount, ...utxo }: UTXO, decimals: number): UTXO => ({
  ...utxo,
  amount: fixValue(amount, decimals),
});

/**
 * Convert the values of an array of UTXOs to the smallest units.
 *
 * @param utxos - The array of UTXOs to fix.
 * @param decimals - The number of decimals to shift by, e.g., 8.
 * @returns An array of UTXOs with the fixed values.
 */
export const fixUTXOs = (utxos: readonly UTXO[], decimals: number): UTXO[] =>
  utxos.map((utxo) => fixUTXO(utxo, decimals));
