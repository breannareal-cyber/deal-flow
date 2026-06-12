import type { ETACaseData } from './types';

export type SeedCase = {
  caseNumber: number;
  title: string;
  industry: string;
  difficulty: number;
  data: ETACaseData;
};

export const SEED_CASES: SeedCase[] = [
  {
    caseNumber: 1,
    title: 'Rocky Mountain Pest Solutions',
    industry: 'Pest Control',
    difficulty: 1,
    data: {
      company: `Rocky Mountain Pest Solutions — Residential & Commercial Pest Control, Colorado Front Range

Founded 2004 by current owner (age 61), who started as a technician and built the business over 20 years. Single location. Asking $1.55M.

FINANCIALS (3-year history):
2022: Revenue $1.61M | Gross Margin 60% | SDE $380K
2023: Revenue $1.74M | Gross Margin 60% | SDE $405K
2024: Revenue $1.83M | Gross Margin 60% | SDE $430K

Revenue breakdown (2024): 64% recurring service agreements (monthly/quarterly), 36% one-time treatments and termite work.

Customer concentration: Largest customer (commercial property management co.) = 11% of revenue. Top 5 = 28%. Residential base ~1,100 active accounts.

DEAL STRUCTURE: $1.25M at close + $300K seller note at 6% over 5 years. No existing business debt. Equipment/vehicles ($85K) included. Lease: month-to-month at $2,800/month.

OPERATIONS: 7 employees — 5 licensed technicians, 1 office coordinator, owner. 6 service trucks (2014–2019, some deferred maintenance). Basic scheduling software, no CRM. Owner holds the state applicator license; two technicians also licensed. Residential accounts: month-to-month. Commercial: annual contracts.

SELLER: Owner does all outbound sales and manages the two largest commercial accounts personally. Wife handles bookkeeping part-time ($24K/year in expenses). No general manager.

INDUSTRY: $26B fragmented US pest control market. Top 4 nationals hold ~30% share. PE consolidation active — roll-ups paying 5–8x EBITDA for operators above $3M revenue. Residential recurring churn averages 15–20% annually industry-wide.

EVALUATE THIS DEAL:
A) Business Quality — Is this a good business? What makes it durable or fragile?
B) Financial Quality — Revenue quality, SDE adjustments, cash flow, working capital.
C) Seller Quality — Why is the owner selling? What transition risks exist?
D) Deal Quality — Is $1.55M fair? What multiple does this imply? Walk the debt structure.
E) Operational Opportunity — What would you fix, grow, or change in year one?
F) Decision — Pass / Continue diligence / Submit LOI / Acquire immediately. Defend it.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Rocky Mountain Pest Solutions

A. BUSINESS QUALITY: Good, not great. Pest control is non-discretionary, recession-resistant, and route-dense — green flags all. 64% recurring revenue is real durability. The 20-year operating history and ~1,100 residential accounts represent genuine switching-cost moat (customers are sticky; changing pest control is friction). The fragmented market is consolidating, meaning a strategic exit to a roll-up buyer is plausible. Risks: owner is the entire sales engine (key-man), the month-to-month lease creates relocation risk, and the single commercial account at 11% of revenue is a concentration flag.

B. FINANCIAL QUALITY: Revenue quality is solid — recurring contracts are real, predictable cash. SDE of $430K requires scrutiny: wife's $24K bookkeeping salary is a legitimate add-back only if you hire a replacement (recast to ~$36K market rate → net add-back ~$0). Owner salary of $120K is fair market for an operator-manager — don't add it back. Gross margin of 60% is healthy for pest control (industry avg 55–65%). No existing debt is a major green flag. Working capital is low (recurring billing, minimal inventory). Deferred truck maintenance = hidden capex — budget $40–60K for fleet catch-up.

C. SELLER QUALITY: Age 61, 20 years in — retirement thesis is credible. But the fact that he personally manages the two largest commercial accounts (28% of top-5 revenue) is a red flag. If those accounts leave after ownership transition, you've lost meaningful revenue on day one. The wife's part-time bookkeeping also means no real back-office infrastructure. Transition risk is HIGH. Require a 12–18 month earnout tied to commercial account retention and a non-compete.

D. DEAL QUALITY: $1.55M on $430K SDE = 3.6x SDE multiple. Fair for a sub-$2M pest control operator with key-man risk — not cheap, not expensive. SBA 7(a) structure: 10% down ($155K equity), SBA loan ~$1.25M at ~7.5% over 10 years = ~$177K/year debt service. Seller note $300K at 6% over 5 years = ~$70K/year. Total annual debt service ~$247K. DSCR = $430K / $247K = 1.74x — healthy. Note: SBA may require seller note on 24-month standby, which improves DSCR to 2.43x in years 1–2. Cash-on-cash return post-debt-service ≈ $183K / $155K equity = 118% in year one — strong if revenue holds.

E. OPERATIONAL OPPORTUNITY: (1) CRM implementation — no CRM means no systematic renewal reminders, upsell triggers, or churn tracking. This alone could improve retention 3–5 points. (2) Hire a sales coordinator to own commercial account management before the seller exits — removes key-man concentration. (3) Convert month-to-month residential accounts to annual prepaid contracts — improves cash flow and reduces churn. (4) Route density analysis — are there under-served zip codes adjacent to existing routes? (5) Commercial account expansion — property management companies are scalable if you can systematize the sales process.

F. DECISION: Continue diligence, targeting LOI. The business is real, the financials are clean, and the multiple is fair. The deal-breakers to resolve in diligence: (1) validate commercial account relationships — get introductions and assess how owner-dependent they truly are; (2) inspect fleet condition and get maintenance estimates; (3) confirm state applicator license transfer requirements; (4) verify month-to-month lease — negotiate a 3-year option before close. If commercial accounts are genuinely transferable and lease is securable, submit LOI with 12-month earnout (20% of purchase price) tied to commercial account retention above 80%.

TEACHING CONCEPTS: SDE normalization, DSCR calculation, key-man risk assessment, earnout structuring, SBA 7(a) debt structure, recurring revenue quality.`,

      teachingConcepts: ['SDE normalization', 'DSCR calculation', 'Key-man risk', 'SBA 7(a) structure', 'Earnout design', 'Recurring revenue quality'],
      keyRedFlags: ['Owner manages top commercial accounts personally', 'Month-to-month lease', 'No CRM or systems', 'Deferred fleet maintenance', 'Wife bookkeeping = no real back-office'],
      keyGreenFlags: ['64% recurring revenue', '20-year operating history', 'No existing debt', '60% gross margin', 'Fragmented industry with PE roll-up exit path', 'Non-discretionary demand'],
    },
  },
  {
    caseNumber: 2,
    title: 'Front Range HVAC Services',
    industry: 'HVAC',
    difficulty: 1,
    data: {
      company: `Front Range HVAC Services — Residential HVAC Installation & Service, Denver Metro

Owner-operated since 2011. Owner age 58, wants to retire in 2 years. Asking $2.1M.

FINANCIALS:
2022: Revenue $2.3M | SDE $480K
2023: Revenue $2.5M | SDE $510K
2024: Revenue $2.7M | SDE $545K

Revenue mix: 45% service/maintenance agreements, 35% equipment replacements, 20% new installations (builder contracts). Maintenance agreement base: 620 residential accounts at $180/year avg.

Customer concentration: No single customer above 5%. Builder contract = 12% of revenue (one builder).

DEAL STRUCTURE: $1.8M at close + $300K seller note at 5% over 3 years. No existing debt. $120K in vehicles/equipment included.

OPERATIONS: 9 employees — 6 HVAC technicians (4 NATE-certified), 2 install crews, 1 dispatcher. All technicians are W-2 employees. Owner does all estimating and handles the builder relationship personally. ServiceTitan software in use. Lease: 3-year remaining at $3,400/month.

SELLER: Owner started as a technician. States retirement as reason for selling. Has been trying to sell for 18 months — previous deal fell through in diligence (reason unknown).

INDUSTRY: Residential HVAC is $25B+ market. Highly fragmented — 90%+ of operators are under $5M revenue. Non-discretionary replacement demand (equipment lifespan 15–20 years). PE roll-up activity increasing. Labor is the binding constraint — NATE-certified techs are scarce.

EVALUATE: Same six dimensions as Case 1. Pay special attention to why the previous deal fell through.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Front Range HVAC Services

A. BUSINESS QUALITY: Strong fundamentals. HVAC is non-discretionary (broken heat in January = emergency call), maintenance agreements create recurring cash flow, and the 620-account agreement base is a real asset. ServiceTitan is a green flag — it means the business has operational infrastructure, not just tribal knowledge. The 4 NATE-certified techs represent defensible human capital. Risk: the builder contract at 12% is owner-dependent (he manages that relationship). Previous deal fell through in diligence — this is a RED FLAG requiring direct investigation.

B. FINANCIAL QUALITY: 3x3 growth ($2.3M→$2.7M over 3 years, consistent ~8% CAGR) is healthy and organic. SDE of $545K at 3.85x asking = $2.1M — reasonable. Owner salary normalization: HVAC operator-managers earn $120–150K market. If owner draws $180K+, add back the excess. New installation revenue (20%) is lumpy and lower-margin than service — adjust mental model for normalized EBITDA without it. Working capital: HVAC has seasonal cash flow swings (peaks in summer/winter) — model a $75–100K working capital cushion.

C. SELLER QUALITY: 18 months on market + a prior failed deal are serious flags. The most common reasons a deal fails in diligence: (1) financial misrepresentation (add-backs that don't hold up), (2) customer concentration discovered in diligence, (3) key employee departure risk, (4) environmental/legal issues, (5) undisclosed liabilities. You MUST find out why the previous deal died before submitting an LOI. Ask the broker directly. If the seller refuses to disclose, walk.

D. DEAL QUALITY: $2.1M / $545K SDE = 3.85x. Fair for a serviceable HVAC business, slightly rich given the unresolved diligence question. SBA structure: 10% down ($210K), SBA loan ~$1.8M at 7.5% / 10 years = ~$255K/year + seller note $300K/5yr = ~$68K/year. Total debt service ~$323K. DSCR = $545K / $323K = 1.69x — workable but tight. If the builder contract (12% = ~$324K revenue) leaves post-transition, SDE drops to ~$445K and DSCR falls to 1.38x — still above 1.25x SBA floor, but stress-tested.

E. OPERATIONAL OPPORTUNITY: (1) Grow the maintenance agreement base — 620 accounts is good but the equipment replacement base should yield 1,000+ agreements with systematic outreach. (2) Hire an estimator to replace owner on large-job bidding — removes key-man from revenue generation. (3) Builder contract: either systematize the relationship (introduce lead tech to builder) or reduce reliance through residential growth. (4) ServiceTitan is already in — build out the automated renewal reminders and upsell campaigns that most operators underuse.

F. DECISION: Do NOT submit LOI until you know why the last deal died. Request a call with the broker and, if possible, the prior buyer (sometimes brokered with permission). If the explanation is satisfactory (e.g., buyer financing fell through, not a business issue), continue to full diligence and target an LOI at $2.0M with $250K seller note contingent on builder account retention. If the seller stonewalls on the failed deal question, pass.

TEACHING CONCEPTS: Diligence red flags, working capital seasonality, builder-contract concentration, ServiceTitan as operational signal, failed-deal investigation protocol.`,

      teachingConcepts: ['Failed deal investigation', 'Working capital seasonality', 'Revenue mix quality', 'Operational systems as signal', 'SBA stress testing'],
      keyRedFlags: ['Prior deal fell through — reason unknown', '18 months on market', 'Owner manages builder relationship personally', 'Builder = 12% concentration'],
      keyGreenFlags: ['ServiceTitan in use (operational maturity)', '4 NATE-certified techs', '620 maintenance agreements', 'Consistent 8% revenue growth', 'No existing debt'],
    },
  },
  {
    caseNumber: 3,
    title: 'Cascade Commercial Cleaning',
    industry: 'Commercial Cleaning',
    difficulty: 1,
    data: {
      company: `Cascade Commercial Cleaning — B2B Janitorial Services, Pacific Northwest

Founded 2008. Owner age 52, relocating out of state for family reasons. Asking $950K.

FINANCIALS:
2022: Revenue $1.9M | SDE $195K
2023: Revenue $2.1M | SDE $215K
2024: Revenue $2.2M | SDE $228K

Revenue mix: 90% recurring monthly contracts (office buildings, medical offices, light industrial), 10% one-time/project work. Average contract length: 2.3 years. Monthly recurring revenue (MRR): ~$183K.

Customer concentration: Largest customer = 18% of revenue (medical office complex, 3-year contract with 1 year remaining). Top 5 = 52% of revenue.

DEAL STRUCTURE: $850K at close + $100K seller note at 6% over 2 years. Existing equipment debt: $45K. Vehicles/equipment: $110K included. Lease: month-to-month, $1,800/month.

OPERATIONS: 22 employees — all part-time hourly, no benefits. Owner + 1 operations manager. High employee turnover (industry avg 100%+ annually). Basic scheduling via Google Sheets. No branded vehicles — employees use personal vehicles and are reimbursed.

SELLER: Relocation for spouse's job — credible non-distress reason. Owner has been preparing the business for sale for 6 months. Operations manager (8 years tenure) open to staying.

INDUSTRY: Commercial cleaning is highly fragmented, labor-intensive, low-margin, and price-competitive. Switching costs are moderate — contracts create inertia but competitive bids happen at renewal. Barriers to entry are extremely low.

EVALUATE: Focus especially on margin quality, customer concentration, and what happens if the top customer doesn't renew.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Cascade Commercial Cleaning

A. BUSINESS QUALITY: Below average for ETA. Commercial cleaning has the surface attributes searchers like (recurring revenue, B2B, non-discretionary) but the underlying economics are weak: 90%+ labor cost, no pricing power, commoditized, low barriers to entry. The 10.4% SDE margin on $2.2M revenue is thin — one bad hire, one lost contract, or one workers' comp claim dents it materially. The 52% top-5 concentration is the real problem: this isn't a portfolio of accounts, it's a handful of relationships that could walk.

B. FINANCIAL QUALITY: MRR of $183K is real recurring cash — that's the one legitimate green flag. But $228K SDE on $2.2M revenue (10.4% margin) leaves almost no buffer. Normalize carefully: if the operations manager (currently likely included in owner's lean structure) is critical and would need a pay raise to stay, the true run-rate SDE is closer to $190–200K. Equipment debt of $45K reduces real equity. No-benefits workforce is a cost advantage but creates HR/legal exposure (misclassification risk if reimbursed employees are later deemed contractors).

C. SELLER QUALITY: Relocation is credible. Operations manager with 8 years tenure is the real continuity asset — verify his/her compensation, retention interest, and whether they have a non-solicit agreement. If the ops manager leaves, this business loses its institutional memory overnight.

D. DEAL QUALITY: $950K on $228K SDE = 4.2x — EXPENSIVE for commercial cleaning. This industry typically trades at 2.5–3.5x SDE. At 4.2x, you're paying a premium you won't recover easily in a low-margin business. SBA structure: 10% down ($95K), SBA loan ~$855K + $45K equipment debt assumed = $900K total debt. Annual debt service on $900K at 7.5%/10yr = ~$127K + seller note $100K/2yr = ~$52K. Total: ~$179K. DSCR = $228K / $179K = 1.27x — barely above SBA's 1.25x minimum. If the top customer (18% = ~$396K revenue, ~$41K SDE impact) doesn't renew, DSCR falls below 1.0x. You are one renewal away from default.

E. OPERATIONAL OPPORTUNITY: Modest. (1) Google Sheets → scheduling software (Janitorial Manager, Swept) to improve ops and reduce manager dependency. (2) Branded vehicles improve perception at renewals. (3) Medical office specialty is a defensible niche — lean into it for marketing. But the ceiling is low: you can't expand margins meaningfully in a labor-cost business without pricing power you don't have.

F. DECISION: Pass, or counter at $650–700K (2.8–3.1x SDE). The current ask is 35% above what this business quality warrants. At $950K with a 1.27x DSCR and 52% top-5 concentration, the downside scenario (one lost contract + normal churn) produces a default. Commercial cleaning is a legal business but not an ETA-quality business. Unless you have a specific roll-up thesis or can negotiate price down significantly, pass.

TEACHING CONCEPTS: Margin quality vs revenue quality, concentration risk math, industry-appropriate multiples, DSCR floor analysis, low-barrier-to-entry industries.`,

      teachingConcepts: ['Margin quality', 'Customer concentration math', 'Industry multiple benchmarks', 'DSCR floor risk', 'Low-barrier industries in ETA'],
      keyRedFlags: ['10.4% SDE margin — dangerously thin', '52% top-5 customer concentration', '4.2x multiple — overpriced for the industry', 'DSCR 1.27x barely above SBA floor', 'No barriers to entry', 'Google Sheets ops — no systems'],
      keyGreenFlags: ['90% recurring MRR', 'Credible seller reason (relocation)', 'Ops manager with 8 years tenure', 'Medical office niche = some stickiness'],
    },
  },
  {
    caseNumber: 4,
    title: 'High Desert Water Treatment',
    industry: 'Water Treatment Services',
    difficulty: 2,
    data: {
      company: `High Desert Water Treatment — Commercial & Industrial Water Treatment, New Mexico/Colorado

Founded 1998 by two partners. One partner (age 67) wants to retire; the other (age 54) wants to stay on as a minority partner or employee. Asking $3.2M for the retiring partner's 60% stake (implies full company value of $5.33M).

FINANCIALS (full company):
2022: Revenue $4.1M | EBITDA $820K
2023: Revenue $4.4M | EBITDA $895K
2024: Revenue $4.7M | EBITDA $960K

Revenue mix: 55% service contracts (water softening systems, cooling tower treatment, boiler water treatment), 30% chemical supply (recurring), 15% equipment sales & installation.

Customer mix: Municipal water utilities (30%), hotels/hospitality (25%), industrial/manufacturing (28%), healthcare (17%). No single customer above 8%.

DEAL STRUCTURE PROPOSED: Acquirer buys retiring partner's 60% for $3.2M. Remaining partner retains 40%, stays as VP Operations for 3 years at $140K/year salary. Seller financing: $500K note at 6% over 4 years.

Existing debt: $180K equipment line. Vehicles/equipment: $340K.

OPERATIONS: 18 employees — 8 field service techs (water treatment certified), 4 chemical delivery drivers, 3 office/admin, 2 sales reps, 1 operations manager (the remaining partner). Proprietary chemical blending capability. Regulatory certifications: EPA-compliant, state water treatment licenses in NM and CO.

SELLER: Retiring partner held the primary customer relationships for the first 10 years; remaining partner took over operations 8 years ago. Remaining partner credibly leads the business today.

EVALUATE: This structure is more complex than Cases 1–3. Analyze the partial acquisition structure, the retained-partner dynamic, and whether the business quality justifies the implied $5.33M full-company valuation.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — High Desert Water Treatment

A. BUSINESS QUALITY: High quality. Water treatment services are essential infrastructure — you cannot run a hotel, hospital, or industrial facility without managed water. Chemical supply creates genuine recurring revenue with real switching costs (changing water treatment providers means re-engineering the chemistry program, retraining staff, and risking compliance issues). The 26-year operating history, EPA certifications, and proprietary blending capability represent durable competitive advantages. Customer diversification across municipalities, hospitality, industrial, and healthcare is excellent. No single customer above 8% is textbook.

B. FINANCIAL QUALITY: $960K EBITDA on $4.7M revenue = 20.4% EBITDA margin — strong for a services/distribution hybrid. Chemical supply margin is typically 35–45%, service contracts 50–60%, equipment lower. The mix suggests real pricing power. EBITDA growth from $820K to $960K over 3 years (+17%) is organic and consistent. Capex: water treatment is moderate-capex (service vehicles, chemical delivery trucks, blending equipment) — normalize for $150–200K/year replacement capex → Adjusted EBITDA ≈ $760–810K. Working capital: chemical inventory + receivables — expect 45–60 day DSO with commercial customers.

C. SELLER QUALITY: The STRUCTURE is the risk, not the seller. Buying 60% from a retiring partner with a 40% minority retained by an active operator creates a complicated governance situation. Key questions: (1) Who controls day-to-day decisions? (2) What are the buy-out rights for the remaining 40%? (3) What happens if the remaining partner wants to leave in year 2? Model out the total cost to reach 100% ownership — if the 40% costs another $2.1M+ in year 3, your total acquisition cost is $5.3M+. The remaining partner's 3-year employment commitment is valuable operationally but creates a principal-agent problem if incentives aren't aligned.

D. DEAL QUALITY: $3.2M for 60% implies $5.33M full-company value. At $960K EBITDA, that's 5.55x EBITDA — reasonable for a water treatment business with recurring chemistry supply and strong customer diversification. Adjusted EBITDA (~$800K) → 6.67x — getting full. SBA won't finance a partial acquisition cleanly — you're likely looking at a combination of SBA (if structured as full asset purchase with seller retained as employee), seller note, and possibly search fund equity. Model total debt service on $2.7M financed (~$382K/year) against $800K adjusted EBITDA → DSCR = 2.09x — healthy.

E. OPERATIONAL OPPORTUNITY: (1) Geographic expansion — NM + CO licenses; add AZ, UT, TX with existing chemical and service platform. (2) Municipal contracts are long-cycle, low-churn — pursue more aggressively. (3) Chemistry supply is the highest-margin line — grow it through cross-selling existing service accounts. (4) Build out digital chemical monitoring (IoT sensors) — differentiator in the market, commands premium pricing.

F. DECISION: Continue diligence with strong interest, but restructure the deal. Do not buy 60% with a 40% minority partner — negotiate a full acquisition (100%) with the remaining partner receiving equity in the new entity (earnout or rollover equity) rather than retaining a minority position in the operating company. The business quality is excellent. The structure as proposed creates governance headaches. If seller insists on the 60% structure, require: (1) put option to acquire remaining 40% at a defined multiple within 3 years; (2) majority governance rights regardless of equity split. If these aren't negotiable, the deal complexity outweighs the opportunity.

TEACHING CONCEPTS: Partial acquisition structures, minority partner governance risk, capex normalization, chemical distribution recurring revenue, geographic expansion in licensed services.`,

      teachingConcepts: ['Partial acquisition structure', 'Minority partner governance', 'EBITDA vs adjusted EBITDA', 'Capex normalization', 'Chemical distribution economics'],
      keyRedFlags: ['Partial acquisition (60%) — governance complexity', 'No clear path to 100%', 'Implied 6.67x adjusted EBITDA — getting expensive', 'Retained minority partner creates principal-agent risk'],
      keyGreenFlags: ['26-year history', 'Chemical supply = recurring revenue with switching costs', 'No customer above 8%', 'EPA certifications + proprietary blending', '20%+ EBITDA margin', 'Essential infrastructure — non-discretionary'],
    },
  },
  {
    caseNumber: 5,
    title: 'Mountain States Electrical Contractors',
    industry: 'Electrical Contracting',
    difficulty: 2,
    data: {
      company: `Mountain States Electrical Contractors — Commercial Electrical Services, Colorado

Founded 2003. Owner age 63, health issues accelerating exit timeline. "Must close in 90 days." Asking $1.8M. No broker — direct deal.

FINANCIALS:
2022: Revenue $3.8M | EBITDA $310K
2023: Revenue $4.2M | EBITDA $285K
2024: Revenue $3.6M | EBITDA $190K (9 months actuals + 3 months projected)

Revenue mix: 70% commercial new construction (GC subcontracts), 30% service/maintenance work.

Customer concentration: Top 3 GC relationships = 78% of revenue.

DEAL STRUCTURE: $1.8M all-cash (seller won't accept seller financing). No existing debt. Equipment: $380K book value. 6 company vehicles included.

OPERATIONS: 22 employees — 12 licensed electricians, 6 apprentices, 4 admin. Owner holds the master electrician license. Two journeyman electricians also licensed. Backlog as of today: $1.1M (down from $2.3M two years ago). Owner handles all GC relationship management and bids.

SELLER: Owner states health reasons. Rush timeline ("90 days or I'm shutting it down"). Not using a broker.

EVALUATE: This deal has multiple distress signals. Identify each one, assess whether any are recoverable, and give your decision.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Mountain States Electrical Contractors

A. BUSINESS QUALITY: Structurally weak for ETA. Commercial electrical contracting is project-based, not recurring — 70% of revenue depends on GC subcontracts that must be re-won every cycle. The 78% top-3 customer concentration means this is a relationship business, not a process business. If the owner leaves and those GC relationships follow him, you have $500K in revenue and $3.3M in overhead. Backlog declining from $2.3M to $1.1M is the canary in the coal mine — work is leaving.

B. FINANCIAL QUALITY: Revenue declining ($4.2M → $3.6M), EBITDA collapsing ($285K → $190K projected). The EBITDA margin has compressed from 6.8% to 5.3% — dangerously thin for a business with 22 employees and equipment overhead. The 2024 EBITDA figure is also partially projected (Q4 estimates) — discount it further. Real LTM EBITDA is likely $150–180K. At $1.8M all-cash on $175K EBITDA = 10.3x — egregiously overpriced for a declining business with concentration risk.

C. SELLER QUALITY: Multiple red flags converging: (1) No broker — sellers who bypass brokers on large deals are either cost-cutting or know the deal won't survive professional scrutiny. (2) 90-day hard deadline with health urgency — creates artificial time pressure designed to compress your diligence. (3) All-cash requirement with no seller financing — a seller who won't take any seller note has no skin in the game post-close. They bear zero risk if the business deteriorates. This is the OPPOSITE of what you want. A good seller takes a note because they believe the business will perform. (4) Declining revenue + declining backlog while simultaneously asking a premium price = seller knows something you don't.

D. DEAL QUALITY: Pass on the math alone. $1.8M / $175K real EBITDA = 10.3x. For a declining, project-based, GC-dependent, owner-run business with a 90-day distress timeline, fair value is $600–900K at most (3–5x EBITDA). The equipment ($380K book value) provides some hard asset floor, but you're buying a relationship business — if the relationships leave, the equipment is worth scrap.

E. OPERATIONAL OPPORTUNITY: Only recoverable if: (1) one of the licensed journeyman electricians is capable of holding GC relationships; (2) the backlog can be stabilized; (3) you can negotiate price to $700–800K. The service/maintenance 30% is the only recurring element worth preserving — a strategic acquirer might strip out the service book and leave the rest.

F. DECISION: Pass as structured. If genuinely interested in the assets: (1) offer $750K — $300K at close, $300K seller note (forcing them to take a note reveals confidence in the business), $150K earnout tied to backlog over $2M within 18 months; (2) require 6-month transition with owner introducing you to all 3 GC relationships before any payment releases; (3) master electrician license transfer — verify Colorado requirements (exam, experience, application time). If the seller rejects all of this, let it go. Health urgency + no broker + all-cash + declining financials = distressed seller trying to escape a deteriorating situation, not a retiring entrepreneur selling a healthy business.

TEACHING CONCEPTS: Distress signals, project-based vs recurring revenue, seller-note absence as red flag, backlog as leading indicator, license transfer requirements.`,

      teachingConcepts: ['Distress seller signals', 'Backlog as leading indicator', 'No seller note = red flag', 'Project-based revenue risk', 'All-cash premium scrutiny'],
      keyRedFlags: ['No broker — bypassing scrutiny', '90-day hard deadline pressure tactic', 'All-cash, no seller financing', 'Revenue and EBITDA both declining', 'Backlog down 52% YoY', '78% customer concentration in 3 GC relationships', '10x+ multiple on declining earnings', 'Owner holds master electrician license'],
      keyGreenFlags: ['$380K hard equipment assets', '30% service/maintenance revenue (recurring element)', 'No existing debt'],
    },
  },
  {
    caseNumber: 6,
    title: 'Spruce Ridge Landscaping',
    industry: 'Landscaping & Grounds Maintenance',
    difficulty: 2,
    data: {
      company: `Spruce Ridge Landscaping — Commercial Grounds Maintenance & Snow Removal, Colorado

Founded 2007. Owner age 55, wants to transition to consulting. Asking $2.4M.

FINANCIALS:
2022: Revenue $2.8M | EBITDA $420K
2023: Revenue $3.1M | EBITDA $465K
2024: Revenue $3.3M | EBITDA $495K

Revenue mix: 68% commercial maintenance contracts (office parks, HOAs, retail centers), 22% snow removal contracts (same client base), 10% enhancement/project work. 87% of 2024 revenue is contracted going into the season.

Customer concentration: Top customer = 9% (large HOA). Top 5 = 31%. 112 active commercial accounts.

DEAL STRUCTURE: $2.1M at close + $300K seller note at 5.5% over 3 years. Equipment: $520K (5 trucks, 3 skid steers, mowers, snow equipment). No existing debt. Lease: owned property (included in sale at $400K appraised value, or lease-back option at $3,200/month).

OPERATIONS: 31 employees — 24 field crew (mix of H-2B visa workers and domestic), 3 foremen, 2 admin, owner/1 sales rep. Owner handles all new contract sales. H-2B visa program in use for seasonal workers. ServiceCEO software.

SELLER: Credible reason — wants to consult. Has been building a management team for 2 years. Lead foreman has been with the company 9 years.

EVALUATE: Focus on the H-2B visa workforce, seasonality cash flow, real estate decision, and the implied multiple.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Spruce Ridge Landscaping

A. BUSINESS QUALITY: Above average. 87% contracted revenue going into the season is excellent forward visibility — this isn't project-based guessing, it's a known book of business. The snow/maintenance combination on the same client base creates year-round cash flow and reduces the pure seasonality risk typical of landscaping. 112 accounts with no customer above 9% is well-diversified. The 9-year foreman is a genuine asset. The H-2B program is double-edged (see below).

B. FINANCIAL QUALITY: $495K EBITDA on $3.3M = 15% margin — solid for landscaping (industry avg 10–14%). Consistent EBITDA growth. Equipment at $520K is substantial but necessary — model $80–100K/year replacement capex (trucks depreciate fast in Colorado winters). Adjusted EBITDA ≈ $395–415K. Real estate: the included-at-$400K property is complex. If you buy it, you're allocating acquisition capital to real estate — fine if you want it, but it raises your all-in cost and complicates SBA financing. The lease-back at $3,200/month = $38,400/year = meaningful EBITDA reduction if you don't buy. Decide separately: buy the RE or take the lease.

C. SELLER QUALITY: Credible reason. The 2-year management team build is a positive signal — sellers who invest in management before selling are typically genuine, not panicked. The lead foreman's 9-year tenure is the operational continuity anchor. Owner's sales role is a risk but 87% contracted revenue means year-1 revenue is largely locked in regardless.

D. DEAL QUALITY: $2.4M on $415K adjusted EBITDA = 5.78x. Fair to slightly full for a landscaping company with real estate included and strong contracted revenue. Excluding RE ($400K), the business-only price is $2.0M / $415K = 4.82x — reasonable. SBA note: SBA will not finance real estate + business acquisition in one loan cleanly — you'll likely need to structure separately (SBA 7(a) for business + SBA 504 for RE, or conventional real estate loan). DSCR on business only: SBA loan $1.8M / 10yr / 7.5% = ~$255K + seller note $300K/3yr = ~$108K. Total debt service ~$363K on $415K EBITDA = DSCR 1.14x — TOO TIGHT. Re-negotiate: push seller note to 5 years ($72K/year) → DSCR = 1.24x (still tight). Buyout RE separately or leave it. At $2.1M business-only with 5-year seller note: DSCR = ($415K / ($255K + $72K)) = 1.27x — workable.

E. OPERATIONAL OPPORTUNITY: (1) H-2B program management — document it, understand renewal timelines, and have a domestic labor contingency. (2) Owner's sales role: hire a sales rep in year 1 before contracts renew — most HOA and commercial managers are relationships, not personalities. (3) Enhancement work (10%) is high-margin upsell — grow it systematically with existing accounts. (4) Geographic expansion to adjacent markets (Boulder, Fort Collins) with the existing equipment fleet.

F. DECISION: Continue diligence with interest. Negotiate: (1) separate RE from the business deal — offer $2.0M for the business, negotiate RE separately; (2) extend seller note to 5 years for DSCR; (3) verify H-2B status and renewal calendar before close; (4) meet the 9-year foreman and assess leadership capability. If RE is bundled and non-negotiable, model total acquisition at $2.4M all-in and finance RE conventionally. The contracted revenue base and management depth make this a defensible platform acquisition.

TEACHING CONCEPTS: H-2B visa workforce, seasonality cash flow, real estate in acquisitions, SBA 504 vs 7(a), contracted revenue as forward indicator.`,

      teachingConcepts: ['H-2B visa workforce risk', 'Contracted revenue forward visibility', 'Real estate in deal structure', 'SBA 504 vs 7(a)', 'DSCR sensitivity analysis'],
      keyRedFlags: ['H-2B dependency — immigration policy risk', 'DSCR tight as structured (1.14x)', 'Owner is sole sales rep', 'Real estate complicates SBA financing'],
      keyGreenFlags: ['87% contracted revenue entering season', 'Snow + maintenance = year-round cash flow', '9-year lead foreman', '112 accounts, no customer above 9%', '2-year management build before sale'],
    },
  },
  {
    caseNumber: 7,
    title: 'Clearwater Well & Pump Service',
    industry: 'Water Well Services',
    difficulty: 2,
    data: {
      company: `Clearwater Well & Pump Service — Residential & Agricultural Well Drilling & Service, Colorado/Wyoming

Founded 1989. Second-generation owner (age 48) inherited from father. Wants to sell to pursue other ventures. Asking $1.9M.

FINANCIALS:
2022: Revenue $2.1M | SDE $385K
2023: Revenue $2.3M | SDE $415K
2024: Revenue $2.4M | SDE $435K

Revenue mix: 40% new well drilling (residential/agricultural), 35% pump service & repair (recurring call-outs), 25% water testing & treatment systems.

Customer concentration: No single customer above 3% (residential and agricultural — inherently diversified).

DEAL STRUCTURE: $1.7M at close + $200K seller note at 5% over 3 years. Equipment: $680K (2 drill rigs, service trucks, pump inventory). Existing equipment debt: $210K. Month-to-month lease on shop/yard: $2,100/month.

OPERATIONS: 11 employees — 2 licensed well drillers, 3 pump techs, 2 water quality techs, 2 drivers/assistants, 1 office manager, owner. State well driller licenses held by owner and one employee (Jake, 12-year tenure). ServiceTitan in use. Owner handles all estimating and is the face of the business for larger drilling jobs.

REGULATORY: Colorado well drilling is licensed by the Colorado Division of Water Resources. License requires exam + field hours — not transferable. Jake (licensed) is the continuity pin.

EVALUATE: Pay particular attention to the license structure, equipment value vs. deal price, and the inherent characteristics of water well services as an ETA business.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Clearwater Well & Pump Service

A. BUSINESS QUALITY: Excellent ETA fit. Water well services are infrastructure — rural Colorado and Wyoming properties MUST have functioning wells, and there's no municipal water alternative. Pump service/repair (35%) is recurring call-out work driven by equipment failure, not discretionary spend. The water testing component (25%) is growing due to PFAS regulations and increased awareness. No customer above 3% — genuine diversification. 35-year operating history with second-generation ownership suggests durable community relationships. This is precisely the type of business ETA literature (Ruback & Yudkoff) describes as "dull is good."

B. FINANCIAL QUALITY: SDE margins of 18% ($435K / $2.4M) are healthy for a services/equipment hybrid. Revenue growth consistent at ~7% CAGR. Equipment at $680K gross with $210K remaining debt = $470K net equity in equipment — meaningful hard asset support for the acquisition price. After paying off equipment debt ($210K), effective acquisition price for the business is $1.69M ($1.9M - $210K net equipment equity). Real EBITDA multiple on that basis: $1.69M / $435K = 3.9x — very fair. Working capital: pump inventory ($50–75K) + receivables. ServiceTitan is operational signal. Capex: drill rigs are high-cost assets ($300–500K each) — model replacement reserves even if current rigs are serviceable.

C. SELLER QUALITY: Second-generation owner at 48 selling to pursue other ventures is unusual. Probe carefully: (1) Is there a business reason for selling that isn't disclosed? (2) Are there regulatory/legal issues with the well drilling operations? (3) Is the market softening (new housing development, water table issues, regulatory changes)? The relatively young age (48) for exit is a mild flag — ask directly why now, and verify the stated reason is consistent with his lifestyle (new venture already identified? family situation?).

D. DEAL QUALITY: $1.9M on $435K SDE = 4.37x — fair to slightly full, but justified by the equipment base, license infrastructure, and industry defensibility. SBA: 10% down ($190K), loan $1.5M + assume equipment debt $210K = $1.71M total debt. Annual service at 7.5%/10yr = ~$242K + seller note $200K/3yr = ~$70K. Total: ~$312K. DSCR = $435K / $312K = 1.39x — comfortable. Critical: the $210K equipment debt must be addressed in the deal — either paid off at close (cleaner) or assumed (reduces seller's net proceeds but improves your balance sheet).

E. OPERATIONAL OPPORTUNITY: (1) Water testing/treatment (25%) is the highest-growth segment — PFAS regulations are driving demand, and residential well owners are increasingly mandated to test. Build this out. (2) Geographic expansion: Wyoming license already in place — add service territory systematically. (3) Pump service is currently reactive (call-outs) — build a proactive PM program (annual pump inspections) to convert it to recurring revenue. (4) ServiceTitan already in use — build out the service agreement module.

F. DECISION: Submit LOI. This is a textbook ETA target: essential service, non-discretionary, defensible license moat, no customer concentration, hard asset support, clean recurring component, growth in water testing. Structure: $1.7M at close (not $1.9M — negotiate), $200K seller note over 5 years (not 3), pay off equipment debt at close. Confirm Jake (licensed driller) has a written retention agreement and non-compete. Model transition: owner introduces you to all municipal/county contacts and escorts you on the first 5 major drilling quotes.

TEACHING CONCEPTS: Licensed-trades defensibility, equipment debt in deal structure, proactive vs reactive service models, water regulation tailwinds, rural infrastructure businesses.`,

      teachingConcepts: ['Licensed-trade moat', 'Equipment debt in deal structure', 'Water regulation tailwinds', 'Proactive service model conversion', 'Rural infrastructure businesses'],
      keyRedFlags: ['Owner age 48 selling — probe the real reason', 'Owner holds one of two licenses — verify transfer/succession', 'Drill rig replacement capex is large', 'Month-to-month lease on shop/yard'],
      keyGreenFlags: ['35-year history, second-generation', 'No customer above 3%', 'License creates real barrier to entry', 'Water testing is a regulatory growth driver', 'ServiceTitan in use', 'Hard asset support ($470K net equipment equity)', 'Essential infrastructure — non-discretionary'],
    },
  },
  {
    caseNumber: 8,
    title: 'Summit Document Shredding',
    industry: 'Document Destruction / B2B Services',
    difficulty: 2,
    data: {
      company: `Summit Document Shredding — Scheduled & On-Demand Document Destruction, Mountain West

Founded 2010. Owner age 60, ready to retire. Asking $2.8M.

FINANCIALS:
2022: Revenue $1.9M | EBITDA $560K
2023: Revenue $2.0M | EBITDA $595K
2024: Revenue $2.1M | EBITDA $625K

Revenue mix: 78% scheduled recurring service (locked consoles + monthly/quarterly pickup routes), 22% one-time purge jobs.

Customer base: 1,340 active commercial accounts. Largest customer = 4% of revenue. Top 10 = 22% of revenue.

DEAL STRUCTURE: $2.5M at close + $300K seller note at 5% over 4 years. Equipment: $420K (2 shred trucks, route vehicles, consoles). No existing debt.

OPERATIONS: 14 employees — 4 route drivers (CDL), 2 shred operators, 1 sales rep, 1 operations manager, 5 admin/compliance. Owner manages compliance relationships (HIPAA, NAID certification) and one large hospital system account (8% of revenue). NAID AAA Certification in place (annual audit). RouteOptix routing software.

SELLER: Credible retirement. Has been delegating for 3 years. Operations manager has 6 years tenure.

INDUSTRY: Document shredding is a recurring-revenue, compliance-driven business. Customers sign annual or multi-year service agreements. HIPAA, SOX, and FACTA create mandatory demand from healthcare, financial, and legal sectors. Primary national competitors: Shred-it (Stericycle), Iron Mountain, Cintas. Independent operators compete on price and responsiveness in secondary markets.

EVALUATE: Why do ETA investors love document shredding? What's the valuation story and what risks matter?`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Summit Document Shredding

A. BUSINESS QUALITY: Excellent. Document shredding is one of the most-cited ETA targets for good reason: it has nearly everything the literature asks for. Recurring revenue (78% scheduled routes), compliance-driven demand that cannot be turned off (HIPAA violations carry real fines), low customer concentration (1,340 accounts, largest at 4%), real switching costs (changing shredding vendors requires new console agreements and compliance documentation), and a route-density model that improves margins as the account base grows. The NAID AAA certification is a competitive moat — most large enterprises require it as a vendor qualification. This is a "dull is great" business.

B. FINANCIAL QUALITY: 29.8% EBITDA margin ($625K / $2.1M) — exceptional for a services business. This is the route-density effect: marginal revenue on existing routes has near-zero incremental cost. Revenue and EBITDA growing ~5% annually — steady, not spectacular. Capex: shred trucks are expensive ($300–400K each) and have 8–12 year useful lives. Model $50–75K/year replacement reserve. Adjusted EBITDA ≈ $550–575K. Working capital is minimal — customers prepay or are invoiced monthly with good collection. No existing debt is a green flag.

C. SELLER QUALITY: Strong. 3-year delegation pattern before sale = genuine preparation. Operations manager with 6 years tenure holds institutional knowledge. The one flag: owner manages the hospital system account (8% of revenue, ~$168K). Hospital relationships are sticky but compliance-driven — introduce the operations manager to the compliance contact 6 months pre-close and this risk largely evaporates.

D. DEAL QUALITY: $2.8M on $575K adjusted EBITDA = 4.87x. This is fair for document shredding — industry comps run 4–6x EBITDA for sub-$3M EBITDA operators. NAID certification and 1,340-account base support the premium. SBA: 10% down ($280K), SBA loan $2.5M / 10yr / 7.5% = ~$354K + seller note $300K/4yr = ~$84K. Total debt service $438K. DSCR = $575K / $438K = 1.31x — workable but not comfortable. Negotiate: push asking to $2.6M and extend seller note to 5 years → debt service reduces to ~$406K → DSCR = 1.42x. Better.

E. OPERATIONAL OPPORTUNITY: (1) Route density — the highest ROI activity in shredding is adding accounts on existing routes (cost of truck is sunk; marginal revenue is nearly pure margin). Focus sales rep on geographic cluster selling. (2) Hospital system relationship — systematize the compliance reporting to remove owner dependency. (3) One-time purge jobs (22%) are high-margin and relationship-deepening — build a systematic outreach program to existing scheduled customers. (4) NAID certification as sales asset — most competitors in secondary markets lack it; use it in marketing to healthcare and financial accounts.

F. DECISION: Submit LOI at $2.6M ($2.3M at close + $300K seller note over 5 years). This is one of the cleanest ETA targets you'll see at this size. The business quality, recurring revenue profile, compliance moat, and seller preparation are all textbook. Structure transition around: (1) ops manager introduction to hospital system account by month 3 pre-close; (2) full route and account list review in diligence; (3) NAID certification transfer process confirmed before LOI.

TEACHING CONCEPTS: Route density economics, NAID certification moat, compliance-driven demand, shredding industry multiples, adjusted EBITDA for capex-heavy businesses.`,

      teachingConcepts: ['Route density economics', 'Compliance-driven recurring demand', 'NAID certification moat', 'Adjusted EBITDA for capex', 'Why document shredding is an ETA favorite'],
      keyRedFlags: ['Owner manages 8% hospital account', 'DSCR 1.31x as structured — tight', 'Shred truck replacement capex is lumpy'],
      keyGreenFlags: ['29.8% EBITDA margin', '78% recurring scheduled revenue', '1,340 accounts, largest at 4%', 'NAID AAA certification = compliance moat', '3-year delegation before sale', 'No existing debt', 'Compliance demand cannot be turned off (HIPAA/SOX)'],
    },
  },
  {
    caseNumber: 9,
    title: 'Alpine Fire Protection Systems',
    industry: 'Fire Protection',
    difficulty: 3,
    data: {
      company: `Alpine Fire Protection Systems — Inspection, Testing & Maintenance of Fire Suppression Systems, Colorado

Founded 2001. Owner age 57, partner buyout situation — 50/50 partner wants liquidity, founding owner wants to stay on as minority equity holder and CEO. Asking $4.1M for 75% of the company (partner's 50% + owner's 25%).

FINANCIALS (full company):
2022: Revenue $3.6M | EBITDA $680K
2023: Revenue $3.9M | EBITDA $740K
2024: Revenue $4.1M | EBITDA $790K

Revenue mix: 60% annual inspection & testing contracts (code-mandated), 25% repair & service, 15% new system installation.

Customer mix: Commercial property (38%), healthcare (22%), education (18%), industrial (22%). No single customer above 6%.

DEAL STRUCTURE: $3.7M at close + $400K seller note (from exiting partner only) at 6% over 3 years. Remaining owner receives 25% equity in new entity, continues as CEO at $175K/year.

Equipment: $290K. No existing debt. Real estate: leased, 5-year term with 3 remaining.

OPERATIONS: 26 employees — 8 licensed fire protection technicians (NICET certifications, levels II–IV), 4 installers, 3 apprentices, 3 admin, 2 sales, owner/CEO, ops manager. NICET-certified technicians are scarce — industry-wide shortage.

EVALUATE: This is a complex deal structure. The quality is high — so is the price. Work through the governance, the NICET scarcity, and what the owner's retained equity means for your returns.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Alpine Fire Protection Systems

A. BUSINESS QUALITY: Very high. Fire protection inspection is code-mandated — buildings MUST have annual inspections regardless of economic conditions. This is as close to guaranteed recurring revenue as exists in ETA. The inspection-to-repair funnel (inspectors find deficiencies → repairs are upsell opportunities to existing customers) creates a natural revenue compounding loop. NICET certifications (especially Levels III–IV) are scarce — technicians take 2–3 years to certify and competition for them is fierce. This scarcity creates a genuine labor barrier to entry. No customer above 6%, diversified across property types.

B. FINANCIAL QUALITY: 19.3% EBITDA margin ($790K / $4.1M) — strong for a services/inspection business. Consistent growth. Normalization: owner/CEO at $175K — verify this is at or below market for a $4M revenue CEO. Capex is low (test equipment, not heavy machinery). Real adjusted EBITDA is close to reported. No existing debt. The deal gets complex because you're buying 75% — your effective EBITDA ownership is 75% × $790K = $592K. But you bear 100% of the debt service. Model returns on total acquisition cost vs. 75% of earnings.

C. SELLER QUALITY: The STRUCTURE is the key issue again. Exiting partner wants full liquidity (appropriate). Founding owner retaining 25% and staying as CEO is a genuine asset — continuity, relationships, culture. But it introduces complexity: (1) What are the governance rights? As the 75% owner, do you control the board? (2) What is the buyout mechanism for the remaining 25%? (3) What if owner/CEO underperforms or wants to leave? You need a shareholder agreement with drag-along, put/call options, and clear vesting/clawback provisions from day one.

D. DEAL QUALITY: $4.1M for 75% implies $5.47M full-company value. At $790K EBITDA = 6.9x — FULL valuation for fire protection. Comparable transactions for inspection-heavy fire protection companies trade at 6–8x EBITDA, so you're at the high end of fair. SBA: $3.7M is above the standard SBA 7(a) loan limit ($5M total, but your equity injection needs to be ~$370K). Consider SBA 504 or conventional + mezzanine. Debt service on $3.3M at market rates ≈ $467K + seller note $400K/3yr = ~$140K. Total ~$607K. Your share of EBITDA: 75% × $790K = $592K. DSCR = $592K / $607K = 0.97x — BELOW 1.0x. This deal does not service its debt on day one from your equity share alone. You need the full $790K as the entity's cash flow (which it generates — you just don't own all of it). Restructure: extend seller note to 5 years → $607K becomes ~$547K → DSCR on full entity EBITDA = 1.44x. As a 75% owner, DSCR on your equity economics = 0.97x — this is why partial acquisitions are structurally difficult.

E. OPERATIONAL OPPORTUNITY: (1) NICET technician pipeline — build apprenticeship program now; the 3 apprentices are a start. (2) Healthcare segment (22%) — Joint Commission requirements mean fire protection inspection is essentially mandatory with zero price sensitivity. Target this segment aggressively. (3) Inspection-to-repair conversion rate — track this KPI and train technicians to document all deficiencies (they often under-report to be liked by customers). (4) Geographic expansion — fire protection licenses are state-specific but NICET certifications are national; add WY and NM with existing staff.

F. DECISION: Proceed with significant structure negotiation. The business is excellent. The deal structure has solvable problems: (1) negotiate full company acquisition (100%) with owner receiving rollover equity in the acquirer entity rather than retaining operating company shares — cleaner governance; (2) establish shareholder agreement with 3-year buy-out rights at defined multiple; (3) restructure debt to extend seller note to 5 years minimum; (4) price is at the high end — push for $3.9M total ($3.5M at close + $400K note) for the 75%. If structure issues can't be resolved cleanly, the business quality is strong enough to walk from this specific deal and find the same quality without the complexity.

TEACHING CONCEPTS: Partial acquisition return math, NICET scarcity as moat, inspection-to-repair funnel, code-mandated recurring revenue, shareholder agreement provisions.`,

      teachingConcepts: ['Partial acquisition return math', 'NICET certification scarcity moat', 'Inspection-to-repair revenue funnel', 'Code-mandated demand', 'Shareholder agreement provisions'],
      keyRedFlags: ['DSCR below 1.0x on equity share economics', '75% acquisition — governance complexity', 'NICET technician scarcity = talent risk', '6.9x EBITDA — top of range', 'No clear path to 100% ownership'],
      keyGreenFlags: ['Code-mandated annual inspections — non-discretionary', 'NICET certifications = barrier to entry', '60% recurring inspection contracts', 'No customer above 6%', 'Low capex', 'Founding owner staying as CEO (continuity)'],
    },
  },
  {
    caseNumber: 10,
    title: 'Heartland Septic & Environmental',
    industry: 'Septic Services / Environmental',
    difficulty: 3,
    data: {
      company: `Heartland Septic & Environmental — Septic Pumping, Inspection & Remediation, Rural Colorado

Founded 2006. Owner age 61, third time trying to sell — previous two deals failed to close. Asking $1.65M.

FINANCIALS:
2021: Revenue $1.4M | SDE $290K
2022: Revenue $1.5M | SDE $305K
2023: Revenue $1.6M | SDE $320K
2024: Revenue $1.1M | SDE $185K (as of September — first 9 months)

Revenue annualized from Q1–Q3 2024: $1.47M. Owner says Q4 is typically the slowest quarter. Previous years show Q4 at 18–22% of annual revenue.

Customer mix: Residential homeowners (72%), commercial/restaurant (18%), county municipal contracts (10%).

DEAL STRUCTURE: $1.5M at close + $150K seller note at 6% over 2 years. Equipment: $380K (3 pump trucks, inspection cameras, remediation equipment). Existing equipment debt: $95K. License: month-to-month, $1,400/month for yard/dispatch.

OPERATIONS: 9 employees — 3 licensed septic technicians (state certification), 2 pump truck drivers, 2 remediation crew, 1 dispatcher, owner. Owner holds one of three state septic licenses. Colorado OWTS (Onsite Wastewater Treatment System) regulations require licensed operators.

SELLER: Third attempt to sell. Previous reasons for failure not disclosed. Cash flow dip in 2024 attributed by owner to "equipment downtime and one slow commercial client."

EVALUATE: The declining 2024 financials, the third-attempt-to-sell flag, and the partial-year reporting require careful analysis. What's real?`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Heartland Septic & Environmental

A. BUSINESS QUALITY: Structurally good, situationally uncertain. Septic services share the non-discretionary, essential-service characteristics of well drilling and water treatment. Rural Colorado residential homeowners have no alternative to periodic septic pumping (typically every 3–5 years), and regulatory inspection requirements at point of sale drive demand. County municipal contracts (10%) are sticky, long-cycle revenue. The state OWTS certification creates a real barrier to entry. However, the 2024 financial deterioration and third failed sale require explanation before quality can be assessed.

B. FINANCIAL QUALITY: The 2024 numbers are the entire story. Through September, revenue is $1.1M vs. $1.6M full-year 2023 — a 30%+ pace decline. Owner attributes this to equipment downtime and one slow commercial client. Two scenarios: (1) BENIGN — one major pump truck was down for 2–3 months (common; a rebuilt transmission on a Vactor truck can be 8 weeks) and a commercial client paused. Revenue recovers in Q4 and 2025. (2) CONCERNING — a major commercial client churned, a key technician left, or a regulatory/permit issue is reducing billable jobs. You cannot know which without the full year's data. DO NOT close a deal with September actuals on a business with a 30% revenue gap. Require Q4 financials before LOI or escrow a significant portion of purchase price in earnout.

C. SELLER QUALITY: Third attempt is a major flag. Ask the broker (or seller directly) exactly why each previous deal failed. Common answers: (1) financing fell through (buyer's problem, not seller's) — benign; (2) diligence revealed something — serious; (3) buyer got cold feet — benign; (4) seller demanded all-cash and buyers refused — signals. The two-year seller note at a low amount ($150K on a $1.65M deal = only 9% deferred) is a mild concern — a seller who truly believes in the business and has nothing to hide should be willing to take more on a note. Request 20–25% seller financing.

D. DEAL QUALITY: Based on 2023 trailing SDE ($320K): $1.65M / $320K = 5.16x — full. Based on LTM adjusted SDE (using owner's Q4 explanation): estimated full-year 2024 SDE ≈ $230–260K → 6.3–7.2x — overpriced. You should price this deal off verified LTM, not 2023. If 2024 comes in at $260K SDE full year: $1.2M is a fair price (4.6x). The gap between asking ($1.65M) and fair value ($1.2M) is your negotiating room.

E. OPERATIONAL OPPORTUNITY: Septic is ripe for systematic service agreement conversion. Most residential customers are reactive (call when the system backs up) — converting to proactive inspection agreements (every 3 years at $350/visit) at 40% of the residential base creates meaningful MRR. The county municipal contracts are underutilized — most rural Colorado counties have inadequate inspection capacity and would welcome a reliable licensed operator.

F. DECISION: Do not submit LOI until Q4 2024 actuals are in hand (January 2025 at the earliest). If full-year 2024 SDE is above $280K and the explanation for the dip is confirmed (equipment invoice + commercial client correspondence), submit LOI at $1.25M ($1.0M at close + $250K seller note over 4 years) — fair for the risk. If full-year 2024 comes in below $250K, pass or offer $900K. The business is structurally sound; the uncertainty is entirely about 2024. Refusing to close on partial-year data is basic acquisition hygiene that every experienced searcher follows.

TEACHING CONCEPTS: Partial-year financials, earnout as uncertainty pricing tool, third-failed-sale investigation, OWTS regulatory demand, service agreement conversion.`,

      teachingConcepts: ['Partial-year financial analysis', 'Third-failed-sale investigation', 'Earnout as risk pricing', 'Septic/OWTS regulatory demand', 'Seller financing as confidence signal'],
      keyRedFlags: ['Third attempt to sell', '30%+ revenue decline in 2024 Q1–Q3', 'Reasons for prior deal failures not disclosed', 'Only 9% of price on seller note', 'Partial-year financials — Q4 critical'],
      keyGreenFlags: ['OWTS license creates barrier to entry', 'Non-discretionary demand (septic pumping)', 'County municipal contracts (sticky)', 'Equipment supports hard asset value'],
    },
  },
  {
    caseNumber: 11,
    title: 'Rockies Industrial Coatings',
    industry: 'Specialty Coatings / Industrial Services',
    difficulty: 3,
    data: {
      company: `Rockies Industrial Coatings — Epoxy Flooring, Industrial Coatings & Surface Prep, Colorado/Wyoming

Founded 2014. Owner age 44, wants to move to a GM role under a new owner and grow the business. Asking $2.6M.

FINANCIALS:
2022: Revenue $2.8M | EBITDA $490K
2023: Revenue $3.4M | EBITDA $595K
2024: Revenue $3.9M | EBITDA $665K

Revenue mix: 40% commercial new construction (GC subcontracts), 35% industrial maintenance (chemical plants, food processing, warehouses), 25% government/municipal (DOT projects, wastewater facilities).

Customer concentration: Top GC = 22% of revenue. DOT contract = 14%. Top 5 = 61%.

DEAL STRUCTURE: $2.3M at close + $300K seller note at 5.5% over 3 years. Equipment: $420K. Existing equipment debt: $150K. Lease: 4 years remaining at $3,800/month.

OPERATIONS: 24 employees — 8 certified coatings applicators (NACE certifications), 6 surface prep crew, 4 laborers, 2 estimators, 1 project manager, 2 admin, owner. Owner wants to stay as GM at $130K. NACE-certified applicators are scarce nationally.

EVALUATE: Fast-growing business but high project concentration and GC dependency. The owner's desire to stay as GM is worth analyzing carefully.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Rockies Industrial Coatings

A. BUSINESS QUALITY: Mixed. The industrial maintenance segment (35%) is genuinely recurring — chemical plants and food processing facilities need floor coating maintenance on fixed cycles, and switching applicators mid-cycle is disruptive. The government/municipal segment (25%) has long cycle times and is sticky once certified. The commercial construction segment (40%) is project-based, GC-dependent, and cyclical. The NACE certifications create a real barrier — many projects require certified applicators and the certification takes 2+ years. The 40% growth from 2022 to 2024 is impressive but raises a question: is this organic account expansion or is one large relationship driving it?

B. FINANCIAL QUALITY: 17% EBITDA margin growing consistently is solid for a coatings business. However, 40% construction revenue + 61% top-5 concentration = significant cyclical and concentration risk. The 39% revenue increase over 2 years ($2.8M → $3.9M) needs explanation: if it's driven by the top GC (22%), revenue could reverse sharply if that relationship changes. Normalize for cyclical downturn: industrial maintenance + government (60% of revenue) at current margins = $390K EBITDA floor in a construction downturn. $2.6M / $390K floor EBITDA = 6.7x — overpriced at the floor. Equipment debt of $150K reduces net equity.

C. SELLER QUALITY: Owner at 44 wanting to stay as GM is unusual and requires probing. Positive interpretation: owner has built a good business, wants financial liquidity, and genuinely enjoys the work. Concerning interpretation: owner has personal financial needs (debt, divorce, tax situation) that require an immediate liquidity event. A 44-year-old GM who believes in the business would typically seek growth equity or a partial sale, not a full exit to a search fund buyer. Verify: (1) is there a specific personal financial driver? (2) how does ownership change the owner's incentives — will a $130K salary feel like a demotion to someone who was drawing $250K+ as owner-operator?

D. DEAL QUALITY: $2.6M on $665K EBITDA = 3.9x — ATTRACTIVE on peak earnings. 3.9x is cheap for the industrial maintenance/government portion of the business. The risk is that you're paying for earnings that include a cyclical construction component. Normalize to mid-cycle EBITDA ($500K, removing some construction upside): $2.6M / $500K = 5.2x — fair. DSCR: SBA $2.3M / 10yr / 7.5% = ~$325K + seller note $300K/3yr = ~$108K. Total ~$433K. DSCR on peak EBITDA ($665K) = 1.54x. On mid-cycle ($500K) = 1.15x — getting tight.

E. OPERATIONAL OPPORTUNITY: (1) Grow industrial maintenance — this is the best part of the business. Target chemical plants, food processing, pharmaceutical. (2) Reduce construction dependency from 40% to 25% over 3 years. (3) Government/DOT pipeline — NACE certifications are required for most government work; leverage this into more government accounts. (4) Owner/GM structure: give owner equity participation (5–10% carry on exit) instead of just salary — aligns incentives properly.

F. DECISION: Continue diligence, conditional interest. Price is attractive for the industrial/government portion. Key diligence items: (1) revenue bridge — prove the $1.1M growth is not concentrated in the top GC; (2) owner motivation — direct conversation about personal financial situation; (3) industrial maintenance contract review — are these real recurring contracts with stated terms or are they relationship-based? (4) NACE certification headcount — verify 8 certified applicators are W-2 employees with non-competes, not independent contractors. If top GC concentration is benign (diversified projects, not a single relationship) and owner motivation is genuine, LOI at $2.4M with owner retaining 5% equity roll to align incentives.

TEACHING CONCEPTS: Cyclical vs. recurring revenue mix, peak vs. mid-cycle EBITDA normalization, owner-GM incentive alignment, NACE certifications as barrier, construction sector concentration.`,

      teachingConcepts: ['Peak vs mid-cycle EBITDA normalization', 'Construction sector concentration risk', 'Owner-GM incentive alignment', 'NACE certification barrier', 'Cyclical stress testing'],
      keyRedFlags: ['22% revenue from top GC', '61% top-5 concentration', '40% construction = cyclical exposure', 'Owner age 44 — full exit unusual', 'DSCR 1.15x at mid-cycle EBITDA'],
      keyGreenFlags: ['NACE certifications = barrier to entry', 'Industrial maintenance = recurring demand', 'Government/DOT = sticky contracts', '17% EBITDA margin', 'Consistent 3-year growth trajectory'],
    },
  },
  {
    caseNumber: 12,
    title: 'Colorado Utility Locating Services',
    industry: 'Utility Locating / Infrastructure Services',
    difficulty: 3,
    data: {
      company: `Colorado Utility Locating Services — Private Utility Locating, Colorado

Founded 2011. Owner age 50. No stated reason for selling — approached by a broker. Asking $3.4M.

FINANCIALS:
2022: Revenue $2.9M | EBITDA $610K
2023: Revenue $3.1M | EBITDA $655K
2024: Revenue $3.3M | EBITDA $700K

Revenue mix: 55% public utility locate tickets (811 system, municipalities), 35% construction & excavation company relationships, 10% emergency locates.

Customer concentration: Top customer = 8% (large regional excavation company). Top 5 = 34%.

DEAL STRUCTURE: $3.0M at close + $400K seller note at 5% over 4 years. Equipment: $280K. No existing debt. Lease: 3-year remaining at $2,400/month.

OPERATIONS: 21 employees — 14 field locators (certified through the Common Ground Alliance), 3 supervisors, 2 admin, owner, 1 dispatch manager. Owner handles all business development and municipality relationships. State registration required; equipment calibration required annually.

SELLER: No disclosed reason — this is a broker-initiated sale. Owner is 50.

INDUSTRY: Utility locating is a federally mandated service (811 law requires notification and locating before any excavation). Every construction project, municipality, and homeowner that digs must call 811 and have utilities located. Demand is tied to construction activity but the 811 mandate creates a floor.

EVALUATE: Owner age 50 with no stated reason for selling and a broker-initiated approach. What does this signal, and how do you approach the deal?`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Colorado Utility Locating Services

A. BUSINESS QUALITY: Strong. Utility locating sits at the intersection of regulatory mandate and construction activity. The 811 federal law means that for every ground disturbance in the US — whether a homeowner planting a tree or a GC laying conduit — a locate ticket must be submitted. This creates genuine demand diversification: it's not one customer type, it's everyone who digs. The Common Ground Alliance certifications create a barrier (not insurmountable, but real). The 21.2% EBITDA margin is healthy for a field-services business with meaningful labor costs.

B. FINANCIAL QUALITY: Clean, consistent growth. $610K → $700K EBITDA (14.7% CAGR) with consistent margins. No existing debt. Equipment at $280K is relatively modest for 21 employees — most is trucks and locating equipment, not heavy iron. Real adjusted EBITDA after capex reserves ($40–50K/year for equipment calibration, truck maintenance) ≈ $650K. $3.4M / $650K = 5.23x — reasonable for a growing, asset-light utility services business with regulatory mandate.

C. SELLER QUALITY: THIS IS THE KEY ISSUE. A 50-year-old owner with no stated reason for selling and a broker-initiated approach is a material flag. This isn't retirement age. The most likely explanations in order of frequency: (1) PE roll-up approach — a private equity firm approached the owner about an industry roll-up and the owner is now "testing the market" to understand value; (2) personal financial event — divorce, estate planning, co-investor buyout need; (3) owner is burned out or facing a health issue not publicly disclosed; (4) competitive threat or contract loss coming — the owner knows something about the business trajectory that you don't. You MUST get a direct, specific answer before proceeding. "I was approached by a broker" is not a reason. It's a mechanism.

D. DEAL QUALITY: $3.4M on $650K adjusted EBITDA = 5.23x. Fair. SBA: 10% down ($340K), loan $3.0M / 10yr / 7.5% = ~$424K + seller note $400K/4yr = ~$111K. Total debt service $535K. DSCR = $650K / $535K = 1.21x — BELOW SBA's typical comfort level. Negotiate: push to $3.1M at close ($300K reduction) and extend seller note to 5 years → debt service drops to ~$493K → DSCR = 1.32x. Better. 811 mandate means revenue floor even in construction downturns — a 20% construction slowdown probably reduces revenue 12–15%, EBITDA floor ~$560K → DSCR = 1.14x on restructured deal. Tight but survivable.

E. OPERATIONAL OPPORTUNITY: (1) Municipality relationship expansion — 811 contract relationships with utilities are long-cycle and high-value. Owner manages these personally; hire a municipal account manager in year 1. (2) Emergency locates (10%) command premium pricing — build a systematic emergency response capability with 2-hour SLA. (3) Geographic expansion — CGA certifications are national; expand into adjacent states (WY, NM, UT) with recruited locators.

F. DECISION: Continue diligence ONLY after getting a direct, credible answer to "why are you selling now?" If the reason is a PE roll-up test (common at this revenue level), you're in a competitive process and the seller may use your interest to validate a higher price. If the reason is personal/financial, proceed with full diligence. If the seller evades the question, pass. The business quality is strong enough to pursue but not so unique that you should accept seller opacity.

TEACHING CONCEPTS: Broker-initiated deals, seller motivation investigation, 811 mandate as regulatory demand floor, DSCR stress testing, municipal relationship transition.`,

      teachingConcepts: ['Broker-initiated deal signals', 'Seller motivation at unusual age', '811 mandate as regulatory floor', 'DSCR below SBA comfort level', 'Municipal relationship transition risk'],
      keyRedFlags: ['50-year-old with no stated reason for selling', 'Broker-initiated — not owner-driven', 'DSCR 1.21x — below SBA comfort', 'Owner manages all municipality relationships'],
      keyGreenFlags: ['811 federal mandate = regulatory demand floor', 'CGA certifications = barrier', '21.2% EBITDA margin', 'No existing debt', 'Consistent growth trajectory', 'Revenue diversified across all who dig'],
    },
  },
  {
    caseNumber: 13,
    title: 'Mesa County Portable Restroom Services',
    industry: 'Portable Sanitation / Waste Services',
    difficulty: 2,
    data: {
      company: `Mesa County Portable Restroom Services — Portable Sanitation Rental & Service, Western Colorado

Founded 2003. Owner age 67, health-driven retirement. Asking $1.1M.

FINANCIALS:
2022: Revenue $1.2M | SDE $240K
2023: Revenue $1.3M | SDE $265K
2024: Revenue $1.35M | SDE $280K

Revenue mix: 45% construction site rentals (weekly service), 35% events (festivals, fairs, weddings), 20% long-term rural/residential placements.

Customer concentration: No single customer above 4% (highly diversified).

DEAL STRUCTURE: $950K at close + $150K seller note at 5% over 3 years. Equipment: $420K (105 portable units, 2 service trucks, 1 vacuum truck). No existing debt.

OPERATIONS: 6 employees — 3 service route drivers, 1 office manager, 1 delivery/setup, owner. Owner handles all GC relationships and event booking. Simple scheduling software. No CRM.

SELLER: Age 67, health issues — credible retirement. Business has been "coasting" for 2 years per the owner.

INDUSTRY: Portable sanitation is highly fragmented, route-based, and semi-recurring. Construction sites create multi-week predictable demand. Events are seasonal. Rural placements are recurring. Barriers to entry: vacuum truck cost (~$150K used), unit inventory, route density.

EVALUATE: A simple, durable, cash-generative small business. What's the right way to think about this?`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Mesa County Portable Restroom Services

A. BUSINESS QUALITY: Solid, simple, durable. Portable sanitation is recession-resistant (construction may slow, but it doesn't stop; events don't disappear; rural placements are permanent). The route-based model creates geographic density — once you have routes, adding a unit is nearly zero marginal cost. The equipment ($420K with no debt) represents genuine hard asset coverage. "Dull is good" in its purest form. Risks: event business (35%) is seasonal and can be disrupted by weather or cancelations; construction (45%) is mildly cyclical; owner "coasting" for 2 years signals potential under-investment.

B. FINANCIAL QUALITY: SDE of $280K on $1.35M revenue = 20.7% margin — excellent for a route services business. Growth is modest (6% CAGR) but steady. The coasting signal means the real growth opportunity is likely 10–15% with basic effort. No existing debt against $420K equipment is a very clean balance sheet. Capex: portable units last 10–15 years; vacuum truck needs $20–30K/year maintenance. Real adjusted SDE ≈ $250–260K after normalized capex. Hard asset coverage: $420K equipment vs. $1.1M asking = you're paying $680K for the business above hard assets — $680K / $260K = 2.6x normalized SDE for the intangible value. Very reasonable.

C. SELLER QUALITY: Age 67, health-driven, 2 years of coasting — credible and transparent. The coasting disclosure is actually a positive honesty signal. The risk is that the business may have been under-marketed during this period — verify whether the GC relationships and event bookings are current or deteriorating. Check whether 2024 bookings are already locked in vs. dependent on active owner selling.

D. DEAL QUALITY: $1.1M on $260K adjusted SDE = 4.2x — fair to slightly full for the industry but appropriate given hard asset coverage. SBA: 10% down ($110K), SBA loan $990K / 10yr / 7.5% = ~$140K + seller note $150K/3yr = ~$53K. Total debt service ~$193K. DSCR = $260K / $193K = 1.35x — comfortable. Cash-on-cash: $260K SDE - $193K debt service = $67K free cash to equity on $110K invested = 61% in year one. Solid, not spectacular — but this is a platform, not a finished product. With basic growth effort (hire a salesperson), EBITDA at $350K in year 3 is realistic.

E. OPERATIONAL OPPORTUNITY: This is where the real value is. (1) Construction market outreach — the GC relationships are there but dormant; a half-time inside sales person calling GCs for job bids would materially increase units deployed. (2) Event bookings — digitize the booking process (most competitors are phone/email only); online booking conversion in the event market is 20–40% uplift. (3) Rural placements — recurring, low-service-frequency revenue; market to rural acreages and seasonal properties in Western Colorado. (4) Add 20–25 units for $25–35K to increase capacity. (5) Wash station upsell — hand wash stations are high-margin add-ons to every unit placement.

F. DECISION: Submit LOI at $1.05M ($900K at close + $150K seller note over 4 years). This is a classic ETA acquisition — simple, durable, asset-backed, with a clear operational opportunity that doesn't require brilliance, just execution. The seller is motivated, the financials are clean, and the industry is defensible. Structure transition around: (1) 90-day overlap with seller to transfer GC and event relationships; (2) full customer list review; (3) equipment inspection by independent mechanic before close.

TEACHING CONCEPTS: Route-based business economics, hard asset coverage as valuation floor, owner-coasting transition, cash-on-cash return calculation, platform vs. finished product thinking.`,

      teachingConcepts: ['Route economics', 'Hard asset coverage as valuation floor', 'Cash-on-cash return', 'Coasting business transition', 'Platform acquisition thinking'],
      keyRedFlags: ['Business "coasting" for 2 years — potential revenue deterioration', 'No CRM — weak systems', 'Owner handles all GC and event bookings', 'Event business (35%) is seasonal/weather-dependent'],
      keyGreenFlags: ['$420K equipment with no debt — strong hard asset support', '20.7% SDE margin', 'No customer above 4%', 'Route density economics', 'Credible retirement reason', '1.35x DSCR comfortable'],
    },
  },
  {
    caseNumber: 14,
    title: 'Foothills Irrigation & Drainage',
    industry: 'Irrigation Services',
    difficulty: 3,
    data: {
      company: `Foothills Irrigation & Drainage — Commercial & Residential Irrigation Systems, Front Range Colorado

Founded 2009. Owner age 46. Second buyer the business has been under LOI with in 18 months. First LOI fell apart when the SBA appraisal came in 22% below purchase price. Asking $1.75M.

FINANCIALS:
2022: Revenue $2.4M | SDE $295K
2023: Revenue $2.6M | SDE $310K
2024: Revenue $2.7M | SDE $330K

Revenue mix: 38% commercial maintenance contracts (HOAs, commercial properties), 32% installation (new systems), 30% repair & service.

Customer concentration: Largest HOA management company = 17% of revenue (controls 8 HOA accounts). Top 5 = 45%.

DEAL STRUCTURE: $1.6M at close + $150K seller note at 5.5% over 2 years. Equipment: $310K. Existing equipment debt: $85K. Month-to-month shop lease: $2,600/month.

OPERATIONS: 19 employees — 6 irrigation technicians (Irrigation Association certified), 4 install crews, 3 service techs, 2 admin, owner, 1 foreman (7 years). Seasonal: full staff April–October, skeleton crew November–March. Owner handles all commercial account relationships and estimating.

SELLER: No disclosed reason beyond "ready for a change." Age 46. Under LOI twice.

EVALUATE: The prior SBA appraisal failure is the critical issue. Why would an appraisal come in 22% below asking? What does this tell you, and how do you structure around it?`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Foothills Irrigation & Drainage

A. BUSINESS QUALITY: Moderate. Irrigation is semi-recurring (maintenance contracts are renewing annual agreements; repairs are call-outs; installations are project-based). The 38% commercial maintenance base is real recurring cash. The Irrigation Association certifications and 7-year foreman provide some continuity. Risks: strong seasonal concentration (70%+ of revenue in April–October), the HOA management company at 17% concentration is concerning (HOA management companies go to bid every 3–5 years — losing that account costs $459K in revenue), and the owner handles all commercial estimating.

B. FINANCIAL QUALITY: SDE of $330K on $2.7M = 12.2% margin — below average for an irrigation contractor (industry avg 14–18%). Revenue growth is steady but margin hasn't improved with scale, suggesting either pricing pressure or cost creep. The SBA appraisal coming in 22% below asking is a critical signal: SBA appraisers use a combination of asset value, income capitalization, and market comps. A 22% gap means either (1) the income being claimed as SDE is not fully supportable in the appraisal methodology, (2) the asset values are overstated, or (3) market comps for irrigation companies in this size range simply don't support the multiple. Normalize: what is the true owner add-back? If the owner is drawing $200K and market replacement is $130K, you can only add back $70K — not the full $200K. Re-examine every add-back.

C. SELLER QUALITY: Age 46 with two LOIs failing and no disclosed reason for selling. First LOI failed on SBA appraisal — either the seller refused to adjust price (stubborn) or the buyer walked rather than restructure. The second LOI is presumably yours to evaluate. A seller who won't adjust price after an independent appraisal says 22% lower is telling you something about their expectations vs. market reality. The 17% HOA management concentration at an HOA management company also means that customer could be at risk if a new owner is perceived as unknown/unproven. HOA managers switch vendors when they get a reason to.

D. DEAL QUALITY: $1.75M on $330K SDE = 5.3x — full price for this quality level. After SBA appraisal experience, the real question is: what does a supportable SBA deal look like? If the SBA appraised at $1.35M ($1.75M × 0.78), you need to find a way to bridge the gap. Options: (1) restructure deal at $1.4M total ($1.25M at close + $150K seller note) — this accepts the appraisal reality; (2) bring more equity (20–25% down instead of 10%) to reduce the required loan amount below the appraised value; (3) conventional financing instead of SBA (harder to qualify, shorter terms, higher rates). The $85K equipment debt reduces net asset value. DSCR on $1.4M deal: SBA loan ~$1.25M / 10yr / 7.5% = ~$177K + seller note $150K/2yr = ~$79K. Total ~$256K. DSCR = $330K / $256K = 1.29x — workable.

E. OPERATIONAL OPPORTUNITY: (1) HOA concentration is the biggest risk and the biggest opportunity — grow the commercial base to reduce dependence. (2) Hire a commercial estimator/sales rep to replace owner function — this is essential pre-close, not post-close. (3) Seasonal cash flow management: irrigation businesses are cash-negative in winter; build a $75–100K line of credit for the November–March trough. (4) Water efficiency compliance — Colorado municipalities are increasingly mandating smart irrigation controllers for commercial properties; position the company as a compliance resource.

F. DECISION: Conditional interest with price restructuring required. Offer $1.45M total ($1.3M at close + $150K seller note over 3 years). This represents fair value given the appraisal evidence. If seller refuses to accept the market-based price reduction, pass. A seller who insists on a price that an independent appraiser and a prior buyer have both rejected is a seller who will be difficult in every stage of the deal. The business has real value at the right price; the stubbornness on valuation is the risk.

TEACHING CONCEPTS: SBA appraisal mechanics, add-back scrutiny, seasonal cash flow management, HOA concentration risk, price adjustment after appraisal failure.`,

      teachingConcepts: ['SBA appraisal mechanics', 'Add-back scrutiny', 'Seasonal working capital', 'HOA management concentration risk', 'Price adjustment after failed appraisal'],
      keyRedFlags: ['SBA appraisal came in 22% below asking', 'Under LOI twice — seller price stubbornness', 'Age 46, no disclosed reason for selling', '17% HOA management company concentration', 'Owner handles all commercial estimating', 'Seasonal: skeleton crew Nov–March'],
      keyGreenFlags: ['38% recurring maintenance contracts', 'Irrigation Association certifications', '7-year foreman tenure', 'Steady 3-year revenue growth', 'Smart irrigation = growth tailwind'],
    },
  },
  {
    caseNumber: 15,
    title: 'Western Slope Propane Distribution',
    industry: 'Propane Distribution',
    difficulty: 4,
    data: {
      company: `Western Slope Propane Distribution — Retail Propane Supply & Tank Rental, Rural Colorado

Founded 1987. Owner age 70, heirs not interested, estate planning driven exit. Asking $5.2M.

FINANCIALS:
2022: Revenue $3.8M | EBITDA $890K
2023: Revenue $3.4M | EBITDA $795K
2024: Revenue $3.6M | EBITDA $840K

Revenue mix: 65% residential heating fuel delivery (recurring, auto-fill accounts), 20% tank rental income, 15% commercial/agricultural deliveries.

Customer base: 2,800 residential accounts. Average 12-year customer tenure. Annual churn: 4%. Largest customer = 1.2% of revenue.

DEAL STRUCTURE: $4.8M at close + $400K seller note at 5% over 5 years. Equipment: $1.4M (4 bobtail delivery trucks, 1 transport truck, 2,200 owned tanks at residential/commercial accounts). Existing equipment debt: $220K. Leased terminal/storage: 10-year lease with 6 remaining at $4,800/month.

OPERATIONS: 14 employees — 4 CDL drivers (Hazmat certified), 2 service techs, 3 office/dispatch, owner, 2 delivery helpers, GM (8 years tenure). Owner has been semi-retired for 3 years — GM runs day-to-day. Regulatory: DOT compliance, NFPA 58 (propane safety code), state LP gas licensing.

SELLER: Age 70, estate planning, heirs not interested. Owner has been semi-retired for 3 years. GM runs the business. Credible reason; business is well-prepared for transition.

INDUSTRY: Rural propane is an infrastructure utility. Off-grid homes, farms, and rural businesses have no natural gas access and depend entirely on propane for heat, cooking, and process heat. Customer tank ownership is the economic moat: the company owns tanks at customer premises; switching requires scheduling a competitor to exchange the tank, which 95%+ of customers never bother with. Propane distribution is one of Permanent Equity's archetypal acquisitions.

EVALUATE: Largest and most complex case so far. Work through the full investment committee framework including the tank asset base, the GM succession, and the propane distribution economics.`,

      expertAnswer: `INVESTMENT COMMITTEE REVIEW — Western Slope Propane Distribution

A. BUSINESS QUALITY: Exceptional. Propane distribution for rural residential heating is as close to a utility as a private small business gets. The 2,800 residential accounts with 12-year average tenure and 4% annual churn means that in any given year you lose 112 accounts and need 112 replacements just to stay flat — but that math also means 96% of your customers will be with you next year, generating predictable fuel and rental revenue. The 2,200 owned tanks sitting at customer premises are the economic moat: every tank represents a customer who cannot easily switch. This is a subscription business disguised as a fuel company. The GM-run operation with a semi-retired owner for 3 years is proof the business operates without the owner — the critical transition risk is already solved.

B. FINANCIAL QUALITY: EBITDA of $840K on $3.6M = 23.3% margin — strong for distribution. Revenue volatility between years ($3.8M → $3.4M → $3.6M) reflects weather (warm winters reduce heating demand) rather than customer attrition — normalize for degree-day-adjusted revenue. At normalized (5-year average) EBITDA of ~$850K, $5.2M / $850K = 6.1x — fair for a utility-like rural propane distributor. Equipment value: $1.4M gross with $220K debt = $1.18M net equity. Tank values: 2,200 tanks at $300–400 each = $660–880K replacement value. Total hard assets ≈ $2.0M. Acquisition price $5.2M - $2.0M hard assets = $3.2M for the customer relationships and recurring EBITDA stream. $3.2M / $850K = 3.8x for the intangible EBITDA — very reasonable. This is the right way to think about asset-heavy distribution businesses.

C. SELLER QUALITY: Ideal. Age 70, estate planning, heirs not interested — textbook retirement exit. Semi-retired for 3 years while GM ran the business is the ultimate proof of systems and management quality. The 6-year remaining lease on the terminal is a risk only if relocation is required — verify the terminal lease has renewal options and the landlord is cooperative. Owner presumably has no ongoing economic interest and will cooperate fully with transition.

D. DEAL QUALITY: $5.2M on $850K normalized EBITDA = 6.1x. This is at the high end of appropriate for rural propane (comparable transactions run 5.5–7.5x EBITDA for businesses with 2,000+ accounts). The tank base and customer tenure justify the premium. SBA structure: $5.2M exceeds standard SBA 7(a) loan limit of $5M. Likely structure: SBA 504 (real estate/equipment portion) + SBA 7(a) (working capital) OR conventional senior debt + seller note. More complex than standard SBA. Total debt scenario: $4.5M financed at 7.5% / 10yr = ~$637K annual service + seller note $400K/5yr = ~$91K. Total debt service ~$728K. DSCR = $850K / $728K = 1.17x — TIGHT. Requires negotiation: either push price to $4.8M total or restructure debt terms. At $4.8M (asking accepted at face): SBA + conventional ~$4.1M → service ~$580K + seller note ~$91K = ~$671K → DSCR = $850K / $671K = 1.27x — workable. Weather risk: in a warm winter (EBITDA $700K), DSCR = 1.04x — stress test says you survive but without margin. Model a weather hedge or LOC.

E. OPERATIONAL OPPORTUNITY: (1) Degree-day billing — most rural propane companies use estimated auto-fill, not meter-based billing; degree-day modeling reduces delivery cost by optimizing truck routes. (2) Customer growth — 2,800 accounts in a rural Colorado service territory almost certainly leaves underserved areas; targeted prospecting of new rural homebuilds and off-grid properties grows the base. (3) Tank monetization — owned tanks are an asset on your balance sheet but also a cash flow constraint; a formal tank rental rate increase (typical $7–12/month) is often under-priced at older operators. (4) Commercial/ag expansion — farm and agricultural propane is less seasonal and higher-volume.

F. DECISION: Serious interest, proceed to diligence with price negotiation. The asset quality is excellent; the DSCR is tight as currently structured. Negotiate to $4.9M total ($4.5M at close + $400K seller note over 5 years). In diligence: (1) verify 3-year delivery records (gallons delivered, degree-day correlation) — the definitive quality check; (2) confirm GM compensation, non-compete, and retention commitment; (3) review terminal lease renewal options; (4) inspect all delivery trucks and tanks for condition; (5) CDL/Hazmat driver count — 4 is tight; one departure creates an operational constraint. If diligence confirms the quality, this is a generational acquisition at a fair price.

TEACHING CONCEPTS: Propane distribution economics, tank-as-moat, degree-day revenue normalization, asset-heavy deal structure, SBA 504 vs 7(a), weather risk in fuel businesses.`,

      teachingConcepts: ['Propane distribution economics', 'Owned-tank switching cost moat', 'Degree-day revenue normalization', 'Asset-heavy deal structure', 'SBA 504 vs 7(a)', 'Hard asset coverage analysis'],
      keyRedFlags: ['DSCR 1.17x as structured — tight', 'SBA 7(a) loan limit exceeded — complex financing', 'Weather-dependent revenue (warm winter risk)', '4 CDL/Hazmat drivers — thin staffing', 'Terminal lease — verify renewal options'],
      keyGreenFlags: ['2,800 accounts, 12-year avg tenure, 4% churn', 'Owned tanks = switching cost moat', 'GM-run for 3 years — owner already exited operations', '23.3% EBITDA margin', '$2.0M hard asset coverage', 'Estate planning exit — no distress', 'Utility-like demand (rural heat, no alternative)'],
    },
  },
];
