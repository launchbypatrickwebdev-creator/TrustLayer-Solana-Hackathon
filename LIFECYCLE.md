# Transaction Lifecycles

## One-leg escrow

1. Participants establish the deal terms in TrustLayer.
2. The initiating party creates the on-chain escrow with the agreed parties, asset, amount, fee configuration, and timing/authority settings.
3. The funder reviews and signs the funding transaction from their wallet.
4. TrustLayer reads the resulting on-chain account state and associates it with the deal.
5. The permitted release, cancellation, or dispute-resolution instruction determines the final outcome.

The precise available instruction variants depend on asset type and the deployed program version. Consult `trustlayer_escrow.json` for the IDL snapshot included here.

## Two-leg atomic exchange

1. Participants agree the two asset legs as part of one deal. Each leg retains its own asset identity and amount.
2. The two parties are mapped to Party A and Party B, and the Ax exchange account is created.
3. Party A signs funding for leg A; Party B signs funding for leg B. The account records the funding state separately.
4. Once both legs are funded, the authorized settlement path can execute the exchange atomically on Solana.
5. Cancellation, reclaim, or dispute-related paths are subject to the deployed program's instruction and authority rules.

This is a two-sided exchange, not a conventional buyer-funds/seller-release escrow. Amounts from different assets must not be added together as if they shared a denomination.
