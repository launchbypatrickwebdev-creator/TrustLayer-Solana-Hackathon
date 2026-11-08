/**
 * Decode on-chain AxSwap account (Anchor account + 8-byte discriminator).
 * Layout must match programs/trustlayer-escrow/src/state.rs AxSwap.
 *
 * Offsets are byte positions after the 8-byte Anchor discriminator.
 */

import { PublicKey } from "@solana/web3.js";

const DISC = 8;

function readU64LE(data: Buffer, offset: number): bigint {
  return data.readBigUInt64LE(offset);
}

function readI64LE(data: Buffer, offset: number): bigint {
  return data.readBigInt64LE(offset);
}

function readPubkey(data: Buffer, offset: number): PublicKey {
  return new PublicKey(data.subarray(offset, offset + 32));
}

function readBool(data: Buffer, offset: number): boolean {
  return data[offset] !== 0;
}

export type AxStatusName =
  | "active"
  | "released"
  | "cancelled"
  | "refunded"
  | "disputed"
  | "unknown";

const AX_STATUS: Record<number, AxStatusName> = {
  0: "active",
  1: "released",
  2: "cancelled",
  3: "refunded",
  4: "disputed",
};

/**
 * Minimum size: disc(8) + fields through bump (conservative).
 * New accounts from current program are larger; reject short/legacy buffers.
 */
export const AX_ACCOUNT_MIN_LEN = 8 + 400;

export type DecodedAxSwap = {
  dealId: string;
  userA: string;
  userB: string;
  assetTypeA: number;
  assetTypeB: number;
  mintA: string;
  mintB: string;
  decimalsA: number;
  decimalsB: number;
  tokenProgramA: string;
  tokenProgramB: string;
  amountA: string;
  amountB: string;
  settlementFeeA: string;
  settlementFeeB: string;
  feeSourceLeg: number;
  feePayer: number;
  releaseMode: number;
  expiryTimestamp: number;
  earliestSettlementTimestamp: number;
  fundedA: boolean;
  fundedB: boolean;
  lockedA: string;
  lockedB: string;
  bothFundedAt: number;
  disputedAt: number;
  expiryDurationSeconds: number;
  status: AxStatusName;
  statusRaw: number;
  createdAt: number;
  bump: number;
};

/**
 * Byte layout after 8-byte discriminator (InitSpace order in state.rs):
 * deal_id 8
 * user_a 32, user_b 32
 * asset_type_a 1, asset_type_b 1
 * mint_a 32, mint_b 32
 * decimals_a 1, decimals_b 1
 * token_program_a 32, token_program_b 32
 * amount_a 8, amount_b 8
 * settlement_fee_bps 2, settlement_fee_amount 8
 * settlement_fee_a 8, settlement_fee_b 8
 * sol_fee_locked_a 8, sol_fee_locked_b 8
 * fee_source_leg 1, fee_payer 1
 * release_mode 1
 * release_authority 32
 * user_a_settlement_destination 32, user_b_settlement_destination 32
 * expiry_timestamp 8, earliest_settlement_timestamp 8
 * funded_a 1, funded_b 1
 * locked_a 8, locked_b 8
 * both_funded_at 8, disputed_at 8, expiry_duration_seconds 8
 * status 1, created_at 8, bump 1
 * (+ cnft fields after)
 */
export function decodeAxSwapAccount(data: Buffer): DecodedAxSwap {
  if (data.length < AX_ACCOUNT_MIN_LEN) {
    throw new Error(
      `Ax account data too short (${data.length} bytes). Legacy or wrong account — create a new Ax PDA.`
    );
  }

  let o = DISC;
  const dealId = readU64LE(data, o).toString(); o += 8;
  const userA = readPubkey(data, o).toBase58(); o += 32;
  const userB = readPubkey(data, o).toBase58(); o += 32;
  const assetTypeA = data[o++]; const assetTypeB = data[o++];
  const mintA = readPubkey(data, o).toBase58(); o += 32;
  const mintB = readPubkey(data, o).toBase58(); o += 32;
  const decimalsA = data[o++]; const decimalsB = data[o++];
  const tokenProgramA = readPubkey(data, o).toBase58(); o += 32;
  const tokenProgramB = readPubkey(data, o).toBase58(); o += 32;
  const amountA = readU64LE(data, o).toString(); o += 8;
  const amountB = readU64LE(data, o).toString(); o += 8;
  o += 2; // settlement_fee_bps
  o += 8; // settlement_fee_amount legacy
  const settlementFeeA = readU64LE(data, o).toString(); o += 8;
  const settlementFeeB = readU64LE(data, o).toString(); o += 8;
  o += 8; o += 8; // sol_fee_locked_a/b
  const feeSourceLeg = data[o++];
  const feePayer = data[o++];
  const releaseMode = data[o++];
  o += 32; // release_authority
  o += 32; o += 32; // settlement destinations
  const expiryTimestamp = Number(readI64LE(data, o)); o += 8;
  const earliestSettlementTimestamp = Number(readI64LE(data, o)); o += 8;
  const fundedA = readBool(data, o); o += 1;
  const fundedB = readBool(data, o); o += 1;
  const lockedA = readU64LE(data, o).toString(); o += 8;
  const lockedB = readU64LE(data, o).toString(); o += 8;
  const bothFundedAt = Number(readI64LE(data, o)); o += 8;
  const disputedAt = Number(readI64LE(data, o)); o += 8;
  const expiryDurationSeconds = Number(readI64LE(data, o)); o += 8;
  const statusRaw = data[o++];
  const createdAt = Number(readI64LE(data, o)); o += 8;
  const bump = data[o++];

  return {
    dealId,
    userA,
    userB,
    assetTypeA,
    assetTypeB,
    mintA,
    mintB,
    decimalsA,
    decimalsB,
    tokenProgramA,
    tokenProgramB,
    amountA,
    amountB,
    settlementFeeA,
    settlementFeeB,
    feeSourceLeg,
    feePayer,
    releaseMode,
    expiryTimestamp,
    earliestSettlementTimestamp,
    fundedA,
    fundedB,
    lockedA,
    lockedB,
    bothFundedAt,
    disputedAt,
    expiryDurationSeconds,
    status: AX_STATUS[statusRaw] ?? "unknown",
    statusRaw,
    createdAt,
    bump,
  };
}
