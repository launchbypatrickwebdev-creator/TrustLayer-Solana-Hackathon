# TrustLayer Solana Architecture

## Core idea

TrustLayer connects an agreement between participants to asset commitments, transaction state, and a defined settlement outcome. The Solana program provides the on-chain escrow/exchange state and asset movement. The application provides the agreement, participant workflow, evidence, and user interface around those operations.

## Two transaction patterns

### One-leg escrow

One party creates an escrow for an agreed asset and amount. The designated funder signs the funding transaction. The escrow account records the parties, asset configuration, amount, fee parameters, funding state, deadline, and status. A permitted release, cancellation, or dispute-resolution path determines the outcome according to the program's instruction and authority rules.

### Two-leg atomic exchange

Two parties agree to exchange two separate asset legs. Party A and Party B each authorize funding of their own leg. The Ax account records each leg independently, including its asset/mint, amount, funding state, locked amount, and fee values. The exchange is not treated as one combined amount: the two legs can be different assets and denominations. Settlement is an atomic on-chain operation governed by the program's instruction and authority rules.

## Trust boundaries

- Wallet owners authorize applicable Solana transactions with their own wallets.
- The application coordinates the agreement and transaction workflow; it is not intended to hold users' wallet private keys.
- On-chain account state is the source for whether the escrow/exchange has been created, funded, or settled on Solana.
- The application also maintains off-chain deal information. This review package does not publish that proprietary deal engine or its authorization implementation.

## Account decoding

`escrow-accounts.ts` and `ax-accounts.ts` are the TypeScript account readers used by the application. They enforce minimum account lengths and decode fields from the serialized account bytes. These are client-side decoders, not substitutes for the program's Rust account definitions. The supplied application archive did not include the Anchor/Rust source or program tests; independent verification of every byte offset requires the matching on-chain source/build artifact.

## Aurora Intents boundary

Aurora Intents is being evaluated as a cross-chain funding route. The intended flow is: source-chain asset deposit → delivery to the user's Solana wallet → user authorizes the existing TrustLayer Solana escrow or exchange funding transaction. Aurora is not described here as the escrow program or as the executor of the two-leg atomic exchange. The integration was not yet tested end-to-end at the time of this submission.
