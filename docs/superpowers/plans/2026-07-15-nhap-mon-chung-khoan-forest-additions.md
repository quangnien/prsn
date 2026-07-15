# Nhập Môn Chứng Khoán — Forest-View Content Additions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close four identified knowledge gaps in the Vietnamese stock-market primer (`blog/nhap-mon-chung-khoan/index.html`) — room ngoại, margin-call math, macro forces on stock prices, and qualitative business analysis — by inserting content that reuses existing, already-responsive HTML/CSS components.

**Architecture:** Single-file content edits. No new CSS classes, no new JS, no page split. Every new block reuses a component class already defined in `blog/blog.css` and already proven responsive/theme-safe in production: `callout callout-info`, `deep-dive`, `compare-grid compare-grid--3`, `self-check`. None of the new blocks use the `dt-reveal`/`svg-draw`/`flow-step` JS-reveal classes, so they render immediately with no IntersectionObserver dependency — this sidesteps the whole class of "hidden until JS fires" bugs the prior pass had to fix.

**Tech Stack:** Static HTML/CSS, no build step. Verification via `git grep`, a Node one-liner for HTML tag-balance sanity, and Chrome headless screenshots.

## Global Constraints

- Target file for all content edits: `blog/nhap-mon-chung-khoan/index.html` (repo-relative from `F:\fe\prsn-portfolio\prsn`).
- No new CSS/JS files or classes — reuse `callout-info`, `deep-dive`, `compare-grid compare-grid--3`, `self-check`, `blog-table` exactly as they exist today.
- Do not touch `§8.1`/`§8.4` (candlestick/Fibonacci diagrams) or any `dt-reveal`/`svg-draw`/`flow-step` markup — those were fixed and verified in the prior pass (2026-07-14) and are out of scope.
- All new prose is Vietnamese, matching the document's existing tone (direct, concrete numeric examples, `<strong>` for key terms, explicit disclaimers where numbers are illustrative).
- Every numeric example must be internally consistent (the plan below has pre-computed all figures — do not re-derive them differently).
- Every new section heading gets an `id` attribute and, where the spec calls for it, a matching TOC entry in `<aside class="blog-toc">`.

---

### Task 1: Room ngoại explainer (§6.4) + glossary row

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html` (two edits: callout insertion near line 643, glossary row insertion near line 1511)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: a new `id`-free callout in §6.4 (no anchor needed — not referenced by TOC or cross-links elsewhere) and a new glossary table row. Task 3 (§2.6) will link to this callout's *section* via the existing `#s6-4` anchor (already present on the `<h3 id="s6-4">` heading), not to the callout itself.

- [ ] **Step 1: Insert the room-ngoại callout in §6.4**

Use Edit on `blog/nhap-mon-chung-khoan/index.html` with this exact `old_string`:

```html
        <p style="font-size:0.8rem;color:var(--muted)">* Tên quỹ/mã ETF nêu trên để minh họa cách phân loại — không phải khuyến nghị đầu tư. Mã và công ty quản lý có thể thay đổi; luôn kiểm tra lại thông tin chính thức trên trang HOSE hoặc trang công ty quản lý quỹ trước khi giao dịch.</p>

        <div class="callout callout-info">
            <div class="callout-title">💡 Phân biệt nơi mua</div>
```

Replace with:

```html
        <p style="font-size:0.8rem;color:var(--muted)">* Tên quỹ/mã ETF nêu trên để minh họa cách phân loại — không phải khuyến nghị đầu tư. Mã và công ty quản lý có thể thay đổi; luôn kiểm tra lại thông tin chính thức trên trang HOSE hoặc trang công ty quản lý quỹ trước khi giao dịch.</p>

        <div class="callout callout-info">
            <div class="callout-title">💡 "Room ngoại" là gì?</div>
            <p><strong>Room ngoại (foreign ownership limit)</strong> là tỷ lệ tối đa cổ phần một doanh nghiệp niêm yết được phép bán cho nhà đầu tư nước ngoài, theo quy định pháp luật hoặc điều lệ công ty. Đa số doanh nghiệp room ngoại 100%; một số ngành có điều kiện (ngân hàng, viễn thông, hàng không...) bị giới hạn thấp hơn — có mã room ngoại chỉ 15–30%. Khi khối ngoại đã mua kín room, họ <strong>không thể mua thêm cổ phiếu đó trên sàn</strong> dù muốn, dù còn tiền. Đây là lý do các ETF "room-free" như FUEVFVND (rổ Diamond) ra đời: gom sẵn các mã đã hết room ngoại vào một chứng chỉ quỹ mà nhà đầu tư nước ngoài vẫn mua bán bình thường.</p>
        </div>

        <div class="callout callout-info">
            <div class="callout-title">💡 Phân biệt nơi mua</div>
```

- [ ] **Step 2: Insert the glossary row**

Use Edit on the same file with this exact `old_string`:

```html
                    <tr><td>Vốn hóa</td><td>Market capitalization</td><td>Giá cổ phiếu × tổng số cổ phiếu lưu hành</td></tr>
```

Replace with:

```html
                    <tr><td>Vốn hóa</td><td>Market capitalization</td><td>Giá cổ phiếu × tổng số cổ phiếu lưu hành</td></tr>
                    <tr><td>Room ngoại</td><td>Foreign ownership limit</td><td>Tỷ lệ sở hữu tối đa nhà đầu tư nước ngoài được phép nắm giữ tại một doanh nghiệp niêm yết</td></tr>
```

- [ ] **Step 3: Verify with grep**

Run:
```bash
grep -c "Room ngoại\" là gì" blog/nhap-mon-chung-khoan/index.html
grep -c "<tr><td>Room ngoại</td>" blog/nhap-mon-chung-khoan/index.html
```
Expected: both output `1`.

- [ ] **Step 4: HTML tag-balance sanity check**

Run:
```bash
node -e "const fs=require('fs');const c=fs.readFileSync('blog/nhap-mon-chung-khoan/index.html','utf8');const o=(c.match(/<div/g)||[]).length;const cl=(c.match(/<\/div>/g)||[]).length;console.log('div open:',o,'div close:',cl, o===cl?'BALANCED':'MISMATCH');"
```
Expected: `BALANCED`.

- [ ] **Step 5: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add room ngoai explainer to sec 6.4 and glossary

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Margin call math deep-dive (§4.8)

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html` (one edit, near line 508)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: a new `deep-dive` block inside §4.8, no new `id` (not referenced elsewhere).

- [ ] **Step 1: Insert the deep-dive block**

Use Edit with this exact `old_string`:

```html
        <div class="callout callout-warn">
            <div class="callout-title">❌ Quy tắc cứng cho người mới</div>
            <p><strong>KHÔNG dùng margin trong ít nhất năm đầu tiên.</strong> Phần lớn các vụ "cháy tài khoản" trên thị trường đều có bàn tay của đòn bẩy.</p>
        </div>

        <hr>

        <h2 id="s5">5. Trái phiếu: cho vay lấy lãi — nhưng không phải không có rủi ro</h2>
```

Replace with:

```html
        <div class="callout callout-warn">
            <div class="callout-title">❌ Quy tắc cứng cho người mới</div>
            <p><strong>KHÔNG dùng margin trong ít nhất năm đầu tiên.</strong> Phần lớn các vụ "cháy tài khoản" trên thị trường đều có bàn tay của đòn bẩy.</p>
        </div>

        <div class="deep-dive">
            <div class="deep-dive-label">🔬 Deep Dive</div>
            <div class="deep-dive-title">Bán giải chấp kích hoạt ở đâu? — con số cụ thể</div>
            <div class="deep-dive-audience">Dành cho: người muốn hiểu chính xác cơ chế "cháy tài khoản"</div>
            <p>Ví dụ: vốn tự có 100 triệu, vay margin thêm 100 triệu (tỷ lệ ký quỹ ban đầu 50%, đòn bẩy 1:1) → mua 200 triệu cổ phiếu ABC. Khoản nợ vay <strong>không đổi</strong> khi giá biến động — chỉ giá trị tài sản đảm bảo và vốn chủ sở hữu thay đổi:</p>
            <div class="blog-table-wrapper">
                <table class="blog-table">
                    <thead><tr><th>Giá ABC thay đổi</th><th>Giá trị TS đảm bảo</th><th>Nợ vay margin</th><th>Vốn chủ sở hữu</th><th>Tỷ lệ ký quỹ thực tế</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                        <tr><td>Chưa giảm</td><td>200tr</td><td>100tr</td><td>100tr</td><td>50%</td><td>An toàn</td></tr>
                        <tr><td>Giảm 10%</td><td>180tr</td><td>100tr</td><td>80tr</td><td>~44,4%</td><td>An toàn</td></tr>
                        <tr><td>Giảm 20%</td><td>160tr</td><td>100tr</td><td>60tr</td><td>37,5%</td><td>Cảnh báo sớm</td></tr>
                        <tr><td>Giảm 25%</td><td>150tr</td><td>100tr</td><td>50tr</td><td>~33,3%</td><td>🚨 Gọi ký quỹ (margin call)</td></tr>
                        <tr><td>Giảm 30%, không nộp thêm</td><td>140tr</td><td>100tr</td><td>40tr</td><td>~28,6%</td><td>⚠️ Bán giải chấp (force sell)</td></tr>
                    </tbody>
                </table>
            </div>
            <p>Tỷ lệ ký quỹ ban đầu, tỷ lệ duy trì và ngưỡng gọi ký quỹ cụ thể <strong>do từng CTCK quy định khác nhau</strong> trong khung của UBCKNN — bảng trên minh họa <em>cơ chế</em>, không phải số chính xác của một CTCK cụ thể. Điểm mấu chốt: với vốn tự có ban đầu chỉ 100 triệu, một cú giảm giá 30% của riêng cổ phiếu ABC — hoàn toàn có thể xảy ra trong vài tuần xấu — khiến CTCK <strong>tự động bán</strong> cổ phiếu của bạn, thường đúng lúc giá đã thấp, khóa chặt khoản lỗ 60% trên vốn thật (mất 60tr/100tr) trong khi bản thân cổ phiếu mới giảm 30%. Đây chính xác là lý do quy tắc cứng ở trên tồn tại.</p>
        </div>

        <hr>

        <h2 id="s5">5. Trái phiếu: cho vay lấy lãi — nhưng không phải không có rủi ro</h2>
```

- [ ] **Step 2: Verify with grep**

Run:
```bash
grep -c "Bán giải chấp kích hoạt ở đâu" blog/nhap-mon-chung-khoan/index.html
grep -c "<tr><td>Giảm 30%, không nộp thêm</td>" blog/nhap-mon-chung-khoan/index.html
```
Expected: both `1`.

- [ ] **Step 3: HTML tag-balance sanity check**

Run:
```bash
node -e "const fs=require('fs');const c=fs.readFileSync('blog/nhap-mon-chung-khoan/index.html','utf8');const o=(c.match(/<table/g)||[]).length;const cl=(c.match(/<\/table>/g)||[]).length;console.log('table open:',o,'table close:',cl, o===cl?'BALANCED':'MISMATCH');const to=(c.match(/<tr>/g)||[]).length;const tc=(c.match(/<\/tr>/g)||[]).length;console.log('tr open:',to,'tr close:',tc, to===tc?'BALANCED':'MISMATCH');"
```
Expected: both `BALANCED`.

- [ ] **Step 4: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add margin call math deep-dive to sec 4.8

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: New §2.6 "Macro forces → stock prices" + TOC entry

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html` (two edits: section insertion near line 292, TOC insertion near line 1599)

**Interfaces:**
- Consumes: cross-links to `#s5-2` (existing anchor, Task-independent — already in the file) and `#s6-4` (existing anchor).
- Produces: new anchor `id="s2-6"` that Task 1/2/4 do not depend on, but which the TOC edit in this same task links to.

- [ ] **Step 1: Insert the new §2.6 section**

Use Edit with this exact `old_string`:

```html
        <div class="callout callout-warn">
            <div class="callout-title">💡 Đừng FOMO</div>
            <p>Nâng hạng là câu chuyện <strong>dài hạn về chất</strong>, không phải "kèo x2 tài khoản trong 3 tháng". Giá cổ phiếu thường đã phản ánh trước một phần kỳ vọng. Người mới cứ học bài bản — cơ hội dài hạn không biến mất chỉ sau một sự kiện.</p>
        </div>

        <hr>

        <h2 id="s3">3. Chứng khoán là gì? Phân loại 4 nhóm</h2>
```

Replace with:

```html
        <div class="callout callout-warn">
            <div class="callout-title">💡 Đừng FOMO</div>
            <p>Nâng hạng là câu chuyện <strong>dài hạn về chất</strong>, không phải "kèo x2 tài khoản trong 3 tháng". Giá cổ phiếu thường đã phản ánh trước một phần kỳ vọng. Người mới cứ học bài bản — cơ hội dài hạn không biến mất chỉ sau một sự kiện.</p>
        </div>

        <h3 id="s2-6">2.6. Vì sao giá cổ phiếu lên xuống theo lãi suất, tỷ giá và dòng vốn ngoại?</h3>
        <p>Tin tức tài chính hàng ngày nhắc liên tục đến lãi suất, tỷ giá, khối ngoại mua/bán ròng — nhưng ít khi giải thích rõ chúng nối với giá cổ phiếu qua đường nào. Ba lực chính:</p>

        <div class="compare-grid compare-grid--3">
            <div class="compare-col compare-col--a">
                <div class="compare-col-title">💰 Lãi suất điều hành</div>
                <p>Ngân hàng Nhà nước (NHNN) hạ lãi suất → gửi tiết kiệm kém hấp dẫn hơn, chi phí vay của doanh nghiệp giảm → dòng tiền có xu hướng dịch chuyển sang kênh sinh lời cao hơn như cổ phiếu, định giá (P/E) có xu hướng giãn ra. Lãi suất tăng thì ngược lại — cơ chế song song với <a href="#s5-2">rủi ro lãi suất của trái phiếu</a> ở Phần 5, chỉ khác kênh tác động là chi phí cơ hội chứ không phải định giá dòng tiền cố định.</p>
            </div>
            <div class="compare-col compare-col--b">
                <div class="compare-col-title">💱 Tỷ giá USD/VND</div>
                <p>Tỷ giá biến động mạnh khiến nhà đầu tư nước ngoài lo ngại giá trị tài sản quy đổi về USD giảm đi — dù cổ phiếu VN tăng giá tính bằng VND, tính ra USD có thể lỗ. Áp lực này có thể khiến khối ngoại rút vốn, đặc biệt ở các thị trường mới nổi/cận biên như Việt Nam.</p>
            </div>
            <div class="compare-col compare-col--a">
                <div class="compare-col-title">🌊 Dòng vốn khối ngoại</div>
                <p>Nhà đầu tư nước ngoài giao dịch khối lượng lớn, tập trung vào nhóm vốn hóa lớn (VN30) — mua ròng/bán ròng liên tục nhiều phiên tác động trực tiếp lên cung–cầu và thường được thị trường trong nước theo dõi như một chỉ báo tâm lý. Xem thêm <a href="#s6-4">room ngoại</a> ở Phần 6 — khi một mã đã hết room, khối ngoại chuyển hướng sang các ETF room-free.</p>
            </div>
        </div>

        <p style="font-size:0.85rem;color:var(--muted)">Lưu ý: đây là các xu hướng được nhiều nhà kinh tế học đồng thuận về <em>hướng</em> tác động, không phải công thức máy móc — độ trễ, cường độ, và đôi khi cả chiều tác động có thể khác nhau tùy bối cảnh cụ thể. Đừng dùng ba yếu tố này để "đoán đỉnh đáy" ngắn hạn; chúng hữu ích hơn để hiểu bối cảnh vĩ mô dài hạn.</p>

        <hr>

        <h2 id="s3">3. Chứng khoán là gì? Phân loại 4 nhóm</h2>
```

- [ ] **Step 2: Insert the TOC entry**

Use Edit with this exact `old_string`:

```html
            <li class="toc-h3"><a href="#s2-4">2.4 Ba sàn & chỉ số</a></li>
            <li><a href="#s3">3. Phân loại chứng khoán</a></li>
```

Replace with:

```html
            <li class="toc-h3"><a href="#s2-4">2.4 Ba sàn & chỉ số</a></li>
            <li class="toc-h3"><a href="#s2-6">2.6 Lãi suất, tỷ giá & dòng vốn ngoại</a></li>
            <li><a href="#s3">3. Phân loại chứng khoán</a></li>
```

- [ ] **Step 3: Verify with grep**

Run:
```bash
grep -c 'id="s2-6"' blog/nhap-mon-chung-khoan/index.html
grep -c 'href="#s2-6"' blog/nhap-mon-chung-khoan/index.html
grep -c "compare-grid compare-grid--3" blog/nhap-mon-chung-khoan/index.html
```
Expected: `1`, `1`, `1` (the `id` appears once on the heading, the TOC `href` links to it once, and this is the first use of the 3-column variant in the file).

- [ ] **Step 4: HTML tag-balance sanity check**

Run:
```bash
node -e "const fs=require('fs');const c=fs.readFileSync('blog/nhap-mon-chung-khoan/index.html','utf8');const o=(c.match(/<div/g)||[]).length;const cl=(c.match(/<\/div>/g)||[]).length;console.log('div open:',o,'div close:',cl, o===cl?'BALANCED':'MISMATCH');"
```
Expected: `BALANCED`.

- [ ] **Step 5: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add sec 2.6 macro forces (interest rate/FX/foreign flow) on stock prices

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: New §7.3 "Qualitative business analysis" + TOC entry

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html` (two edits: section insertion near line 780, TOC insertion near line 1612)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: new anchor `id="s7-3"`.

- [ ] **Step 1: Insert the new §7.3 section**

Use Edit with this exact `old_string`:

```html
            <p>Bài học chung: <strong>giá phản ánh kỳ vọng tương lai, còn E trong P/E là quá khứ.</strong> Câu hỏi đúng luôn là "lợi nhuận <em>sắp tới</em> sẽ ra sao?".</p>
        </div>

        <hr>

        <h2 id="s8">8. Phân tích kỹ thuật: nến, chỉ báo, Fibonacci (và lời cảnh báo)</h2>
```

Replace with:

```html
            <p>Bài học chung: <strong>giá phản ánh kỳ vọng tương lai, còn E trong P/E là quá khứ.</strong> Câu hỏi đúng luôn là "lợi nhuận <em>sắp tới</em> sẽ ra sao?".</p>
        </div>

        <h3 id="s7-3">7.3. Phân tích định tính — những câu hỏi số liệu không trả lời được</h3>
        <p>Tỷ số ở mục 7.2 cho biết doanh nghiệp <em>đã</em> làm ăn ra sao trong quá khứ. Chúng không trả lời được: doanh nghiệp có giữ được vị thế đó trong 5–10 năm tới không? Bốn nhóm câu hỏi định tính sau <strong>bổ sung</strong> phần con số bỏ sót — dùng song song với 7.2, không thay thế:</p>

        <div class="self-check">
            <div class="self-check-title">🔎 Checklist phân tích định tính</div>
            <ol>
                <li><strong>Lợi thế cạnh tranh (moat):</strong> Vì sao khách hàng chọn doanh nghiệp này thay vì đối thủ? Lợi thế đó có dễ bị sao chép không (thương hiệu, chi phí thấp, mạng lưới, chi phí chuyển đổi cao)?</li>
                <li><strong>Ban lãnh đạo:</strong> Đội ngũ điều hành có lịch sử thực hiện đúng cam kết với cổ đông không? Có giao dịch với bên liên quan (người nhà, công ty "sân sau") đáng ngờ trong BCTC không?</li>
                <li><strong>Vị thế ngành:</strong> Ngành đang tăng trưởng, chững lại, hay suy thoái? Doanh nghiệp đứng ở đâu trong chuỗi giá trị — có phụ thuộc quá nhiều vào một khách hàng/nhà cung cấp không?</li>
                <li><strong>Tính minh bạch:</strong> BCTC có được kiểm toán bởi công ty uy tín không? Doanh nghiệp có lịch sử bị UBCKNN xử phạt vi phạm công bố thông tin không?</li>
            </ol>
        </div>

        <p>Không có câu trả lời "điểm số" cho bốn câu hỏi này như P/E hay ROE — đây là lý do phân tích cơ bản luôn cần <strong>phán đoán</strong>, không chỉ phép tính. Một doanh nghiệp vượt qua cả bộ lọc định lượng (7.2) lẫn định tính (7.3) mới là ứng viên đáng nghiên cứu sâu hơn.</p>

        <hr>

        <h2 id="s8">8. Phân tích kỹ thuật: nến, chỉ báo, Fibonacci (và lời cảnh báo)</h2>
```

- [ ] **Step 2: Insert the TOC entry**

Use Edit with this exact `old_string`:

```html
            <li class="toc-h3"><a href="#s7-2">7.2 Bộ chỉ số vỡ lòng</a></li>
            <li><a href="#s8">8. Phân tích kỹ thuật</a></li>
```

Replace with:

```html
            <li class="toc-h3"><a href="#s7-2">7.2 Bộ chỉ số vỡ lòng</a></li>
            <li class="toc-h3"><a href="#s7-3">7.3 Phân tích định tính</a></li>
            <li><a href="#s8">8. Phân tích kỹ thuật</a></li>
```

- [ ] **Step 3: Verify with grep**

Run:
```bash
grep -c 'id="s7-3"' blog/nhap-mon-chung-khoan/index.html
grep -c 'href="#s7-3"' blog/nhap-mon-chung-khoan/index.html
```
Expected: `1`, `1`.

- [ ] **Step 4: HTML tag-balance sanity check**

Run:
```bash
node -e "const fs=require('fs');const c=fs.readFileSync('blog/nhap-mon-chung-khoan/index.html','utf8');const o=(c.match(/<div/g)||[]).length;const cl=(c.match(/<\/div>/g)||[]).length;console.log('div open:',o,'div close:',cl, o===cl?'BALANCED':'MISMATCH');const oo=(c.match(/<ol/g)||[]).length;const oc=(c.match(/<\/ol>/g)||[]).length;console.log('ol open:',oo,'ol close:',oc, oo===oc?'BALANCED':'MISMATCH');"
```
Expected: both `BALANCED`.

- [ ] **Step 5: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: add sec 7.3 qualitative business analysis checklist

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Reading-time update + full verification pass

**Files:**
- Modify: `blog/nhap-mon-chung-khoan/index.html` (reading-time text, near line 52)

**Interfaces:**
- Consumes: the completed state of Tasks 1–4 (this task runs last and verifies the whole file).
- Produces: nothing consumed by other tasks — this is the terminal task.

- [ ] **Step 1: Update the reading-time estimate**

Use Edit with this exact `old_string`:

```html
                ~60 min read
```

Replace with:

```html
                ~62 min read
```

- [ ] **Step 2: Verify with grep**

Run:
```bash
grep -c "~62 min read" blog/nhap-mon-chung-khoan/index.html
```
Expected: `1`.

- [ ] **Step 3: Full-file HTML tag-balance check**

Run:
```bash
node -e "
const fs=require('fs');
const c=fs.readFileSync('blog/nhap-mon-chung-khoan/index.html','utf8');
const pairs=[['div','</div>'],['table','</table>'],['tr>','</tr>'],['ol>','</ol>'],['ul>','</ul>']];
for (const [open,close] of pairs) {
  const o=(c.match(new RegExp('<'+open.replace('>','(?:\\\\s|>)'),'g'))||[]).length;
  const cl=(c.match(new RegExp(close,'g'))||[]).length;
  console.log(open,'open:',o,close,'close:',cl, o===cl?'BALANCED':'MISMATCH');
}
"
```
Expected: `BALANCED` on every line.

- [ ] **Step 4: Confirm no duplicate anchor IDs across the whole file**

Run:
```bash
grep -o 'id="[a-zA-Z0-9-]*"' blog/nhap-mon-chung-khoan/index.html | sort | uniq -d
```
Expected: empty output (no duplicates).

- [ ] **Step 5: Chrome headless visual smoke test — desktop**

Run (adjust the Chrome path if it differs on this machine; check `C:\Program Files\Google\Chrome\Application\chrome.exe` first):
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --window-size=1280,4000 --screenshot="C:\Users\Admin\AppData\Local\Temp\claude\F--fe-prsn-portfolio-prsn\487bbaf0-9c8c-40bf-8f6b-3caeb1b4b938\scratchpad\s26-desktop.png" "file:///F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html#s2-6"
```

- [ ] **Step 6: Chrome headless visual smoke test — mobile (375px, iPhone SE width)**

Run:
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --window-size=375,4000 --screenshot="C:\Users\Admin\AppData\Local\Temp\claude\F--fe-prsn-portfolio-prsn\487bbaf0-9c8c-40bf-8f6b-3caeb1b4b938\scratchpad\s26-mobile.png" "file:///F:/fe/prsn-portfolio/prsn/blog/nhap-mon-chung-khoan/index.html#s2-6"
```
Repeat both screenshots anchored at `#s7-3` and `#s4-8` (margin section) and `#s6-4` (room ngoại) to cover all four new blocks — 8 screenshots total, or fewer if one screenshot's scroll position already captures multiple sections.

- [ ] **Step 7: Read the screenshots to visually confirm no overflow, no broken layout, no unstyled/raw HTML**

Use the Read tool on each `.png` file produced in Steps 5–6. Confirm: text wraps within the viewport width, the 3-column macro-forces grid collapses to 1 column on the 375px screenshot, the margin-call table doesn't overflow the article column, and the self-check checklist renders with proper numbering/indentation.

- [ ] **Step 8: Confirm TOC scroll-spy, glossary search, and console-error safety by construction**

No scripted step needed here — verify by reading the existing `<script>` block (already in the file, untouched by this plan):
- TOC scroll-spy (`tocObserver`) builds its heading list by iterating `document.querySelectorAll('.toc-list a')` and resolving each `href` with `document.querySelector` — it is not a hardcoded list, so the two new `#s2-6`/`#s7-3` entries added in Tasks 3–4 are picked up automatically. Confirm this by opening the two new anchors in a normal browser tab (not headless) and checking the corresponding TOC entry highlights on scroll.
- Glossary filter (`glossaryFilter` input handler) filters `#glossary-table tbody tr` by `row.textContent`, generic over row count — type "room ngoại" into the glossary search box and confirm the new row (added in Task 1) is the only one that survives the filter.
- Console-error risk: none of the four new blocks use the `dt-reveal`, `svg-draw`, or `flow-step` classes that the page's `IntersectionObserver` setup targets, and none add new `<script>` tags — so no new code path executes. Open the page in a normal Chrome tab with DevTools open, scroll through the four new sections, and confirm the console stays empty.

- [ ] **Step 9: Commit**

```bash
git add blog/nhap-mon-chung-khoan/index.html
git commit -m "content: update reading-time estimate after forest-view additions

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Post-plan note

Tasks 1–4 are independent of each other (different sections, no shared state) and could theoretically run in any order or in parallel across subagents. Task 5 must run last since it verifies the cumulative result of all four.
