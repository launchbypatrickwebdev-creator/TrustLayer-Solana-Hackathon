# TrustLayer — Solana Hackathon Technical Review

TrustLayer is agreement-first, non-custodial transaction infrastructure built on Solana. This review package contains selected, genuine implementation artifacts from the TrustLayer application: the Anchor IDL used by the client and the account decoders used to interpret one-leg escrow and two-leg atomic-exchange accounts.

## What is included

- `trustlayer_escrow.json` — the client-side Anchor IDL snapshot included in the application archive reviewed for this submission.
- `escrow-accounts.ts` — the application's TypeScript decoder for the one-leg `Escrow` account, including current account-length and field-offset checks.
- `ax-accounts.ts` — the application's TypeScript decoder for the two-leg `AxSwap` account, including both funding flags, per-leg assets/amounts, fees, expiry, and status fields.
- `ARCHITECTURE.md` — high-level transaction model and trust boundaries.
- `LIFECYCLE.md` — concise one-leg and two-leg lifecycle descriptions.
- `DEVNET-STATUS.md` — implementation status and limitations at submission time.

## Important scope note

This is a deliberately limited technical-review package, not the complete TrustLayer product repository. The source application includes proprietary product, deal-engine, API, administration, compliance, and integration logic that is not published here. The Anchor/Rust program source and program tests were not present in the supplied application archive, so they are not represented as included. The IDL and client decoders are genuine application artifacts, but this package alone is not a complete, independently deployable Solana program.

## Network and program

The IDL identifies program address:

`99bimYMBRnPkLjFS8CTVy2aUUyoWNC9rLXpaLqUWr7Lb`

The application configuration in the reviewed archive defaults to Solana Devnet. Verify the deployed program and account layouts against the live cluster before relying on this snapshot. Do not infer mainnet deployment from this repository.

## Review guidance

Start with `ARCHITECTURE.md`, then compare `LIFECYCLE.md` with the instruction definitions in the IDL. The two decoder files show how the application reads account state after transactions. For full product behavior, the web application coordinates these on-chain operations with an off-chain agreement/deal record; this package intentionally omits those proprietary workflows.
