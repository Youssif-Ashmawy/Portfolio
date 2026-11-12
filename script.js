// ============================================
// Portfolio: live inference hero, result graphs,
// career trace and the RAG ask bar
// ============================================

const $ = (id) => document.getElementById(id);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// Live inference hero
// Illustrative replay; only the ratio between modes reflects the real 90% cut.
// ============================================
function initInferenceHero() {
    const out = $('out');
    if (!out) return;

    const tokens = out.innerHTML.trim().split(/\s+/);
    const CONFIG = {
        tuned: { ttft: 41, tps: 138, gpu: 72 },
        untuned: { ttft: 410, tps: 14, gpu: 31 }
    };
    const NOTES = {
        tuned: 'Illustrative replay. Same model and GPU with tuned serving; the 10× gap matches the real <b>90%</b> latency cut at BSF.',
        untuned: 'Illustrative replay on default serving parameters. Each token waits on a half-empty batch.'
    };
    let mode = 'tuned';
    let timers = [];

    const render = (n) => {
        out.innerHTML = tokens.slice(0, n)
            .map((t, i) => `<span class="tok${i === n - 1 ? ' fresh' : ''}">${t}</span>`)
            .join(' ') + '<span class="caret"></span>';
    };
    const setMeters = (c, n) => {
        $('ttft').textContent = `${c.ttft} ms`;
        $('tps').textContent = c.tps;
        $('ntok').textContent = n;
        $('gpu').textContent = `${c.gpu}%`;
        $('gpuBar').style.width = `${c.gpu}%`;
    };

    const run = () => {
        timers.forEach(clearTimeout);
        timers = [];
        const c = CONFIG[mode];
        $('meter').classList.toggle('slow', mode === 'untuned');
        $('note').innerHTML = NOTES[mode];

        if (reducedMotion()) {
            render(tokens.length);
            setMeters(c, tokens.length);
            return;
        }

        render(0);
        $('ttft').textContent = '…';
        $('tps').textContent = '–';
        $('ntok').textContent = '0';
        $('gpu').textContent = '0%';
        $('gpuBar').style.width = '0';

        // Slowed 3x so it stays readable; the ratio between modes is unchanged
        const step = 1000 / c.tps * 3;
        timers.push(setTimeout(() => {
            $('ttft').textContent = `${c.ttft} ms`;
            tokens.forEach((_, i) => timers.push(setTimeout(() => {
                render(i + 1);
                $('ntok').textContent = i + 1;
                $('tps').textContent = Math.round(c.tps * (0.94 + Math.random() * 0.1));
                const g = Math.round(c.gpu * (0.9 + Math.random() * 0.15));
                $('gpu').textContent = `${g}%`;
                $('gpuBar').style.width = `${g}%`;
            }, i * step)));
        }, c.ttft * 3));
    };

    const setMode = (m) => {
        mode = m;
        $('tuned').setAttribute('aria-pressed', m === 'tuned');
        $('untuned').setAttribute('aria-pressed', m === 'untuned');
        run();
    };

    $('tuned').addEventListener('click', () => setMode('tuned'));
    $('untuned').addEventListener('click', () => setMode('untuned'));
    $('replay').addEventListener('click', run);
    setTimeout(run, 500);
}

// ============================================
// Result graphs: before -> after, y from zero so the slope is to scale
// ============================================
function initResultGraphs() {
    document.querySelectorAll('.stat[data-before]').forEach((card) => {
        const b = +card.dataset.before;
        const a = +card.dataset.after;
        const max = Math.max(a, b) * 1.15;
        // Only the fairness card has real units; the others are relative
        const raw = 'raw' in card.dataset;
        const X0 = 16, X1 = 184, TOP = 8, BASE = 56;
        const y = (v) => BASE - v / max * (BASE - TOP);
        const yb = y(b), ya = y(a);
        const label = card.querySelector('.label').textContent;
        const tip = (w, v) => raw ? `${w}: ${v.toFixed(1)}` : w;

        card.insertAdjacentHTML('beforeend', `
            <svg class="slope" viewBox="0 0 200 62" role="img" aria-label="${label}: before to after">
                <line x1="${X0}" x2="${X1}" y1="${BASE}" y2="${BASE}" stroke="var(--line)" stroke-width="1"/>
                <line x1="${X0}" x2="${X0}" y1="${TOP}" y2="${BASE}" stroke="var(--line)" stroke-dasharray="2 3"/>
                <line x1="${X1}" x2="${X1}" y1="${TOP}" y2="${BASE}" stroke="var(--line)" stroke-dasharray="2 3"/>
                <path d="M${X0} ${yb} L${X1} ${ya} L${X1} ${BASE} L${X0} ${BASE} Z" fill="var(--signal)" fill-opacity=".1"/>
                <path d="M${X0} ${yb} L${X1} ${ya}" stroke="var(--signal)" stroke-width="2" fill="none"/>
                <g><circle cx="${X0}" cy="${yb}" r="12" fill="transparent"/><circle cx="${X0}" cy="${yb}" r="4.5" fill="var(--dim)" stroke="var(--panel)" stroke-width="2"/><title>${tip('before', b)}</title></g>
                <g><circle cx="${X1}" cy="${ya}" r="12" fill="transparent"/><circle cx="${X1}" cy="${ya}" r="4.5" fill="var(--signal)" stroke="var(--panel)" stroke-width="2"/><title>${tip('after', a)}</title></g>
            </svg>`);
    });
}

// ============================================
// Career trace: waterfall built from the job list in the HTML
// ============================================
function initCareerTrace() {
    const grid = $('grid');
    const jobs = [...document.querySelectorAll('#jobs .job')];
    if (!grid || !jobs.length) return;

    const parse = (s) => {
        if (!s) return null;
        const [yy, mm] = s.split('-').map(Number);
        return new Date(yy, mm - 1, 1);
    };
    const NOW = new Date();
    const spans = jobs.map((el) => ({
        el,
        id: el.dataset.id,
        svc: el.dataset.svc,
        name: el.querySelector('.job-role').textContent,
        edu: el.dataset.kind === 'edu',
        from: parse(el.dataset.from),
        // An end month counts through its last day
        to: el.dataset.to ? new Date(parse(el.dataset.to).getFullYear(), parse(el.dataset.to).getMonth() + 1, 0) : null
    }));

    const START = new Date(Math.min(...spans.map((s) => s.from)));
    const END = new Date(NOW.getFullYear(), NOW.getMonth() + 2, 1);
    const pct = (d) => `${((d - START) / (END - START) * 100).toFixed(2)}%`;
    const months = (a, b) => Math.max(1, Math.round(((b || NOW) - a) / 2.628e9));

    const ticks = [];
    for (let yr = START.getFullYear() + 1; yr <= END.getFullYear(); yr++) {
        const t = new Date(yr, 0, 1);
        if (t < END) ticks.push(t);
    }
    const gridLines = ticks.map((t) => `<span class="gl" style="left:${pct(t)}"></span>`).join('')
        + `<span class="now" style="left:${pct(NOW)}"></span>`;

    let html = `<div class="row axis"><div class="name"><span class="label">span</span></div><div class="lane">${
        ticks.map((t) => `<span class="tick" style="left:${pct(t)}">${t.getFullYear()}</span>`).join('')
    }</div></div>`;
    spans.forEach((s) => {
        html += `<div class="row">
            <div class="name${s.edu ? '' : ' child'}"><span>${s.name}</span><span class="svc">${s.svc}</span></div>
            <div class="lane">${gridLines}<button type="button" class="span${s.edu ? ' edu' : ''}" data-id="${s.id}" aria-expanded="false" aria-controls="jobs"
                style="left:${pct(s.from)};width:calc(${pct(s.to || NOW)} - ${pct(s.from)})">${s.svc} · ${months(s.from, s.to)} mo</button></div>
        </div>`;
    });
    grid.innerHTML = html;

    const show = (id) => {
        spans.forEach((s) => { s.el.hidden = s.id !== id; });
        grid.querySelectorAll('.span').forEach((b) => b.setAttribute('aria-expanded', b.dataset.id === id));
    };
    grid.addEventListener('click', (e) => {
        const b = e.target.closest('.span');
        if (b) show(b.dataset.id);
    });
    show(spans[0].id);
}

function initProjectCount() {
    const count = document.querySelectorAll('.projects .proj').length;
    if ($('projCount')) $('projCount').textContent = `${count} shipped`;
}

// ============================================
// Ask bar: RAG chat against the FastAPI backend
// ============================================
function initAsk() {
    const form = $('askForm');
    if (!form) return;
    const input = $('q');
    const send = $('askSend');
    const thread = $('thread');

    let apiUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
    } else {
        // The CI/CD pipeline replaces https://portfolio-5m5s.onrender.com with the real Render URL
        apiUrl = 'https://portfolio-5m5s.onrender.com';
    }

    const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Server answers use "•" bullets and blank lines between blocks
    const formatAnswer = (text) => escapeHtml(text).split(/\n{2,}/).map((block) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const bullets = lines.filter((l) => /^[•-]\s?/.test(l));
        if (bullets.length && bullets.length === lines.length) {
            return `<ul>${bullets.map((l) => `<li>${l.replace(/^[•-]\s?/, '')}</li>`).join('')}</ul>`;
        }
        const head = lines.filter((l) => !/^[•-]\s?/.test(l));
        return `<p>${head.join('<br>')}</p>${bullets.length ? `<ul>${bullets.map((l) => `<li>${l.replace(/^[•-]\s?/, '')}</li>`).join('')}</ul>` : ''}`;
    }).join('');

    let firstRequest = true;

    const ask = async (message) => {
        const turn = document.createElement('div');
        turn.className = 'turn';
        turn.innerHTML = `<div class="q"></div><div class="a wait">retrieving…</div>`;
        turn.querySelector('.q').textContent = message;
        thread.prepend(turn);
        // Newest question sits on top; keep the window there and drop very old turns
        thread.scrollTop = 0;
        while (thread.children.length > 20) thread.lastElementChild.remove();
        const answer = turn.querySelector('.a');

        send.disabled = true;
        input.disabled = true;

        // The free Render instance sleeps; the first request can take ~30 s
        const wakeTimer = firstRequest
            ? setTimeout(() => { answer.textContent = 'waking up the server, this can take about 30 seconds…'; }, 3000)
            : null;
        firstRequest = false;

        const retryDelays = [15000, 20000];
        let result = null;
        let failure = 'I couldn\'t reach the server. Try again in a moment.';

        for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
            const started = performance.now();
            try {
                const response = await fetch(`${apiUrl}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                if (response.status === 429 || response.status === 422) {
                    const body = await response.json().catch(() => ({}));
                    failure = typeof body.detail === 'string'
                        ? body.detail
                        : 'Questions can be up to 500 characters.';
                    break;
                }
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                result = { data: await response.json(), ms: Math.round(performance.now() - started) };
                break;
            } catch (error) {
                console.error('Ask request failed:', error);
                if (attempt < retryDelays.length) {
                    await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
                }
            }
        }

        clearTimeout(wakeTimer);
        if (result) {
            answer.className = 'a';
            answer.innerHTML = formatAnswer(result.data.response);
            const n = (result.data.sources || []).length;
            turn.insertAdjacentHTML('beforeend',
                `<div class="meta"><span>sources <b>${n} resume passage${n === 1 ? '' : 's'}</b></span><span>round trip <b>${result.ms} ms</b></span></div>`);
        } else {
            answer.className = 'a err';
            answer.textContent = failure;
        }

        send.disabled = false;
        input.disabled = false;
        input.value = '';
        input.focus();
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (message && !send.disabled) ask(message);
    });

    $('suggest').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || send.disabled) return;
        input.value = b.textContent;
        ask(b.textContent);
    });
}

// ============================================
// Init
// ============================================
function initializeApp() {
    initInferenceHero();
    initResultGraphs();
    initCareerTrace();
    initProjectCount();
    initAsk();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
