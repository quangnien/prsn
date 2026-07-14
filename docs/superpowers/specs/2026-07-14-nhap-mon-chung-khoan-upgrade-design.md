# Nhập Môn Chứng Khoán & Quỹ Đầu Tư — Bug Fix + Content Upgrade Design

**Status:** Approved by user (scope confirmed via question set on 2026-07-14). Ready for implementation plan.

## Problem Statement

`blog/nhap-mon-chung-khoan/index.html` is a 1681-line, 15-section Vietnamese-language investing primer (see prior plan: `docs/superpowers/plans/2026-07-13-nhap-mon-chung-khoan-page.md`). Two issues to address:

1. **Bug report:** the user cannot see the diagrams in §8.1 ("Bốn khái niệm nền" — candlestick anatomy cards) and §8.4 ("Fibonacci — từ dãy số đến các mức thoái lui" — spiral + retracement SVGs) when viewing the page in Chrome.
2. **Content gaps:** as a subject-matter review, several practically-important topics for a Vietnamese retail investor are thin or missing entirely.

## Investigation Summary (see full audit for detail)

A headless-Chrome-driven audit (real browser, not static read) could not reproduce the invisible-diagram bug under normal scrolling — all 41 reveal-gated elements on the page, including both reported diagrams, correctly animate to visible in every tested combination (desktop/mobile × dark/light). No missing CSS class, no thrown JS exception, no broken image path (all 7 images exist locally).

**Root cause is architectural, not a typo:** every reveal animation in the article (25 diagram instances across the whole page) is hard-gated behind a single shared `IntersectionObserver`-driven `<script>` block with:
- No `try/catch` isolation between its ~5 init sub-blocks (a future failure in one — e.g. the TOC scroll-spy — could in principle prevent later blocks, including the SVG-draw block that drives §8.4, from ever attaching observers).
- No non-JS / JS-disabled fallback — elements start at `opacity:0` (CSS diagrams) or an undrawn `stroke-dashoffset` (SVGs) and rely entirely on JS to reveal them, with no fail-safe.
- A ratio-based `threshold` (0.15–0.2) rather than `rootMargin`, which is more sensitive to tall elements, OS zoom, and window-height edge cases.
- Anchor-jump risk: a reader landing via a direct link/TOC click to `#s8-1` or `#s8-4` triggers a native browser scroll-to-anchor that can race the observer's `observe()` call during initial script parse.

Whatever the user's exact trigger was, the fix is the same regardless of cause: remove the single point of failure so these elements can never get permanently stuck invisible.

## Part A — Bug Fix Design

**Approach: fail-safe CSS baseline + `try/catch` isolation** (chosen over lowering the threshold alone, and over a full CSS-only scroll-driven-animation rewrite — the latter has inconsistent support on older Safari/Android WebView, which conflicts with the site's "works on laptop/iPhone/iPad/Android/Chrome/Safari" requirement).

1. **CSS fail-safe baseline** (in `blog/blog.css`, near the existing `.dt-reveal`/`.svg-draw` rules): add a rule so `.dt-reveal`, `.flow-step`, and `.draw-path` elements are visible/drawn *by default*. The JS then does the opposite of today's model — instead of JS being required to reveal content, JS *opts into* an entrance animation only after it successfully sets up, by adding a `js-reveal-ready` class (or similar) to `<html>`/`<body>` early, and the opacity-0/dash-offset styling only applies when that ready class is present AND the element hasn't yet been marked `.visible`. Net effect: no JS = fully visible content immediately; JS present and working = existing fade-in/draw-in animation; JS present but throws partway = still fully visible (no regression), just without the animation flourish for whichever elements didn't get observed.
2. **`try/catch` around each of the script's init blocks** (theme toggle, reading-progress, TOC scroll-spy, reveal-Block-A, SVG-draw-Block-B, glossary filter) so a failure in one can never prevent the others from running. This directly fixes the "later diagrams silently never observed" cascade risk.
3. **Swap `threshold` for `rootMargin`** on both observers (e.g. `rootMargin: '0px 0px -10% 0px'` in place of `threshold: 0.15/0.2`) — more robust for elements taller than the viewport, per the audit's finding #2.
4. Apply this pattern **once, in the shared reveal script**, so it automatically protects all 25 diagram instances on the page, not just the two reported ones.

**Verification:** re-run the same headless-Chrome methodology the audit used (load page, screenshot pre-scroll and post-scroll states, check for console exceptions) at desktop/mobile × dark/light, plus a new check simulating direct-anchor-link navigation to `#s8-1` and `#s8-4` (the one scenario the audit couldn't fully rule out via CDP) to confirm content is visible even in that path.

## Part B — Content Upgrade Design (Tier 1 + Tier 2, per user selection)

All additions follow the document's existing pedagogy (concrete numeric example before/with abstraction) and reuse existing CSS component vocabulary (`.compare-grid`, `.org-map`, `.flow-diagram`, `.callout`, `.blog-table`) — no new diagram component classes needed except the Part C trend chart.

**Tier 1:**
1. **Concrete VN fund/ETF examples + how to buy each** (§6.4, "Ba hình dạng quỹ"): name real fund families (VFMVN30, DCVFMVN DIAMOND, SSIAM VNFIN LEAD as ETF examples; VCBF, DCDS as open-end fund examples) and add a `.compare-grid` contrasting the purchase mechanism — ETF: mua/bán trên sàn qua CTCK như một mã cổ phiếu; Quỹ mở: mua qua công ty quản lý quỹ hoặc đại lý phân phối (Fmarket, TCBS...), không niêm yết trên sàn.
2. **Dividend/split/rights-issue disambiguation** (extends §4.7's existing ex-dividend deep dive): add a `.blog-table` distinguishing cổ tức bằng cổ phiếu (stock dividend), cổ phiếu thưởng, quyền mua phát hành thêm (rights issue), and chia tách cổ phiếu (stock split) — four concepts VN retail investors commonly conflate — each with what happens to share count, price, and total position value.
3. **Position-sizing rule of thumb** (§9.1/9.2 risk map & diversification): add a concrete guideline callout — e.g. không quá ~15–20% NAV vào 1 mã, không quá ~30–40% vào 1 ngành — turning the existing conceptual diversification discussion into an actionable rule, matching the document's existing "concrete number" style.
4. **Rebalancing** (new short subsection, likely §6.6 alongside DCA, or folded into §11's roadmap): review & rebalance danh mục định kỳ (6–12 tháng) — what it means, a minimal worked example (target 70/30 stock/bond drifts to 80/20 after a rally → sell back to target).

**Tier 2:**
5. **Tax treatment for chứng chỉ quỹ/ETF vs. cổ phiếu** (§10): current tax table reads stock-trade-focused (0.1% per sell); add the fund/ETF-specific treatment (tax on realized NAV gain at redemption) so §10 covers all three security types from §3, not just stocks.
6. **"Time in market vs. timing the market" stat** (§9.3, psychology): one concrete VN-Index-based or globally-recognized illustrative statistic (e.g., missing the N best trading days over a period materially reduces CAGR) to give the existing narrative section a hard number, consistent with the doc's numeric-example style. Source will be cited in §15 (Nguồn tham khảo) same as other stats in the doc.

**Explicitly out of scope for this round (Tier 3, deferred):** DCF/valuation intuition beyond P/E-P/B-ROE, and a trading-app fee/UX comparison table — both flagged as lower priority / better suited to a future follow-up post, per YAGNI.

**Verification note for §11.2 ("Mở TK"):** before adding new eKYC/account-opening content, the implementation plan must re-check what's already there — the audit did not confirm whether this is already adequately concrete. If already sufficient, skip; do not duplicate.

## Part C — VN-Index 2024–2026 Trend Diagram

A CSS-only (no chart library, matching site convention) animated line/area diagram for §2.5 ("Bối cảnh 2025–2026: khúc quanh lịch sử"), turning the existing bullet list into a visual timeline. Shows an illustrative VN-Index trajectory across 2024→2026 annotated with the two milestones already named in the prose: KRX system go-live (5/2025) and FTSE Russell secondary-emerging-market upgrade (effective 21/9/2026). Built from the same primitives already in `blog.css` (CSS grid/flex, `.dt-reveal`-style scroll reveal, existing color tokens) — no new external dependency, no `<canvas>`. Data is illustrative/schematic (explicitly labeled as such, consistent with the document's existing "số liệu mang tính lịch sử/tham khảo" disclaimer pattern), not a precise historical index feed, since this is an educational illustration, not a financial data product.

## Testing / Verification Plan

- Re-run headless-Chrome visual verification (as used in the audit) after the bug fix, across desktop/mobile × dark/light × direct-anchor-link navigation.
- Manual `/verify`-style pass on the new content sections for factual accuracy (fund names, tax rules) cross-checked against §15's existing official sources where possible.
- Confirm no regressions to the other 23 diagram instances that reuse the same reveal script.
- Confirm new content sections get TOC entries where the existing curated TOC pattern warrants it (matching current curation style — not every H3 is listed today).

## Risks

- **Tier 1/2 content additions increase page length** (~55 min read today) — acceptable per user's explicit scope choice; no mitigation needed beyond keeping additions tight and example-driven like the rest of the doc.
- **Fund/ETF names and tax rules are point-in-time facts** — must carry the same "correct as of 07/2026, verify against official sources" framing already used elsewhere in the document (see existing disclaimer callout).
