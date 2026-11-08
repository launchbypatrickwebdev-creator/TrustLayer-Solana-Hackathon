/**
 * Shared decoder for TrustLayer Escrow account (post 1-leg + fee_payer + NFT fields).
 * Layout matches programs/trustlayer-escrow/src/state.rs after 8-byte Anchor discriminator.
 *
 * Account data length: 8 (disc) + 327 = 335 bytes minimum for full struct.
 * Do not use legacy offsets (funded@219, status@244, len 254).
 */
import { PublicKey } from "@solana/web3.js";

/** Full Escrow account including Anchor discriminator. */
export const ESCROW_ACCOUNT_MIN_LEN = 335;

/** Byte offset of `funded` from start of account data (includes disc). */
export const ESCROW_FUNDED_OFFSET = 220;

/** Byte offset of `status` from start of account data (includes disc). */
export const ESCROW_STATUS_OFFSET = 253;

export type EscrowStatusOnChain =
  | "active"
  | "released"
  | "refunded"
  | "cancelled_by_seller"
  | "disputed"
  | "unknown";

export type FeePayerOnChain = "funder" | "receiver";

export type ParsedEscrowAccount = {
  dealId: string;
  milestoneIndex: number;
  milestoneCount: number;
  initiator: string;
  origin: number;
  buyer: string;
  seller: string;
  assetType: number;
  mint: string;
  decimals: number;
  tokenProgram: string;
  amount: string;
  settlementFeeBps: number;
  settlementFeeAmount: string;
  refundFeeBps: number;
  refundFeeAmount: string;
  cancellationFeeBps: number;
  cancellationFeeAmount: string;
  feePayer: FeePayerOnChain;
  feePayerRaw: number;
  funded: boolean;
  solFeeLocked: string;
  totalLocked: string;
  createdAt: string;
  deadline: string;
  status: number;
  statusLabel: EscrowStatusOnChain;
  disputeOpenedAt: string;
  bump: number;
};

function statusLabel(s: number): EscrowStatusOnChain {
  switch (s) {
    case 0:
      return "active";
    case 1:
      return "released";
    case 2:
      return "refunded";
    case 3:
      return "cancelled_by_seller";
    case 4:
      return "disputed";
    default:
      return "unknown";
  }
}

/**
 * Decode Escrow account bytes. Throws if buffer is too short.
 */
export function decodeEscrowAccount(raw: Buffer | Uint8Array): ParsedEscrowAccount {
  const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
  if (buf.length < ESCROW_ACCOUNT_MIN_LEN) {
    throw new Error(
      `Escrow account data too short (${buf.length} < ${ESCROW_ACCOUNT_MIN_LEN}). Redeploy client against current program layout.`
    );
  }

  const feePayerRaw = buf.readUInt8(219);
  return {
    dealId: buf.readBigUInt64LE(8).toString(),
    milestoneIndex: buf.readUInt8(16),
    milestoneCount: buf.readUInt8(17),
    initiator: new PublicKey(buf.subarray(18, 50)).toBase58(),
    origin: buf.readUInt8(50),
    buyer: new PublicKey(buf.subarray(51, 83)).toBase58(),
    seller: new PublicKey(buf.subarray(83, 115)).toBase58(),
    assetType: buf.readUInt8(115),
    mint: new PublicKey(buf.subarray(116, 148)).toBase58(),
    decimals: buf.readUInt8(148),
    tokenProgram: new PublicKey(buf.subarray(149, 181)).toBase58(),
    amount: buf.readBigUInt64LE(181).toString(),
    settlementFeeBps: buf.readUInt16LE(189),
    settlementFeeAmount: buf.readBigUInt64LE(191).toString(),
    refundFeeBps: buf.readUInt16LE(199),
    refundFeeAmount: buf.readBigUInt64LE(201).toString(),
    cancellationFeeBps: buf.readUInt16LE(209),
    cancellationFeeAmount: buf.readBigUInt64LE(211).toString(),
    feePayerRaw,
    feePayer: feePayerRaw === 1 ? "receiver" : "funder",
    funded: buf.readUInt8(220) !== 0,
    solFeeLocked: buf.readBigUInt64LE(221).toString(),
    totalLocked: buf.readBigUInt64LE(229).toString(),
    createdAt: buf.readBigInt64LE(237).toString(),
    deadline: buf.readBigInt64LE(245).toString(),
    status: buf.readUInt8(253),
    statusLabel: statusLabel(buf.readUInt8(253)),
    disputeOpenedAt: buf.readBigInt64LE(254).toString(),
    bump: buf.readUInt8(262),
  };
}

/** Safe funded check for UI (returns false if account missing or too short). */
export function isEscrowFunded(data: Buffer | Uint8Array | null | undefined): boolean {
  if (!data || data.length <= ESCROW_FUNDED_OFFSET) return false;
  return data[ESCROW_FUNDED_OFFSET] !== 0;
}
