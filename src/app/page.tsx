import Link from "next/link";

const homepageCss = `

  :root {
    /* Match the existing app's globals */
    --paper-50:  #fbf8f2;
    --paper-100: #f4efe3;
    --paper-200: #e8e0cc;
    --paper-300: #d6cfbe;
    --stone-500: #6b6657;
    --stone-600: #4a4639;
    --ink-600:   #1d2a5e;
    --ink-700:   #14204a;
    --ink-800:   #0c163a;
    --ochre-100: #f5ecd8;
    --ochre-300: #d4a957;
    --ochre-400: #c79c40;
    --ochre-500: #b8892c;
    --ds-border: rgba(60, 50, 30, 0.10);
    --ds-border-strong: rgba(60, 50, 30, 0.18);
    --ds-bg-elevated: #ffffff;
    --ds-fg-muted: #8a8273;
    --shadow-sm: 0 1px 2px rgba(20, 14, 0, 0.04);
    --shadow-md: 0 4px 12px rgba(20, 14, 0, 0.06);
    --shadow-lg: 0 12px 36px rgba(20, 14, 0, 0.08);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--paper-50);
    color: var(--stone-600);
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .serif { font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.02em; }
  .mono  { font-family: 'JetBrains Mono', ui-monospace, monospace; }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
  a { color: inherit; }
  .eyebrow {
    font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--ochre-500); font-weight: 600;
  }
  .eyebrow.muted { color: var(--ds-fg-muted); }
  .eyebrow.dark  { color: var(--ochre-300); }

  /* ── NAV ─────────────────────────────────── */
  .nav {
    position: sticky; top: 0; z-index: 30;
    background: rgba(251, 248, 242, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--ds-border);
    padding: 18px 0;
  }
  .nav-inner { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .brand-name { font-size: 17px; color: var(--ink-800); }
  .nav-links { display: flex; gap: 28px; font-size: 13px; color: var(--stone-500); }
  .nav-links a { text-decoration: none; }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--ink-600); color: var(--paper-50);
    padding: 9px 16px; border-radius: 6px;
    font-size: 13px; font-weight: 500; text-decoration: none;
    transition: background 0.15s;
  }
  .btn-primary:hover { background: var(--ink-700); }
  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--ink-700); padding: 11px 18px; border-radius: 6px;
    font-size: 15px; font-weight: 500; text-decoration: none;
    transition: background 0.15s;
  }
  .btn-ghost:hover { background: var(--paper-100); }

  /* ── HERO ─────────────────────────────────── */
  .hero { position: relative; padding: 80px 0 72px; overflow: hidden; }
  .hero-glow {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 700px 400px at 20% 0%, rgba(184,137,44,0.06), transparent 60%);
  }
  .hero h1 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(44px, 6.4vw, 68px); line-height: 1.02;
    letter-spacing: -0.025em; color: var(--ink-800);
    margin: 18px 0 22px; max-width: 980px;
    text-wrap: pretty;
  }
  .hero h1 em { font-style: italic; color: var(--ochre-500); font-weight: 400; }
  .hero .lede {
    font-size: 19px; line-height: 1.5; color: var(--stone-500);
    max-width: 660px; margin: 0 0 30px;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .hero-actions .btn-primary { padding: 13px 20px; font-size: 15px; }

  /* ── HOW IT WORKS ─────────────────────────────────── */
  .how-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;
  }
  .how-step { }
  .how-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .how-num { font-size: 11px; color: var(--ochre-400); letter-spacing: 0.08em; }
  .how-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; background: var(--paper-100); border-radius: 8px;
    color: var(--ink-600);
  }
  .how-title {
    font-size: 19px; color: var(--ink-800); margin: 0 0 8px;
    line-height: 1.3;
  }
  .how-body {
    font-size: 14px; color: var(--stone-500); line-height: 1.55;
    margin: 0;
  }

  /* ── CTA ─────────────────────────────────── */
  .cta-band {
    padding: 96px 0; background: var(--paper-100);
    border-top: 1px solid var(--ds-border);
  }
  .cta-title {
    font-size: clamp(32px, 4.4vw, 44px); color: var(--ink-800);
    letter-spacing: -0.02em; line-height: 1.1; margin: 0 0 16px;
    text-wrap: balance;
  }
  .cta-desc {
    font-size: 16px; color: var(--stone-500); max-width: 560px;
    margin: 0 auto 28px; line-height: 1.55;
  }

  /* ── FOOTER ─────────────────────────────────── */
  .footer {
    background: var(--ink-800); color: var(--paper-300); padding: 40px 0;
  }
  .footer-inner {
    display: flex; align-items: center; justify-content: space-between;
    gap: 24px; flex-wrap: wrap;
  }

  @media (max-width: 1000px) {
    .how-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .band { padding: 96px 0; border-top: 1px solid var(--ds-border); }
  .band-header { margin-bottom: 56px; max-width: 760px; }
  .band-header h2 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(32px, 4.4vw, 44px); line-height: 1.08;
    letter-spacing: -0.02em; color: var(--ink-800);
    margin: 12px 0 14px;
    text-wrap: balance;
  }
  .band-header p {
    font-size: 17px; color: var(--stone-500); line-height: 1.5;
    margin: 0; max-width: 640px;
  }

  /* ── EXPAND BAND (small input → big output) ──────────── */
  .expand-band {
    background: var(--paper-100);
  }
  .expand-pair {
    display: grid;
    grid-template-columns: 1fr auto 1.4fr;
    gap: 24px;
    align-items: stretch;
    margin-top: 32px;
  }
  .expand-card {
    background: var(--ds-bg-elevated);
    border: 1px solid var(--ds-border);
    border-radius: 10px;
    padding: 28px 28px 26px;
    display: flex; flex-direction: column;
  }
  .input-card {
    background: #fcfaf3;
  }
  .output-card {
    background: var(--ink-800); color: var(--paper-100);
    border-color: var(--ink-800);
  }
  .expand-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--ochre-500);
    margin-bottom: 12px;
  }
  .output-card .expand-tag { color: var(--ochre-300); }
  .expand-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 22px; line-height: 1.25;
    color: var(--ink-800); font-weight: 500;
    margin: 0 0 18px;
    letter-spacing: -0.01em;
  }
  .output-card .expand-title { color: var(--paper-50); }
  .expand-note {
    margin-top: auto; padding-top: 18px;
    font-size: 12.5px; line-height: 1.55;
    color: var(--ds-fg-muted);
  }
  .output-card .expand-note { color: var(--paper-300); }

  /* INPUT card content */
  .input-table {
    border: 1px solid var(--ds-border-strong);
    border-radius: 8px; overflow: hidden;
    background: #fff;
  }
  .input-table .it-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 14px;
    background: rgba(29,42,94,0.04);
    border-bottom: 1px solid var(--ds-border);
    font-size: 11px; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--stone-500);
    font-weight: 600;
  }
  .input-table .it-head .mono {
    font-family: 'JetBrains Mono', monospace;
    text-transform: none; letter-spacing: 0;
    color: var(--ds-fg-muted); font-weight: 400;
  }
  .input-table .it-cols {
    display: flex; flex-direction: column;
  }
  .it-col {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px;
    font-size: 13px; color: var(--ink-800);
    border-bottom: 1px dashed var(--ds-border);
  }
  .it-col:last-child { border-bottom: none; }
  .it-col .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--ochre-400);
    flex-shrink: 0;
  }
  .input-table .it-foot {
    padding: 10px 14px;
    background: rgba(29,42,94,0.03);
    border-top: 1px solid var(--ds-border);
    font-size: 10.5px; color: var(--ds-fg-muted);
  }

  /* ARROW between input and output */
  .expand-arrow {
    align-self: center;
    display: flex; flex-direction: column;
    align-items: center; gap: 10px;
    color: var(--ochre-400);
    padding: 0 4px;
  }
  .expand-arrow svg { width: 40px; height: 24px; }
  .expand-arrow-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ds-fg-muted);
    text-align: center; line-height: 1.5;
  }

  /* OUTPUT card content */
  .output-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 8px;
    overflow: hidden;
  }
  .og-stat {
    background: var(--ink-800);
    padding: 18px 18px 16px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .og-stat.wide { grid-column: 1 / -1; }
  .og-num {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 36px; line-height: 1;
    color: var(--paper-50); font-weight: 500;
    letter-spacing: -0.02em;
    display: flex; align-items: baseline;
  }
  .og-num .og-unit {
    font-size: 18px; margin-left: 2px;
    color: var(--ochre-300);
  }
  .og-label {
    font-size: 12px; line-height: 1.4;
    color: var(--paper-300);
  }

  @media (max-width: 880px) {
    .expand-pair { grid-template-columns: 1fr; }
    .expand-arrow { transform: rotate(90deg); padding: 4px 0; }
    .expand-arrow-label { display: none; }
  }

  /* ── PRIVACY MODULE (Patterns, never people) ─────────── */
  .privacy-module-band { background: var(--paper-100); }
  .pm-stage-wrap {
    margin-top: 40px;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .pm-stage {
    min-width: 1100px;
  }
  .pm-stage svg { display: block; width: 100%; height: auto; }
  .pm-closer {
    margin-top: 16px;
  }
  .pm-closer p {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 28px; line-height: 1.2;
    letter-spacing: -0.018em;
    color: var(--paper-50);
    margin: 0;
    max-width: 720px;
  }
  .pm-closer p em { color: var(--ochre-300); font-style: italic; }
  .pm-closer {
    background: var(--ink-800);
    padding: 32px 40px;
    border-radius: 14px;
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .pm-closer-micro {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--ochre-300);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 12px;
  }

  /* ── PRIVACY PROOF STRIP (slim) ──────────────────────── */
  .proof-strip {
    background: var(--ink-800); color: var(--paper-100);
    padding: 32px 0;
  }
  .proof-inner {
    display: flex; align-items: center; gap: 32px; flex-wrap: wrap;
    justify-content: space-between;
  }
  .proof-inner .lead {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 18px;
    color: var(--paper-50); letter-spacing: -0.01em; max-width: 480px;
    line-height: 1.35;
  }
  .proof-points {
    display: flex; gap: 28px; flex-wrap: wrap;
  }
  .proof-points .pp {
    display: flex; flex-direction: column; gap: 3px; font-size: 12.5px;
  }
  .proof-points .pp .v { color: var(--paper-50); font-weight: 500; }
  .proof-points .pp .l { color: var(--paper-300); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; }

  @media (max-width: 880px) {
    .nav-links { display: none; }
  }

  /* SVG icon helpers */
  svg.i { display: inline-block; vertical-align: middle; }

`;

export default function Home() {
  return (
    <>
      {/* Fraunces is used by the homepage CSS but not in the app's global next/font setup. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap"
      />
      <style dangerouslySetInnerHTML={{ __html: homepageCss }} />

      {/* NAV */}
      <header className="nav">
        <div className="container nav-inner">
          <Link className="brand" href="/">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#1d2a5e" />
              <path d="M7 9.5L14 6L21 9.5V18.5L14 22L7 18.5V9.5Z" stroke="#b8892c" strokeWidth="1.4" />
              <circle cx="14" cy="14" r="2.2" fill="#b8892c" />
            </svg>
            <span className="serif brand-name">Jewish Engagement Insights</span>
          </Link>
          <nav className="nav-links">
            <a href="#expand">What you see</a>
            <a href="#how">How it works</a>
            <a href="#privacy">Privacy</a>
            <Link href="/login">Log in</Link>
          </nav>
          <Link className="btn-primary" href="/signup">
            Get started
            <svg className="i" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8m0 0L7 3m4 4L7 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="container" style={{ position: "relative" }}>
          <div className="eyebrow">For Jewish organizations and communal leaders</div>
          <h1>
            See the full picture of <em>community engagement</em>.
          </h1>
          <p className="lede">
            Upload event attendance and membership data. Get back anonymized
            analytics that show who you serve, how your programs perform, and
            how you compare to peer organizations across the community — all
            with privacy built in.
          </p>
          <div className="hero-actions">
            <Link className="btn-primary" href="/signup">
              Start uploading data
              <svg className="i" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8m0 0L7 3m4 4L7 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a className="btn-ghost" href="#expand">See what you get</a>
          </div>
        </div>
      </section>

      {/* INPUT → EXPANDED OUTPUT */}
      <section className="band expand-band" id="expand">
        <div className="container">
          <div className="band-header" style={{ maxWidth: "820px" }}>
            <div className="eyebrow">Small input, big output</div>
            <h2>You bring the sign-up sheet. We bring the picture behind it.</h2>
            <p>A typical event collects a handful of fields per person. Once that
            data joins the anonymized network, those few columns expand into a
            far richer profile of who actually walked in the door.</p>
          </div>

          <div className="expand-pair">

            {/* INPUT */}
            <article className="expand-card input-card">
              <div className="expand-tag">What you upload</div>
              <h3 className="expand-title">A short list of fields per attendee.</h3>

              <div className="input-table">
                <div className="it-head">
                  <span>Hanukkah Family Night</span>
                  <span className="mono">80 rows</span>
                </div>
                <div className="it-cols">
                  <div className="it-col"><span className="dot"></span>Name</div>
                  <div className="it-col"><span className="dot"></span>Email</div>
                  <div className="it-col"><span className="dot"></span>Phone</div>
                  <div className="it-col"><span className="dot"></span>Adults / kids</div>
                  <div className="it-col"><span className="dot"></span>Zip</div>
                </div>
                <div className="it-foot mono">5 fields · whatever you collect at the door</div>
              </div>

              <p className="expand-note">That&apos;s it. No reformatting, no extra surveys, no
              new questions to ask your members.</p>
            </article>

            {/* ARROW */}
            <div className="expand-arrow" aria-hidden="true">
              <svg viewBox="0 0 40 24" fill="none">
                <path d="M2 12 H32 M32 12 L24 4 M32 12 L24 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="expand-arrow-label">Joined to the<br />anonymized network</span>
            </div>

            {/* OUTPUT */}
            <article className="expand-card output-card">
              <div className="expand-tag">What you get back</div>
              <h3 className="expand-title">A composite picture of who attended.</h3>

              <div className="output-grid">
                <div className="og-stat">
                  <div className="og-num">38<span className="og-unit">%</span></div>
                  <div className="og-label">households with kids 0–5</div>
                </div>
                <div className="og-stat">
                  <div className="og-num">22<span className="og-unit">%</span></div>
                  <div className="og-label">first time at your org</div>
                </div>
                <div className="og-stat">
                  <div className="og-num">14<span className="og-unit">%</span></div>
                  <div className="og-label">interfaith households</div>
                </div>
                <div className="og-stat">
                  <div className="og-num">3.4<span className="og-unit">×</span></div>
                  <div className="og-label">avg. orgs each attendee touches</div>
                </div>
                <div className="og-stat wide">
                  <div className="og-num">+18<span className="og-unit">pp</span></div>
                  <div className="og-label">young-family share vs. similar holiday programs</div>
                </div>
              </div>

              <p className="expand-note">Built from anonymized records that other orgs
              have contributed — your roster is enriched without anyone seeing names.</p>
            </article>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="band" id="how">
        <div className="container">
          <div className="band-header">
            <div className="eyebrow">How it works</div>
            <h2>A richer view of the people you already serve.</h2>
          </div>

          <div className="how-grid">
            <div className="how-step">
              <div className="how-head">
                <span className="mono how-num">01</span>
                <span className="how-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 11V3m0 0L4.5 6.5M8 3l3.5 3.5M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <h3 className="serif how-title">Upload your data</h3>
              <p className="how-body">Drop in a spreadsheet of event attendees or members. Columns are mapped automatically — whatever you already collect.</p>
            </div>
            <div className="how-step">
              <div className="how-head">
                <span className="mono how-num">02</span>
                <span className="how-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5L3 3.5v3.5c0 3 2 5.5 5 7 3-1.5 5-4 5-7V3.5L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <h3 className="serif how-title">PII is scrubbed out</h3>
              <p className="how-body">Names, emails, phone numbers, and addresses are removed and sealed in an isolated identity vault. They never touch analytics.</p>
            </div>
            <div className="how-step">
              <div className="how-head">
                <span className="mono how-num">03</span>
                <span className="how-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8c2-3 4-3 6 0s4 3 6 0M2 4c2-3 4-3 6 0s4 3 6 0M2 12c2-3 4-3 6 0s4 3 6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
              <h3 className="serif how-title">Data from other orgs is combined with yours</h3>
              <p className="how-body">Anonymized records from every participating organization come together — deduplicated by anonymous ID, stitched across time and place.</p>
            </div>
            <div className="how-step">
              <div className="how-head">
                <span className="mono how-num">04</span>
                <span className="how-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 13V8M6 13V4M10 13v-3M14 13V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
              <h3 className="serif how-title">You get a composite view</h3>
              <p className="how-body">A richer picture of who actually showed up: life stage, household, prior engagement, cross-org reach — without ever seeing a single name.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY: Patterns, never people */}
      <section className="band privacy-module-band" id="privacy-module">
        <div className="container">
          <div className="band-header" style={{ maxWidth: "880px" }}>
            <div className="eyebrow">How privacy works</div>
            <h2>Patterns, never people.</h2>
            <p>Personal details stay locked in the Identity Vault. An anonymous ID is generated
            for each person — so insights can be shared across organizations without ever sharing identities.</p>
          </div>

          <div className="pm-stage-wrap">
            <div className="pm-stage">
              <svg viewBox="0 0 1640 580" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Privacy diagram: spreadsheet to identity vault to anonymous ID to dashboard">
                <defs>
                  <pattern id="pmRule" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="20" x2="20" y2="20" stroke="#d6cfbe" strokeWidth="0.6" />
                  </pattern>
                  <linearGradient id="pmVaultGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1d2a5e" />
                    <stop offset="100%" stopColor="#141c44" />
                  </linearGradient>
                  <radialGradient id="pmLockGlow" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#b8892c" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#b8892c" stopOpacity="0" />
                  </radialGradient>
                  <marker id="pmArrowGold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
                    <path d="M0 0 L10 5 L0 10 z" fill="#b8892c" />
                  </marker>
                  <marker id="pmArrowInk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
                    <path d="M0 0 L10 5 L0 10 z" fill="#1d2a5e" />
                  </marker>
                  <filter id="pmShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="2" />
                    <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="pmIdGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* 01 SPREADSHEET */}
                <text x="20" y="40" fontFamily="Source Serif 4, serif" fontSize="26" fontWeight="500" fill="#1d2a5e" letterSpacing="-0.018em">Your spreadsheet</text>
                <text x="20" y="62" fontFamily="Source Serif 4, serif" fontSize="13" fontStyle="italic" fill="#5a5343">What you upload</text>

                <g transform="translate(20, 90)" filter="url(#pmShadow)">
                  <rect width="320" height="380" rx="6" fill="#fbf8f2" stroke="#b6ad95" strokeWidth="1" />
                  <rect width="320" height="32" rx="6" fill="#1d2a5e" />
                  <rect y="26" width="320" height="6" fill="#1d2a5e" />
                  <circle cx="14" cy="16" r="3" fill="#b8892c" />
                  <text x="28" y="20" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#fbf8f2" letterSpacing="0.06em">members.csv</text>

                  <rect y="32" width="320" height="28" fill="#e8e0cc" />
                  <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5a5343" letterSpacing="0.08em">
                    <text x="14" y="50">FIRST</text>
                    <text x="74" y="50">LAST</text>
                    <text x="146" y="50">EMAIL</text>
                    <text x="232" y="50">DOB</text>
                    <text x="278" y="50">ZIP</text>
                  </g>
                  <line x1="70" y1="32" x2="70" y2="60" stroke="#b6ad95" />
                  <line x1="142" y1="32" x2="142" y2="60" stroke="#b6ad95" />
                  <line x1="228" y1="32" x2="228" y2="60" stroke="#b6ad95" />
                  <line x1="274" y1="32" x2="274" y2="60" stroke="#b6ad95" />

                  <rect y="60" width="320" height="320" fill="url(#pmRule)" opacity="0.5" />
                  <g fontFamily="Inter Tight, sans-serif" fontSize="13" fill="#3d3528">
                    <text x="14" y="80">Rachel</text><text x="74" y="80">Horowitz</text><text x="146" y="80">rachel.h@…</text><text x="232" y="80">1992</text><text x="278" y="80">80206</text>
                    <text x="14" y="104">Daniel</text><text x="74" y="104">Becker</text><text x="146" y="104">d.becker@…</text><text x="232" y="104">1985</text><text x="278" y="104">80220</text>
                    <text x="14" y="128">Sarah</text><text x="74" y="128">Weinstein</text><text x="146" y="128">sweinstein…</text><text x="232" y="128">1997</text><text x="278" y="128">80207</text>
                    <text x="14" y="152">Aaron</text><text x="74" y="152">Goldfarb</text><text x="146" y="152">a.goldfarb@…</text><text x="232" y="152">1974</text><text x="278" y="152">80206</text>
                    <text x="14" y="176">Miriam</text><text x="74" y="176">Stern</text><text x="146" y="176">miriam.s@…</text><text x="232" y="176">1999</text><text x="278" y="176">80218</text>
                    <text x="14" y="200">Jacob</text><text x="74" y="200">Rosenblum</text><text x="146" y="200">j.rblum@…</text><text x="232" y="200">1981</text><text x="278" y="200">80209</text>
                    <text x="14" y="224">Lisa</text><text x="74" y="224">Kaplan</text><text x="146" y="224">lkaplan@…</text><text x="232" y="224">1968</text><text x="278" y="224">80230</text>
                    <text x="14" y="248">David</text><text x="74" y="248">Cohen</text><text x="146" y="248">d.cohen@…</text><text x="232" y="248">1990</text><text x="278" y="248">80206</text>
                    <text x="14" y="272">Eli</text><text x="74" y="272">Mendelsohn</text><text x="146" y="272">eli.m@…</text><text x="232" y="272">1955</text><text x="278" y="272">80238</text>
                    <text x="14" y="296">Dahlia</text><text x="74" y="296">Friedman</text><text x="146" y="296">dahlia.f@…</text><text x="232" y="296">1979</text><text x="278" y="296">80220</text>
                    <text x="14" y="320">Nathan</text><text x="74" y="320">Schwartz</text><text x="146" y="320">nschwartz@…</text><text x="232" y="320">1988</text><text x="278" y="320">80218</text>
                  </g>
                  <text x="160" y="354" textAnchor="middle" fontFamily="Source Serif 4, serif" fontSize="13" fontStyle="italic" fill="#8a8273">… 2,407 more rows</text>
                </g>

                <line x1="350" y1="280" x2="430" y2="280" stroke="#1d2a5e" strokeWidth="2" markerEnd="url(#pmArrowInk)" />

                {/* 02 IDENTITY VAULT */}
                <g transform="translate(440, 18)">
                  <rect x="0" y="10" width="22" height="16" rx="2.5" fill="none" stroke="#b8892c" strokeWidth="2" />
                  <path d="M4 10 v-4 a7 7 0 0 1 14 0 v4" fill="none" stroke="#b8892c" strokeWidth="2" />
                  <circle cx="11" cy="17" r="1.8" fill="#b8892c" />
                </g>
                <text x="472" y="40" fontFamily="Source Serif 4, serif" fontSize="26" fontWeight="500" fill="#1d2a5e" letterSpacing="-0.018em">The Identity Vault</text>
                <text x="472" y="62" fontFamily="Source Serif 4, serif" fontSize="13" fontStyle="italic" fill="#5a5343">Where personal details stay sealed</text>

                <ellipse cx="650" cy="306" rx="280" ry="220" fill="url(#pmLockGlow)" opacity="0.5" />

                <g transform="translate(440, 90)" filter="url(#pmShadow)">
                  <rect width="420" height="380" rx="14" fill="url(#pmVaultGrad)" stroke="#0f1739" strokeWidth="1" />
                  <g fill="#3a4470">
                    <circle cx="16" cy="16" r="3" /><circle cx="404" cy="16" r="3" />
                    <circle cx="16" cy="364" r="3" /><circle cx="404" cy="364" r="3" />
                  </g>
                  <rect width="420" height="96" rx="14" fill="#0f1739" />
                  <rect y="90" width="420" height="6" fill="#0f1739" />
                  <g transform="translate(174, 18)">
                    <circle cx="36" cy="36" r="34" fill="#b8892c" opacity="0.12" />
                    <rect x="14" y="32" width="44" height="32" rx="4" fill="#b8892c" stroke="#b8892c" strokeWidth="2" />
                    <path d="M22 32 v-10 a14 14 0 0 1 28 0 v10" fill="none" stroke="#b8892c" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="36" cy="45" r="3.5" fill="#0f1739" />
                    <rect x="34.5" y="45" width="3" height="10" fill="#0f1739" />
                  </g>
                  <text x="210" y="126" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#8a93b8" letterSpacing="0.16em">SEALED INSIDE — NEVER LEAVES</text>

                  <g fontFamily="Inter Tight, sans-serif" fontSize="16" fill="#fbf8f2">
                    <g transform="translate(60, 158)">
                      <g><rect x="0" y="2" width="14" height="11" rx="1.5" fill="none" stroke="#b8892c" strokeWidth="1.5" /><path d="M2.5 2 v-2 a4.5 4.5 0 0 1 9 0 v2" fill="none" stroke="#b8892c" strokeWidth="1.5" /></g>
                      <text x="32" y="14">Names</text>
                    </g>
                    <g transform="translate(60, 196)">
                      <g><rect x="0" y="2" width="14" height="11" rx="1.5" fill="none" stroke="#b8892c" strokeWidth="1.5" /><path d="M2.5 2 v-2 a4.5 4.5 0 0 1 9 0 v2" fill="none" stroke="#b8892c" strokeWidth="1.5" /></g>
                      <text x="32" y="14">Email addresses</text>
                    </g>
                    <g transform="translate(60, 234)">
                      <g><rect x="0" y="2" width="14" height="11" rx="1.5" fill="none" stroke="#b8892c" strokeWidth="1.5" /><path d="M2.5 2 v-2 a4.5 4.5 0 0 1 9 0 v2" fill="none" stroke="#b8892c" strokeWidth="1.5" /></g>
                      <text x="32" y="14">Phone numbers</text>
                    </g>
                    <g transform="translate(60, 272)">
                      <g><rect x="0" y="2" width="14" height="11" rx="1.5" fill="none" stroke="#b8892c" strokeWidth="1.5" /><path d="M2.5 2 v-2 a4.5 4.5 0 0 1 9 0 v2" fill="none" stroke="#b8892c" strokeWidth="1.5" /></g>
                      <text x="32" y="14">Home addresses</text>
                    </g>
                    <g transform="translate(60, 310)">
                      <g><rect x="0" y="2" width="14" height="11" rx="1.5" fill="none" stroke="#b8892c" strokeWidth="1.5" /><path d="M2.5 2 v-2 a4.5 4.5 0 0 1 9 0 v2" fill="none" stroke="#b8892c" strokeWidth="1.5" /></g>
                      <text x="32" y="14">Birthdates</text>
                    </g>
                  </g>
                </g>

                <g transform="translate(860, 280)">
                  <circle r="14" fill="#0f1739" stroke="#b8892c" strokeWidth="1.5" />
                  <circle r="6" fill="#b8892c" />
                </g>
                <line x1="876" y1="280" x2="934" y2="280" stroke="#b8892c" strokeWidth="2.5" markerEnd="url(#pmArrowGold)" />

                {/* 03 ANONYMOUS ID */}
                <text x="950" y="40" fontFamily="Source Serif 4, serif" fontSize="26" fontWeight="500" fill="#1d2a5e" letterSpacing="-0.018em">Anonymous ID</text>
                <text x="950" y="62" fontFamily="Source Serif 4, serif" fontSize="13" fontStyle="italic" fill="#5a5343">One short code per person</text>

                <g transform="translate(950, 90)" filter="url(#pmShadow)">
                  <g filter="url(#pmIdGlow)">
                    <rect width="290" height="380" rx="12" fill="rgba(184,137,44,0.18)" />
                  </g>
                  <rect width="290" height="380" rx="12" fill="#fbf8f2" stroke="#b8892c" strokeWidth="1.5" />
                  <g transform="translate(124, 70)" fill="none" stroke="#b8892c" strokeWidth="2">
                    <circle cx="16" cy="16" r="10" />
                    <line x1="26" y1="16" x2="46" y2="16" />
                    <line x1="42" y1="16" x2="42" y2="22" />
                    <line x1="36" y1="16" x2="36" y2="20" />
                  </g>
                  <text x="145" y="170" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="28" fill="#1d2a5e" letterSpacing="0.02em">jei_a8f2c1d6</text>
                  <text x="145" y="208" textAnchor="middle" fontFamily="Source Serif 4, serif" fontSize="16" fill="#5a5343" fontStyle="italic">one per person</text>
                  <line x1="40" y1="240" x2="250" y2="240" stroke="#e8e0cc" />
                  <g fontFamily="Inter Tight, sans-serif" fontSize="13" fill="#3d3528">
                    <text x="145" y="270" textAnchor="middle">A short, scrambled code —</text>
                    <text x="145" y="290" textAnchor="middle">the same one every time</text>
                    <text x="145" y="310" textAnchor="middle">that person appears.</text>
                  </g>
                  <text x="145" y="352" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#b8892c" letterSpacing="0.14em">CANNOT BE REVERSED</text>
                </g>

                <g stroke="#b8892c" strokeWidth="1.5" fill="none" opacity="0.5">
                  <path d="M1240 226 Q 1290 226 1320 156" />
                  <path d="M1240 266 Q 1290 266 1320 246" />
                  <path d="M1240 306 Q 1290 306 1320 346" />
                  <path d="M1240 346 Q 1290 346 1320 436" />
                </g>
                <line x1="1240" y1="280" x2="1320" y2="280" stroke="#b8892c" strokeWidth="2.5" markerEnd="url(#pmArrowGold)" />

                {/* 04 DASHBOARD */}
                <text x="1330" y="40" fontFamily="Source Serif 4, serif" fontSize="26" fontWeight="500" fill="#1d2a5e" letterSpacing="-0.018em">Your dashboard</text>
                <text x="1330" y="62" fontFamily="Source Serif 4, serif" fontSize="13" fontStyle="italic" fill="#5a5343">Patterns, powered by IDs</text>

                <g transform="translate(1330, 90)" filter="url(#pmShadow)">
                  <rect width="290" height="380" rx="8" fill="#fbf8f2" stroke="#b6ad95" />
                  <rect width="290" height="32" rx="8" fill="#1d2a5e" />
                  <rect y="26" width="290" height="6" fill="#1d2a5e" />
                  <text x="14" y="20" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#fbf8f2" letterSpacing="0.08em">Q1 INSIGHTS</text>

                  <g transform="translate(20, 56)">
                    <text x="0" y="0" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8a8273" letterSpacing="0.1em">ATTENDANCE BY AGE</text>
                    <line x1="0" y1="100" x2="250" y2="100" stroke="#e8e0cc" />
                    <g fill="#1d2a5e">
                      <rect x="6" y="62" width="28" height="38" />
                      <rect x="46" y="44" width="28" height="56" />
                      <rect x="86" y="22" width="28" height="78" />
                      <rect x="126" y="52" width="28" height="48" />
                      <rect x="166" y="64" width="28" height="36" />
                      <rect x="206" y="80" width="28" height="20" />
                    </g>
                    <g fill="#b8892c">
                      <rect x="34" y="78" width="6" height="22" />
                      <rect x="74" y="58" width="6" height="42" />
                      <rect x="114" y="34" width="6" height="66" />
                    </g>
                    <g fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#8a8273">
                      <text x="6" y="114">0–12</text><text x="46" y="114">13–24</text><text x="86" y="114">25–39</text><text x="126" y="114">40–54</text><text x="166" y="114">55–69</text><text x="206" y="114">70+</text>
                    </g>
                  </g>

                  <line x1="20" y1="200" x2="270" y2="200" stroke="#e8e0cc" />

                  <g transform="translate(20, 220)">
                    <text x="0" y="0" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8a8273" letterSpacing="0.1em">ENGAGEMENT FUNNEL</text>
                    <g fontFamily="Inter Tight, sans-serif" fontSize="11" fill="#3d3528">
                      <text x="0" y="20">Ever attended</text>
                      <rect x="120" y="11" width="130" height="8" rx="2" fill="#e8e0cc" />
                      <rect x="120" y="11" width="102" height="8" rx="2" fill="#1d2a5e" />
                      <text x="0" y="42">≥ 3 events</text>
                      <rect x="120" y="33" width="130" height="8" rx="2" fill="#e8e0cc" />
                      <rect x="120" y="33" width="62" height="8" rx="2" fill="#1d2a5e" />
                      <text x="0" y="64">Monthly regular</text>
                      <rect x="120" y="55" width="130" height="8" rx="2" fill="#e8e0cc" />
                      <rect x="120" y="55" width="36" height="8" rx="2" fill="#b8892c" />
                      <text x="0" y="86">Volunteers</text>
                      <rect x="120" y="77" width="130" height="8" rx="2" fill="#e8e0cc" />
                      <rect x="120" y="77" width="20" height="8" rx="2" fill="#b8892c" />
                    </g>
                  </g>

                  <line x1="20" y1="332" x2="270" y2="332" stroke="#e8e0cc" />
                  <text x="145" y="358" textAnchor="middle" fontFamily="Source Serif 4, serif" fontSize="13" fontStyle="italic" fill="#5a5343">Patterns, never people.</text>
                </g>
              </svg>
            </div>
          </div>

          <div className="pm-closer">
            <p>You see <em>real patterns</em> — without ever seeing real people.</p>
            <span className="pm-closer-micro">Privacy by design</span>
          </div>
        </div>
      </section>

      {/* SLIM PRIVACY PROOF STRIP */}
      <section className="proof-strip" id="privacy">
        <div className="container proof-inner">
          <div className="lead">Privacy isn&apos;t a feature on a list. It&apos;s the architecture of the diagram above.</div>
          <div className="proof-points">
            <div className="pp"><span className="v">Isolated vault</span><span className="l">PII never leaves</span></div>
            <div className="pp"><span className="v">Anonymous IDs only</span><span className="l">Cross orgs and time</span></div>
            <div className="pp"><span className="v">Delete anytime</span><span className="l">One request, both DBs</span></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="serif cta-title">Ready to see your community more clearly?</h2>
          <p className="cta-desc">Start uploading your event data today. The more organizations
          that participate, the more useful the insights become for everyone.</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn-primary" href="/signup" style={{ padding: "13px 20px", fontSize: "15px" }}>
              Create your account
              <svg className="i" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8m0 0L7 3m4 4L7 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="brand">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#1d2a5e" />
              <path d="M7 9.5L14 6L21 9.5V18.5L14 22L7 18.5V9.5Z" stroke="#b8892c" strokeWidth="1.4" />
              <circle cx="14" cy="14" r="2.2" fill="#b8892c" />
            </svg>
            <span className="serif" style={{ color: "var(--paper-50)", fontSize: "16px" }}>Jewish Engagement Insights</span>
          </div>
          <div style={{ fontSize: "13px", color: "var(--paper-300)" }}>Building a clearer understanding of Jewish community engagement.</div>
        </div>
      </footer>
    </>
  );
}
