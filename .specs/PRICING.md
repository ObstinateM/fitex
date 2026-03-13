# Pricing Strategy

> Status: Draft (2026-03-13)

## Core Insight

Job seekers churn fast from subscriptions — the better the product works, the sooner they cancel. A credit-based model aligns revenue with usage instead of fighting against product success.

## Model: Credit-Based With Free Tier

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | 0€ | Extension installed + **3 CV tailors** (no card required) |
| **Starter** | 9€ | 15 credits |
| **Pro Pack** | 19€ | 40 credits (best value) |
| **Unlimited Month** | 39€ | Unlimited for 30 days |

1 credit = 1 tailored CV generation (includes keyword scans, questions, salary estimate, and story filtering).

Post-generation actions (feedback refinement, reduce to one page, match score) are included — no extra credit consumed.

## Why This Works

### For Revenue

- No churn problem — credits are purchased, not subscribed to. Revenue is recognized immediately.
- Heavy appliers (ICP) burn through credits fast. Someone applying to 50 jobs buys multiple packs.
- The Unlimited Month captures the "applying sprint" user who would otherwise feel nickel-and-dimed. It's a time-boxed subscription they *expect* to cancel.

### For Growth

- Free tier (3 credits) = zero friction. Everyone installs the extension, tries it, sees the magic.
- 3 credits is enough to prove value, not enough to finish a job search. Natural conversion point.
- Extension stays installed even after credits run out — they see the button every time they're on a job listing, creating re-purchase triggers.

### For Margins

- Credit packs have better unit economics than subscriptions (no ongoing service obligation).
- Anchor the Pro Pack as "best value" with a per-credit discount (~0.48€/credit vs 0.60€/credit on Starter).

## Key Design Decisions

- **Credits never expire.** Removes purchase anxiety and is a strong selling point. ("Buy once, use whenever.")
- **Extension is free for everyone.** The extension is the distribution channel, not the product. The AI generation is the product.
- **Show remaining credits in the extension.** Gentle nudge to buy more when running low.
- **Referral credits.** Give 2 free credits per referral — job seekers talk to other job seekers. ROI: 22-225x depending on model (see cost analysis below).

## Abuse Protection (Unlimited Tier)

No visible daily cap — "Unlimited" must feel unlimited. Instead, use invisible guardrails:

- **Rate limit**: minimum 30-60 seconds between generations. Blocks scripted abuse, invisible to real users.
- **Concurrent limit**: max 1 generation at a time (already enforced by streaming).
- **Soft monthly cap**: 500 generations/month (~16/day every day). No legitimate user hits this. Cost at 500/month on gpt-5.2: ~€25 — still profitable at €39.

## API Cost Analysis

### Cost per generation by model

| Model | Input rate ($/M) | Output rate ($/M) | Cost per generation | + 1 refinement | + 2 refinements |
|-------|-----------------|-------------------|--------------------|-----------------|-----------------|
| gpt-4.1-mini | $0.40 | $1.60 | **$0.006** | $0.008 | $0.011 |
| o4-mini | $1.10 | $4.40 | **$0.016** | $0.023 | $0.030 |
| gpt-4.1 | $2.00 | $8.00 | **$0.029** | $0.041 | $0.053 |
| gpt-5.2 | $2.00 | $8.00 | **$0.029** | $0.041 | $0.053 |

Background pre-scans (gpt-4.1-nano, hardcoded): <$0.001/scan — negligible.

### Margin per tier

**Starter (9€ / 15 credits)**

| Model | Cost for 15 credits | You keep | Margin |
|-------|-------------------|----------|--------|
| gpt-4.1-mini | €0.08 | €8.92 | 99% |
| gpt-5.2 (worst, +2 refinements each) | €0.73 | €8.27 | 92% |

**Pro Pack (19€ / 40 credits)**

| Model | Cost for 40 credits | You keep | Margin |
|-------|-------------------|----------|--------|
| gpt-4.1-mini | €0.22 | €18.78 | 99% |
| gpt-5.2 (worst, +2 refinements each) | €1.96 | €17.04 | 90% |

**Unlimited Month (39€)**

| User type | Generations | Refinements | Model | API cost | Margin |
|-----------|-----------|------------|-------|---------|--------|
| Casual | 30 | 15 | mini | €0.24 | 99% |
| Active | 100 | 50 | mini | €0.80 | 98% |
| Active | 100 | 50 | gpt-5.2 | €5.00 | 87% |
| Power user | 200 | 100 | gpt-5.2 | €10.00 | 74% |
| Soft cap (500) | 500 | 250 | gpt-5.2 | €25.00 | 36% |

### Free credits & referrals

| | gpt-4.1-mini | gpt-5.2 (worst) |
|---|---|---|
| 3 free credits (new user) | €0.015 | €0.15 |
| 2 referral credits | €0.01 | €0.10 |

Non-credit features (story enhancement, bulk import): ~€0.15/user lifetime on gpt-5.2. Not worth metering.

## Conversion Funnel & Revenue Projections

### Funnel (from 10,000 monthly landing page visitors)

| Stage | Rate | Users |
|-------|------|-------|
| Visit landing page | — | 10,000 |
| Install extension | ~8% | 800 |
| Use 1st free credit (activate) | ~50% | 400 |
| Use all 3 credits | ~60% | 240 |
| Pay | ~20% of exhausted trial | 48 |

Effective conversion: **6% from install**, **0.5% from landing page**.

### Monthly revenue scenarios (based on 800 installs/month, 400 activated users)

| Scenario | Conv. rate (of activated) | Purchases | Avg purchase | Revenue |
|----------|--------------------------|-----------|-------------|---------|
| Conservative | 8% | 32 | €14 | **€448/mo** |
| Moderate | 12% | 48 | €15 | **€720/mo** |
| Optimistic | 18% | 72 | €16 | **€1,152/mo** |

All scenarios are profitable from day one — API costs are <5% of revenue even in the conservative case.

The primary growth lever is **installs**, not conversion rate. The product sells itself once users try it.
