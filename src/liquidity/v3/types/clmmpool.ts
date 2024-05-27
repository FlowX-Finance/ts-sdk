import BN from 'bn.js';

/**
 * Represents tick data for a liquidity pool.
 */
export type TickData = {
  /**
   * The object identifier of the tick data.
   */
  objectId: string;

  /**
   * The index of the tick.
   */
  index: number;

  /**
   * The square root price value for the tick.
   */
  sqrtPrice: BN;

  /**
   * The net liquidity value for the tick.
   */
  liquidityNet: BN;

  /**
   * The gross liquidity value for the tick.
   */
  liquidityGross: BN;

  /**
   * The fee growth outside coin A for the tick.
   */
  feeGrowthOutsideA: BN;

  /**
   * The fee growth outside coin B for the tick.
   */
  feeGrowthOutsideB: BN;

  /**
   * An array of rewarders' growth outside values for the tick.
   */
  rewardersGrowthOutside: BN[];
};

/**
 * Represents a tick for a liquidity pool.
 */
export type Tick = {
  /**
   * The index of the tick.
   */
  index: Bits;

  /**
   * The square root price value for the tick (string representation).
   */
  sqrt_price: string;

  /**
   * The net liquidity value for the tick (Bits format).
   */
  liquidity_net: Bits;

  /**
   * The gross liquidity value for the tick (string representation).
   */
  liquidity_gross: string;

  /**
   * The fee growth outside coin A for the tick (string representation).
   */
  fee_growth_outside_a: string;

  /**
   * The fee growth outside coin B for the tick (string representation).
   */
  fee_growth_outside_b: string;

  /**
   * An array of rewarders' growth outside values for the tick (array of string representations).
   */
  rewarders_growth_outside: string[3];
};

/**
 * Represents bits information.
 */
export type Bits = {
  bits: string;
};

/**
 * Represents data for a liquidity mining pool.
 */
export type ClmmpoolData = {
  coinA: string;
  coinB: string;
  currentSqrtPrice: BN;
  currentTickIndex: number;
  feeGrowthGlobalA: BN;
  feeGrowthGlobalB: BN;
  feeProtocolCoinA: BN;
  feeProtocolCoinB: BN;
  feeRate: BN;
  liquidity: BN;
  tickIndexes: number[];
  tickSpacing: number;
  ticks: Array<TickData>;
  collection_name: string;
};
