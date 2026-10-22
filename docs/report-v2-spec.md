# Detailed SEO Report v2 — spec

**Status:** draft for review · **Date:** 22 October 2026 · **Owners:** frixB (build), Carlos (product)
**Scope:** the report a customer receives for $1,500: sections, data model, and the data source behind every number.

Related: `docs/architecture.md` (code contract), `../architecture.md` (product invariants), `components/blocks/report-sections.ts`, `lib/orders/types.ts`.

---

## 1. Problem

The report today is 4 sections × 5 checks, and each finding is `severity + title + body` (`lib/orders/types.ts`). That is what free tools and $500–2,500 "lite" audits deliver, which buyers describe as tool exports with a logo on top. Buyers who pay $1,500 compare us to $2,500–7,500 strategic audits: Search Console data, competitor analysis, a prioritized roadmap and a walkthrough.

The current report also shows the most common red flags buyers use to reject an audit:

- **No business discovery.** We don't ask what a customer is worth.
- **Numbers without a method.** `score`, `monthlyVisitsLost` and `localRank` have no explanation.
- **Findings without evidence.** No affected URLs, measurements or screenshots.

If we ship as is, we invite refunds and "I could have got this free" reviews, and we can't defend the price on the landing page.

**Our edge:** competitors take 10 days to 6 weeks. We deliver strategic-tier content in about a day. v2 has to keep that speed while adding the depth.

## 2. Goals

1. **The report defends its price on its own.** Every finding carries evidence, a fix, an owner and an effort estimate. Every headline number links to a method and a dated source.
2. **The money is visible.** The executive summary states revenue at stake as a range, built from the customer's own intake figures.
3. **The customer knows what to do on Monday.** A 90-day plan puts every non-pass finding into a phase, with an owner and hours.
4. **The report includes what competitors sell separately:** local visibility, competitor scorecard, keyword map, AI search visibility, and ready-to-use assets.
5. **We prove it worked.** A 30-day re-check shows before and after.

## 3. Non-goals

| Not in v2 | Why |
|---|---|
| Ongoing monitoring or a subscription | Product invariant: one purchase, one report. The 30-day re-check is a single follow-up, not a plan. |
| Making changes on the customer's site | Implementation is a different service with different liability. We hand over assets and instructions. |
| Multi-location businesses (more than one Business Profile) | Changes the local section, pricing and crawl budget. Revisit after v2. |
| Large ecommerce or sites over 500 pages (see §10) | A different audit shape (facets, crawl budget). The order form should refuse them, not sell them a weak report. |
| Ranking or traffic guarantees | A red flag to buyers, and not in our control. |

## 4. User stories

**Owner (non-technical, pays the $1,500)**
- As a business owner, I want to see what my SEO problems cost me in dollars, so that I can decide whether fixing them is worth it.
- As a business owner, I want to know the three things to do first and who should do them, so that I can start this week without hiring a consultant.
- As a business owner, I want to see what's already working, so that I trust the report has actually looked at my site.
- As a business owner, I want to see how I compare to the businesses that outrank me on Google Maps, so that I understand why customers find them first.
- As a business owner, I want to know whether ChatGPT and Google's AI answers mention my business, so that I'm not invisible where customers are starting to search.
- As a business owner who didn't connect Search Console, I want the report to still be complete and to tell me what I'd gain by connecting, so that I don't feel I got a lesser report.

**Implementer (the owner's web developer or writer)**
- As a web developer handed the report, I want the affected URLs, the measured values and the exact change, so that I can turn findings into tickets without a meeting.
- As a writer, I want ready content briefs and rewritten titles, so that I can start writing straight away.

**Owner, after 30 days**
- As a business owner, I want to see which fixes are confirmed and what moved, so that I know the money was well spent.

**Edge cases**
- As a business owner whose domain is new, I want sections without data to explain why rather than show zeros (this already exists for `off_page`).
- As a recipient of a share link, I must not see the owner's revenue figures or Search Console data.

## 5. Report structure

### Order on the page

1. **Executive summary**: revenue at stake (range), visits at stake (range), top 3 moves, what's working, and a score breakdown.
2. **90-day action plan**: three phases (foundation, weeks 1–4; build, weeks 5–8; accelerate, weeks 9–12), each task with an owner and hours.
3. **Sections**, each as a list of findings plus section-specific tables (below).
4. **Ready-to-use assets**
5. **Methodology & sources**: how each estimate is calculated, the data source and when it was collected, and the crawl settings.
6. **Exports**: findings CSV, assets ZIP, PDF.

### Sections

Today there are 4 sections. v2 has 9. `REPORT_SECTIONS` stays the single list that feeds both the landing page and the report.

| Key | Name | New? | Section-specific data beyond findings | Phase |
|---|---|---|---|---|
| `technical` | Technical SEO | existing | Core Web Vitals table per template | 1 |
| `on_page` | On-Page SEO | existing | Per-page title, H1 and meta table | 1 |
| `measurement` | Tracking & Measurement | **new** | Which conversions are tracked: calls, forms, bookings | 1 |
| `search_performance` | Your Google Search Data | **new**, needs Search Console | Keywords ranking 4–20, declining pages, pages that bring leads | 2 |
| `content` | Keywords & Content Map | **new** | Keyword table (volume, difficulty, rank, target page) and a decision per page: keep, optimize, merge, remove or create | 2 |
| `local` | Local Visibility | **new**, split out of `off_page` | Geo-grid heatmap, share of local voice, Business Profile score, review comparison, name/address/phone consistency | 2 |
| `off_page` | Backlinks & Authority | existing, narrowed | Referring domains, link gap against competitors, toxic links | 2 |
| `competitive` | Competitor Scorecard | existing, reworked | Side-by-side table of the top 3 competitors | 2 |
| `ai_search` | AI Search Visibility | **new** | Prompt results: mentioned or cited, which competitors were cited, readiness checks | 3 |

The landing page copy "Four parts. One clear plan." and the `CHECKS` count in `landing.tsx` change with this table. Ship the copy change in the same PR as the sections.

## 6. Data model

All types go in `lib/orders/types.ts` (or a new `lib/reports/types.ts` once it grows). The report payload is versioned so v1 fixtures and any delivered v1 reports keep rendering.

```ts
export type Range = { low: number; high: number };
export type SourceKey =
  | "crawl" | "psi" | "crux" | "gsc" | "ga4" | "places" | "gbp"
  | "serp" | "maps_grid" | "keywords" | "backlinks" | "citations" | "ai_engines" | "intake";

/** Every number in the report points at one of these. */
export type SourceRecord = { key: SourceKey; provider: string; collectedAt: string; settings?: Record<string, string> };
export type MethodKey = "visits_from_rank_gap" | "revenue_from_visits" | "cwv_threshold" | "share_of_local_voice" | "ai_mention_rate";

export type Intake = {
  // existing step 1 and step 2 fields
  businessName: string; websiteUrl: string; industry: string; city: string; country: string;
  revenueRange?: string; employees?: string;
  // new
  services: string[];               // up to 5, these seed the keyword set
  serviceArea: { kind: "radius"; miles: number } | { kind: "places"; names: string[] };
  primaryGoal: "calls" | "forms" | "bookings" | "store_visits" | "online_sales";
  customerValue?: number;           // average first-job value, in cents
  closeRate?: number;               // 0–1; we assume a stated default when missing
  knownCompetitors?: string[];      // optional URLs
};

export type Severity = "critical" | "important" | "minor" | "pass";   // v1 "medium" maps to "important"
export type Owner = "you" | "developer" | "writer";

export type Finding = {
  id: string;                       // stable across the 30-day re-check
  section: SectionKey;
  severity: Severity;
  title: string;
  why: string;                      // one plain-language sentence
  evidence: {
    urls: string[];                 // first 20; full list in the CSV
    urlCount: number;
    measurements?: { metric: string; value: string; target: string }[];
    screenshots?: string[];         // asset ids
    snippet?: string;               // the offending HTML or header
    source: SourceKey;
  };
  impact?: { visits?: Range; revenue?: Range; confidence: "high" | "medium" | "low"; method: MethodKey };
  effortHours?: Range;
  owner?: Owner;
  fix?: { steps: string[]; code?: { language: string; content: string }; assetIds?: string[] };
  verify?: string;                  // how to check it is fixed, and what the re-check tests
};

export type PlanTask = {
  id: string; title: string; findingIds: string[];
  phase: "foundation" | "build" | "accelerate";
  owner: Owner; effortHours: Range;
  kind: "revenue" | "hygiene";      // revenue fixes are separated from cosmetic ones
};

export type SectionKey =
  | "technical" | "on_page" | "measurement" | "search_performance"
  | "content" | "local" | "off_page" | "competitive" | "ai_search";

export type SectionState = "complete" | "partial" | "unavailable" | "not_connected";

export type ReportSection = {
  key: SectionKey;
  state: SectionState;
  reason?: string;                  // required unless complete
  findings: Finding[];
  data?: SectionData;               // tables and charts for that section
};

export type SectionData =
  | { kind: "keywords"; rows: { keyword: string; volume: number; difficulty: number; rank?: number; targetUrl?: string; decision: "keep" | "optimize" | "merge" | "remove" | "create" }[] }
  | { kind: "geo_grid"; keyword: string; center: [number, number]; spacingMiles: number; cells: { lat: number; lng: number; rank: number | null }[]; shareOfVoice: number }
  | { kind: "scorecard"; metrics: string[]; rows: { name: string; url: string; isYou: boolean; values: (string | number | null)[] }[] }
  | { kind: "ai_prompts"; runs: { prompt: string; engine: string; samples: number; mentioned: number; cited: number; competitorsCited: string[] }[] }
  | { kind: "gsc"; strikingDistance: { query: string; position: number; impressions: number; url: string }[]; declining: { url: string; clicksDelta: number }[] }
  | { kind: "tracking"; checks: { goal: Intake["primaryGoal"]; tracked: boolean; tool?: string }[] };

export type Asset = {
  id: string;
  kind: "titles_meta" | "schema_jsonld" | "gbp_description" | "review_replies" | "content_brief" | "redirect_map" | "screenshot";
  title: string; format: "csv" | "json" | "md" | "png"; url: string;
};

export type ReportV2 = {
  version: 2;
  deliveredAt: string;
  pagesCrawled: number;
  intake: Intake;
  summary: {
    visitsAtStake: Range;
    revenueAtStake?: Range;          // only when customerValue was given
    topMoves: string[];              // 3 PlanTask ids
    strengths: string[];             // pass finding ids
    score: { overall: number; bySection: Partial<Record<SectionKey, number>>; method: string };
  };
  plan: PlanTask[];
  sections: ReportSection[];
  assets: Asset[];
  sources: SourceRecord[];
  recheck?: { scheduledFor: string; ranAt?: string; results?: { findingId: string; status: "fixed" | "open" | "regressed" }[] };
};
```

**Rules the types can't enforce. Review and tests must:**

- A number shown in the summary must come from findings or section data, and must carry a `method` and a `source`. No literal headline numbers.
- `revenueAtStake` = visits range × website conversion rate × `closeRate` × `customerValue`. Show it as a range, never as a single number. Omit it when `customerValue` is missing, and say why.
- **Website conversion rate** comes from a per-industry benchmark range in `lib/reports/benchmarks.ts`. Each entry records its source and date, and the methodology section cites it. When GA4 is connected, the customer's real rate replaces the benchmark and the methodology says so. When the industry has no entry, use a general 2–5% range and label it "general benchmark". Published figures disagree (legal alone ranges from about 1% to 12% across sources), so pick one source per industry, prefer studies over vendor blog posts, and keep the range wide.
- `not_connected` (Search Console skipped) does **not** make the order `partial`. `unavailable` because a provider failed **does**.
- **Share projection** (`/share/[token]`) removes `intake.customerValue`, `intake.closeRate`, `intake.revenueRange`, `summary.revenueAtStake` and the whole `search_performance` section. Write this as a projection function with a test, not as conditionals in the view.

**Storage:** `db/schema.sql` has no report tables yet, and reports come from fixtures. Add:

- `reports(id, order_id, version, payload jsonb, delivered_at)`
- `report_sources(report_id, key, provider, collected_at, settings jsonb)`
- `report_assets(id, report_id, kind, storage_key)`

Store screenshots and assets in object storage, not in Postgres.

## 7. Data sources per section

Costs are per report and need confirming with each provider before Phase 2 starts (see open questions). "Fallback" is what the section shows when the source fails.

| Section | Source | What it gives us | Fallback |
|---|---|---|---|
| `technical` | Our crawler (headless Chromium) | Status codes, redirects, canonicals, robots, sitemap, rendered HTML, screenshots | Order goes `blocked` (exists today) |
| | PageSpeed Insights API (Lighthouse) | Lab Core Web Vitals per template | Crawl timings, labelled as lab estimates |
| | Chrome UX Report API | Field data from real users: LCP, INP, CLS | "Not enough real-user traffic for field data", which is normal for small sites |
| `on_page` | Crawl, plus Claude analysis | Titles, H1s, meta, internal links, thin pages, duplicates | — |
| `measurement` | Crawl (detect GA4, GTM, call-tracking and form scripts); GA4 Admin/Data API if connected | Whether calls, forms and bookings are tracked | Crawl detection only, marked "detected from page source" |
| `search_performance` | Search Console API (OAuth, read-only) | Queries, positions, clicks, pages, 16 months of history | `not_connected`, with a one-line explanation of what connecting adds |
| | GA4 Data API (OAuth, read-only) | Landing pages that lead to conversions | Omit the conversion columns |
| `content` | Keyword data provider (e.g. DataForSEO Keywords, Semrush API) | Volume, difficulty and intent for the keyword set built from intake services × area | Section `partial`: rank and decisions without volume |
| | SERP API (e.g. DataForSEO SERP) | Current rank per keyword, which features appear, whether an AI Overview appears | — |
| `local` | Google Places API (New) | Categories, rating, review count, hours, photos count; the same for competitors | Required. If it fails, the section is `unavailable` |
| | Business Profile API (only if the owner connects) | Posts, Q&A, attributes, review response rate | Public data only; say which checks were skipped |
| | Geo-grid provider (e.g. Local Falcon API, DataForSEO Maps) | Map-pack rank at each grid point → heatmap and share of local voice | A single-point rank from the business address, labelled as such |
| | Citation provider (e.g. BrightLocal, Whitespark) | Name/address/phone consistency across directories | Check the top 10 directories via SERP lookups |
| `off_page` | Backlink provider (e.g. DataForSEO Backlinks, Ahrefs or Moz API) | Referring domains, anchors, toxic signals, link gap | `unavailable` with a reason (exists today) |
| `competitive` | Competitors found by the SERP and geo-grid runs, plus `knownCompetitors` from intake | Scorecard built from the data already gathered for the other sections | Fewer columns, never invented values |
| `ai_search` | OpenAI, Perplexity and Gemini APIs, with web search on; AI Overview presence from the SERP API | Mentions and citations for 10–20 buyer prompts, run **several times each**, because answers vary | `partial`, per engine |
| | Crawl | Readiness: can AI crawlers fetch the pages (robots rules), structured data, clear entity details | — |
| assets | Claude, from crawl, intake and section data | Titles and meta, JSON-LD, Business Profile description, review replies, content briefs, redirect map | Leave out the asset type. Never ship a placeholder |
| re-check | Our crawler + PSI + SERP, re-run after 30 days | Fixed, open or regressed per finding id | — |

**Chosen providers (22 Oct 2026):** DataForSEO for SERP, the Maps geo-grid (our own grid of coordinates), keywords and backlinks. Google Places API (New) for business profiles. OpenAI, Perplexity and Gemini APIs directly for AI search. Citations stay P1; no provider chosen yet. PageSpeed Insights and CrUX are free.

**Estimated third-party data cost per report.** These figures come from public price lists and third-party reviews, October 2026; confirm them on a test account during Phase 1.

| Item | Assumption | Approx. cost |
|---|---|---|
| SERP rankings | ~50 keywords, live queue, plus the 30-day re-check | ~$0.20 |
| Geo-grid | 3 keywords × 7×7 grid via DataForSEO Maps | ~$0.30 |
| Keyword data | 1–2 tasks | ~$0.10 |
| Backlinks | You + 3 competitors, summary and top rows | ~$0.50–1 |
| Places | You + ~10 competitors, Enterprise fields | ~$0.25 |
| AI search | 15 prompts × 3 engines × 5 samples = 225 calls, plus tokens | ~$5–15 |
| **Total** | | **~$7–17**, with headroom for retries and price changes |

**Budget cap:** $50 of third-party data per report, not counting Claude and staff time. The pipeline records the cost of each provider call against the report and alerts when a report passes the cap. It never cuts sections silently to stay under it. Measure Claude token cost separately in Phase 1.

**Caveats for the methodology section and the copy:**

- API answers from AI engines differ from what people see in the consumer apps. Report counts across samples ("mentioned in 3 of 5 runs"), never a single yes or no.
- Studies disagree on how much AI Overviews cut clicks: Ahrefs and Seer found −58% to −61%, and Seer's April 2026 update reports a partial rebound. Copy must say "contested", not quote a single figure.
- Google's Rich Results Test has no supported API. Validate JSON-LD locally against schema.org types, and tell the customer to confirm in the Rich Results Test (as part of `verify`).

## 8. Phases

Each phase ships on its own and leaves the report coherent. Phase 1 can be built against fixtures while the pipeline is built in parallel. Nothing in `workers/` exists yet.

### Phase 1: Earn the price (UI + model + crawl-only data)

**P0**
- [x] Delivery promise: change `SLA` in `lib/orders/sla.ts` to "within 48 hours of payment, every day". Remove the business-day window and working days, and rework `late`/`escalated` timing and their tests to calendar hours. Update every surface that reads `SLA`, plus the README and the shared-report CTA copy.
- [ ] Human review: every report passes a `reviewing` step before `ready`. Build a reviewer checklist in admin (`/admin/review` exists): numbers trace to sources, no invented findings, assets are valid, and the share projection is correct. Keep the "reviewed by a person" copy.
- [ ] Page cap: the order form checks the sitemap or a quick crawl estimate, and above 500 pages asks the customer to contact us instead of taking payment.
- [ ] `lib/reports/benchmarks.ts` with per-industry conversion-rate ranges and their sources (see §6).
- [ ] `ReportV2` types; v1 → v2 adapter so existing fixtures render; new fixtures for each `SectionState`.
- [ ] Intake: add services, service area, primary goal, customer value (optional) and close rate (optional) to `order-form.tsx` step 2. Every new field explains why we ask.
- [ ] Finding v2 shown with evidence, fix, owner, effort and verify. The evidence is collapsible so the list stays scannable.
- [ ] Executive summary: visits and revenue ranges, top 3 moves, what's working, score breakdown with a method link.
- [ ] 90-day plan view, grouped by phase, with an owner filter.
- [ ] `measurement` section from crawl detection.
- [ ] Methodology & sources section, generated from `sources`.
- [ ] Findings CSV export.
- [ ] Share projection function and test (fields listed in §6).

**Acceptance**
- Given a report where `customerValue` is missing, when the summary renders, then it shows visits at stake, and a sentence explaining that revenue needs the customer value, with no dollar figure.
- Given any number in the summary, when the reader follows its method link, then they reach the methodology entry that names the source and the date it was collected.
- Given a share link, when the shared view renders, then no intake money fields and no Search Console data appear in the HTML.

**New UI primitives** (add these to `components/ui` first, per `docs/architecture.md` §2): `DataTable`, `RangeValue`, `Disclosure` (evidence), `HeatGrid`.

### Phase 2: Data a free tool can't give (external sources)

**P0**
- [ ] Search Console OAuth (read-only scope) after purchase, on the order page. It's optional, and the report waits a short, configurable window before running without it. The wait counts against the 48-hour promise.
- [ ] The connect screen asks for explicit agreement that a member of our team reviews the report, including this data. Google's Limited Use rules only allow people to read the data with the user's affirmative agreement, so without it the reviewer must not see the `search_performance` section.
- [ ] Data retention: keep raw Search Console and GA4 pulls and the token, encrypted, until the 30-day re-check runs. Then delete them and revoke the token. The delivered report keeps its derived tables. Never send this data to a model provider that may train on it or retain it beyond the request.
- [ ] `search_performance` section.
- [ ] `content` section with keyword table and page decisions.
- [ ] `local` section: Places data, geo-grid heatmap for the top 3 service keywords, review comparison.
- [ ] `off_page` narrowed to backlinks; `competitive` becomes the scorecard.
- [ ] Each provider call records a `SourceRecord`; a provider failure marks only its own section `unavailable`/`partial`.

**P1**
- [ ] GA4 connection for conversion columns.
- [ ] Business Profile API connection for posts, Q&A and response rate.
- [ ] Citation provider.

### Phase 3: What makes it feel worth more than $1,500

**P0**
- [ ] `ai_search` section with a prompt library per industry, multiple samples per prompt and engine, and readiness checks.
- [ ] Assets: titles and meta CSV, JSON-LD, Business Profile description, 3–5 content briefs, redirect map. Each asset links to the findings it fixes.
- [ ] 30-day re-check: a scheduled re-run of crawl, PSI and SERP; a before/after view on the same `/reports/:id` route; an email when it's ready.

**P1**
- [ ] Walkthrough video per report (see open questions).
- [ ] Landing page "value stack" with sourced market prices for each part.

**P2** (design for these, don't build them)
- Multi-location reports, meaning `local` holds one entry per location.
- Re-check comparisons beyond 30 days.

## 9. Success metrics

There is no live baseline yet, so these targets are hypotheses to check at 30 and 90 days after launch.

| Metric | Type | Target | How measured |
|---|---|---|---|
| Refund requests on delivered reports | lagging | under 3% | Refund records ÷ delivered reports |
| Reports with at least one share link created | leading | 40% or more | `shareToken` created ÷ delivered |
| Walkthrough calls booked | leading | 25% or more | Booking link clicks, then bookings |
| Search Console connection rate | leading | 50% or more | OAuth completions ÷ paid orders |
| Plan tasks marked fixed at the 30-day re-check | lagging | 30% or more of critical findings | `recheck.results` |
| Landing → paid conversion with the v2 sample report | lagging | +20% vs v1 sample | Analytics funnel |

## 10. Decisions and open questions

### Decided (22 October 2026)

| Question | Decision | Consequence |
|---|---|---|
| Human review | **A person reviews every report** before delivery. The "reviewed by a person" copy stays. | `reviewing` stays in `ORDER_STATUS`. Combined with every-day delivery, **someone must be on the review rota at weekends.** |
| Delivery promise | **Within 48 hours of payment, every day.** | Replaces "1 business day, Mon–Fri" in `sla.ts`, the README and the copy. The root `../architecture.md` "no fixed window" note is superseded. |
| Page cap | **500 pages.** Above that, the order form asks the customer to contact us. | Crawl everything up to 500; analyse the top pages per template in depth. |
| Website conversion rate | **Per-industry benchmark range**, cited; the customer's real rate replaces it when GA4 is connected. | Needs `lib/reports/benchmarks.ts` and a chosen source per industry. |
| Providers | **DataForSEO + Google Places + AI engine APIs directly.** Citations deferred. | One pay-as-you-go data account. We build our own geo-grid on DataForSEO Maps. |
| Data budget | **$50 per report cap** on third-party data. | Cost is logged per call; going over the cap raises an alert. |
| Search Console / GA4 retention | **Kept until the 30-day re-check, then deleted and access revoked.** | Report keeps derived tables only. |

### Still open

| Question | Who | Blocking? |
|---|---|---|
| Who covers weekend reviews, and what's the review time budget per report? | Product (Carlos) | **Yes, before the 48-hour promise goes live** |
| Submit Google OAuth verification for `webmasters.readonly` (and `analytics.readonly` if GA4 is in P1). Google says 3–5 business days for sensitive scopes, but developers report waits of 5+ weeks, so submit as soon as the privacy policy is updated. Confirm the scopes are sensitive, not restricted. | Engineering | **Yes, for Phase 2 timing** |
| Privacy policy wording: Search Console and GA4 use, human review of that data, retention until the re-check, the AI providers we send data to and their no-training terms. Needs a lawyer's read, particularly for UK/EU customers. | Legal | **Yes, before Phase 2** |
| Which benchmark source per industry? | Data | Yes, before Phase 1 ships the revenue range |
| Walkthrough video: recorded by a person (needs staff time) or generated narration? Is generated video honest enough to call a walkthrough? | Product | No |
| Business Profile API needs a separate access application to Google. Apply now or ship Phase 2 on Places data only? | Engineering | No |

## 11. Dependencies and order

- Phase 1 depends on nothing external. The UI and model can ship against fixtures; real crawl data needs the crawl worker, which is not built yet.
- Phase 2 depends on the report pipeline (`workers/`, which isn't in the repo yet), the provider decisions, and Google OAuth verification. Start the verification and the provider trials during Phase 1.
- Phase 3 depends on Phase 2's SERP access (for AI Overview presence) and a scheduler for the re-check (the planned `sla-watchdog` can share it).
