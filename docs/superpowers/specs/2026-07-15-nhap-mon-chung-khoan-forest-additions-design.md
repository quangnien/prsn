# Nhập Môn Chứng Khoán — "Forest View" Content Additions

**Date:** 2026-07-15
**Target file:** `blog/nhap-mon-chung-khoan/index.html`
**Type:** Content addition (no restructuring, no new CSS components)

## Context

The blog post is a 15-section, ~1780-line Vietnamese stock-market primer that already went through a major bugfix + content-enhancement pass on 2026-07-14 (see `2026-07-14-nhap-mon-chung-khoan-upgrade-design.md`). The page uses an established visual vocabulary (callouts, deep-dive blocks, compare-grid, decision-tree, self-check checklists, org-map, cashflow-timeline, candlestick/Fibonacci SVGs, a searchable glossary) and is deployed to production.

This round is a **content-only** pass: closing four specific knowledge gaps identified by re-reading the full document end-to-end, framed by the user as "expand into the forest, not just the trees" (e.g. leverage/đòn bẩy deserves deeper treatment than it currently gets).

## Decisions (confirmed with user)

1. **No page split.** Stays a single page. The existing sticky TOC, reading-progress bar, and live glossary search already make a 60-min document navigable in chunks; splitting would fragment the 13-question quiz's cross-references (e.g. Q13 references §11.6) and require new URL/nav/redirect engineering for little reader benefit.
2. **All 4 identified gaps are in scope** (user selected all 4 from a shortlist).
3. **No new diagram/SVG components.** Reuse existing, already-responsive components for consistency and to avoid re-introducing the mobile-overflow class of bugs fixed in the prior pass.

## The four additions

### 1. Room ngoại (foreign ownership limit) explainer
- **Problem:** §6.4's ETF table uses the phrase "đã hết room ngoại" (FUEVFVND) without ever defining "room ngoại" — a real comprehension gap given the document's own emphasis on the Sept-2026 FTSE upgrade and foreign capital flows (§2.5).
- **Placement:** New `callout-info` box immediately after the ETF example table in §6.4.
- **Content:** One paragraph defining room ngoại (tỷ lệ sở hữu tối đa nhà đầu tư nước ngoài được nắm giữ tại một doanh nghiệp niêm yết, theo ngành nghề), why some sectors are capped lower (ngành có điều kiện theo cam kết quốc tế/luật chuyên ngành, ví dụ ngân hàng), and why "hết room" pushes foreign demand into room-free vehicles like Diamond ETFs.
- **Glossary:** add one row.

### 2. Margin call math deep-dive
- **Problem:** §4.8 explains the margin mechanism and gives one clean symmetric example (±10% price move → ±20% equity) but never shows the actual **trigger math** — the initial ratio, maintenance ratio, and the exact price point where force-sell kicks in. This is the mechanic every "cháy tài khoản" story actually hinges on.
- **Placement:** New `deep-dive` block in §4.8, following the existing pattern (label + title + audience line + prose + table).
- **Content:** Concrete worked example — buy with typical initial margin ratio (~50%, i.e. borrow up to 1:1), show equity ratio eroding as price drops, identify the price point where equity ratio crosses the maintenance threshold (~30–35%) triggering call margin, and the force-sell price if not topped up. Table columns: Giá cổ phiếu | Giá trị TS đảm bảo | Nợ vay | Tỷ lệ ký quỹ thực tế | Trạng thái.
- Ends with an explicit tie-back to the existing "no margin in year 1" rule already stated in the section — reinforcing rather than replacing it.

### 3. Macro forces → stock prices ("forest view")
- **Problem:** Interest-rate risk is taught only inside bonds (§5.2); foreign flow is only touched in §2.5's trend blurb. Nothing connects them into a unified picture of *why VN-Index moves* — which is exactly the "forest" context a reader needs to make sense of financial news.
- **Placement:** New **§2.6**, immediately after the existing 2025–2026 trend diagram in §2.5 (natural continuation — that section already discusses KRX and the FTSE upgrade).
- **Content:** Short intro paragraph, then a 3-column `compare-grid` (existing pattern):
  1. **Lãi suất** — lãi suất điều hành giảm → tiền gửi kém hấp dẫn hơn → dòng tiền tìm kênh sinh lời cao hơn (cổ phiếu); ngược lại khi lãi suất tăng. Cross-link to §5.2.
  2. **Tỷ giá USD/VND** — tỷ giá biến động mạnh → nhà đầu tư ngoại lo ngại giá trị tài sản quy đổi giảm → có thể rút vốn.
  3. **Dòng vốn khối ngoại** — mua ròng/bán ròng tác động trực tiếp cung–cầu, đặc biệt nhóm vốn hóa lớn (VN30). Cross-link to the new room-ngoại callout in §6.4.
- Closes with a one-line caveat consistent with the document's existing "đừng FOMO" tone: these are directional tendencies economists debate, not mechanical trading signals.
- **TOC:** add a `toc-h3` entry for §2.6.

### 4. Qualitative business analysis
- **Problem:** §7 ("đọc sức khỏe doanh nghiệp qua con số") is 100% quantitative ratios — no treatment of moat, management quality, or industry position, despite the section's own framing promising to read business health, not just arithmetic.
- **Placement:** New **§7.3**, after the existing P/E-trap deep-dive.
- **Content:** Reuse the `self-check` component (already used in §11.4 and §13.1) — a short checklist of qualitative questions grouped under three headers: Lợi thế cạnh tranh (moat) / Ban lãnh đạo / Vị thế ngành. Framed explicitly as *complementary* to the ratios in §7.2, not a replacement.
- **TOC:** add a `toc-h3` entry for §7.3.

## Non-goals

- No restructuring of existing sections, no page split, no new CSS/JS components.
- No changes to already-fixed diagrams (§8.1 candlesticks, §8.4 Fibonacci) — those were verified working in the prior pass.
- No new stock/fund ticker examples beyond what's needed to illustrate room ngoại.

## Verification plan

- Visual check in Chrome headless (light + dark theme) at desktop, iPad, and iPhone SE (375px) viewports for each new block — the 375px check specifically because that viewport surfaced a (later ruled-out as tooling-artifact) overflow concern in the prior pass.
- Confirm new TOC entries scroll-spy correctly.
- Confirm glossary search still finds the new "room ngoại" row.
- Update the reading-time estimate in the hero meta line to reflect the added word count.
- Zero new console errors.
