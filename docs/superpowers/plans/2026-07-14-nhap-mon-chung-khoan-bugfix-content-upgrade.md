# Nhập Môn Chứng Khoán — Bug Fix + Content Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the architectural single-point-of-failure that can make §8.1 and §8.4's diagrams (and, in principle, any of the article's 25 reveal-animated diagram instances) get stuck permanently invisible, and add six scoped content improvements (concrete fund/ETF examples + purchase channels, dividend/split/rights-issue disambiguation, a position-sizing rule, rebalancing, fund/ETF tax treatment, a time-in-market statistic) plus one new visual (a VN-Index 2024–2026 trend diagram) to `blog/nhap-mon-chung-khoan/index.html`.

**Architecture:** No new files, no new libraries, no build step. The bug fix is a surgical rewrite of the single inline `<script>` block already in the page (lines 1594–1678): each of its 6 init blocks gets `try/catch` isolation, the two `IntersectionObserver`s switch from a ratio-based `threshold` to a more robust `rootMargin`, and a new `forceRevealAll()` helper plus a `window.load` + 4s-timeout safety net guarantees every reveal-gated element becomes visible even if an observer never fires (covers the anchor-jump-race scenario the audit couldn't fully rule out). This fix is scoped entirely to this page's own `<script>` — it does **not** touch `blog/blog.css`'s shared `.dt-reveal`/`.flow-step`/`.svg-draw` rules, because those are reused by other blog posts and changing their defaults would risk regressions elsewhere. Content additions reuse existing CSS component vocabulary (`.blog-table`, `.callout`, `.compare-grid`) with zero new CSS, except the new trend diagram which adds one small SVG-based component (`.trend-chart`) following the exact pattern already established by `.fib-chart` in `blog.css`.

**Tech Stack:** Plain HTML5 + CSS (existing `blog/blog.css` design tokens) + vanilla JS (no build step, no dependencies, no `<canvas>`).

## Global Constraints

- All new visible content in Vietnamese, matching the rest of the document.
- No new external libraries, no `<canvas>` — CSS/inline SVG only, matching the existing site convention.
- Reuse existing `blog.css` design tokens (`--bg`, `--primary`, `--teal`, `--bg2`, `--border2`, `--radius-md`, `--muted`, `--sub`, etc.) — no new hardcoded colors.
- Theme-aware: every new element must work in both `data-theme="dark"` and `data-theme="light"` using existing CSS custom properties only.
- Responsive: any new multi-column/wide element must not overflow at 375px viewport width (iPhone SE) — the new `.trend-chart` SVG uses `width:100%; height:auto` exactly like the existing `.fib-chart`, so this is inherited for free.
- The bug fix must not change `blog.css`'s shared `.dt-reveal`, `.flow-step`, or `.svg-draw .draw-path` rules — those are used by other posts (`loose-coupling-spring-boot`, `prompt-engineering-roadmap`, `docker-toan-tap`); the fix lives entirely inside this page's own `<script>` block.
- New factual claims (fund/ETF ticker names, tax treatment) must carry the same "verify against official sources, correct as of 07/2026" hedge already used elsewhere in the document (see the disclaimer callout near the top and the §10.1 legal-basis callout) — do not state them as unhedged fact.
- Do not fabricate VN-specific statistics that can't be sourced. Where an illustrative statistic is used (time-in-market), explicitly frame it as a general/mechanism-based illustration, not a specific VN-Index number.
- Keep new numeric claims internally consistent with figures already stated elsewhere in the document — e.g. the existing text at line 1025 already says "một mã ≤10–15% danh mục"; the new position-sizing callout must use the same range, not a conflicting one.
- No changes to the document's H2/H3 id structure or numbering — all additions are inserted as unnumbered supporting content (tables/callouts) within existing subsections, so the sidebar TOC (`.blog-toc`) needs no changes.

---

## File Structure

- **Modify** `blog/nhap-mon-chung-khoan/index.html` — bug-fix rewrite of the inline `<script>` block; six content insertions at specific existing line ranges; one new diagram markup block in §2.5; reading-time meta update.
- **Modify** `blog/blog.css` — append one new small CSS block (`.trend-chart` and children) immediately after the existing `.fib-spiral-caption` rule, following the exact pattern of the neighboring `.fib-chart` block.

---

## Task 1: Harden the reveal-animation script (bug fix)

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html:1594-1678` (the entire inline `<script>` block)

**Interfaces:**
- Produces: `forceRevealAll()` — a global function later verification steps and the load-timeout failsafe both call. Takes no arguments, returns nothing. Marks every `.dt-reveal`/`.flow-step` element `.visible` and zeroes every `.svg-draw .draw-path`'s `strokeDashoffset`.

- [ ] **Step 1: Replace the entire `<script>` block**

Open `blog/nhap-mon-chung-khoan/index.html`. Replace the full contents from `<script>` (line 1594) through `</script>` (line 1678) with:

```html
<script>
    // ── Failsafe: guarantee reveal-gated content is never stuck invisible ──
    function forceRevealAll() {
        document.querySelectorAll('.dt-reveal:not(.visible), .flow-step:not(.visible)').forEach(el => el.classList.add('visible'));
        document.querySelectorAll('.svg-draw .draw-path').forEach(path => {
            path.style.transition = 'none';
            path.style.strokeDashoffset = 0;
        });
    }

    // ── Theme ──────────────────────────────────────────────────────────────
    try {
        const saved = localStorage.getItem('blog-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        document.getElementById('theme-label').textContent = saved === 'dark' ? 'Dark' : 'Light';
    } catch (e) { console.warn('theme init failed', e); }

    function toggleTheme() {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('blog-theme', next);
        document.getElementById('theme-label').textContent = next === 'dark' ? 'Dark' : 'Light';
    }

    // ── Reading progress bar ──────────────────────────────────────────────
    try {
        const bar = document.getElementById('reading-progress');
        window.addEventListener('scroll', () => {
            const doc = document.documentElement;
            const scrolled = doc.scrollTop;
            const total = doc.scrollHeight - doc.clientHeight;
            bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
        }, { passive: true });
    } catch (e) { console.warn('reading-progress init failed', e); }

    // ── Flow / decision-tree / diagram staggered reveal ────────────────────
    try {
        const revealGroups = document.querySelectorAll('.flow-diagram, .decision-tree, .orderbook-diagram, .candle-anatomy, .pattern-grid, .plan-template');
        revealGroups.forEach(group => {
            const descendants = Array.from(group.querySelectorAll('.flow-step, .dt-reveal'));
            const steps = group.matches('.dt-reveal') ? [group, ...descendants] : descendants;
            if (!steps.length) return;
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        steps.forEach((step, i) => setTimeout(() => step.classList.add('visible'), i * 100));
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.01, rootMargin: '0px 0px -5% 0px' });
            obs.observe(group);
        });
    } catch (e) {
        console.warn('reveal-diagram init failed, forcing visible', e);
        forceRevealAll();
    }

    // ── SVG diagram draw-in (Fibonacci spiral, retracement chart, trend chart) ─
    try {
        document.querySelectorAll('.svg-draw').forEach(container => {
            const path = container.querySelector('.draw-path');
            if (!path) return;
            const len = path.getTotalLength();
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = len;
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        path.style.transition = 'stroke-dashoffset 1.8s ease';
                        path.style.strokeDashoffset = 0;
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.01, rootMargin: '0px 0px -5% 0px' });
            obs.observe(container);
        });
    } catch (e) {
        console.warn('svg-draw init failed, forcing visible', e);
        forceRevealAll();
    }

    // ── TOC active link ────────────────────────────────────────────────────
    try {
        const tocLinks = document.querySelectorAll('.toc-list a');
        const headings = Array.from(tocLinks)
            .map(a => document.querySelector(a.getAttribute('href')))
            .filter(Boolean);
        const tocObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tocLinks.forEach(a => a.classList.remove('active'));
                    const link = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
                    if (link) link.classList.add('active');
                }
            });
        }, { rootMargin: '-20% 0% -70% 0%' });
        headings.forEach(h => tocObserver.observe(h));
    } catch (e) { console.warn('toc scrollspy init failed', e); }

    // ── Glossary live filter ───────────────────────────────────────────────
    try {
        const glossaryFilter = document.getElementById('glossary-filter');
        if (glossaryFilter) {
            glossaryFilter.addEventListener('input', (e) => {
                const q = e.target.value.trim().toLowerCase();
                document.querySelectorAll('#glossary-table tbody tr').forEach(row => {
                    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
                });
            });
        }
    } catch (e) { console.warn('glossary filter init failed', e); }

    // ── Global failsafe: guarantee visibility even if an observer never fires
    //    (e.g. direct anchor-link navigation racing observer setup, or an
    //    element whose visible-ratio never crosses the intersection threshold) ──
    window.addEventListener('load', () => { setTimeout(forceRevealAll, 4000); });
</script>
```

What changed vs. the original: added `forceRevealAll()`; wrapped all 6 blocks in their own `try/catch` (a failure in one can no longer prevent the ones after it from running); both `IntersectionObserver`s now use `{ threshold: 0.01, rootMargin: '0px 0px -5% 0px' }` instead of a bare `threshold: 0.15`/`0.2` (far more reliable for tall elements); added the closing `window.load` + 4s timeout safety net. The TOC observer's `rootMargin` (`-20% 0% -70% 0%`) is untouched — that one is deliberately narrow, it drives active-link highlighting, not content visibility.

- [ ] **Step 2: Syntax-check the script**

Extract the script contents (everything between `<script>` and `</script>`) to a scratch file and run:

```bash
node --check "C:\Users\Admin\AppData\Local\Temp\claude\F--fe-prsn-portfolio-prsn\adf68bea-83d8-4dad-ad99-462a03ba81b2\scratchpad\reveal-script-check.js"
```

Expected: no output (exit code 0). If Node reports a syntax error, fix the script before continuing.

- [ ] **Step 3: Manual verification in Chrome — normal scroll path**

Open `blog/nhap-mon-chung-khoan/index.html` directly in Chrome (`file://` URL or via a local static server). Scroll slowly from the top through §8 ("Phân tích kỹ thuật"). Confirm: the §8.1 candle cards fade in, and both §8.4 Fibonacci diagrams (spiral + retracement chart) draw in as you reach them. Open DevTools Console — confirm zero errors/warnings logged.

- [ ] **Step 4: Manual verification — direct anchor-link path (the actual regression test for this bug)**

With the page already loaded elsewhere, type the URL with the hash directly into the address bar and press Enter (a **fresh navigation**, not just clicking an in-page TOC link) — e.g. `file:///F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html#s8-4`. Confirm the Fibonacci diagrams are visible immediately (fully drawn, not stuck at an undrawn/invisible state) even though the browser jumped straight to that anchor without a normal scroll pass. Repeat for `#s8-1`.

- [ ] **Step 5: Manual verification — theme and viewport**

Toggle the theme button (dark ↔ light) and confirm both diagrams remain correctly styled and visible in each mode. Open DevTools → toggle device toolbar → select "iPhone SE" (375×667) and "iPad Air" (820×1180), reload the page, confirm both diagrams render without horizontal overflow and are visible after scrolling.

- [ ] **Step 6: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "fix: harden diagram reveal-animation script against silent failures

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Add real VN fund/ETF examples + purchase channels (§6.4)

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html:590-601`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nothing consumed by later tasks (independent content insertion).

- [ ] **Step 1: Insert the new table + callout**

Find this exact text (the end of the existing `.compare-grid` in §6.4, immediately before the §6.5 heading):

```html
        </div>

        <h3 id="s6-5">6.5. Phí của quỹ — kẻ gặm nhấm thầm lặng</h3>
```

Replace it with:

```html
        </div>

        <div class="blog-table-wrapper">
            <table class="blog-table">
                <thead><tr><th>Ví dụ thực tế tại VN*</th><th>Loại</th><th>Mua ở đâu?</th></tr></thead>
                <tbody>
                    <tr><td><strong>E1VFVN30</strong> (ETF VFMVN30)</td><td>ETF — mô phỏng chỉ số VN30</td><td>Trên sàn HOSE qua CTCK, giống hệt mua một mã cổ phiếu, gõ mã <code>E1VFVN30</code></td></tr>
                    <tr><td><strong>FUEVFVND</strong> (ETF DCVFMVN DIAMOND)</td><td>ETF — mô phỏng rổ Diamond (ngành đã hết room ngoại)</td><td>Trên sàn HOSE, mã <code>FUEVFVND</code></td></tr>
                    <tr><td><strong>FUESSVFL</strong> (ETF SSIAM VNFIN LEAD)</td><td>ETF — rổ cổ phiếu tài chính dẫn đầu</td><td>Trên sàn HOSE, mã <code>FUESSVFL</code></td></tr>
                    <tr><td>Quỹ mở của các công ty QLQ (VD: VCBF, DCDS...)</td><td>Quỹ mở chủ động</td><td><strong>Không</strong> giao dịch trên sàn — mua/bán trực tiếp qua công ty quản lý quỹ hoặc đại lý phân phối (app Fmarket, TCBS iWealth...)</td></tr>
                </tbody>
            </table>
        </div>
        <p style="font-size:0.8rem;color:var(--muted)">* Tên quỹ/mã ETF nêu trên để minh họa cách phân loại — không phải khuyến nghị đầu tư. Mã và công ty quản lý có thể thay đổi; luôn kiểm tra lại thông tin chính thức trên trang HOSE hoặc trang công ty quản lý quỹ trước khi giao dịch.</p>

        <div class="callout callout-info">
            <div class="callout-title">💡 Phân biệt nơi mua</div>
            <p><strong>ETF</strong>: mở app CTCK bạn đang dùng (SSI, VPS, TCBS...), tìm đúng mã (vd. <code>E1VFVN30</code>), đặt lệnh <strong>y hệt mua cổ phiếu thường</strong> — theo lô 100, khớp lệnh trong giờ giao dịch, giá thay đổi liên tục trong phiên. <strong>Quỹ mở</strong>: không có "mã" để gõ vào bảng giá — bạn mở tài khoản giao dịch chứng chỉ quỹ tại chính công ty quản lý quỹ hoặc qua nền tảng phân phối (Fmarket, TCBS iWealth...), lệnh mua/bán khớp theo <strong>NAV cuối ngày</strong>, không phải giá thị trường theo thời gian thực.</p>
        </div>

        <h3 id="s6-5">6.5. Phí của quỹ — kẻ gặm nhấm thầm lặng</h3>
```

- [ ] **Step 2: Verify the insertion landed correctly**

```bash
grep -c "E1VFVN30" "F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html"
```

Expected: `2` (appears once in the table, once in the callout).

- [ ] **Step 3: Visual check**

Open the page in Chrome, scroll to §6.4, confirm the new table and info callout render correctly (table columns readable, no overflow) in both dark and light theme, and at 375px viewport width (table should scroll horizontally inside `.blog-table-wrapper`, not break the layout).

- [ ] **Step 4: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add real VN fund/ETF examples and purchase channels to sec 6.4

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Disambiguate dividend / bonus shares / rights issue / stock split (§4.7)

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html:468-472`

- [ ] **Step 1: Insert the new comparison table**

Find this exact text (end of the ex-dividend deep-dive in §4.7, immediately before the §4.8 heading):

```html
            <p>Ví dụ: ABC giá 50.000đ, trả cổ tức tiền mặt 2.000đ/CP → ngày không hưởng quyền, giá tham chiếu còn 48.000đ. Bạn nhận 2.000đ (còn ~1.900đ sau thuế 5%) nhưng giá vốn thị trường cũng giảm 2.000đ — <strong>tổng tài sản không tự nhiên tăng lên</strong>. Tương tự, cổ tức <strong>bằng cổ phiếu</strong> làm số CP tăng nhưng giá điều chỉnh giảm tương ứng — như cắt pizza thành nhiều miếng nhỏ hơn, tổng bánh không đổi.</p>
        </div>

        <h3 id="s4-8">4.8. Margin (vay ký quỹ) — con dao hai lưỡi</h3>
```

Replace it with:

```html
            <p>Ví dụ: ABC giá 50.000đ, trả cổ tức tiền mặt 2.000đ/CP → ngày không hưởng quyền, giá tham chiếu còn 48.000đ. Bạn nhận 2.000đ (còn ~1.900đ sau thuế 5%) nhưng giá vốn thị trường cũng giảm 2.000đ — <strong>tổng tài sản không tự nhiên tăng lên</strong>. Tương tự, cổ tức <strong>bằng cổ phiếu</strong> làm số CP tăng nhưng giá điều chỉnh giảm tương ứng — như cắt pizza thành nhiều miếng nhỏ hơn, tổng bánh không đổi.</p>
        </div>

        <div class="blog-table-wrapper">
            <table class="blog-table">
                <thead><tr><th>Khái niệm</th><th>Tiền/CP từ đâu ra</th><th>Số CP bạn có</th><th>Giá tham chiếu</th><th>Tổng giá trị nắm giữ</th></tr></thead>
                <tbody>
                    <tr><td><strong>Cổ tức bằng cổ phiếu</strong></td><td>Trích từ lợi nhuận giữ lại</td><td>Tăng theo tỷ lệ công bố</td><td>Giảm tương ứng</td><td>Không đổi (tại thời điểm chia)</td></tr>
                    <tr><td><strong>Cổ phiếu thưởng</strong></td><td>Trích từ thặng dư vốn/quỹ khác (không phải lợi nhuận)</td><td>Tăng theo tỷ lệ công bố</td><td>Giảm tương ứng</td><td>Không đổi</td></tr>
                    <tr><td><strong>Quyền mua phát hành thêm</strong></td><td><strong>Bạn phải nộp thêm tiền</strong> để mua CP mới, thường giá ưu đãi</td><td>Tăng NẾU bạn thực hiện quyền</td><td>Giảm (pha loãng), tính theo giá quyền</td><td>= giá trị cũ + tiền mới bạn góp thêm</td></tr>
                    <tr><td><strong>Chia tách cổ phiếu (split)</strong></td><td>Không liên quan lợi nhuận — chỉ "cắt nhỏ" đơn vị</td><td>Tăng đúng theo tỷ lệ tách (vd 1:2 → gấp đôi)</td><td>Giảm đúng theo tỷ lệ tách</td><td>Không đổi</td></tr>
                </tbody>
            </table>
        </div>
        <div class="callout callout-info">
            <div class="callout-title">💡 Điểm chung dễ bị bỏ sót</div>
            <p>Trừ quyền mua (bạn phải trả thêm tiền thật), <strong>không có trường hợp nào ở trên làm bạn giàu lên "miễn phí"</strong> — số cổ phiếu tăng luôn đi kèm giá giảm tương ứng, đúng logic "cắt pizza thành nhiều miếng nhỏ hơn" đã học ở trên. Đọc thông báo "chia thưởng tỷ lệ 20%" hay "chia tách 1:2" nên hiểu là <em>thay đổi hình dạng</em> khoản đầu tư, không phải <em>được cho thêm tiền</em>.</p>
        </div>

        <h3 id="s4-8">4.8. Margin (vay ký quỹ) — con dao hai lưỡi</h3>
```

- [ ] **Step 2: Verify**

```bash
grep -c "Chia tách cổ phiếu" "F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html"
```

Expected: `1`.

- [ ] **Step 3: Visual check**

Open in Chrome, scroll to §4.7, confirm the new 5-column table is readable (scrolls horizontally inside `.blog-table-wrapper` on mobile, doesn't break layout) in both themes.

- [ ] **Step 4: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: disambiguate dividend vs bonus shares vs rights issue vs split in sec 4.7

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Add a concrete position-sizing rule (§9.2)

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html:992-994`

- [ ] **Step 1: Insert the new callout**

Find this exact text (end of §9.2's diversification paragraph, immediately before the §9.3 heading):

```html
        <p style="font-size:0.85rem;color:var(--muted)">Logic: phần lõi (quỹ/ETF) tăng trưởng dài hạn ít tốn công; phần cổ phiếu tự chọn để bạn <em>học</em> với quy mô đủ nhỏ để sai lầm không chí mạng; trái phiếu/tiết kiệm là "giảm xóc"; tiền mặt cho bạn <strong>quyền chủ động</strong> khi thị trường hoảng loạn — thay vì là người phải bán, bạn là người được mua rẻ.</p>

        <h3 id="s9-3">9.3. Tâm lý đầu tư — kẻ thù lớn nhất ở trong gương</h3>
```

Replace it with:

```html
        <p style="font-size:0.85rem;color:var(--muted)">Logic: phần lõi (quỹ/ETF) tăng trưởng dài hạn ít tốn công; phần cổ phiếu tự chọn để bạn <em>học</em> với quy mô đủ nhỏ để sai lầm không chí mạng; trái phiếu/tiết kiệm là "giảm xóc"; tiền mặt cho bạn <strong>quyền chủ động</strong> khi thị trường hoảng loạn — thay vì là người phải bán, bạn là người được mua rẻ.</p>

        <div class="callout callout-warn">
            <div class="callout-title">📏 Quy tắc tỷ trọng — con số cụ thể để bám vào</div>
            <p>Không có luật bắt buộc, nhưng khung tham khảo phổ biến cho phần danh mục cổ phiếu tự chọn: <strong>tối đa ~10–15% NAV cho MỘT mã</strong> (đúng con số đã nêu ở mục "bộ giáp chống lại chính mình" bên dưới), <strong>tối đa ~30–40% cho MỘT ngành</strong>. Nếu một mã vượt quá tỷ trọng mục tiêu chỉ vì nó tăng giá mạnh — đó là tín hiệu để <strong>chốt lời một phần</strong>, đưa danh mục về đúng khung, không phải để tự hào "all-in đúng hàng". Quy tắc này biến "đa dạng hóa" từ một ý tưởng mơ hồ thành một con số bạn có thể tự kiểm tra sau mỗi lần mua.</p>
        </div>

        <h3 id="s9-3">9.3. Tâm lý đầu tư — kẻ thù lớn nhất ở trong gương</h3>
```

- [ ] **Step 2: Verify**

```bash
grep -c "Quy tắc tỷ trọng" "F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html"
```

Expected: `1`.

- [ ] **Step 3: Visual check**

Open in Chrome, scroll to §9.2, confirm the new warning callout renders with correct amber styling in both themes, and that its "~10–15%" figure reads consistently with the same figure repeated later in §9.3's existing "bộ giáp chống lại chính mình" paragraph (no contradiction between the two).

- [ ] **Step 4: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add concrete position-sizing rule callout to sec 9.2

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Add rebalancing explanation (§6.6)

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html:636-638`

- [ ] **Step 1: Insert the new callout**

Find this exact text (end of §6.6's DCA paragraph, immediately before the §6.7 heading):

```html
        <p>Giá vốn thực (19.672đ) <strong>thấp hơn</strong> trung bình cộng của giá (20.333đ) — "phép màu" cơ học của DCA. Quan trọng hơn: DCA <strong>loại bỏ nhu cầu đoán đỉnh–đáy</strong> và biến cú giảm thành "đợt khuyến mãi gom hàng". Hầu hết nền tảng đều có <strong>SIP (đầu tư định kỳ tự động)</strong> — hãy bật nó lên để kỷ luật thay bạn làm việc.</p>

        <h3 id="s6-7">6.7. Tự chọn cổ phiếu hay mua quỹ? — Cây quyết định</h3>
```

Replace it with:

```html
        <p>Giá vốn thực (19.672đ) <strong>thấp hơn</strong> trung bình cộng của giá (20.333đ) — "phép màu" cơ học của DCA. Quan trọng hơn: DCA <strong>loại bỏ nhu cầu đoán đỉnh–đáy</strong> và biến cú giảm thành "đợt khuyến mãi gom hàng". Hầu hết nền tảng đều có <strong>SIP (đầu tư định kỳ tự động)</strong> — hãy bật nó lên để kỷ luật thay bạn làm việc.</p>

        <div class="callout callout-info">
            <div class="callout-title">🔄 Đừng quên "tái cân bằng" (rebalancing)</div>
            <p>DCA lo phần <em>mua vào</em>, nhưng danh mục còn cần bảo trì định kỳ. Ví dụ: bạn đặt mục tiêu <strong>70% cổ phiếu / 30% trái phiếu</strong>. Sau một năm cổ phiếu tăng mạnh, tỷ lệ thực tế trôi thành <strong>80/20</strong> — danh mục của bạn giờ rủi ro hơn dự tính ban đầu mà bạn không hề "quyết định" điều đó, thị trường tự làm thay bạn. <strong>Tái cân bằng</strong>: bán bớt phần đã vượt tỷ trọng (cổ phiếu), mua thêm phần đang thiếu (trái phiếu) để đưa danh mục về đúng 70/30 mục tiêu. Tần suất hợp lý cho người mới: <strong>6–12 tháng/lần</strong> — làm quá thường xuyên chỉ tốn thêm phí giao dịch mà không cải thiện đáng kể kết quả.</p>
        </div>

        <h3 id="s6-7">6.7. Tự chọn cổ phiếu hay mua quỹ? — Cây quyết định</h3>
```

- [ ] **Step 2: Verify**

```bash
grep -c "tái cân bằng" "F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html"
```

Expected: `2` or more (case-sensitive grep may need `-i`; run `grep -ci "tái cân bằng" ...` if the plain count is 0).

- [ ] **Step 3: Visual check**

Open in Chrome, scroll to §6.6, confirm the new info callout renders correctly in both themes, positioned between the DCA table and the §6.7 decision tree.

- [ ] **Step 4: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add rebalancing explanation to sec 6.6

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Add fund/ETF tax treatment row (§10.1)

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html:1094-1095`

- [ ] **Step 1: Insert the new table row**

Find this exact text (the first two rows of the §10.1 tax table):

```html
                    <tr><td><strong>Bán</strong> CK niêm yết</td><td><strong>0,1% × giá trị BÁN</strong> mỗi lần</td><td>CTCK tự khấu trừ</td><td>Kể cả khi bán <strong>lỗ</strong> vẫn nộp. Mua không chịu thuế này</td></tr>
                    <tr><td><strong>Cổ tức tiền mặt</strong></td><td><strong>5%</strong></td><td>Khấu trừ tại nguồn</td><td>Nhận 3.000đ/CP → thực nhận 2.850đ/CP</td></tr>
```

Replace it with:

```html
                    <tr><td><strong>Bán</strong> CK niêm yết</td><td><strong>0,1% × giá trị BÁN</strong> mỗi lần</td><td>CTCK tự khấu trừ</td><td>Kể cả khi bán <strong>lỗ</strong> vẫn nộp. Mua không chịu thuế này</td></tr>
                    <tr><td><strong>Bán/tất toán CCQ</strong> (quỹ mở hoặc ETF)</td><td><strong>0,1% × giá trị chuyển nhượng</strong>, cùng nguyên tắc như CK niêm yết</td><td>CTCK/Công ty QLQ khấu trừ</td><td>Áp dụng dù CCQ lãi hay lỗ — không tính riêng theo % lợi nhuận</td></tr>
                    <tr><td><strong>Cổ tức tiền mặt</strong></td><td><strong>5%</strong></td><td>Khấu trừ tại nguồn</td><td>Nhận 3.000đ/CP → thực nhận 2.850đ/CP</td></tr>
```

- [ ] **Step 2: Verify**

```bash
grep -c "tất toán CCQ" "F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html"
```

Expected: `1`.

- [ ] **Step 3: Visual check**

Open in Chrome, scroll to §10.1, confirm the new row renders correctly in the existing table in both themes and at 375px width.

- [ ] **Step 4: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add fund/ETF tax treatment row to sec 10.1

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Add a time-in-market callout (§9.3)

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html:1025-1027`

- [ ] **Step 1: Insert the new callout**

Find this exact text (end of §9.3's psychology content, immediately before the §9.4 heading):

```html
        <p><strong>Bộ giáp chống lại chính mình:</strong> <strong>(1)</strong> viết kế hoạch TRƯỚC khi mua; <strong>(2)</strong> tự động hóa DCA; <strong>(3)</strong> giới hạn tỷ trọng (một mã ≤10–15% danh mục); <strong>(4)</strong> nhật ký giao dịch — sau 6–12 tháng đọc lại, bạn sẽ <em>nhìn thấy</em> lỗi tâm lý của chính mình.</p>

        <h3 id="s9-4">9.4. Nhận diện lừa đảo đầu tư — bộ lọc 3 câu hỏi</h3>
```

Replace it with:

```html
        <p><strong>Bộ giáp chống lại chính mình:</strong> <strong>(1)</strong> viết kế hoạch TRƯỚC khi mua; <strong>(2)</strong> tự động hóa DCA; <strong>(3)</strong> giới hạn tỷ trọng (một mã ≤10–15% danh mục); <strong>(4)</strong> nhật ký giao dịch — sau 6–12 tháng đọc lại, bạn sẽ <em>nhìn thấy</em> lỗi tâm lý của chính mình.</p>

        <div class="callout callout-info">
            <div class="callout-title">📊 "Ở trong thị trường" quan trọng hơn "đoán đúng thời điểm"</div>
            <p>Một thống kê kinh điển trong tài chính hành vi (thường trích dẫn từ dữ liệu chỉ số chứng khoán Mỹ dài hạn, nhưng cơ chế toán học áp dụng cho mọi thị trường bao gồm VN-Index): nếu bạn giữ khoản đầu tư <strong>suốt một giai đoạn dài (vd. 20 năm)</strong>, bạn nhận trọn lợi suất thị trường trong giai đoạn đó. Nhưng nếu chỉ vì "đoán sai thời điểm" mà đứng ngoài đúng <strong>10 phiên tăng mạnh nhất</strong> trong hàng nghìn phiên của giai đoạn đó, lợi suất tích lũy có thể giảm còn <strong>chưa bằng một nửa</strong>. Trớ trêu hơn: phần lớn những phiên tăng mạnh nhất lại rơi ngay <strong>sau</strong> những phiên giảm mạnh nhất — đúng lúc nhà đầu tư hoảng loạn (giai đoạn E ở trên) đang rút tiền ra. Đây là lý do "ở trong thị trường" (time in the market) thường thắng "đoán đúng thời điểm vào/ra" (timing the market) về mặt thống kê dài hạn.</p>
        </div>

        <h3 id="s9-4">9.4. Nhận diện lừa đảo đầu tư — bộ lọc 3 câu hỏi</h3>
```

- [ ] **Step 2: Verify**

```bash
grep -c "timing the market" "F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html"
```

Expected: `1`.

- [ ] **Step 3: Visual check**

Open in Chrome, scroll to §9.3, confirm the new callout renders correctly in both themes, positioned between the "bộ giáp" paragraph and the §9.4 scam-detection decision tree.

- [ ] **Step 4: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add time-in-market statistic callout to sec 9.3

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Add VN-Index 2024–2026 trend diagram (§2.5)

**Files:**
- Modify: `blog/blog.css` (append new `.trend-chart` component)
- Modify: `blog/nhap-mon-chung-khoan/index.html:268-274`

**Interfaces:**
- Consumes: the `.svg-draw`/`.draw-path` reveal mechanism fixed in Task 1 — this task's new SVG must use the exact same class names (`svg-draw` on the wrapper, `draw-path` on the path to be drawn) to get the entrance animation and, more importantly, the Task-1 failsafe for free.

- [ ] **Step 1: Add the `.trend-chart` CSS block**

In `blog/blog.css`, find this exact text (end of the existing `.fib-spiral-caption` rule, immediately before the 30-day plan template CSS section):

```css
.fib-spiral-caption { font-size: 0.82rem; color: var(--sub); line-height: 1.6; text-align: center; max-width: 460px; margin: 0; }

/* ─── 30-DAY PLAN TEMPLATE CARD ─────────────────── */
```

Replace it with:

```css
.fib-spiral-caption { font-size: 0.82rem; color: var(--sub); line-height: 1.6; text-align: center; max-width: 460px; margin: 0; }

/* ─── VN-INDEX TREND ILLUSTRATION (2024-2026) ───── */
.trend-chart { margin: 1.6rem 0; padding: 16px 10px 8px; background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-md); }
.trend-chart svg { width: 100%; height: auto; display: block; overflow: visible; }
.trend-axis { stroke: var(--border3); stroke-width: 1.5; }
.trend-axis-label { font-size: 11px; fill: var(--muted); font-family: 'Poppins', sans-serif; }
.trend-line { stroke: var(--teal); stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
.trend-dot { fill: var(--primary); }
.trend-dot--gold { fill: var(--teal); }
.trend-label { font-size: 11px; fill: var(--sub); font-weight: 700; font-family: 'Poppins', sans-serif; }
.trend-label--gold { fill: var(--teal); }
.trend-chart-caption { font-size: 0.8rem; color: var(--sub); text-align: center; padding: 4px 12px 8px; margin: 0; }

/* ─── 30-DAY PLAN TEMPLATE CARD ─────────────────── */
```

- [ ] **Step 2: Insert the diagram markup in §2.5**

In `blog/nhap-mon-chung-khoan/index.html`, find this exact text:

```html
            <li><strong>Nâng hạng:</strong> FTSE Russell nâng hạng TTCK Việt Nam từ <strong>Thị trường Cận biên</strong> lên <strong>Thị trường Mới nổi Thứ cấp</strong>, hiệu lực <strong>21/09/2026</strong> — dòng vốn ngoại dự báo lên tới hàng tỷ USD.</li>
        </ul>
        <div class="callout callout-warn">
```

Replace it with:

```html
            <li><strong>Nâng hạng:</strong> FTSE Russell nâng hạng TTCK Việt Nam từ <strong>Thị trường Cận biên</strong> lên <strong>Thị trường Mới nổi Thứ cấp</strong>, hiệu lực <strong>21/09/2026</strong> — dòng vốn ngoại dự báo lên tới hàng tỷ USD.</li>
        </ul>

        <div class="trend-chart svg-draw">
            <svg viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="Minh họa xu hướng thị trường 2024-2026 với các mốc KRX và nâng hạng FTSE">
                <line class="trend-axis" x1="30" y1="190" x2="620" y2="190"></line>
                <path class="draw-path trend-line" d="M30,150 C120,170 180,120 240,130 C300,140 340,80 400,90 C460,100 500,60 560,50 L600,40" fill="none"></path>
                <circle class="trend-dot" cx="240" cy="130" r="4"></circle>
                <text class="trend-label" x="240" y="115" text-anchor="middle">KRX 5/2025</text>
                <circle class="trend-dot trend-dot--gold" cx="560" cy="50" r="5"></circle>
                <text class="trend-label trend-label--gold" x="560" y="35" text-anchor="middle">FTSE nâng hạng 9/2026</text>
                <text class="trend-axis-label" x="30" y="208">2024</text>
                <text class="trend-axis-label" x="600" y="208" text-anchor="end">2026</text>
            </svg>
            <p class="trend-chart-caption">Minh họa mang tính <strong>khái quát</strong> xu hướng kỳ vọng thị trường 2024–2026 gắn với hai mốc sự kiện ở trên — <strong>không phải</strong> dữ liệu VN-Index chính xác theo phiên giao dịch.</p>
        </div>

        <div class="callout callout-warn">
```

- [ ] **Step 3: Verify**

```bash
grep -c "trend-chart" "F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html"
grep -c "trend-chart" "F:/fe/prsn-portfolio/prsn/blog/blog.css"
```

Expected: both counts ≥ 1 (HTML) and ≥ 9 (CSS, one per new rule).

- [ ] **Step 4: Visual check**

Open in Chrome, scroll to §2.5. Confirm the trend diagram draws in on scroll (line animates in), the KRX and FTSE markers are legible in both themes, and the SVG scales without overflow at 375px width. Also re-run the Task 1 Step 4 direct-anchor-link check against this new diagram: navigate directly to `#s2-5` via a fresh URL load and confirm it's visible immediately.

- [ ] **Step 5: Commit**

```bash
git add blog/blog.css blog/nhap-mon-chung-khoan/index.html
git commit -m "feat: add VN-Index 2024-2026 trend diagram to sec 2.5

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: Update reading-time estimate + final full-page regression pass

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html:52`

- [ ] **Step 1: Update the reading-time meta**

Find:

```html
                ~55 min read
```

Replace with:

```html
                ~60 min read
```

- [ ] **Step 2: Full-page regression pass in Chrome**

Load the page fresh (hard refresh, clear cache if needed). Scroll from top to bottom through all 15 sections. Confirm:
- All 25 pre-existing diagram instances still reveal/animate correctly (not just the two that were reported broken) — spot-check §1.3 decision tree, §2.2 org-map, §4.6 order-book deep dive, §6.7 decision tree, §9.2 donut chart, §9.3 emotion-cycle flow diagram, §9.4 scam decision tree, §11.8 plan template.
- The six new content blocks (Tasks 2–7) and the new trend diagram (Task 8) all render correctly.
- DevTools Console shows zero errors on load and after scrolling the full page.
- Repeat the theme toggle (dark/light) and device-toolbar (375px, 820px) checks from Task 1 across the whole page, not just §8.

- [ ] **Step 3: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "chore: update reading-time estimate after content additions

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review Notes

- **Spec coverage:** Part A (bug fix) → Task 1. Part B Tier 1 (fund/ETF examples, dividend disambiguation, position sizing, rebalancing) → Tasks 2, 3, 4, 5. Part B Tier 2 (fund/ETF tax, time-in-market) → Tasks 6, 7. Part C (trend diagram) → Task 8. Reading-time/regression → Task 9. All spec sections have a task.
- **Consistency fix applied during planning:** the spec's Part B item 3 originally suggested "~15–20% NAV per position"; the document already states "≤10–15% một mã" at line 1025 (§9.3). Task 4's callout was written to use the existing 10–15% figure instead, to avoid introducing an internal contradiction — this is a refinement of the spec's exact wording, not a deviation from its intent.
- **Design refinement applied during planning:** the spec's Part A description ("CSS fail-safe baseline") is implemented here via a JS-side `forceRevealAll()` + `try/catch` + `rootMargin` + load-timeout combination rather than flipping `blog.css`'s shared `.dt-reveal`/`.svg-draw` defaults — because that CSS file is shared across multiple blog posts and changing its defaults would risk regressions on pages this plan doesn't touch. Net effect (no-JS-or-JS-failure ⇒ still fully visible) is the same; blast radius is smaller.
