# Pricing Strategy

> Status: Draft (2026-03-14)

## Core Insight

Job seekers churn fast from subscriptions — the better the product works, the sooner they cancel. A credit-based model aligns revenue with usage instead of fighting against product success.

The second insight: **low sticker price + fast consumption > high sticker price + slow consumption.** Keep prices attractive, make credits burn at the rate of real usage.

## Model: Credit-Based With Free Tier

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | 0€ | Extension installed + **2 CV tailors** (no card required) |
| **Starter** | 9€ | 15 credits |
| **Pro Pack** | 19€ | 40 credits (best value) |
| **Unlimited Month** | 49€ | Unlimited for 30 days |

## Credit System

Credits are consumed per action, not per generation. A full generation with all features costs 2 credits.

| Action | Credit cost |
|--------|------------|
| CV tailoring | 1 credit |
| Q&A generation | +0.5 credit |
| Salary estimate | +0.5 credit |
| Refinement pass | 0.5 credit |

- **CV-only users** pay 1 credit per application — feels like a deal.
- **Full-package users** pay 2 credits per application — burns credits faster, drives repeat purchases.
- **Refinements** cost 0.5 credit each — included in Unlimited, metered for credit packs.

Post-generation actions that don't involve new AI calls (PDF export, match score display) are free.

### Why split credits?

1. **Doubles effective consumption** without raising sticker prices. 15 credits = 7-8 full applications instead of 15.
2. **Users feel they're choosing** what to pay for — agency reduces price sensitivity.
3. **CV-only at 1 credit** is cheaper per-application than the old model — a genuine value add for budget-conscious users.
4. **Pushes power users toward Unlimited** — anyone applying to 20+ jobs/month saves money on Unlimited vs buying packs.

## Why This Works

### For Revenue

- No churn problem — credits are purchased, not subscribed to. Revenue is recognized immediately.
- Heavy appliers (ICP) burn through credits fast. Someone applying to 50 jobs at 2 credits each needs 100 credits — multiple packs or Unlimited.
- The Unlimited Month at €49 captures the "applying sprint" user who would otherwise feel nickel-and-dimed. It's a time-boxed subscription they *expect* to cancel.
- Target: **€20 ARPU from 100 paying users → ~€2,000-2,500/month**.

### For Growth

- Free tier (2 credits) = zero friction. Everyone installs the extension, tries it, sees the magic.
- 2 credits is enough to prove value on 1-2 real applications, not enough to finish a job search. Natural conversion point.
- Extension stays installed even after credits run out — they see the button every time they're on a job listing, creating re-purchase triggers.

### For Margins

- Credit packs have better unit economics than subscriptions (no ongoing service obligation).
- Anchor the Pro Pack as "best value" with a per-credit discount (~0.48€/credit vs 0.60€/credit on Starter).

## Key Design Decisions

- **Credits never expire.** Removes purchase anxiety and is a strong selling point. ("Buy once, use whenever.")
- **Extension is free for everyone.** The extension is the distribution channel, not the product. The AI generation is the product.
- **Show remaining credits in the extension.** Gentle nudge to buy more when running low.
- **Referral credits.** Give 2 free credits per referral — job seekers talk to other job seekers. ROI: 22-225x depending on model (see cost analysis below).
- **Free tier reduced to 2 credits** (from 3). Still proves value on real applications. Converts faster.
- **Unlimited raised to €49** (from €39). Sprint-mode users won't blink at €10 more — still cheaper than a single CV coach session.

## Abuse Protection (Unlimited Tier)

No visible daily cap — "Unlimited" must feel unlimited. Instead, use invisible guardrails:

- **Rate limit**: minimum 30-60 seconds between generations. Blocks scripted abuse, invisible to real users.
- **Concurrent limit**: max 1 generation at a time (already enforced by streaming).
- **Soft monthly cap**: 500 generations/month (~16/day every day). No legitimate user hits this. Cost at 500/month on gpt-5.2: ~€25 — still profitable at €49.

## API Cost Analysis

### Cost per generation by model

| Model | Input rate ($/M) | Output rate ($/M) | Cost per CV tailor | Full generation (CV+Q&A+salary) |
|-------|-----------------|-------------------|--------------------|---------------------------------|
| gpt-4.1-mini | $0.40 | $1.60 | **$0.004** | **$0.010** |
| o4-mini | $1.10 | $4.40 | **$0.010** | **$0.026** |
| gpt-4.1 | $2.00 | $8.00 | **$0.020** | **$0.050** |
| gpt-5.2 | $2.00 | $8.00 | **$0.020** | **$0.050** |

Background pre-scans (gpt-4.1-nano, hardcoded): <$0.001/scan — negligible.
Refinement: ~$0.015 on gpt-5.2.

### Margin per tier (gpt-5.2, worst case)

**Starter (9€ / 15 credits → ~7.5 full generations)**

| Scenario | API cost | You keep | Margin |
|----------|----------|----------|--------|
| All CV-only (15 gen) | €0.28 | €8.72 | 97% |
| All full-package (7.5 gen) | €0.35 | €8.65 | 96% |
| Full + 2 refinements each | €0.56 | €8.44 | 94% |

**Pro Pack (19€ / 40 credits → ~20 full generations)**

| Scenario | API cost | You keep | Margin |
|----------|----------|----------|--------|
| All CV-only (40 gen) | €0.74 | €18.26 | 96% |
| All full-package (20 gen) | €0.92 | €18.08 | 95% |
| Full + 2 refinements each | €1.48 | €17.52 | 92% |

**Unlimited Month (49€)**

| User type | Full generations | Refinements | API cost | Margin |
|-----------|-----------------|-------------|----------|--------|
| Casual | 20 | 10 | €1.14 | 98% |
| Active | 60 | 30 | €3.42 | 93% |
| Power user | 120 | 60 | €6.84 | 86% |
| Soft cap (300 full) | 300 | 150 | €17.10 | 65% |

### Free credits & referrals

| | gpt-4.1-mini | gpt-5.2 (worst) |
|---|---|---|
| 2 free credits (new user) | €0.008 | €0.08 |
| 2 referral credits | €0.008 | €0.08 |

Non-credit features (story enhancement, bulk import): ~€0.15/user lifetime on gpt-5.2. Not worth metering.

## Revenue Projections (100 Paying Users)

### Monthly revenue scenarios

| Tier | Users | Purchases/mo | Revenue |
|------|-------|-------------|---------|
| Starter (€9) | 40 | 1.3× avg (credits burn in ~2 weeks) | €468 |
| Pro Pack (€19) | 30 | 1.0× | €570 |
| Unlimited (€49) | 30 | 1.0× | €1,470 |
| **Total** | **100** | | **€2,508** |

**API cost**: ~€200/month | **Margin**: 92%

### Conservative scenario

| Tier | Users | Purchases/mo | Revenue |
|------|-------|-------------|---------|
| Starter (€9) | 50 | 1.1× | €495 |
| Pro Pack (€19) | 30 | 1.0× | €570 |
| Unlimited (€49) | 20 | 1.0× | €980 |
| **Total** | **100** | | **€2,045** |

### Conversion funnel (from 10,000 monthly landing page visitors)

| Stage | Rate | Users |
|-------|------|-------|
| Visit landing page | — | 10,000 |
| Install extension | ~8% | 800 |
| Use 1st free credit (activate) | ~50% | 400 |
| Use both credits | ~70% | 280 |
| Pay | ~25% of exhausted trial | 70 |

Effective conversion: **8.75% from install**, **0.7% from landing page**.

Note: 2 free credits converts faster than 3 — users hit the wall sooner and the "buy more" prompt arrives while momentum is high.

The primary growth lever is **installs**, not conversion rate. The product sells itself once users try it.
