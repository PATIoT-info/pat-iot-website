/* Design Your Panel: live preview of a PAT touch panel on a wall.
   Sizes, boards, colours and finishes follow the PAT brochure and the boards in production.
   Uploaded photos and logos stay in the visitor's browser. */
(function () {
    'use strict';

    const form = document.getElementById('dpForm');
    const canvas = document.getElementById('dpCanvas');
    if (!form || !canvas) return;
    const mainCtx = canvas.getContext('2d');
    let ctx = mainCtx;
    const WHATSAPP = '919030983040';

    // Only the boards made for customers (pat_matter_hub FINAL_MASTER_CODES / FINAL_SLAVE_CODES).
    // A fan regulator (fan + speed bars) or a curtain (open ‹ › and close › ‹) takes the room of 2 switches.
    // A socket also takes 2 modules, so a socket plate runs the next smaller board (12 Module + socket = 10 Module board).
    // Layout codes: S = switch, FAN = fan regulator, CUR = curtain, SOCK = socket (always at the right end).
    const L = 'light', P = 'pendant', B = 'bulb', R = 'ring';
    const S = 'S', FAN = 'FAN', CUR = 'CUR', SOCK = 'SOCK';
    const S4 = [S, S, S, S], S6 = [S, S, S, S, S, S];
    // Plate sizes in mm, frame included
    const SIZES = {
        '2':  { name: '2 Module',  w: 90, pitch: 30.7,  h: 90, boards: [
            { label: '2 switches', rows: [[S, S]] },
            { label: 'Fan with speed', rows: [[FAN]] },
            { label: 'Curtain', rows: [[CUR]] }] },
        '4':  { name: '4 Module',  w: 148, pitch: 30.6, h: 90, boards: [
            { label: '4 switches', rows: [S4] },
            { label: '2 switches + fan', rows: [[S, S, FAN]] },
            { label: '2 switches + curtain', rows: [[S, S, CUR]] },
            { label: '2 curtains', rows: [[CUR, CUR]] },
            { label: '2 switches + socket', rows: [[S, S, SOCK]] }] },
        '6':  { name: '6 Module',  w: 222, pitch: 31.8, h: 90, boards: [
            { label: '6 switches', rows: [S6] },
            { label: '4 switches + fan', rows: [[...S4, FAN]] },
            { label: '4 switches + curtain', rows: [[...S4, CUR]] },
            { label: '4 switches + socket', rows: [[...S4, SOCK]] },
            { label: 'Fan + 2 switches + socket', rows: [[FAN, S, S, SOCK]] }] },
        '8':  { name: '8 Module',  w: 250, pitch: 26.6, h: 90, boards: [
            { label: '8 switches', rows: [[...S6, S, S]] },
            { label: '6 switches + fan', rows: [[...S6, FAN]] },
            { label: '6 switches + curtain', rows: [[...S6, CUR]] },
            { label: 'Fan + 4 switches + curtain', rows: [[FAN, ...S4, CUR]] },
            { label: '6 switches + socket', rows: [[...S6, SOCK]] },
            { label: 'Fan + 4 switches + socket', rows: [[FAN, ...S4, SOCK]] }] },
        '12': { name: '12 Module', w: 228, pitch: 30.5, h: 158, boards: [
            { label: '12 switches', rows: [S6, S6] },
            { label: '10 switches + fan', rows: [S6, [...S4, FAN]] },
            { label: '10 switches + curtain', rows: [S6, [...S4, CUR]] },
            { label: 'Fan + 8 switches + curtain', rows: [[FAN, ...S4], [...S4, CUR]] },
            { label: '2 fans + 8 switches', rows: [[...S4, FAN], [...S4, FAN]] },
            { label: '10 switches + socket', rows: [S6, [...S4, SOCK]] },
            { label: 'Fan + 8 switches + socket', rows: [[FAN, ...S4], [...S4, SOCK]] },
            { label: '2 fans + 6 switches + socket', rows: [[FAN, ...S4], [FAN, S, S, SOCK]] }] }
    };
    const SOCKET_W = 70;
    const ICON_MM = 13;   // brochure icons are 14 mm on a 96 mm drawing; the real plates are 90 mm tall
    // Centre of each icon in a row, in mm from the plate's left edge.
    // Brochure layout: icons sit as one centred group with an even gap; on socket boards (brochure page 6)
    // they sit 27.4 mm apart, the last one 45 mm left of the socket's centre.
    function iconXs(spec, ri) {
        const n = spec.rows[ri].length, idx = [...Array(n).keys()];
        if (spec.socket) {
            const sr = spec.rows.length - 1, m = spec.rows[sr].length, last = spec.w - 51 - 45;
            const p = m > 1 ? Math.min(27.4, (last - 20) / (m - 1)) : 27.4, first = last - p * (m - 1);
            if (ri === sr) return idx.map(i => first + p * i);
            // the row above lines up with the socket row's columns
            const q = n > 1 ? Math.min(p, (spec.w - 20 - first) / (n - 1)) : 0;
            return idx.map(i => first + q * i);
        }
        const p = n > 1 ? Math.min(spec.pitch, (spec.w - 40) / (n - 1)) : 0;
        return idx.map(i => spec.w / 2 + (i - (n - 1) / 2) * p);
    }
    const FILL = [L, P, B, R, L, L, P, B, R, L, L, P];
    function currentSpec(src = state) {
        const b = SIZES[src.size];
        const board = b.boards[src.board] || b.boards[0];
        let n = 0, socket = false;
        const rows = board.rows.map(row => row.flatMap(c => {
            if (c === S) return [FILL[n++]];
            if (c === FAN) return ['fan', 'speed'];
            if (c === CUR) return ['copen', 'cclose'];
            socket = true; return [];
        }));
        return { ...b, rows, socket, switches: n, detail: board.label.toLowerCase() };
    }

    // Brochure colour range
    const COLOURS = [
        ['White', '#f7f7f5'], ['Black', '#1c1c1e'], ['Light Grey', '#c9cbcd'], ['Dark Grey', '#4a4d52'],
        ['Light Blue', '#a9cbe6'], ['Dark Blue', '#1f3a5f'], ['Light Green', '#b9dcb8'], ['Dark Green', '#24493a'],
        ['Baby Pink', '#f6d3dc'], ['Pink', '#e58fae'], ['Cream', '#efe4cc'], ['Brown', '#6b4630'], ['Orange', '#e9823a']
    ];

    const TEXTURES = {
        'marble-1': { name: 'Marble 1 (Blue Gold)', src: 'images/finishes/marble-1.jpg' },
        'marble-2': { name: 'Marble 2 (Mint)', src: 'images/finishes/marble-2.jpg' },
        'marble-3': { name: 'Marble 3 (Rose)', src: 'images/finishes/marble-3.jpg' },
        'wood':     { name: 'Wooden', src: 'images/finishes/wood.jpg' }
    };

    // Walls to try the panel on
    const WALLS = {
        studio: { name: 'Studio' },
        white:  { name: 'White wall', paint: '#efede8' },
        cream:  { name: 'Cream wall', paint: '#e6d7bb' },
        grey:   { name: 'Grey wall', paint: '#a9adb2' },
        sage:   { name: 'Sage green wall', paint: '#9fae94' },
        blue:   { name: 'Blue wall', paint: '#7f98b3' },
        brick:  { name: 'Brick wall' },
        wood:   { name: 'Wooden wall' },
        photo:  { name: 'Your wall photo' }
    };

    // Metal frame round the glass: 1.5 mm on each side, inside the board size. Stops run from the lit corner to the far one.
    const FRAME_MM = 1.5, CORNER_MM = 1.2;
    const FRAMES = {
        silver: { name: 'Silver', stops: ['#f4f5f7', '#c3c7cd', '#8e939a', '#d5d8dc', '#a4a8ae'] },
        black:  { name: 'Black', stops: ['#5c5c60', '#2a2a2d', '#0c0c0e', '#3a3a3d', '#161618'] },
        gold:   { name: 'Gold', stops: ['#fbe7a6', '#d9b25a', '#9c7426', '#e8c873', '#b58b35'] },
        rose:   { name: 'Rose gold', stops: ['#f8d5c8', '#dba292', '#a86c5c', '#e9b9aa', '#c08676'] }
    };
    const state = {
        frame: 'silver',
        size: '6', board: 4,       // 6 Module: fan + 2 switches + socket
        finish: 'colour',          // colour | texture | photo
        colour: '#f7f7f5', colourName: 'White',
        texture: 'marble-1',
        photo: null,
        photoCrop: { cx: 0.5, cy: 0.5, zoom: 1 },   // part of the own photo on the board
        logoCrop: null,                             // part of the own logo (0..1 of the picture)
        logo: 'pat',               // pat | own | none
        ownLogo: null,
        logoPos: 'br',
        logoSize: 1,
        wall: 'studio',
        wallScale: 1,              // board size on a wall photo
        pos: { x: 0, y: 0 },       // board offset on a wall photo
        light: { x: -0.35, y: -0.75 }   // light from the top left; follows the mouse on computers
    };

    const images = {};
    const looks = {};             // average brightness 0..1 and colour per image key
    function loadImage(key, src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => { images[key] = img; looks[key] = lookOf(img); resolve(img); };
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }
    function lookOf(img) {
        const c = document.createElement('canvas'); c.width = c.height = 24;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0, 24, 24);
        const d = x.getImageData(0, 0, 24, 24).data; let sum = 0, n = 0, r = 0, g = 0, b = 0;
        for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 30) continue;
            sum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; n++;
            r += d[i]; g += d[i + 1]; b += d[i + 2];
        }
        return n ? { tone: sum / n, rgb: [r / n, g / n, b / n] } : { tone: 1, rgb: [240, 240, 240] };
    }
    function hexRgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
    function hexBrightness(hex) {
        const [r, g, b] = hexRgb(hex);
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }
    function rgba(rgb, f, a) {      // f < 0 darkens, f > 0 lightens
        const m = v => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f);
        return `rgba(${m(rgb[0])},${m(rgb[1])},${m(rgb[2])},${a})`;
    }

    /* ── Drawing ─────────────────────────────────────────── */
    // Everything is drawn in "logical" pixels and scaled up for sharp screens and for the
    // high quality download, so the picture stays crisp at any size.
    /* ── Workspace: many boards in one order ──────────────────────────────
       `state` always holds the board being edited; `boards` has one entry per board of the order.
       Boards of the same size and type sit together. "Apply changes to" decides whether an edit
       changes only the selected board, all boards like it, or every board. */
    const BOARD_KEYS = ['size', 'board', 'finish', 'colour', 'colourName', 'texture', 'photo', 'photoCrop',
        'logo', 'ownLogo', 'logoPos', 'logoSize', 'logoCrop', 'frame'];
    const LOOK_KEYS = ['photoImg', 'logoImg', 'photoLook', 'photoUrl'];
    // Settings that belong together: when one of them changes, the whole set goes to the other boards in scope
    const FAMILIES = [['size', 'board'],
        ['finish', 'colour', 'colourName', 'texture', 'photo', 'photoCrop', 'photoImg', 'photoLook', 'photoUrl'],
        ['logo', 'ownLogo', 'logoImg', 'logoCrop'], ['logoPos'], ['logoSize'], ['frame']];
    const copyVal = v => v && typeof v === 'object' ? { ...v } : v;
    let boards = [], active = 0, view = 'one', scope = 'one', hits = [], photoUrl = '';
    const MAX_BOARDS = 200;
    const kindOf = b => b.size + '.' + b.board;
    function snapshot() {
        const b = {};
        BOARD_KEYS.forEach(k => { b[k] = copyVal(state[k]); });
        b.photoImg = images.photo || null; b.logoImg = images.ownLogo || null;
        b.photoLook = looks.photo || null; b.photoUrl = photoUrl;
        return b;
    }
    function load(b) {
        BOARD_KEYS.forEach(k => { state[k] = copyVal(b[k]); });
        images.photo = b.photoImg; images.ownLogo = b.logoImg; looks.photo = b.photoLook; photoUrl = b.photoUrl;
    }
    const inScope = (b, ref) => scope === 'all' || (scope === 'group' && kindOf(b) === kindOf(ref));
    // Store the edits of the board on screen, and pass them on to the other boards in scope
    function saveActive() {
        const cur = boards[active]; if (!cur) return;
        const now = snapshot(), was = kindOf(cur);
        if (scope !== 'one' && boards.length > 1) {
            const diff = k => LOOK_KEYS.includes(k) ? cur[k] !== now[k] : JSON.stringify(cur[k]) !== JSON.stringify(now[k]);
            const changed = FAMILIES.filter(f => f.some(diff)).flat();
            if (changed.length) boards.forEach(b => {
                if (b !== cur && inScope(b, cur)) changed.forEach(k => { b[k] = LOOK_KEYS.includes(k) ? now[k] : copyVal(now[k]); });   // pictures are shared, not copied
            });
        }
        Object.assign(cur, now);
        if (kindOf(cur) !== was) regroup(cur, was);
    }
    // A board that changed size or type joins the boards like it (or sits right after its old group)
    function regroup(cur, was) {
        const rest = boards.filter(b => b !== cur), order = [];
        rest.forEach(b => { if (!order.includes(kindOf(b))) order.push(kindOf(b)); });
        const k = kindOf(cur);
        if (!order.includes(k)) { const at = order.indexOf(was); order.splice(at < 0 ? order.length : at + 1, 0, k); }
        const all = rest.concat(cur);
        boards = order.flatMap(g => all.filter(b => kindOf(b) === g));
        active = boards.indexOf(cur);
    }
    function sortGroups() {
        const order = [];
        boards.forEach(b => { if (!order.includes(kindOf(b))) order.push(kindOf(b)); });
        boards = order.flatMap(g => boards.filter(b => kindOf(b) === g));
    }
    // Boards that look exactly alike count as one design with a quantity (for the message, file and link)
    const imgId = (() => { const ids = new WeakMap(); let n = 0; return o => !o ? 0 : ids.get(o) || (ids.set(o, ++n), n); })();
    function lookSig(b) {
        const f = b.finish;
        return JSON.stringify([b.size, b.board, f,
            f === 'texture' ? b.texture : f === 'photo' ? [imgId(b.photoImg), b.photoCrop] : b.colour,
            b.logo, b.logo === 'none' ? 0 : [b.logoPos, b.logoSize],
            b.logo === 'own' ? [imgId(b.logoImg), b.logoCrop] : 0, b.frame]);
    }
    function designs() {
        const out = [], at = new Map();
        boards.forEach(b => {
            const k = lookSig(b);
            if (at.has(k)) out[at.get(k)].qty++;
            else { at.set(k, out.length); out.push({ b, qty: 1 }); }
        });
        return out;
    }
    const showAll = () => view === 'all' && boards.length > 1;

    // Sheet layout in mm: each group of boards starts a new line with its name above, and wraps at the sheet width.
    // The sheet width is picked so the boards come out as big as possible on the screen.
    const PAD = 30, GAP = 12;
    function groupsOf() {
        const out = [];
        boards.forEach((b, i) => {
            const last = out[out.length - 1];
            if (last && last.key === kindOf(b)) last.n++;
            else out.push({ key: kindOf(b), start: i, n: 1, spec: currentSpec(b) });
        });
        return out;
    }
    function place(groups, SW, lab) {
        let y = 0, w = 0;
        const rects = [], labels = [];
        groups.forEach(g => {
            labels.push({ g, y });
            y += lab;
            let x = 0;
            for (let c = 0; c < g.n; c++) {
                if (x > 0 && x + g.spec.w > SW + 0.01) { x = 0; y += g.spec.h + GAP; }
                rects.push({ i: g.start + c, x, y, w: g.spec.w, h: g.spec.h });
                w = Math.max(w, x + g.spec.w); x += g.spec.w + GAP;
            }
            y += g.spec.h + GAP * 1.6;
        });
        return { w, h: y - GAP * 1.6, rects, labels, lab };
    }
    function sheetLayout() {
        const groups = groupsOf();
        const maxW = Math.max(...groups.map(g => g.spec.w));
        const longest = Math.max(...groups.map(g => g.n * (g.spec.w + GAP) - GAP));
        const availW = CW - 2 * PAD, availH = (fitHeight ? CW * 1.25 : 700) - 2 * PAD;
        let best = null;
        for (let k = 0; k <= 30; k++) {
            const SW = maxW + (longest - maxW) * k / 30;
            let lab = 0, L = null, sc = 0;
            for (let pass = 0; pass < 2; pass++) {
                L = place(groups, SW, lab);
                sc = Math.min(availW / L.w, availH / L.h, 2.6);
                lab = 30 / sc;
            }
            if (!best || sc > best.sc + 1e-6) best = { ...L, sc };
        }
        return best;
    }
    function sheetHeight() { const L = sheetLayout(); return Math.max(260, Math.round(L.h * L.sc + 2 * PAD)); }

    function paintAll() {
        ctx.fillStyle = '#f1f4f9'; ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = 'rgba(100,116,139,0.22)';
        for (let gx = 12; gx < CW; gx += 24) for (let gy = 12; gy < CH; gy += 24) ctx.fillRect(gx, gy, 1.3, 1.3);
        const L = sheetLayout(), sc = L.sc;
        const ox = (CW - L.w * sc) / 2, oy = (CH - L.h * sc) / 2;
        const keep = boards[active], minLine = MIN_LINE;
        hits = L.rects.map(r => ({ i: r.i, x: ox + r.x * sc, y: oy + r.y * sc, w: r.w * sc, h: r.h * sc }));
        MM = sc; MIN_LINE = 0.8;
        hits.forEach(r => { load(boards[r.i]); drawPanel(currentSpec(), r.x, r.y, r.w, r.h); });
        load(keep); MIN_LINE = minLine;
        noShadow();
        // Blue outline: strong on the board being edited, light on the others the edits also go to
        ctx.save();
        hits.forEach(r => {
            const on = r.i === active;
            if (!on && !inScope(boards[r.i], keep)) return;
            roundRect(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 8);
            ctx.lineWidth = on ? 3 : 2; ctx.strokeStyle = on ? '#2563eb' : 'rgba(37,99,235,0.5)';
            ctx.stroke();
        });
        ctx.restore();
        L.labels.forEach(({ g, y }) => {
            const ly = oy + y * sc + L.lab * sc / 2, mine = active >= g.start && active < g.start + g.n;
            ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
            ctx.font = '600 14px Inter, "Segoe UI", system-ui, sans-serif';
            ctx.fillStyle = mine ? '#1d4ed8' : '#334155';
            const name = `${g.spec.name} · ${g.spec.detail}`;
            ctx.fillText(name, ox, ly);
            const tx = ox + ctx.measureText(name).width + 8;
            ctx.font = '700 14px Inter, "Segoe UI", system-ui, sans-serif';
            ctx.fillStyle = '#0f172a'; ctx.fillText(`· ${g.n} board${g.n === 1 ? '' : 's'}`, tx, ly);
        });
    }

    function select(i) {
        if (!boards[i] || i === active) return;
        const wasWide = scope !== 'one';
        saveActive(); active = i; scope = 'one'; load(boards[i]);
        syncForm(); render();
        if (wasWide) toast(`Now changing board ${i + 1} only. Pick “All” under “Apply changes to” to change many again.`);
    }
    function setView(v) { view = v; render(); }
    function setScope(v) { saveActive(); scope = v; render(); }
    // "All 8 Module" when every board is an 8 Module is the same as "All boards"; one board has nothing to share with
    function fixScope() {
        const N = boards.length, cur = boards[active]; if (!cur) return;
        const same = boards.filter(b => kindOf(b) === kindOf(cur)).length;
        if (scope === 'group' && !(same > 1 && same < N)) scope = N > 1 && same === N ? 'all' : 'one';
        if (N < 2) scope = 'one';
    }
    const where = () => fitHeight ? 'in the form below' : 'on the left';
    function addBoards(size, type, n) {
        saveActive();
        n = Math.max(0, Math.min(MAX_BOARDS - boards.length, Math.round(+n) || 1));
        if (!n) return;
        const made = [];
        for (let c = 0; c < n; c++) made.push({ ...snapshot(), size, board: type });
        const last = boards.map(kindOf).lastIndexOf(kindOf(made[0]));
        boards.splice(last < 0 ? boards.length : last + 1, 0, ...made);
        active = boards.indexOf(made[0]); scope = 'one'; view = 'all';
        load(boards[active]); syncForm(); render();
        const name = SIZES[size].name;
        toast(`Added ${n} × ${name}. Tap any board in the picture to change just that one, or pick “All ${name}” to change them together.`);
    }
    function duplicate() {
        if (boards.length >= MAX_BOARDS) return;
        saveActive();
        const b = boards[active], copy = { ...b, photoCrop: copyVal(b.photoCrop), logoCrop: copyVal(b.logoCrop) };
        boards.splice(active + 1, 0, copy);
        active++; scope = 'one'; view = 'all';
        load(copy); syncForm(); render();
        toast(`Board ${active + 1} added, the same as board ${active}. Change it ${where()}.`);
    }
    function removeBoards() {
        saveActive();
        const gone = scope === 'one' ? [boards[active]] : boards.filter(b => inScope(b, boards[active]));
        if (gone.length >= boards.length) return;
        if (gone.length > 1 && !window.confirm(`Remove these ${gone.length} boards?`)) return;
        const before = boards.slice(0, active).filter(b => gone.includes(b)).length;
        boards = boards.filter(b => !gone.includes(b));
        active = Math.max(0, Math.min(active - before, boards.length - 1)); scope = 'one';
        load(boards[active]);
        if (boards.length < 2) view = 'one';
        syncForm(); render();
    }

    // Show the controls as the board being edited has them
    function syncForm() {
        $('dpSize').value = state.size; fillBoards();
        $('dpHex').value = state.colour.toUpperCase();
        form.querySelector(`input[name="dpLogo"][value="${state.logo}"]`).checked = true;
        posSelect.value = state.logoPos; logoSize.value = Math.round(state.logoSize * 100);
        posSelect.disabled = logoSize.disabled = state.logo === 'none';
        if (photoUrl) { photoBtn.style.setProperty('--img', `url("${photoUrl}")`); photoBtn.classList.add('has-img'); }
        else { photoBtn.style.removeProperty('--img'); photoBtn.classList.remove('has-img'); }
        closeWheel();
    }

    // "Your boards" bar under the preview
    const ws = document.createElement('div');
    ws.className = 'dp-ws';
    ws.innerHTML = `<div class="dp-ws-head">
            <span class="dp-ws-title">Your boards <span class="dp-ws-total"></span></span>
            <div class="dp-ws-view" role="group" aria-label="Preview">
                <button type="button" data-view="all"><i class="fas fa-table-cells" aria-hidden="true"></i> See all</button>
                <button type="button" data-view="one"><i class="fas fa-magnifying-glass-plus" aria-hidden="true"></i> Zoom in</button></div></div>
        <div class="dp-ws-scope">
            <span class="dp-ws-scope-label">Apply changes to</span>
            <div class="dp-ws-pills" role="group" aria-label="Apply changes to">
                <button type="button" data-scope="one"></button>
                <button type="button" data-scope="group"></button>
                <button type="button" data-scope="all"></button></div>
            <p class="dp-ws-hint"></p></div>
        <div class="dp-ws-actions">
            <button type="button" class="dp-ws-add"><i class="fas fa-plus" aria-hidden="true"></i> Add boards</button>
            <button type="button" class="dp-ws-dup"><i class="fas fa-clone" aria-hidden="true"></i> Duplicate</button>
            <button type="button" class="dp-ws-del"><i class="fas fa-trash-can" aria-hidden="true"></i> <span>Remove</span></button></div>`;
    canvas.parentElement.after(ws);
    const wsQ = c => ws.querySelector(c);
    ws.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    ws.querySelectorAll('[data-scope]').forEach(b => b.addEventListener('click', () => setScope(b.dataset.scope)));
    wsQ('.dp-ws-add').addEventListener('click', () => openAdd());
    wsQ('.dp-ws-dup').addEventListener('click', duplicate);
    wsQ('.dp-ws-del').addEventListener('click', removeBoards);

    // "Add boards": pick a size, a type and how many
    const addDlg = document.createElement('dialog');
    addDlg.className = 'dp-crop dp-add';
    addDlg.innerHTML = `<form method="dialog" class="dp-crop-card">
            <div class="dp-crop-head"><strong>Add boards</strong></div>
            <label class="dp-add-row"><span>Size</span><select class="dp-add-size"></select></label>
            <label class="dp-add-row"><span>Type</span><select class="dp-add-type"></select></label>
            <div class="dp-add-row"><span>How many</span>
                <span class="dp-add-n"><button type="button" data-d="-1" aria-label="One less">−</button><input type="number" min="1" inputmode="numeric" value="1" aria-label="How many boards"><button type="button" data-d="1" aria-label="One more">+</button></span></div>
            <p class="dp-crop-hint dp-add-hint"></p>
            <div class="dp-crop-actions">
                <button type="button" class="dp-crop-cancel">Cancel</button>
                <button type="submit" class="dp-crop-done">Add</button></div></form>`;
    document.body.appendChild(addDlg);
    const addQ = c => addDlg.querySelector(c), addSize = addQ('.dp-add-size'), addType = addQ('.dp-add-type'), addN = addQ('.dp-add-n input');
    Object.entries(SIZES).forEach(([k, z]) => addSize.add(new Option(`${z.name} (${z.w} × ${z.h} mm)`, k)));
    const fillAddTypes = pick => {
        addType.innerHTML = '';
        SIZES[addSize.value].boards.forEach((bd, i) => addType.add(new Option(bd.label, i, false, i === pick)));
    };
    const roomLeft = () => Math.max(1, MAX_BOARDS - boards.length);
    const setAddN = v => { addN.value = Math.max(1, Math.min(roomLeft(), Math.round(+v) || 1)); };
    addSize.addEventListener('change', () => fillAddTypes(0));
    addQ('.dp-add-n').querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => setAddN(+addN.value + +b.dataset.d)));
    addN.addEventListener('change', () => setAddN(addN.value));
    addQ('.dp-crop-cancel').addEventListener('click', () => addDlg.close());
    addQ('form').addEventListener('submit', e => {
        e.preventDefault(); setAddN(addN.value); addDlg.close();
        addBoards(addSize.value, +addType.value, +addN.value);
    });
    function openAdd() {
        saveActive();
        if (boards.length >= MAX_BOARDS) return;
        addSize.value = state.size; fillAddTypes(state.board); addN.max = roomLeft(); setAddN(1);
        addQ('.dp-add-hint').textContent = `New boards get the same finish and logo as ${boards.length > 1 ? `board ${active + 1}` : 'your board'}. You can change each one after.`;
        addDlg.showModal();
    }

    let wsKey = '';
    function updateBoardsBar() {
        const N = boards.length, cur = boards[active], spec = currentSpec(cur);
        const same = boards.filter(b => kindOf(b) === kindOf(cur)).length, groupOk = same > 1 && same < N;
        const twin = boards.some(b => b.size === cur.size && kindOf(b) !== kindOf(cur));
        const groupName = `All ${spec.name}${twin ? ` (${spec.detail})` : ''}`;
        const key = JSON.stringify([active, view, scope, N, groupName, same]);
        const label = form.querySelector('label[for="dpSize"]');
        if (label) label.textContent = scope === 'all' ? `All ${N}` : scope === 'group' ? `${same} boards` : N > 1 ? `Board ${active + 1}` : 'Board';
        // Mixed sizes can't all become one size by accident: size and type change per board or per group
        $('dpSize').disabled = boardSelect.disabled = scope === 'all';
        $('dpSize').title = boardSelect.title = scope === 'all' ? 'To change a size, pick one board or one group under “Apply changes to”' : '';
        if (key === wsKey) return;
        wsKey = key;
        wsQ('.dp-ws-total').textContent = `· ${N} board${N === 1 ? '' : 's'}`;
        wsQ('.dp-ws-view').hidden = N < 2;
        ws.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('is-on', b.dataset.view === view));
        wsQ('.dp-ws-scope').hidden = N < 2;
        const pill = v => wsQ(`[data-scope="${v}"]`);
        pill('one').textContent = `Board ${active + 1} only`;
        pill('group').textContent = `${groupName} · ${same}`;
        pill('group').hidden = !groupOk;
        pill('all').textContent = `All ${N} boards`;
        ws.querySelectorAll('[data-scope]').forEach(b => {
            b.classList.toggle('is-on', b.dataset.scope === scope);
            b.setAttribute('aria-pressed', b.dataset.scope === scope);
        });
        wsQ('.dp-ws-hint').textContent = scope === 'all' ? `What you change now goes to all ${N} boards.`
            : scope === 'group' ? `What you change now goes to all ${same} ${spec.name} boards (${spec.detail}).`
            : `What you change now goes to board ${active + 1} only. Tap any board in the picture to edit it.`;
        wsQ('.dp-ws-add').disabled = N >= MAX_BOARDS;
        wsQ('.dp-ws-dup').hidden = scope !== 'one';
        wsQ('.dp-ws-dup').disabled = N >= MAX_BOARDS;
        wsQ('.dp-ws-del').hidden = scope === 'all' || N < 2;
        wsQ('.dp-ws-del span').textContent = scope === 'group' ? `Remove these ${same}` : 'Remove';
    }

    const fitHeight = document.documentElement.classList.contains('site-mobile');
    const SCALE = 2.9;           // logical px per mm: the widest plate (250 mm) fills about 60% of the desktop stage
    const CW = fitHeight ? Math.round(250 * SCALE + 70) : 1200;
    let CH = 700, MM = SCALE, RES = 1, MIN_LINE = 1.6;
    let box = { x: 0, y: 0, w: 0, h: 0 };   // where the board was last drawn

    function logicalH() { if (showAll()) return fitHeight ? sheetHeight() : 700; return fitHeight ? Math.round(SIZES[state.size].h * SCALE + 130) : 700; }
    function screenRes() {
        const w = canvas.clientWidth || CW;
        return Math.min(2.5, Math.max(1, w * (window.devicePixelRatio || 1) / CW));
    }
    canvas.width = CW; canvas.height = logicalH();

    function roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    }
    function drawCover(img, x, y, w, h) {
        const s = Math.max(w / img.width, h / img.height);
        const sw = w / s, sh = h / s;
        ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
    }
    function shadow(color, blur, ox, oy) {   // shadow sizes are in screen pixels, so scale them
        ctx.shadowColor = color; ctx.shadowBlur = blur * RES;
        ctx.shadowOffsetX = ox * RES; ctx.shadowOffsetY = oy * RES;
    }
    function noShadow() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = ctx.shadowOffsetY = 0; }

    function panelLook() {
        if (state.finish === 'texture' && looks[state.texture]) return looks[state.texture];
        if (state.finish === 'photo' && state.photo) return looks.photo;
        return { tone: hexBrightness(state.colour), rgb: hexRgb(state.colour) };
    }

    // Paint the whole picture onto a canvas at k times the logical size
    function paint(target, k) {
        CH = logicalH();
        const W = Math.round(CW * k), H = Math.round(CH * k);
        if (target.width !== W) target.width = W;
        if (target.height !== H) target.height = H;
        ctx = target.getContext('2d'); RES = k;
        ctx.setTransform(k, 0, 0, k, 0, 0);
        ctx.clearRect(0, 0, CW, CH);
        noShadow();
        if (showAll()) {
            paintAll(); box = { x: 0, y: 0, w: 0, h: 0 };
            ctx.setTransform(1, 0, 0, 1, 0, 0); ctx = mainCtx;
            return;
        }

        const spec = currentSpec();
        const onPhoto = state.wall === 'photo' && images.wall;
        MM = SCALE * (onPhoto ? state.wallScale : 1);
        const w = spec.w * MM, h = spec.h * MM;
        let x = (CW - w) / 2, y = (CH - h) / 2 - (state.wall === 'studio' ? 18 : 0);
        if (onPhoto) {
            // keep at least a third of the board inside the picture
            state.pos.x = Math.max(-(CW + w) / 2 + w / 3, Math.min((CW + w) / 2 - w / 3, state.pos.x));
            state.pos.y = Math.max(-(CH + h) / 2 + h / 3, Math.min((CH + h) / 2 - h / 3, state.pos.y));
            x += state.pos.x; y += state.pos.y;
        }
        box = { x, y, w, h };

        drawWall();
        drawPanel(spec, x, y, w, h);
        if (state.wall === 'studio') drawDimension(spec, x, y, w, h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx = mainCtx;
    }

    function render() {
        saveActive(); fixScope();
        try { paint(canvas, screenRes()); }
        catch (err) { console.error(err); load(boards[active] || snapshot()); }
        canvas.classList.toggle('is-draggable', !showAll() && state.wall === 'photo' && !!images.wall);
        canvas.classList.toggle('is-pickable', showAll() && boards.length > 1);
        updateCaption();
        updateBoardsBar();
        scheduleExport();
    }
    let frame = 0;
    function renderSoon() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; render(); }); }

    /* Walls */
    let plaster = null, brick = null;
    function plasterPattern() {
        if (plaster) return plaster;
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const x = c.getContext('2d'); const d = x.createImageData(256, 256);
        for (let i = 0; i < d.data.length; i += 4) {
            const v = Math.random() < 0.5 ? 0 : 255;
            d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() * 20;
        }
        x.putImageData(d, 0, 0);
        // a few soft patches like a painted plaster wall
        for (let k = 0; k < 40; k++) {
            const px = Math.random() * 256, py = Math.random() * 256, r = 8 + Math.random() * 30;
            const g = x.createRadialGradient(px, py, 0, px, py, r);
            const dark = Math.random() < 0.5;
            g.addColorStop(0, dark ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0)');
            x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
        }
        return (plaster = c);
    }
    function brickTile() {
        if (brick) return brick;
        // Wall tiles 200 × 55 mm with 9 mm joints, drawn at 2× for sharpness
        const k = SCALE * 2, bw = 200 * k, bh = 55 * k, j = 9 * k;
        const c = document.createElement('canvas');
        c.width = Math.round(3 * (bw + j)); c.height = Math.round(4 * (bh + j));
        const x = c.getContext('2d');
        x.fillStyle = '#c9bfb0'; x.fillRect(0, 0, c.width, c.height);
        for (let row = 0; row < 4; row++) {
            const off = row % 2 ? (bw + j) / 2 : 0;
            for (let col = -1; col < 4; col++) {
                const bx = col * (bw + j) + off + j / 2, by = row * (bh + j) + j / 2;
                const hue = 12 + Math.random() * 10, light = 34 + Math.random() * 12;
                x.fillStyle = `hsl(${hue}, 48%, ${light}%)`;
                x.fillRect(bx, by, bw, bh);
                const g = x.createLinearGradient(0, by, 0, by + bh);
                g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.16)');
                x.fillStyle = g; x.fillRect(bx, by, bw, bh);
                for (let s = 0; s < 260; s++) {
                    x.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.07)';
                    x.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 1 + Math.random() * 4, 1 + Math.random() * 4);
                }
            }
        }
        return (brick = c);
    }
    function wallLight(strength) {
        // a ceiling lamp up and to the left, darker corners
        const g = ctx.createRadialGradient(CW * 0.3, -CH * 0.25, 0, CW * 0.3, -CH * 0.25, Math.hypot(CW, CH) * 1.05);
        g.addColorStop(0, `rgba(255,250,240,${0.30 * strength})`);
        g.addColorStop(0.55, 'rgba(255,255,255,0)');
        g.addColorStop(1, `rgba(0,0,0,${0.22 * strength})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
    }
    function drawWall() {
        const wall = WALLS[state.wall] || WALLS.studio;
        if (state.wall === 'photo' && images.wall) { drawCover(images.wall, 0, 0, CW, CH); return; }
        if (wall.paint) {
            ctx.fillStyle = wall.paint; ctx.fillRect(0, 0, CW, CH);
            ctx.fillStyle = ctx.createPattern(plasterPattern(), 'repeat'); ctx.fillRect(0, 0, CW, CH);
            wallLight(1); return;
        }
        if (state.wall === 'brick') {
            const p = ctx.createPattern(brickTile(), 'repeat');
            p.setTransform(new DOMMatrix().scale(0.5));
            ctx.fillStyle = p; ctx.fillRect(0, 0, CW, CH);
            wallLight(1.2); return;
        }
        if (state.wall === 'wood' && images.wood) {
            ctx.save();   // vertical wooden slats
            ctx.translate(CW / 2, CH / 2); ctx.rotate(Math.PI / 2);
            drawCover(images.wood, -CH / 2, -CW / 2, CH, CW);
            ctx.restore();
            ctx.fillStyle = 'rgba(40,20,5,0.18)'; ctx.fillRect(0, 0, CW, CH);
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            for (let sx = 110 * SCALE / 2.9 * 0; sx < CW; sx += 120 * SCALE) ctx.fillRect(sx, 0, 1.5, CH);
            wallLight(1.2); return;
        }
        // Studio: soft backdrop like a product photo
        const g = ctx.createLinearGradient(0, 0, 0, CH);
        g.addColorStop(0, '#f8faff'); g.addColorStop(1, '#e1e7f4');
        ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
        const r = ctx.createRadialGradient(CW / 2, CH * 0.4, 0, CW / 2, CH * 0.4, CW * 0.55);
        r.addColorStop(0, 'rgba(255,255,255,0.95)'); r.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = r; ctx.fillRect(0, 0, CW, CH);
    }

    /* The glass board with depth, shadows and reflections */
    function drawPanel(spec, x, y, w, h) {
        const r = CORNER_MM * MM, fw = FRAME_MM * MM, ri = 0.5 * MM;
        const metal = (FRAMES[state.frame] || FRAMES.silver).stops, edge = hexRgb(metal[2]);
        const look = panelLook(), dark = look.tone < 0.5;
        const lx = state.light.x, ly = state.light.y;
        const depth = 2.4 * MM;                       // visible glass and back-box edge
        const ex = -lx * depth * 0.7, ey = -ly * depth;

        // 1. shadows on the wall: a wide soft one and a tight contact one
        ctx.save();
        shadow('rgba(12,18,32,0.30)', 14 * MM, -lx * 7 * MM, -ly * 8 * MM);
        roundRect(ctx, x + ex, y + ey, w, h, r); ctx.fillStyle = rgba(look.rgb, -0.5, 1); ctx.fill();
        shadow('rgba(12,18,32,0.40)', 2.2 * MM, -lx * 1.2 * MM, -ly * 1.6 * MM);
        ctx.fill();
        ctx.restore();

        // 2. the edge (thickness), drawn as a solid extrusion
        const steps = Math.max(2, Math.ceil(Math.max(Math.abs(ex), Math.abs(ey)) * RES));
        for (let i = steps; i >= 1; i--) {
            const t = i / steps;
            roundRect(ctx, x + ex * t, y + ey * t, w, h, r);
            ctx.fillStyle = rgba(edge, -0.2 - 0.3 * t, 1); ctx.fill();
        }
        roundRect(ctx, x + ex, y + ey, w, h, r);
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke();

        // 3. the metal frame, lit from the light's side
        const fg = ctx.createLinearGradient(x + w * (0.5 + lx * 0.5), y + h * (0.5 + ly * 0.5), x + w * (0.5 - lx * 0.5), y + h * (0.5 - ly * 0.5));
        metal.forEach((c, i) => fg.addColorStop(i / (metal.length - 1), c));
        roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fg; ctx.fill();

        // 4. the glass face inside the frame (the finish runs under the frame, as on the real board)
        const gx = x + fw, gy = y + fw, gw = w - 2 * fw, gh = h - 2 * fw;
        ctx.save();
        roundRect(ctx, gx, gy, gw, gh, ri); ctx.clip();
        if (state.finish === 'texture' && images[state.texture]) drawCover(images[state.texture], x, y, w, h);
        else if (state.finish === 'photo' && images.photo) {
            ctx.fillStyle = state.colour; ctx.fillRect(x, y, w, h);     // shows where the photo doesn't reach
            drawPart(ctx, photoPic(), photoSrc(spec.w, spec.h), x, y, w, h);
        }
        else { ctx.fillStyle = state.colour; ctx.fillRect(x, y, w, h); }

        // glass: brighter top, slight shade at the bottom
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, 'rgba(255,255,255,0.20)'); g.addColorStop(0.5, 'rgba(255,255,255,0.03)');
        g.addColorStop(1, 'rgba(0,0,0,0.12)');
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
        // reflection band that moves with the light
        const shift = (lx + 0.35) * 0.35;
        const band = ctx.createLinearGradient(x + w * (0.05 + shift), y, x + w * (0.55 + shift), y + h);
        band.addColorStop(0, 'rgba(255,255,255,0)');
        band.addColorStop(0.42, 'rgba(255,255,255,0)');
        band.addColorStop(0.5, `rgba(255,255,255,${dark ? 0.13 : 0.22})`);
        band.addColorStop(0.62, 'rgba(255,255,255,0)');
        ctx.fillStyle = band; ctx.fillRect(x, y, w, h);

        drawIcons(spec, x, y, w, h, dark);
        if (spec.socket) drawSocket(spec, x, y, w, h);
        drawLogo(x, y, w, h, dark);

        // polished glass edge: light on the lit side, dark on the far side
        const rim = ctx.createLinearGradient(x + w * (0.5 + lx * 0.5), y + h * (0.5 + ly * 0.5), x + w * (0.5 - lx * 0.5), y + h * (0.5 - ly * 0.5));
        rim.addColorStop(0, 'rgba(255,255,255,0.75)'); rim.addColorStop(0.5, 'rgba(255,255,255,0.12)');
        rim.addColorStop(1, 'rgba(0,0,0,0.30)');
        roundRect(ctx, gx, gy, gw, gh, ri);
        ctx.lineWidth = 0.8 * MM; ctx.strokeStyle = rim; ctx.stroke();
        // the glass sits a step below the frame: a thin shadow line along its edge
        roundRect(ctx, gx, gy, gw, gh, ri);
        ctx.lineWidth = Math.max(1, 0.35 * MM); ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.stroke();
        ctx.restore();

        // crisp frame edges: bright on the lit side, dark on the far side
        const bevel = ctx.createLinearGradient(x + w * (0.5 + lx * 0.5), y + h * (0.5 + ly * 0.5), x + w * (0.5 - lx * 0.5), y + h * (0.5 - ly * 0.5));
        bevel.addColorStop(0, 'rgba(255,255,255,0.85)'); bevel.addColorStop(0.5, 'rgba(255,255,255,0.15)'); bevel.addColorStop(1, 'rgba(0,0,0,0.35)');
        roundRect(ctx, x + 0.2 * MM, y + 0.2 * MM, w - 0.4 * MM, h - 0.4 * MM, r * 0.85);
        ctx.lineWidth = Math.max(1, 0.3 * MM); ctx.strokeStyle = bevel; ctx.stroke();
        roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r);
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke();
    }

    function drawDimension(spec, x, y, w, h) {
        const dy = y + h + 46;
        const label = `${spec.w} × ${spec.h} mm`;
        ctx.font = `600 ${fitHeight ? 38 : 26}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const half = ctx.measureText(label).width / 2 + 12, cx = x + w / 2;
        ctx.strokeStyle = '#94a3b8'; ctx.fillStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, dy); ctx.lineTo(cx - half, dy); ctx.moveTo(cx + half, dy); ctx.lineTo(x + w, dy);
        ctx.moveTo(x, dy - 9); ctx.lineTo(x, dy + 9); ctx.moveTo(x + w, dy - 9); ctx.lineTo(x + w, dy + 9);
        ctx.stroke();
        ctx.fillText(label, cx, dy);
    }

    function drawIcons(spec, x, y, w, h, dark) {
        const colour = dark ? 'rgba(255,255,255,0.96)' : 'rgba(17,17,17,0.88)';
        const rows = spec.rows;
        const s = ICON_MM * MM;
        ctx.save();
        // backlit icons glow on dark glass
        if (dark) shadow('rgba(255,255,255,0.55)', 2.4 * MM, 0, 0);
        rows.forEach((row, ri) => {
            const cy = rowY(rows.length, ri, y, h), xs = iconXs(spec, ri);
            row.forEach((kind, i) => ICONS[kind](x + xs[i] * MM, cy, s, colour));
        });
        ctx.restore();
    }

    // Each icon is drawn in a box about s wide and s tall around (cx, cy), measured from the brochure artwork
    const ICONS = {
        light(cx, cy, s, c) {          // brochure: dome with a flat rim, a lamp under it and five rays
            stroke(c, s);
            const by = cy - s * 0.01;
            ctx.beginPath(); ctx.arc(cx, by, s * 0.5, Math.PI, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, by, s * 0.34, 0, Math.PI); ctx.stroke();
            ctx.lineWidth *= 1.6;
            ctx.beginPath(); ctx.moveTo(cx - s * 0.5, by); ctx.lineTo(cx + s * 0.5, by); ctx.stroke();
            ctx.lineWidth /= 1.6;
            [[-0.29, 0.18, -0.47, 0.38], [-0.18, 0.29, -0.25, 0.51], [0, 0.34, 0, 0.55], [0.18, 0.29, 0.25, 0.51], [0.29, 0.18, 0.47, 0.38]]
                .forEach(([x1, y1, x2, y2]) => {
                    ctx.beginPath(); ctx.moveTo(cx + x1 * s, by + y1 * s); ctx.lineTo(cx + x2 * s, by + y2 * s); ctx.stroke();
                });
        },
        pendant(cx, cy, s, c) {        // brochure: ceiling cup, rod, small joint, flared shade, lamp below
            stroke(c, s);
            roundRect(ctx, cx - s * 0.12, cy - s * 0.56, s * 0.24, s * 0.07, s * 0.035); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.49); ctx.lineTo(cx, cy - s * 0.1); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy - s * 0.03, s * 0.07, Math.PI, 0); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - s * 0.34, cy - s * 0.03); ctx.lineTo(cx + s * 0.34, cy - s * 0.03);
            ctx.lineTo(cx + s * 0.39, cy + s * 0.38); ctx.lineTo(cx - s * 0.39, cy + s * 0.38); ctx.closePath(); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy + s * 0.38, s * 0.12, 0, Math.PI); ctx.stroke();
        },
        bulb(cx, cy, s, c) {           // brochure page 6: bulb with a screw base and five rays over the top
            stroke(c, s);
            const gy = cy - s * 0.06, r = s * 0.2;
            ctx.beginPath();
            ctx.arc(cx, gy, r, Math.PI * 0.75, Math.PI * 2.25);
            ctx.lineTo(cx + s * 0.08, gy + s * 0.24); ctx.lineTo(cx - s * 0.08, gy + s * 0.24); ctx.closePath(); ctx.stroke();
            [[0.3, 0.085], [0.36, 0.085], [0.42, 0.045]].forEach(([oy, hw]) => {
                ctx.beginPath(); ctx.moveTo(cx - s * hw, gy + s * oy); ctx.lineTo(cx + s * hw, gy + s * oy); ctx.stroke();
            });
            for (let k = 0; k <= 4; k++) {
                const ang = Math.PI + k * Math.PI / 4;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(ang) * s * 0.31, gy + Math.sin(ang) * s * 0.31);
                ctx.lineTo(cx + Math.cos(ang) * s * 0.45, gy + Math.sin(ang) * s * 0.45);
                ctx.stroke();
            }
        },
        ring(cx, cy, s, c) {           // brochure page 6: plain ring, as tall as the other icons
            stroke(c, s);
            ctx.beginPath(); ctx.arc(cx, cy, s * 0.48, 0, Math.PI * 2); ctx.stroke();
        },
        fan(cx, cy, s, c) {            // real panels: small hub ring, three slim hollow blades (one up, two down)
            stroke(c, s);
            const hy = cy + s * 0.1, hub = s * 0.075, bw = s * 0.13;
            for (let k = 0; k < 3; k++) {
                ctx.save(); ctx.translate(cx, hy); ctx.rotate(-Math.PI / 2 + k * Math.PI * 2 / 3);
                roundRect(ctx, hub + s * 0.04, -bw / 2, s * 0.38, bw, bw * 0.35); ctx.stroke();
                ctx.restore();
            }
            ctx.beginPath(); ctx.arc(cx, hy, hub, 0, Math.PI * 2); ctx.stroke();
        },
        speed(cx, cy, s, c) {          // product photos: four level marks, double chevrons up top and down below
            stroke(c, s);
            ctx.fillStyle = c;
            const bx = cx - s * 0.3, bw = s * 0.2, bh = s * 0.15;
            [-0.95, -0.32, 0.32, 0.95].forEach(oy => ctx.fillRect(bx - bw / 2, cy + oy * s - bh / 2, bw, bh));
            const ax = cx + s * 0.34, aw = s * 0.2, ah = s * 0.2;
            [[-1.15, -1], [-0.9, -1], [0.9, 1], [1.15, 1]].forEach(([oy, d]) => {
                const tip = cy + oy * s;
                ctx.beginPath(); ctx.moveTo(ax - aw, tip - d * ah); ctx.lineTo(ax, tip); ctx.lineTo(ax + aw, tip - d * ah); ctx.stroke();
            });
        },
        copen(cx, cy, s, c) {          // curtain switch photo: square-cornered diamond split down the middle  < >
            stroke(c, s);
            const g = s * 0.08, d = s * 0.52, hh = s * 0.52;
            ctx.beginPath(); ctx.moveTo(cx - g, cy - hh); ctx.lineTo(cx - g - d, cy); ctx.lineTo(cx - g, cy + hh); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + g, cy - hh); ctx.lineTo(cx + g + d, cy); ctx.lineTo(cx + g, cy + hh); ctx.stroke();
        },
        cclose(cx, cy, s, c) {         // curtain switch photo: two chevrons meeting in the middle  > <
            stroke(c, s);
            const g = s * 0.035, d = s * 0.52, hh = s * 0.52;
            ctx.beginPath(); ctx.moveTo(cx - g - d, cy - hh); ctx.lineTo(cx - g, cy); ctx.lineTo(cx - g - d, cy + hh); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + g + d, cy - hh); ctx.lineTo(cx + g, cy); ctx.lineTo(cx + g + d, cy + hh); ctx.stroke();
        }
    };
    function stroke(c, s) {
        ctx.strokeStyle = c; ctx.lineWidth = Math.max(MIN_LINE, s * 0.045); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    }

    // Universal socket with bronze shutters, placed as on brochure page 6 (mm from the plate's centre line)
    function rowY(count, i, y, h) { return count === 1 ? y + h * 0.48 : y + h * (0.33 + i * 0.34); }
    // Universal socket as in the brochure (page 6): bronze earth slot running into a black round hole,
    // two stepped live/neutral slots below. These outlines are the holes in the glass.
    function socketPaths(sx, cy, m) {
        const earth = k => {                     // figure 8: rounded top lobe, narrow waist, larger round lobe below
            const p = new Path2D(), a = 3.5 * m - k, top = cy - 17.3 * m + k, lh = 8.4 * m - 2 * k, ly = cy - 4.9 * m;
            p.roundRect(sx - a, top, a * 2, lh, a);
            p.rect(sx - 2.1 * m + k * 0.6, top + lh - a, (2.1 * m - k * 0.6) * 2, ly - (top + lh - a));
            p.moveTo(sx + 3.7 * m - k, ly); p.arc(sx, ly, 3.7 * m - k, 0, Math.PI * 2);
            return p;
        };
        const pin = (d, k) => {                  // k = inset for the dark opening
            const inner = sx + d * (2.8 * m + k), raised = sx + d * (9.3 * m - k), outer = sx + d * (16.2 * m - k);
            const top = cy + 5 * m + k, step = cy + 7.6 * m + k, bot = cy + 15.4 * m - k, p = new Path2D();
            p.moveTo(inner, top); p.lineTo(raised, top); p.lineTo(raised, step);
            p.lineTo(outer, step); p.lineTo(outer, bot); p.lineTo(inner, bot); p.closePath();
            return p;
        };
        return { outer: [earth(0), pin(-1, 0), pin(1, 0)] };
    }
    function drawSocket(spec, x, y, w, h) {
        const m = MM, cy = rowY(spec.rows.length, spec.rows.length - 1, y, h), sx = x + w - 51 * m;
        const { outer } = socketPaths(sx, cy, m);
        const metal = ctx.createLinearGradient(0, cy - 17.3 * m, 0, cy + 15.4 * m);
        metal.addColorStop(0, '#6a4528'); metal.addColorStop(0.5, '#4a2f1a'); metal.addColorStop(1, '#2e1c10');   // bronze, as in the brochure
        ctx.save();
        // set into the glass: a thin dark ring under each opening
        shadow('rgba(0,0,0,0.55)', 0.9 * m, 0, 0.35 * m);
        ctx.fillStyle = metal; outer.forEach(p => ctx.fill(p));
        noShadow();
        // brochure page 6: the round lower part of the earth is an open black hole
        ctx.fillStyle = '#0b0b0b'; ctx.beginPath(); ctx.arc(sx, cy - 4.9 * m, 3.7 * m, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,220,180,0.25)'; ctx.lineWidth = 0.35 * m;   // metal sheen on the shutters
        outer.slice(1).forEach(p => ctx.stroke(p));   // the earth is built from overlapping parts, so no edge line on it
        ctx.restore();
    }

    function drawLogo(x, y, w, h, dark) {
        let img, sx = 0, sy = 0, sw, sh;
        if (state.logo === 'pat' && images.pat) {
            img = images.pat; sx = 75; sy = 15; sw = 191; sh = 174;   // logo without its transparent margin
        } else if (state.logo === 'own' && images.ownLogo) {
            img = logoPic(); [sx, sy, sw, sh] = logoSrc();
        } else return;

        // Brochure: logo about 20 mm wide, 9 mm in from the side, 8 mm up from the bottom; the visitor can resize it
        const z = state.logoSize;
        const boxW = Math.min(24 * z, 0.6 * w / MM) * MM, boxH = Math.min(17 * z, 0.45 * h / MM) * MM;
        const k = Math.min(boxW / sw, boxH / sh);
        const lw = sw * k, lh = sh * k, mx = 9 * MM, my = 8 * MM;
        const lx = state.logoPos.includes('r') ? x + w - mx - lw : x + mx;
        const ly = state.logoPos.includes('b') ? y + h - my - lh : y + my;

        // The PAT logo keeps its own colours on every finish, dark ones too
        ctx.drawImage(img, sx, sy, sw, sh, lx, ly, lw, lh);
    }

    /* ── High quality picture (about 3000 px wide), made in the background ── */
    const EXPORT_W = 3000;
    let exportBlob = null, exportTimer = 0, exportRun = 0;
    function makeBlob() {
        const c = document.createElement('canvas');
        paint(c, Math.max(2, EXPORT_W / CW));
        return new Promise(resolve => c.toBlob(resolve, 'image/png'));
    }
    function scheduleExport() {
        exportBlob = null; clearTimeout(exportTimer);
        const run = ++exportRun;
        exportTimer = setTimeout(() => makeBlob().then(b => { if (run === exportRun) exportBlob = b; }), 600);
    }
    function getBlob() { return exportBlob ? Promise.resolve(exportBlob) : makeBlob(); }
    function fileName() {
        if (boards.length > 1) { const d = designs().length; return `PAT-panels-${d}-design${d === 1 ? '' : 's'}-${boards.length}-boards.png`; }
        const s = currentSpec();
        return `PAT-panel-${(s.name + ' ' + s.detail).replace(/\W+/g, '-')}.png`;
    }

    /* ── CorelDRAW file: the plate at real size in mm, ready for printing ──
       Opens in CorelDRAW (File > Open or Import). Layers, bottom to top:
         Plate   - the finish with every icon and the socket cut out (transparent), so light and the wall show through.
                   A plain colour is one vector shape with holes; marble, wood or a photo is a 300 dpi picture with holes.
         Cut_shapes - each icon and the socket as a closed vector outline, named, on a hairline: ready to Trim,
                   Intersect or Weld with the picture, or to fill for a spot colour / white ink.
         Outline - the plate's cut line.   Logo - the logo picture.
       The cut shapes are traced from the same drawing code as the preview, so they match it exactly. */
    const fmt = n => +n.toFixed(3);
    const ICON_NAMES = { light: 'Light', pendant: 'Pendant', bulb: 'Bulb', ring: 'Switch', fan: 'Fan', speed: 'Fan_speed',
        copen: 'Curtain_open', cclose: 'Curtain_close' };

    // Draw one icon (or the socket) in mm onto any 2D context, filled solid
    function drawCutout(c, item) {
        const keep = { ctx, MM, MIN_LINE };
        ctx = c; MM = 1; MIN_LINE = 0;
        try {
            if (item.kind === 'socket') {
                c.fillStyle = '#000';
                socketPaths(item.sx, item.cy, 1).outer.forEach(p => c.fill(p));
            } else {
                ICONS[item.kind](item.cx, item.cy, ICON_MM, '#000');
            }
        } finally { ctx = keep.ctx; MM = keep.MM; MIN_LINE = keep.MIN_LINE; }
    }
    function cutoutItems(spec, W, H) {
        const items = [];
        spec.rows.forEach((row, ri) => {
            const cy = rowY(spec.rows.length, ri, 0, H), xs = iconXs(spec, ri);
            row.forEach((kind, i) => {
                const cx = xs[i], tall = kind === 'speed' ? 17 : 10;   // the speed column is about twice as tall
                items.push({ kind, cx, cy, name: `${ICON_NAMES[kind]}_row${ri + 1}_${i + 1}`, box: [cx - 11, cy - tall, 22, tall * 2] });
            });
        });
        if (spec.socket) {
            const cy = rowY(spec.rows.length, spec.rows.length - 1, 0, H), sx = W - 51;
            items.push({ kind: 'socket', sx, cy, name: 'Socket', box: [sx - 19, cy - 20, 38, 38] });
        }
        return items;
    }

    // Trace a drawn shape into closed outlines (marching squares at 40 px per mm, then simplified)
    const TRACE = 40;
    function traceItem(item) {
        const [bx, by, bw, bh] = item.box, pad = 2;
        const gw = Math.ceil(bw * TRACE) + pad * 2, gh = Math.ceil(bh * TRACE) + pad * 2;
        const c = document.createElement('canvas'); c.width = gw; c.height = gh;
        const o = c.getContext('2d');
        o.setTransform(TRACE, 0, 0, TRACE, (pad - bx * TRACE), (pad - by * TRACE));
        drawCutout(o, item);
        const px = o.getImageData(0, 0, gw, gh).data;
        const A = (x, y) => px[(y * gw + x) * 4 + 3] / 255;
        const T = 0.5;
        // edge crossing points, keyed by edge; each cell joins two (or four) of them
        const pt = {}, link = {};
        const key = (t, x, y) => t + x + ',' + y;
        const edge = (t, x, y) => {
            const k = key(t, x, y);
            if (!pt[k]) {
                const a = A(x, y), b = t === 'h' ? A(x + 1, y) : A(x, y + 1);
                const f = Math.max(0, Math.min(1, (T - a) / ((b - a) || 1e-9)));
                pt[k] = t === 'h' ? [x + f, y] : [x, y + f];
            }
            return k;
        };
        const join = (p, q) => { (link[p] = link[p] || []).push(q); (link[q] = link[q] || []).push(p); };
        for (let y = 0; y < gh - 1; y++) {
            for (let x = 0; x < gw - 1; x++) {
                const tl = A(x, y) >= T, tr = A(x + 1, y) >= T, br = A(x + 1, y + 1) >= T, bl = A(x, y + 1) >= T;
                const n = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
                if (n === 0 || n === 15) continue;
                const top = () => edge('h', x, y), bot = () => edge('h', x, y + 1);
                const lef = () => edge('v', x, y), rig = () => edge('v', x + 1, y);
                switch (n) {
                    case 1: case 14: join(lef(), bot()); break;
                    case 2: case 13: join(bot(), rig()); break;
                    case 3: case 12: join(lef(), rig()); break;
                    case 4: case 11: join(top(), rig()); break;
                    case 6: case 9: join(top(), bot()); break;
                    case 7: case 8: join(lef(), top()); break;
                    case 5: join(lef(), top()); join(bot(), rig()); break;
                    case 10: join(top(), rig()); join(lef(), bot()); break;
                }
            }
        }
        // walk the links into closed loops
        const loops = [], seen = new Set();
        Object.keys(link).forEach(startKey => {
            if (seen.has(startKey)) return;
            const loop = []; let prev = null, cur = startKey;
            while (cur && !seen.has(cur)) {
                seen.add(cur); loop.push(pt[cur]);
                const next = link[cur].find(k => k !== prev && !seen.has(k));
                prev = cur; cur = next;
            }
            if (loop.length > 2) loops.push(loop.map(([gx, gy]) => [bx + (gx - pad + 0.5) / TRACE, by + (gy - pad + 0.5) / TRACE]));
        });
        return loops.map(l => simplify(l, 0.012));
    }
    function simplify(pts, tol) {        // Ramer-Douglas-Peucker on a closed loop
        if (pts.length < 8) return pts;
        const rdp = (a, b) => {
            let max = 0, at = -1;
            const [x1, y1] = pts[a], [x2, y2] = pts[b], len = Math.hypot(x2 - x1, y2 - y1) || 1e-9;
            for (let i = a + 1; i < b; i++) {
                const d = Math.abs((x2 - x1) * (y1 - pts[i][1]) - (x1 - pts[i][0]) * (y2 - y1)) / len;
                if (d > max) { max = d; at = i; }
            }
            return max > tol ? [...rdp(a, at).slice(0, -1), ...rdp(at, b)] : [pts[a], pts[b]];
        };
        const half = Math.floor(pts.length / 2);
        const out = [...rdp(0, half).slice(0, -1), ...rdp(half, pts.length - 1)];
        return out;
    }
    const loopsPath = loops => loops.map(l => 'M' + l.map(p => `${fmt(p[0])} ${fmt(p[1])}`).join('L') + 'Z').join('');

    // The plate's face as a picture (about 12 px per mm, 300 dpi) with the cut-outs made transparent
    function faceImage(tex, src, W, H, items) {
        // pixels per mm: the picture's own resolution, at least 300 dpi and at most 600 dpi
        const P = Math.min(24, Math.max(12, Math.min(src[2] / W, src[3] / H))), c = document.createElement('canvas');
        c.width = Math.round(W * P); c.height = Math.round(H * P);
        const o = c.getContext('2d');
        o.setTransform(P, 0, 0, P, 0, 0);
        o.beginPath(); o.rect(0, 0, W, H); o.clip();   // sharp corners
        if (state.finish === 'photo' && tex === photoPic()) { o.fillStyle = state.colour; o.fillRect(0, 0, W, H); }
        drawPart(o, tex, src, 0, 0, W, H);
        o.globalCompositeOperation = 'destination-out';
        items.forEach(it => drawCutout(o, it));
        return c.toDataURL('image/png');
    }
    function coverSrc(img, W, H) {
        const k = Math.max(W / img.width, H / img.height), sw = W / k, sh = H / k;
        return [(img.width - sw) / 2, (img.height - sh) / 2, sw, sh];
    }
    function logoData(img, sx, sy, sw, sh, wmm, hmm, white) {
        const P = Math.min(24, Math.max(12, sw / wmm)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(wmm * P)); c.height = Math.max(1, Math.round(hmm * P));
        const o = c.getContext('2d');
        o.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        if (white) { o.globalCompositeOperation = 'source-in'; o.fillStyle = '#ffffff'; o.fillRect(0, 0, c.width, c.height); }
        return c.toDataURL('image/png');
    }

    function boardSvg(qty = 1) {
        const spec = currentSpec(), W = spec.w, H = spec.h;
        const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        const items = cutoutItems(spec, W, H);
        const traced = items.map(it => ({ name: it.name, d: loopsPath(traceItem(it)) }));
        const plateD = `M0 0H${W}V${H}H0Z`;   // sharp corners
        const parts = [];

        // Plate with transparent cut-outs
        const tex = state.finish === 'texture' ? images[state.texture] : state.finish === 'photo' ? photoPic() : null;
        if (tex) {
            parts.push(`<g id="Plate"><image id="Finish_with_cutouts" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" xlink:href="${faceImage(tex, state.finish === 'photo' ? photoSrc(W, H) : coverSrc(tex, W, H), W, H, items)}"/></g>`);
        } else {
            parts.push(`<g id="Plate"><path id="Colour_with_cutouts" fill="${state.colour}" fill-rule="evenodd" d="${plateD}${traced.map(t => t.d).join('')}"/></g>`);
        }
        // Each cut-out as its own closed vector shape: hairline only, so the holes stay see-through
        parts.push(`<g id="Cut_shapes">\n${traced.map(t => `<path id="${t.name}" fill="none" fill-rule="evenodd" stroke="#ff00ff" stroke-width="0.05" d="${t.d}"/>`).join('\n')}\n</g>`);
        parts.push(`<g id="Outline"><path id="Plate_cut_line" fill="none" stroke="#000000" stroke-width="0.1" d="${plateD}"/></g>`);

        // Logo at its place and size
        let img, sx = 0, sy = 0, sw, sh;
        if (state.logo === 'pat' && images.pat) { img = images.pat; sx = 75; sy = 15; sw = 191; sh = 174; }
        else if (state.logo === 'own' && images.ownLogo) { img = logoPic(); [sx, sy, sw, sh] = logoSrc(); }
        if (img) {
            const z = state.logoSize, bw = Math.min(24 * z, 0.6 * W), bh = Math.min(17 * z, 0.45 * H);
            const k = Math.min(bw / sw, bh / sh), lw = sw * k, lh = sh * k;
            const lx = state.logoPos.includes('r') ? W - 9 - lw : 9, ly = state.logoPos.includes('b') ? H - 8 - lh : 8;
            parts.push(`<g id="Logo"><image x="${fmt(lx)}" y="${fmt(ly)}" width="${fmt(lw)}" height="${fmt(lh)}" preserveAspectRatio="none" xlink:href="${logoData(img, sx, sy, sw, sh, lw, lh, false)}"/></g>`);
        }

        const title = `PAT ${spec.name}, ${spec.detail}, ${finishLabel()}, ${logoLabel()} (${W} x ${H} mm)${qty > 1 ? `, quantity ${qty}` : ''}`;
        return { W, H, title, body: parts.join('\n') };
    }
    function makeSvg() {
        saveActive();
        const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        const head = (W, H) => '<?xml version="1.0" encoding="UTF-8"?>\n' +
            `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${fmt(W)}mm" height="${fmt(H)}mm" viewBox="0 0 ${fmt(W)} ${fmt(H)}">\n`;
        const list = designs();
        if (list.length === 1) {
            const one = boardSvg(list[0].qty);
            return head(one.W, one.H) + `<title>${esc(one.title)}</title>\n${one.body}\n</svg>\n`;
        }
        const keep = boards[active], out = [], LAB = 8, GAP_MM = 15, SHEET = 600;
        let x = 0, y = 0, rowH = 0, sheetW = 0;
        list.forEach(({ b, qty }, i) => {
            load(b);
            const one = boardSvg(qty), spec = currentSpec(), n = i + 1;
            if (x > 0 && x + one.W > SHEET) { x = 0; y += rowH + GAP_MM; rowH = 0; }
            out.push(`<g id="Board_${n}_${spec.name.replace(/\W+/g, '')}_qty_${qty}" transform="translate(${fmt(x)} ${fmt(y + LAB)})">\n` +
                `<desc>${esc(one.title)}</desc>\n` +
                `<text id="B${n}_Label" x="0" y="-2.5" font-family="Arial" font-size="4.5" fill="#000000">${esc(`Design ${n} · ${spec.name} · qty ${qty}`)}</text>\n` +
                one.body.replace(/ id="/g, ` id="B${n}_`) + '\n</g>');
            x += one.W + GAP_MM; rowH = Math.max(rowH, one.H + LAB); sheetW = Math.max(sheetW, x - GAP_MM);
        });
        load(keep);
        const title = `PAT order: ${list.length} designs, ${boards.length} boards`;
        return head(sheetW, y + rowH) + `<title>${esc(title)}</title>\n${out.join('\n')}\n</svg>\n`;
    }

    /* ── Text summary ───────────────────────────────────── */
    function finishLabel() {
        if (state.finish === 'texture') return TEXTURES[state.texture].name;
        if (state.finish === 'photo' && state.photo) return 'Own photo';
        return state.colourName ? state.colourName : `Custom colour ${state.colour.toUpperCase()}`;
    }
    const frameLabel = () => `${(FRAMES[state.frame] || FRAMES.silver).name} frame`;
    function logoLabel() {
        const pos = { br: 'bottom right', bl: 'bottom left', tr: 'top right', tl: 'top left' }[state.logoPos];
        const size = state.logoSize === 1 ? '' : `, ${Math.round(state.logoSize * 100)}% size`;
        if (state.logo === 'pat') return `PAT logo, ${pos}${size}`;
        if (state.logo === 'own' && state.ownLogo) return `Own logo, ${pos}${size}`;
        return 'No logo';
    }
    const $ = id => document.getElementById(id);
    // Print quality: how many dots per inch the customer's own photo or logo gives at its printed size
    function printDpi(img, wmm, hmm) {
        return img ? Math.round(25.4 * Math.min(img.width / wmm, img.height / hmm)) : 0;
    }
    function photoDpi() { const s = SIZES[state.size]; return images.photo ? Math.round(25.4 * photoSrc(s.w, s.h)[2] / s.w) : 0; }
    function quality(dpi) {
        return dpi >= 250 ? { cls: 'is-good', text: 'sharp print' }
            : dpi >= 150 ? { cls: 'is-ok', text: 'good print' }
            : { cls: 'is-low', text: 'may print blurry' };
    }
    /* ── Crop: the customer picks which part of their photo or logo goes on the board ──
       Photo: the box keeps the board's shape (the glass is a fixed size) but can be any size: zoom in on a
       detail, or out past the photo's edges to show all of it (the rest of the board takes the board colour).
       The print quality is shown live and never blocks the customer. Logo: free shape. */
    const crop = (() => {
        const dlg = document.createElement('dialog');
        dlg.className = 'dp-crop';
        dlg.innerHTML = `<div class="dp-crop-card">
            <div class="dp-crop-head"><strong class="dp-crop-title"></strong><span class="dp-crop-q"></span></div>
            <div class="dp-crop-stage"><canvas class="dp-crop-pic"></canvas>
                <div class="dp-crop-box"><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i></div></div>
            <p class="dp-crop-hint"></p>
            <div class="dp-crop-actions">
                <button type="button" class="dp-crop-reset">Reset</button>
                <span class="dp-crop-rots">
                    <button type="button" data-turn="3" title="Rotate left" aria-label="Rotate left"><i class="fas fa-rotate-left" aria-hidden="true"></i></button>
                    <button type="button" data-turn="1" title="Rotate right" aria-label="Rotate right"><i class="fas fa-rotate-right" aria-hidden="true"></i></button></span>
                <button type="button" class="dp-crop-fit">Fit whole photo</button>
                <button type="button" class="dp-crop-cancel">Cancel</button>
                <button type="button" class="dp-crop-done" autofocus>Done</button></div></div>`;
        document.body.appendChild(dlg);
        const pic = dlg.querySelector('.dp-crop-pic'), boxEl = dlg.querySelector('.dp-crop-box'), qEl = dlg.querySelector('.dp-crop-q');
        const hint = dlg.querySelector('.dp-crop-hint');
        let cur = null, drag = null;

        // The stage shows the picture inside an "area" (bigger than the photo, so the box can go past its edges)
        const scale = () => pic.clientWidth / cur.area[0];
        function draw() {
            const f = scale(), [x, y, w, h] = cur.rect, [ox, oy] = cur.off;
            Object.assign(boxEl.style, { left: (x + ox) * f + 'px', top: (y + oy) * f + 'px', width: w * f + 'px', height: h * f + 'px' });
            const dpi = cur.dpi(cur.rect), q = quality(dpi);
            qEl.className = 'dp-crop-q dp-quality ' + q.cls;
            qEl.textContent = `${q.text} · ${dpi} dpi`;
            const low = dpi < MIN_DPI;
            hint.classList.toggle('is-low', low);
            hint.textContent = low
                ? `This part has too few pixels for a clear print (${dpi} dpi, 150 or more is needed). Make the box bigger, or upload the original photo from your camera (not a screenshot or a WhatsApp copy).`
                : cur.aspect ? 'Drag the box to move it. Pull a corner to zoom in or out: you can go past the photo’s edges to fit all of it.'
                : 'Drag the box to move it. Pull a corner to trim the edges.';
        }
        function toImg(e) {
            const r = pic.getBoundingClientRect(), f = scale();
            return [(e.clientX - r.left) / f - cur.off[0], (e.clientY - r.top) / f - cur.off[1]];
        }
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
        dlg.addEventListener('pointerdown', e => {
            if (!cur || !boxEl.contains(e.target)) return;
            e.preventDefault();
            const [x, y, w, h] = cur.rect, hd = e.target.dataset.h;
            drag = hd
                ? { hd, dx: hd.includes('e') ? 1 : -1, dy: hd.includes('s') ? 1 : -1,
                    ax: hd.includes('e') ? x : x + w, ay: hd.includes('s') ? y : y + h }
                : { move: true, from: toImg(e), rect: cur.rect.slice() };
            boxEl.setPointerCapture(e.pointerId);
        });
        boxEl.addEventListener('pointermove', e => {
            if (!drag) return;
            const [ox, oy] = cur.off, IW = cur.img.width + ox, IH = cur.img.height + oy, p = toImg(e);   // area edges
            if (drag.move) {
                const [x, y, w, h] = drag.rect;
                cur.rect = [clamp(x + p[0] - drag.from[0], -ox, IW - w), clamp(y + p[1] - drag.from[1], -oy, IH - h), w, h];
            } else {
                const { dx, dy, ax, ay } = drag, a = cur.aspect;
                const maxW = dx > 0 ? IW - ax : ax + ox, maxH = dy > 0 ? IH - ay : ay + oy;
                const pw = Math.max(0, (p[0] - ax) * dx), ph = Math.max(0, (p[1] - ay) * dy);
                let w, h;
                if (a) {                                    // photo: keep the board's shape
                    w = Math.min(Math.max(pw, ph * a, cur.minW), maxW, maxH * a); h = w / a;
                    if (w < cur.minW - 0.5) return;         // no room for the smallest allowed box here
                } else {
                    w = clamp(pw, Math.min(cur.minW, maxW), maxW); h = clamp(ph, Math.min(cur.minH, maxH), maxH);
                }
                cur.rect = [dx > 0 ? ax : ax - w, dy > 0 ? ay : ay - h, w, h];
            }
            draw();
        });
        const stop = () => { drag = null; };
        boxEl.addEventListener('pointerup', stop); boxEl.addEventListener('pointercancel', stop);
        window.addEventListener('resize', () => { if (dlg.open) draw(); });

        const close = ok => { if (ok && cur) cur.done(cur.rect); cur = null; dlg.close(); };
        dlg.querySelector('.dp-crop-done').addEventListener('click', () => close(true));
        dlg.querySelector('.dp-crop-cancel').addEventListener('click', () => close(false));
        dlg.querySelector('.dp-crop-reset').addEventListener('click', () => { cur.rect = cur.reset(); draw(); });
        dlg.querySelectorAll('[data-turn]').forEach(b => b.addEventListener('click', () => {
            if (!cur) return;
            cur = cur.build((cur.rot + +b.dataset.turn) % 4); layout(); draw();
        }));
        dlg.querySelector('.dp-crop-fit').addEventListener('click', () => { cur.rect = [-cur.off[0], -cur.off[1], cur.area[0], cur.area[1]]; draw(); });
        dlg.addEventListener('cancel', () => { cur = null; });

        function layout() {
            const opts = cur, img = opts.img, iw = img.width, ih = img.height, a = opts.aspect;
            // photo: the area is the smallest board-shaped box that holds the whole photo
            const AW = a ? Math.max(iw, ih * a) : iw, AH = a ? AW / a : ih;
            cur.area = [AW, AH]; cur.off = [(AW - iw) / 2, (AH - ih) / 2];
            dlg.classList.toggle('is-logo', !a);
            dlg.querySelector('.dp-crop-fit').hidden = !a;
            dlg.querySelector('.dp-crop-title').textContent = opts.title;
            const k = Math.min(1, 1600 / Math.max(AW, AH)), o = pic.getContext('2d');
            pic.width = Math.round(AW * k); pic.height = Math.round(AH * k);
            o.clearRect(0, 0, pic.width, pic.height);
            if (a) { o.fillStyle = opts.fill || '#f7f7f5'; o.fillRect(0, 0, pic.width, pic.height); }
            o.drawImage(img, cur.off[0] * k, cur.off[1] * k, iw * k, ih * k);
        }
        return opts => {
            cur = opts; layout();
            dlg.showModal();
            requestAnimationFrame(draw);
        };
    })();

    // The part of the customer's photo used for a W x H mm board (state.photoCrop: centre and zoom)
    const MIN_DPI = 150, LOGO_MIN_PX = 300;
    const CROP_MIN_PX = 24;
    // A picture turned by rot × 90° clockwise. Very big photos are kept under 16 megapixels so phones can hold them.
    const turnCache = new WeakMap();
    function turned(img, rot) {
        rot = (((rot | 0) % 4) + 4) % 4;
        if (!img || !rot) return img;
        let m = turnCache.get(img); if (!m) turnCache.set(img, m = []);
        if (m[rot]) return m[rot];
        const k = Math.min(1, Math.sqrt(16e6 / (img.width * img.height))), w = Math.round(img.width * k), h = Math.round(img.height * k);
        const c = document.createElement('canvas'), o = c.getContext('2d');
        c.width = rot % 2 ? h : w; c.height = rot % 2 ? w : h;
        o.translate(c.width / 2, c.height / 2); o.rotate(rot * Math.PI / 2); o.drawImage(img, -w / 2, -h / 2, w, h);
        if (img.standIn) c.standIn = true;
        return (m[rot] = c);
    }
    const photoPic = () => turned(images.photo, state.photoCrop && state.photoCrop.rot);
    const logoPic = () => turned(images.ownLogo, state.logoCrop && state.logoCrop.rot);
    function photoSrc(W, H) {
        const img = photoPic(), iw = img.width, ih = img.height, a = W / H, c = state.photoCrop;
        const cw0 = Math.min(iw, ih * a), AW = Math.max(iw, ih * a), AH = AW / a;   // cover width; whole-photo box
        const zoom = clamp01(+c.zoom || 1, cw0 / AW, Math.max(1, cw0 / CROP_MIN_PX));
        const w = cw0 / zoom, h = w / a, ox = (AW - iw) / 2, oy = (AH - ih) / 2;
        return [clamp01(c.cx * iw - w / 2, -ox, iw + ox - w), clamp01(c.cy * ih - h / 2, -oy, ih + oy - h), w, h];
    }
    // Draw the part `src` of a picture into a box; where the part reaches past the picture nothing is drawn
    function drawPart(o, img, src, x, y, w, h) {
        const [sx, sy, sw, sh] = src, iw = img.width, ih = img.height;
        const x0 = Math.max(sx, 0), y0 = Math.max(sy, 0), x1 = Math.min(sx + sw, iw), y1 = Math.min(sy + sh, ih);
        if (x1 <= x0 || y1 <= y0) return;
        const kx = w / sw, ky = h / sh;
        o.drawImage(img, x0, y0, x1 - x0, y1 - y0, x + (x0 - sx) * kx, y + (y0 - sy) * ky, (x1 - x0) * kx, (y1 - y0) * ky);
    }
    function clamp01(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function logoSrc() {
        const img = logoPic(), c = state.logoCrop || { x: 0, y: 0, w: 1, h: 1 };
        return [c.x * img.width, c.y * img.height, c.w * img.width, c.h * img.height];
    }
    function logoDpiFor(w, h) {          // the logo prints up to 24 x 17 mm times the size slider
        const z = state.logoSize, mmPerPx = Math.min(24 * z / w, 17 * z / h);
        return Math.round(25.4 / mmPerPx);
    }
    function cropPhoto() {
        const s = SIZES[state.size], orig = images.photo, a = s.w / s.h, rot0 = (state.photoCrop.rot | 0) % 4;
        const build = rot => {
            const img = turned(orig, rot), cw0 = Math.min(img.width, img.height * a);
            const reset = () => { const w = cw0, h = w / a; return [(img.width - w) / 2, (img.height - h) / 2, w, h]; };
            return {
                build, rot, img, aspect: a, fill: state.colour,
                title: `Crop your photo for the ${s.name} board (${s.w} × ${s.h} mm)`,
                minW: Math.min(cw0, CROP_MIN_PX),
                rect: rot === rot0 ? photoSrc(s.w, s.h) : reset(), reset,
                dpi: r => Math.round(25.4 * r[2] / s.w),
                done: r => {
                    state.photoCrop = { cx: (r[0] + r[2] / 2) / img.width, cy: (r[1] + r[3] / 2) / img.height, zoom: cw0 / r[2], rot };
                    render();
                }
            };
        };
        crop(build(rot0));
    }
    function cropLogo() {
        const orig = images.ownLogo, rot0 = ((state.logoCrop && state.logoCrop.rot) | 0) % 4;
        const build = rot => {
            const img = turned(orig, rot);
            return {
                build, rot, img, aspect: 0, title: 'Crop your logo',
                minW: Math.min(img.width, 12), minH: Math.min(img.height, 12),
                rect: rot === rot0 ? logoSrc() : [0, 0, img.width, img.height],
                reset: () => [0, 0, img.width, img.height],
                dpi: r => logoDpiFor(r[2], r[3]),
                done: r => {
                    state.logoCrop = { x: r[0] / img.width, y: r[1] / img.height, w: r[2] / img.width, h: r[3] / img.height, rot };
                    render();
                }
            };
        };
        crop(build(rot0));
    }

    function updateCaption() {
        const s = currentSpec(), N = boards.length, d = showAll() ? designs().length : 0;
        $('dpCaption').textContent = showAll()
            ? `${N} boards · ${d} design${d === 1 ? '' : 's'}. Tap a board to pick it, double-tap to zoom in.`
            : `${N > 1 ? `Board ${active + 1} of ${N}: ` : ''}${s.name}, ${s.detail} (${s.w} × ${s.h} mm) · ${finishLabel()} · ${frameLabel()} · ${logoLabel()}${N > 1 ? ' · Double-tap to see all boards' : ''}`;
        markFrame();
        const name = $('dpFinishName');
        name.textContent = finishLabel();
        if (state.finish === 'photo' && images.photo) {
            const q = quality(photoDpi()), tag = document.createElement('span');
            tag.className = 'dp-quality ' + q.cls; tag.textContent = q.text;
            tag.title = `${photoDpi()} dpi at ${s.w} × ${s.h} mm. 250 dpi or more prints sharp.`;
            name.append(' · ', tag);
        }
        $('dpPhotoCrop').hidden = !(state.finish === 'photo' && images.photo);
        $('dpLogoCrop').hidden = !(state.logo === 'own' && images.ownLogo);
        markFinish();
        markWall();
    }

    /* ── Controls ───────────────────────────────────────── */
    // Board list follows the size; on a size change keep the same mix (fan / curtain / socket) when that board exists
    const boardSelect = $('dpBoard');
    const mix = rows => ['FAN', 'CUR', 'SOCK'].map(c => rows.flat().filter(x => x === c).length).join();
    function fillBoards() {
        boardSelect.innerHTML = '';
        SIZES[state.size].boards.forEach((bd, i) => boardSelect.add(new Option(bd.label, i, false, i === state.board)));
    }
    $('dpSize').addEventListener('change', e => {
        const before = mix((SIZES[state.size].boards[state.board] || {}).rows || []);
        state.size = e.target.value;
        const same = SIZES[state.size].boards.findIndex(bd => mix(bd.rows) === before);
        state.board = same < 0 ? 0 : same;
        fillBoards(); render();
    });
    boardSelect.addEventListener('change', e => { state.board = +e.target.value; render(); });

    // One grid: brochure colours, the colour wheel, marble and wood, your photo
    const finishGroup = $('dpFinishGroup');
    const colourRow = $('dpSwatches');
    const customBtn = $('dpCustom');
    COLOURS.forEach(([name, hex]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'dp-swatch'; b.style.setProperty('--c', hex);
        b.title = name; b.setAttribute('aria-label', name); b.dataset.hex = hex;
        b.addEventListener('click', () => { closeWheel(); setColour(hex, name); });
        colourRow.insertBefore(b, customBtn);
    });

    // Highlights whichever swatch matches the current finish
    function markFinish() {
        finishGroup.querySelectorAll('.dp-swatch').forEach(el => {
            let on = false;
            if (el.dataset.hex) on = state.finish === 'colour' && !!state.colourName && el.dataset.hex === state.colour;
            else if (el === customBtn) on = state.finish === 'colour' && !state.colourName;
            else if (el.dataset.texture) on = state.finish === 'texture' && el.dataset.texture === state.texture;
            else if (el.id === 'dpPhotoBtn') on = state.finish === 'photo';
            el.classList.toggle('is-on', on);
            if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', on);
        });
        customBtn.style.setProperty('--dot', state.finish === 'colour' && !state.colourName ? state.colour : 'transparent');
    }

    function setColour(hex, name) {
        state.finish = 'colour'; state.colour = hex; state.colourName = name || '';
        $('dpHex').value = hex.toUpperCase();
        render();
    }

    // Colour wheel pop-up: hue around, saturation outward, brightness slider
    const pop = $('dpWheelPop');
    function openWheel() {
        pop.hidden = false; customBtn.setAttribute('aria-expanded', 'true');
        placeWheelMarker(state.finish === 'colour' ? state.colour : '#2563eb');
        if (state.finish !== 'colour' || state.colourName) fromWheel();
    }
    function closeWheel() { pop.hidden = true; customBtn.setAttribute('aria-expanded', 'false'); }
    customBtn.addEventListener('click', () => (pop.hidden ? openWheel() : closeWheel()));
    $('dpWheelDone').addEventListener('click', closeWheel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { closeWheel(); customBtn.focus(); } });
    document.addEventListener('pointerdown', e => {
        if (!pop.hidden && !pop.contains(e.target) && !customBtn.contains(e.target)) closeWheel();
    });

    const wheel = $('dpWheel'), wctx = wheel.getContext('2d');
    const WR = wheel.width / 2;
    let wheelHS = { h: 0, s: 0 };
    (function paintWheel() {
        const img = wctx.createImageData(wheel.width, wheel.height);
        for (let py = 0; py < wheel.height; py++) for (let px = 0; px < wheel.width; px++) {
            const dx = px - WR, dy = py - WR, d = Math.hypot(dx, dy);
            const i = (py * wheel.width + px) * 4;
            if (d > WR) { img.data[i + 3] = 0; continue; }
            const [r, g, b] = hsv((Math.atan2(dy, dx) / (2 * Math.PI) + 1) % 1, d / WR, 1);
            img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b;
            img.data[i + 3] = d > WR - 1 ? 255 * (WR - d) : 255;
        }
        wctx.putImageData(img, 0, 0);
    })();
    function hsv(h, s, v) {
        const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    function toHex(rgb) { return '#' + rgb.map(n => n.toString(16).padStart(2, '0')).join(''); }
    function rgbToHsv(hex) {
        const [R, G, Bl] = hexRgb(hex);
        const r = R / 255, g = G / 255, b = Bl / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        let h = 0;
        if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return { h: ((h / 6) + 1) % 1, s: max ? d / max : 0, v: max };
    }
    const marker = $('dpWheelMarker'), bright = $('dpBright');
    function moveMarker() {
        const a = wheelHS.h * 2 * Math.PI;
        marker.style.left = (50 + Math.cos(a) * wheelHS.s * 50) + '%';
        marker.style.top = (50 + Math.sin(a) * wheelHS.s * 50) + '%';
    }
    function placeWheelMarker(hex) {
        const { h, s, v } = rgbToHsv(hex);
        wheelHS = { h, s }; bright.value = Math.round(v * 100);
        moveMarker(); marker.style.background = hex;
    }
    function fromWheel() {
        const hex = toHex(hsv(wheelHS.h, wheelHS.s, bright.value / 100));
        marker.style.background = hex;
        setColour(hex, '');
    }
    function pickAt(ev) {
        const rect = wheel.getBoundingClientRect();
        const dx = (ev.clientX - rect.left) / rect.width * 2 - 1, dy = (ev.clientY - rect.top) / rect.height * 2 - 1;
        wheelHS = { h: (Math.atan2(dy, dx) / (2 * Math.PI) + 1) % 1, s: Math.min(1, Math.hypot(dx, dy)) };
        moveMarker();
        if (+bright.value < 15) bright.value = 100;
        fromWheel();
    }
    let picking = false;
    wheel.addEventListener('pointerdown', e => { picking = true; wheel.setPointerCapture(e.pointerId); pickAt(e); });
    wheel.addEventListener('pointermove', e => { if (picking) pickAt(e); });
    wheel.addEventListener('pointerup', () => { picking = false; });
    wheel.addEventListener('pointercancel', () => { picking = false; });
    bright.addEventListener('input', fromWheel);
    $('dpHex').addEventListener('change', e => {
        let v = e.target.value.trim(); if (!v.startsWith('#')) v = '#' + v;
        if (/^#[0-9a-f]{6}$/i.test(v)) { placeWheelMarker(v.toLowerCase()); setColour(v.toLowerCase(), ''); }
        else e.target.value = state.colour.toUpperCase();
    });

    // Marble and wood
    finishGroup.querySelectorAll('.dp-swatch[data-texture]').forEach(b => {
        b.style.setProperty('--img', `url("${TEXTURES[b.dataset.texture].src}")`);
        b.addEventListener('click', () => { closeWheel(); state.finish = 'texture'; state.texture = b.dataset.texture; render(); });
    });

    // Uploads (read locally, never sent anywhere)
    function readImage(file, cb) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => cb(img, reader.result);
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
    const photoBtn = $('dpPhotoBtn');
    $('dpPhoto').addEventListener('change', e => readImage(e.target.files[0], (img, url) => {
        e.target.value = '';
        saveActive();
        const targets = scope === 'one' ? [state] : boards.filter(b => inScope(b, boards[active]));
        const s = targets.map(b => SIZES[b.size]).reduce((m, z) => printDpi(img, z.w, z.h) < printDpi(img, m.w, m.h) ? z : m, SIZES[state.size]);
        if (printDpi(img, s.w, s.h) < MIN_DPI) {
            const need = [s.w, s.h].map(mm => Math.ceil(mm / 25.4 * MIN_DPI));
            toast(`Heads up: this photo is ${img.width} × ${img.height} px, so it may print blurry on the ${s.name} board (a clear print needs about ${need[0]} × ${need[1]} px). For the best print use the original photo from your camera, not a screenshot or a WhatsApp copy.`);
        }
        images.photo = img; looks.photo = lookOf(img); state.photo = true; state.finish = 'photo'; photoUrl = url;
        state.photoCrop = { cx: 0.5, cy: 0.5, zoom: 1 };
        photoBtn.style.setProperty('--img', `url("${url}")`); photoBtn.classList.add('has-img');
        closeWheel(); render();
        cropPhoto();
    }));
    $('dpPhotoCrop').addEventListener('click', cropPhoto);
    // Picking the photo swatch again after a photo is loaded switches back to it
    photoBtn.addEventListener('click', e => {
        if (state.photo && state.finish !== 'photo') { e.preventDefault(); state.finish = 'photo'; render(); }
    });

    // Walls: paint colours, brick, wood, or a photo of the visitor's own wall
    const wallBtns = form.querySelectorAll('[data-wall]');
    const wallTools = $('dpWallTools');
    function setWall(name) {
        state.wall = name;
        wallTools.hidden = !(name === 'photo' && images.wall);
        render();
    }
    function markWall() {
        wallBtns.forEach(el => {
            const on = el.dataset.wall === state.wall;
            el.classList.toggle('is-on', on);
            if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', on);
        });
    }
    wallBtns.forEach(el => {
        const wall = WALLS[el.dataset.wall];
        if (wall && wall.paint) el.style.setProperty('--c', wall.paint);
        if (el.dataset.wall === 'wood') el.style.setProperty('--img', 'url("images/finishes/wood.jpg")');
        if (el.tagName === 'BUTTON') el.addEventListener('click', () => setWall(el.dataset.wall));
    });
    const brickBtn = form.querySelector('[data-wall="brick"]');
    if (brickBtn) {
        const t = brickTile(), c = document.createElement('canvas'); c.width = c.height = 96;
        c.getContext('2d').drawImage(t, 0, 0, t.width * 0.12, t.height * 0.12);
        brickBtn.style.setProperty('--img', `url("${c.toDataURL()}")`);
    }
    const wallPhotoBtn = $('dpWallPhotoBtn');
    $('dpWallPhoto').addEventListener('change', e => readImage(e.target.files[0], (img, url) => {
        images.wall = img; state.pos = { x: 0, y: 0 };
        wallPhotoBtn.style.setProperty('--img', `url("${url}")`); wallPhotoBtn.classList.add('has-img');
        setWall('photo');
    }));
    wallPhotoBtn.addEventListener('click', e => {
        if (images.wall && state.wall !== 'photo') { e.preventDefault(); setWall('photo'); }
    });
    $('dpWallScale').addEventListener('input', e => { state.wallScale = e.target.value / 100; renderSoon(); });

    // Drag the board around on a wall photo; on computers the light follows the mouse
    let drag = null;
    function toLogical(e) {
        const rc = canvas.getBoundingClientRect();
        return { x: (e.clientX - rc.left) / rc.width * CW, y: (e.clientY - rc.top) / rc.height * CH };
    }
    const hitAt = e => { const p = toLogical(e); return hits.find(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); };
    // Double-click / double-tap: on a board in the overview, zoom in to edit it; when zoomed in, back to all boards.
    // Counted by hand so it works the same with a mouse, a finger or a pen (phones don't always send dblclick).
    let lastTap = null;
    function doubleTap(e) {
        const now = e.timeStamp, near = lastTap && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30;
        const dbl = near && now - lastTap.t < 350;
        lastTap = dbl ? null : { t: now, x: e.clientX, y: e.clientY };
        if (!dbl || boards.length < 2) return false;
        if (showAll()) { const h = hitAt(e); if (!h) return false; select(h.i); setView('one'); }
        else setView('all');
        return true;
    }
    canvas.addEventListener('dblclick', e => e.preventDefault());
    canvas.addEventListener('pointerdown', e => {
        if (e.isPrimary !== false && doubleTap(e)) { endDrag(); e.preventDefault(); return; }
        if (showAll()) { const h = hitAt(e); if (h) select(h.i); return; }
        if (!(state.wall === 'photo' && images.wall)) return;
        const p = toLogical(e);
        if (p.x < box.x || p.x > box.x + box.w || p.y < box.y || p.y > box.y + box.h) return;
        drag = { x: p.x, y: p.y, px: state.pos.x, py: state.pos.y };
        canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-dragging');
        e.preventDefault();
    });
    canvas.addEventListener('pointermove', e => {
        if (showAll()) return;
        const p = toLogical(e);
        if (drag) {
            state.pos.x = drag.px + p.x - drag.x; state.pos.y = drag.py + p.y - drag.y;
            renderSoon(); return;
        }
        if (e.pointerType === 'mouse') {
            const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
            state.light = {
                x: Math.max(-1, Math.min(1, (p.x - cx) / (CW / 2))),
                y: Math.max(-1, Math.min(-0.3, (p.y - cy) / (CH / 2) - 0.5))
            };
            renderSoon();
        }
    });
    function endDrag() { drag = null; canvas.classList.remove('is-dragging'); }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', e => {
        if (e.pointerType === 'mouse' && !drag && !showAll()) { state.light = { x: -0.35, y: -0.75 }; renderSoon(); }
    });

    // Logo: PAT stays until the visitor picks something else
    const ownInput = $('dpOwnLogo'), posSelect = $('dpLogoPos'), logoSize = $('dpLogoSize');
    function setLogo(value) {
        state.logo = value;
        form.querySelector(`input[name="dpLogo"][value="${value}"]`).checked = true;
        posSelect.disabled = logoSize.disabled = value === 'none';
        render();
    }
    form.querySelectorAll('input[name="dpLogo"]').forEach(r => r.addEventListener('change', () => {
        if (r.value === 'own' && !state.ownLogo) { ownInput.click(); return; }
        setLogo(r.value);
    }));
    // "Your logo" again opens the picker to change it
    $('dpOwnLogoChip').addEventListener('click', e => {
        if (state.logo === 'own') { e.preventDefault(); ownInput.click(); }
    });
    ownInput.addEventListener('change', e => readImage(e.target.files[0], img => {
        e.target.value = '';
        if (Math.max(img.width, img.height) < LOGO_MIN_PX)
            toast(`Heads up: this logo is small (${img.width} × ${img.height} px) and may print blurry. For a sharp print upload one at least ${LOGO_MIN_PX} px wide, or send us the PDF / SVG / CDR file.`);
        images.ownLogo = img; state.ownLogo = true; state.logoCrop = null; setLogo('own');
        cropLogo();
    }));
    $('dpLogoCrop').addEventListener('click', cropLogo);
    // Picker closed without a file: keep the logo that was showing
    ownInput.addEventListener('cancel', () => setLogo(state.logo));
    window.addEventListener('focus', () => setTimeout(() => {
        const checked = form.querySelector('input[name="dpLogo"]:checked');
        if (checked && checked.value !== state.logo) setLogo(state.logo);
    }, 400));
    posSelect.addEventListener('change', e => { state.logoPos = e.target.value; render(); });
    logoSize.addEventListener('input', e => { state.logoSize = e.target.value / 100; renderSoon(); });

    /* ── Actions ────────────────────────────────────────── */
    const stage = canvas.parentElement;
    let toastTimer = 0;
    function toast(text, link) {
        let t = stage.querySelector('.dp-toast');
        if (!t) { t = document.createElement('div'); t.className = 'dp-toast'; t.setAttribute('role', 'status'); stage.appendChild(t); }
        t.innerHTML = '';
        t.append(text);
        if (link) {
            const a = document.createElement('a');
            a.href = link.href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = link.text;
            t.append(' ', a);
        }
        t.classList.add('is-on');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 12000);
    }
    function saveBlob(blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = fileName();
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
    const cdrBtn = $('dpCorel');
    if (cdrBtn) cdrBtn.addEventListener('click', () => {
        const blob = new Blob([makeSvg()], { type: 'image/svg+xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = fileName().replace(/\.png$/, '-CorelDRAW.svg');
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast(`CorelDRAW file saved${boards.length > 1 ? ` with all ${boards.length} designs (quantity in each name)` : ''}: real size in mm, icons and socket cut out. Open it in CorelDRAW.`);
    });
    const dlBtn = $('dpDownload');
    dlBtn.addEventListener('click', async () => {
        dlBtn.disabled = true;
        const blob = await designBlob();
        dlBtn.disabled = false;
        if (blob) saveBlob(blob);
    });

    // A link that rebuilds this exact design on patiot.in, so PAT IoT sees it straight from the chat
    // Links point at the site the customer is on, so a test copy (localhost / LAN) links to itself, not to the live site
    const SITE = /^https?:$/.test(location.protocol) ? location.origin + '/' : 'https://patiot.in/';
    const finishCode = b => b.finish === 'texture' ? b.texture : b.finish === 'photo' ? 'photo' : b.colour.slice(1);
    // One code per design: size.board.finish.logo.position.logoSize.quantity.photoCrop.logoCrop
    // Own photos and logos are numbered (p1, p2 / o1, o2): the pictures travel in the design file, not in the link.
    const k3 = v => Math.round(v * 1000);
    function designLink() {
        saveActive();
        const q = new URLSearchParams(), pics = [], logos = [];
        const num = (list, img) => { if (!list.includes(img)) list.push(img); return list.indexOf(img) + 1; };
        q.set('d', designs().map(({ b, qty }) => {
            const photo = b.finish === 'photo' && b.photoImg, own = b.logo === 'own' && b.logoImg;
            const pc = photo && b.photoCrop ? [b.photoCrop.cx, b.photoCrop.cy, b.photoCrop.zoom, b.photoCrop.rot | 0].map(k3).join('~') : '';
            const lc = own && b.logoCrop ? [b.logoCrop.x, b.logoCrop.y, b.logoCrop.w, b.logoCrop.h, b.logoCrop.rot | 0].map(k3).join('-') : '';
            return [b.size, b.board, photo ? 'p' + num(pics, b.photoImg) : finishCode(b), own ? 'o' + num(logos, b.logoImg) : b.logo,
                b.logoPos, Math.round(b.logoSize * 100), qty, pc, lc, b.frame === 'silver' ? '' : b.frame].join('.').replace(/\.+$/, '');
        }).join('_'));
        q.set('w', state.wall);
        return `${SITE}#design-panel?${q}`;
    }
    // Stand-in for a customer picture that is in the design file, not in the link
    const stand = {};
    function standIn(kind, n) {
        const key = kind + n;
        if (stand[key]) return stand[key];
        const photo = kind === 'photo', c = document.createElement('canvas');
        c.width = photo ? 3000 : 1200; c.height = photo ? 2000 : 600;
        const x = c.getContext('2d');
        if (photo) {
            x.fillStyle = '#cfd5dd'; x.fillRect(0, 0, c.width, c.height);
            x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 40;
            for (let i = -c.height; i < c.width; i += 160) { x.beginPath(); x.moveTo(i, c.height); x.lineTo(i + c.height, 0); x.stroke(); }
        } else {
            x.setLineDash([40, 30]); x.lineWidth = 16; x.strokeStyle = '#2563eb'; x.strokeRect(20, 20, c.width - 40, c.height - 40);
        }
        x.fillStyle = photo ? '#334155' : '#2563eb'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.font = `700 ${photo ? 220 : 170}px Inter, system-ui, sans-serif`;
        x.fillText(photo ? `Customer photo ${n}` : `Logo ${n}`, c.width / 2, c.height / 2 - (photo ? 140 : 70));
        x.font = `500 ${photo ? 120 : 90}px Inter, system-ui, sans-serif`;
        x.fillText('in the design file', c.width / 2, c.height / 2 + (photo ? 160 : 90));
        c.standIn = true;
        return (stand[key] = c);
    }
    const isStandIn = img => !!(img && img.standIn);
    function applyLink() {
        const m = location.hash.match(/^#design-panel\?(.+)$/);
        if (!m) return false;
        const q = new URLSearchParams(m[1]);
        const w = q.get('w');
        if (WALLS[w] && w !== 'photo') state.wall = w;
        const d = q.get('d');
        if (d) {
            const base = snapshot(), list = [];
            d.split('_').filter(Boolean).slice(0, MAX_BOARDS).forEach(code => {
                if (list.length >= MAX_BOARDS) return;
                load(base);
                const [s, b, f, l, p, z, n, pc, lc, fr] = code.split('.');
                applyCode({ s, b, f, l, p, z, pc, lc, fr });
                const k = Math.max(1, parseInt(n, 10) || 1);
                for (let c = 0; c < k && list.length < MAX_BOARDS; c++) list.push(snapshot());
            });
            boards = list.length ? list : [base];
            sortGroups();
            active = 0; scope = 'one'; load(boards[0]); view = boards.length > 1 ? 'all' : 'one';
        } else applyCode(Object.fromEntries(q));
        syncForm();
        if (boards.some(b => isStandIn(b.photoImg) || isStandIn(b.logoImg)))
            setTimeout(() => toast('This design has the customer’s own photo or logo. Open the design file they sent on WhatsApp with “Open file” under the preview to see it.'), 1200);
        return true;
    }
    function applyCode(o) {
        if (SIZES[o.s]) {
            state.size = o.s;
            const b = parseInt(o.b, 10);
            state.board = SIZES[state.size].boards[b] ? b : 0;
        }
        const f = o.f || '', nums = v => (v || '').split((v || '').includes('~') ? '~' : '-').map(t => parseInt(t, 10) / 1000);
        const pm = f === 'photo' ? ['', '1'] : f.match(/^p(\d{1,3})$/);
        if (pm) {
            images.photo = standIn('photo', +pm[1]); looks.photo = lookOf(images.photo); photoUrl = '';
            state.photo = true; state.finish = 'photo';
            const [cx, cy, zoom, r] = nums(o.pc), rot = r >= 0 && r <= 3 ? Math.round(r) : 0;
            state.photoCrop = cx >= -3 && cx <= 4 && cy >= -3 && cy <= 4 && zoom > 0 && zoom <= 500 ? { cx, cy, zoom, rot } : { cx: 0.5, cy: 0.5, zoom: 1, rot };
        }
        const lm = (o.l || '').match(/^o(\d{1,3})$/);
        if (lm) {
            images.ownLogo = standIn('logo', +lm[1]); state.ownLogo = true; state.logo = 'own';
            const [x, y, w, h, r] = nums(o.lc), rot = r >= 0 && r <= 3 ? Math.round(r) : 0;
            state.logoCrop = [x, y, w, h].every(v => v >= 0 && v <= 1) && w > 0 && h > 0 ? { x, y, w, h, rot } : rot ? { x: 0, y: 0, w: 1, h: 1, rot } : null;
        }
        if (pm) { /* photo set above */ }
        else if (TEXTURES[f]) { state.finish = 'texture'; state.texture = f; }
        else if (/^[0-9a-f]{6}$/i.test(f)) {
            const hex = '#' + f.toLowerCase(), named = COLOURS.find(c => c[1] === hex);
            state.finish = 'colour'; state.colour = hex; state.colourName = named ? named[0] : '';
        }
        if (o.l === 'pat' || o.l === 'none') state.logo = o.l;
        if (/^(br|bl|tr|tl)$/.test(o.p || '')) state.logoPos = o.p;
        const z = parseInt(o.z, 10);
        if (z >= 60 && z <= 180) state.logoSize = z / 100;
        state.frame = FRAMES[o.fr] ? o.fr : 'silver';
    }

    /* ── Design file ──
       The HD picture the customer sends also carries the whole order: every board, crops, wall,
       and the original photos and logos at full quality. Opened here ("Open design file" or dropped
       on the preview), it rebuilds everything exactly. */
    const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
    const crc32 = b => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
    const KEYWORD = 'pat-design';
    function designData() {
        saveActive();
        const pics = [], idx = img => {
            if (!img || isStandIn(img) || !/^data:image\//.test(img.src || '')) return -1;
            if (!pics.includes(img)) pics.push(img);
            return pics.indexOf(img);
        };
        const list = boards.map(b => {
            const o = {}; BOARD_KEYS.forEach(k => { o[k] = b[k]; });
            o.pi = idx(b.photoImg); o.li = idx(b.logoImg);
            return o;
        });
        const wallPic = state.wall === 'photo' ? idx(images.wall) : -1;
        return { v: 1, boards: list, active, wall: state.wall, wallPic, wallScale: state.wallScale, pos: state.pos, pictures: pics.map(i => i.src) };
    }
    async function designBlob() {
        const blob = await getBlob(); if (!blob) return blob;
        const png = new Uint8Array(await blob.arrayBuffer());
        const json = JSON.stringify(designData()).replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
        const data = new TextEncoder().encode(KEYWORD + '\0' + json);
        const chunk = new Uint8Array(12 + data.length), dv = new DataView(chunk.buffer);
        dv.setUint32(0, data.length); chunk.set([116, 69, 88, 116], 4); chunk.set(data, 8);   // tEXt
        dv.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
        const end = png.length - 12;   // before IEND
        return new Blob([png.subarray(0, end), chunk, png.subarray(end)], { type: 'image/png' });
    }
    async function readDesignFile(file) {
        const b = new Uint8Array(await file.arrayBuffer()), dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
        if (b[1] !== 80 || b[2] !== 78 || b[3] !== 71) return null;   // not a PNG
        const dec = new TextDecoder('latin1');
        for (let p = 8; p + 12 <= b.length;) {
            const len = dv.getUint32(p), type = dec.decode(b.subarray(p + 4, p + 8));
            if (type === 'tEXt') {
                const d = b.subarray(p + 8, p + 8 + len), z = d.indexOf(0);
                if (z > 0 && dec.decode(d.subarray(0, z)) === KEYWORD) { try { return JSON.parse(dec.decode(d.subarray(z + 1))); } catch (err) { return null; } }
            }
            if (type === 'IEND') break;
            p += 12 + len;
        }
        return null;
    }
    const picFrom = src => new Promise(res => {
        if (typeof src !== 'string' || !/^data:image\//.test(src)) return res(null);
        const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src;
    });
    async function openDesignFile(file) {
        if (!file) return;
        const o = await readDesignFile(file).catch(() => null);
        if (!o || !Array.isArray(o.boards) || !o.boards.length) {
            toast('This picture has no design inside. Open the PNG file the customer sent from “Send on WhatsApp” (as a Document), or one saved with “Download HD”.');
            return;
        }
        const pics = await Promise.all((o.pictures || []).map(picFrom)), picLooks = pics.map(i => i && lookOf(i));
        load(boards[0] || snapshot());
        const base = snapshot(), list = [];
        o.boards.slice(0, MAX_BOARDS).forEach(r => {
            const b = { ...base };
            BOARD_KEYS.forEach(k => { if (r && k in r) b[k] = copyVal(r[k]); });
            if (!SIZES[b.size]) b.size = base.size;
            if (!SIZES[b.size].boards[b.board]) b.board = 0;
            if (!/^#[0-9a-f]{6}$/i.test(b.colour || '')) b.colour = base.colour;
            if (!TEXTURES[b.texture]) b.texture = base.texture;
            if (!/^(br|bl|tr|tl)$/.test(b.logoPos)) b.logoPos = 'br';
            b.logoSize = Math.min(1.8, Math.max(0.6, +b.logoSize || 1));
            if (!FRAMES[b.frame]) b.frame = 'silver';
            b.photoImg = pics[r.pi] || null; b.photoLook = picLooks[r.pi] || null; b.photoUrl = b.photoImg ? b.photoImg.src : '';
            b.logoImg = pics[r.li] || null;
            if (!['colour', 'texture', 'photo'].includes(b.finish) || (b.finish === 'photo' && !b.photoImg)) b.finish = 'colour';
            if (!['pat', 'own', 'none'].includes(b.logo) || (b.logo === 'own' && !b.logoImg)) b.logo = 'pat';
            b.photo = !!b.photoImg; b.ownLogo = !!b.logoImg;
            list.push(b);
        });
        boards = list; active = Math.min(Math.max(0, o.active | 0), list.length - 1); scope = 'one';
        view = list.length > 1 ? 'all' : 'one';
        load(boards[active]);
        const wallImg = pics[o.wallPic];
        if (wallImg) {
            images.wall = wallImg; state.wallScale = +o.wallScale || 1;
            state.pos = o.pos && isFinite(o.pos.x) && isFinite(o.pos.y) ? { x: +o.pos.x, y: +o.pos.y } : { x: 0, y: 0 };
            wallPhotoBtn.style.setProperty('--img', `url("${wallImg.src}")`); wallPhotoBtn.classList.add('has-img');
            $('dpWallScale').value = Math.round(state.wallScale * 100);
        }
        syncForm(); markWall();
        setWall(wallImg ? 'photo' : WALLS[o.wall] && o.wall !== 'photo' ? o.wall : state.wall === 'photo' && !images.wall ? 'studio' : state.wall);
        const N = boards.length;
        toast(`Design opened: ${N} board${N === 1 ? '' : 's'}${pics.filter(Boolean).length ? ', with the customer’s original pictures' : ''}.`);
    }
    // "Open design file" next to the CorelDRAW button, and drop a file on the preview
    const openInput = document.createElement('input');
    openInput.type = 'file'; openInput.accept = 'image/png,.png'; openInput.hidden = true;
    openInput.addEventListener('change', e => { openDesignFile(e.target.files[0]); e.target.value = ''; });
    document.body.appendChild(openInput);
    {
        const ob = document.createElement('button');
        ob.type = 'button'; ob.className = 'dp-ws-open'; ob.id = 'dpOpenFile';
        ob.title = 'Open a design file sent on WhatsApp (the PNG picture): every board, photo and logo';
        ob.innerHTML = '<i class="fas fa-folder-open" aria-hidden="true"></i> Open file';
        ob.addEventListener('click', () => openInput.click());
        wsQ('.dp-ws-actions').appendChild(ob);
    }
    stage.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
    stage.addEventListener('drop', e => {
        const f = e.dataTransfer.files[0];
        if (f && /png$/i.test(f.type || f.name)) { e.preventDefault(); openDesignFile(f); }
    });

    const framePick = document.createElement('span');
    framePick.className = 'dp-frames'; framePick.setAttribute('role', 'group'); framePick.setAttribute('aria-label', 'Frame colour');
    framePick.innerHTML = '<span class="dp-mini">Frame</span>' + Object.entries(FRAMES).map(([k, f]) =>
        `<button type="button" class="dp-frame" data-frame="${k}" title="${f.name} frame" aria-label="${f.name} frame" style="--metal:linear-gradient(135deg,${f.stops.join(',')})"></button>`).join('');
    $('dpFinishGroup').querySelector('.dp-label').appendChild(framePick);
    framePick.addEventListener('click', e => {
        const b = e.target.closest('[data-frame]'); if (!b) return;
        state.frame = b.dataset.frame; render();
    });
    function markFrame() {
        framePick.querySelectorAll('[data-frame]').forEach(b => {
            const on = b.dataset.frame === state.frame;
            b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
        });
    }

    const anyBoard = f => { saveActive(); return boards.some(f); };
    function message() {
        saveActive();
        const s = currentSpec(), keep = boards[active], list = [], all = designs(), N = boards.length;
        const own = [anyBoard(b => b.finish === 'photo') && 'photo finish', anyBoard(b => b.logo === 'own') && 'logo', state.wall === 'photo' && 'wall photo']
            .filter(Boolean);
        if (all.length === 1) {
            list.push(`Size: ${s.name}, ${s.detail} (${s.w} × ${s.h} mm)`, `Finish: ${finishLabel()}`, `Frame: ${FRAMES[state.frame].name}`, `Logo: ${logoLabel()}`);
            if (N > 1) list.push(`Quantity: ${N}`);
        } else {
            // Designs that differ only in which uploaded picture or which crop they use get numbered,
            // so two lines never read the same: "Own photo 2, crop 1"
            const tagger = (on, img, cut) => {
                const pics = [], cuts = new Map();
                all.forEach(({ b }) => {
                    if (!on(b)) return;
                    if (!pics.includes(img(b))) { pics.push(img(b)); cuts.set(img(b), []); }
                    const c = cuts.get(img(b)), k = JSON.stringify(cut(b));
                    if (!c.includes(k)) c.push(k);
                });
                return b => {
                    if (!on(b)) return '';
                    const c = cuts.get(img(b));
                    return (pics.length > 1 ? ` ${pics.indexOf(img(b)) + 1}` : '') +
                        (c.length > 1 ? `, crop ${c.indexOf(JSON.stringify(cut(b))) + 1}` : '');
                };
            };
            const photoTag = tagger(b => b.finish === 'photo' && b.photoImg, b => b.photoImg, b => b.photoCrop);
            const logoTag = tagger(b => b.logo === 'own' && b.logoImg, b => b.logoImg, b => b.logoCrop);
            all.forEach(({ b, qty }, i) => {
                load(b);
                const t = currentSpec();
                const fin = finishLabel().replace(/^Own photo/, m => m + photoTag(b));
                const logo = logoLabel().replace(/^Own logo/, m => m + logoTag(b));
                list.push(`${i + 1}) ${t.name}, ${t.detail} (${t.w} × ${t.h} mm) × ${qty}`, `    Finish: ${fin} · Frame: ${FRAMES[b.frame].name} · Logo: ${logo}`);
            });
            load(keep);
            list.push(`Total: ${N} boards`);
        }
        const n = N;
        return [
            `Hi PAT IoT, I designed ${n > 1 ? `${n} touch panels` : 'a touch panel'} on your website.`, '',
            ...list, '',
            `See my design: ${designLink()}`,
            ...(own.length ? ['', `I'm sending my design file ${fileName()} as a Document. It has all ${N > 1 ? `${N} boards` : 'the board'} with my original ${own.join(' and ')} in full quality.`] : [])
        ].join('\n');
    }
    // Uploaded photos and logos can't travel in a link, so those designs also need the picture attached
    const hasUploads = () => anyBoard(b => b.finish === 'photo' || b.logo === 'own') || state.wall === 'photo';

    const touch = window.matchMedia('(pointer: coarse)').matches;
    const sendBtn = $('dpSend');
    sendBtn.addEventListener('click', async () => {
        const chat = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message())}`;
        const openChat = () => { const win = window.open(chat, '_blank'); if (win) win.opener = null; return !!win; };

        if (!hasUploads()) {
            // The design link in the message shows PAT IoT the full design
            const opened = openChat();
            toast('Your design link is in the message. Just press send in WhatsApp.', opened ? null : { href: chat, text: 'Open WhatsApp chat' });
            return;
        }

        // With an uploaded photo or logo: save the design file (the picture with every board and the original
        // pictures inside), then open the PAT IoT chat. Sent as a Document, WhatsApp keeps it exactly as it is.
        const blob = await designBlob(); if (blob) saveBlob(blob);
        const opened = openChat();
        const name = fileName();
        toast((touch ? `Design file “${name}” saved to your phone. In the chat tap 📎 > Document, pick it and send.`
            : `Design file “${name}” downloaded. In the chat click 📎 > Document, pick it and send.`) +
            ' Please send it as a Document, not as a photo, so your photo and logo arrive in full quality.',
            opened ? null : { href: chat, text: 'Open WhatsApp chat' });
    });

    // One step at a time (Size, Colour, Logo, Wall, Boards), Send always at the bottom
    {
        const form = $('dpForm'), finish = $('dpFinishGroup');
        const [wallGroup, logoGroup] = [...form.querySelectorAll(':scope > .dp-group')].filter(g => g !== finish);
        const STEPS = [
            ['size', 'Size', 'fa-border-all', form.querySelector('.dp-pick'), 'Pick the board size, then what goes on it.'],
            ['colour', 'Colour', 'fa-palette', finish, 'Tap a colour, marble or wood. Tap the camera to use your own photo.'],
            ['logo', 'Logo', 'fa-certificate', logoGroup, 'Keep the PAT logo, add your own, or have no logo.'],
            ['wall', 'Wall', 'fa-house', wallGroup, 'See the board on a wall. Tap the house to use a photo of your own wall.'],
            ['boards', 'Boards', 'fa-layer-group', ws, 'Need boards for more rooms? Add them here and design each one.']
        ];
        const bar = document.createElement('div');
        bar.className = 'dp-steps'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', 'Design steps');
        bar.innerHTML = STEPS.map(([k, name, icon], i) => `<button type="button" role="tab" data-step="${k}" aria-controls="dpStep-${k}">
            <i class="fas ${icon}" aria-hidden="true"></i><span>${name}</span>${k === 'boards' ? '<b class="dp-step-n" hidden></b>' : ''}</button>`).join('');
        form.prepend(bar);
        form.insertBefore(ws, form.querySelector('.dp-actions'));       // the boards bar becomes the last step
        // the frame gets its own row under the colours
        framePick.querySelector('.dp-mini').textContent = 'Frame colour';
        finish.appendChild(framePick);
        STEPS.forEach(([k, , , el, hint], i) => {
            el.id = el.id || `dpStep-${k}`; bar.querySelector(`[data-step="${k}"]`).setAttribute('aria-controls', el.id);
            el.classList.add('dp-step'); el.setAttribute('role', 'tabpanel');
            const p = document.createElement('p'); p.className = 'dp-step-hint'; p.textContent = hint;
            el.prepend(p);
            if (i < STEPS.length - 1) {
                const nx = document.createElement('button');
                nx.type = 'button'; nx.className = 'dp-step-next';
                nx.innerHTML = `Next: ${STEPS[i + 1][1]} <i class="fas fa-arrow-right" aria-hidden="true"></i>`;
                nx.addEventListener('click', () => { showStep(STEPS[i + 1][0]); bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
                el.appendChild(nx);
            }
        });
        function showStep(k) {
            STEPS.forEach(([key, , , el]) => {
                const on = key === k;
                el.classList.toggle('is-step', on);
                const t = bar.querySelector(`[data-step="${key}"]`);
                t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on);
            });
            closeWheel();
        }
        bar.addEventListener('click', e => { const t = e.target.closest('[data-step]'); if (t) showStep(t.dataset.step); });
        showStep('size');
        // board count on the Boards tab
        const nEl = bar.querySelector('.dp-step-n'), total = ws.querySelector('.dp-ws-total');
        const count = () => { const n = parseInt(total.textContent.replace(/\D/g, ''), 10) || 1; nEl.textContent = n; nEl.hidden = n < 2; };
        new MutationObserver(count).observe(total, { childList: true, characterData: true, subtree: true }); count();
        // the floating WhatsApp / call buttons step aside while the customer is designing
        const section = document.getElementById('design-panel');
        if (section && 'IntersectionObserver' in window && document.documentElement.classList.contains('site-mobile'))
            new IntersectionObserver(([en]) => document.documentElement.classList.toggle('dp-in-view', en.isIntersecting), { threshold: 0.25 }).observe(section);
    }

    // Start: brochure defaults (6 Module fan + socket, White, PAT logo bottom right), or a shared design link
    fillBoards();
    boards = [snapshot()];
    setColour('#f7f7f5', 'White');
    if (applyLink()) {
        render();
        window.addEventListener('load', () => setTimeout(() => {
            document.getElementById('design-panel').scrollIntoView({ behavior: 'instant', block: 'start' });
        }, 300));
    }
    const loads = [loadImage('pat', 'images/logo.png')];
    Object.entries(TEXTURES).forEach(([k, t]) => loads.push(loadImage(k, t.src)));
    Promise.all(loads).then(render);
    if (document.fonts) document.fonts.ready.then(render);
    // keep the preview sharp when the window or phone rotates
    let lastRes = 0;
    window.addEventListener('resize', () => { const r = screenRes(); if (Math.abs(r - lastRes) > 0.05) { lastRes = r; renderSoon(); } });
})();
