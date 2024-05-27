import {normalizeStructTag} from '@mysten/sui.js';

const EQUAL = 0;
const LESS_THAN = 1;
const GREATER_THAN = 2;

function cmp(a: number, b: number) {
  if (a === b) {
    return EQUAL;
  }
  if (a < b) {
    return LESS_THAN;
  }
  return GREATER_THAN;
}

function compare(symbolX: string, symbolY: string) {
  let i = 0;
  (symbolX = normalizeStructTag(symbolX)), (symbolY = normalizeStructTag(symbolY));
  const len = symbolX.length <= symbolY.length ? symbolX.length : symbolY.length;
  const lenCmp = cmp(symbolX.length, symbolY.length);
  while (i < len) {
    const elemCmp = cmp(symbolX.charCodeAt(i), symbolY.charCodeAt(i));
    i += 1;
    if (elemCmp !== 0) {
      return elemCmp;
    }
  }

  return lenCmp;
}

export function isSortedSymbols(symbolX: string, symbolY: string) {
  return compare(symbolX, symbolY) === LESS_THAN;
}
