import Link from "next/link";
import type { ReactNode } from "react";

export const marketingCss = `

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
  .footer-meta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .footer-link {
    font-size: 13px; color: var(--paper-50); text-decoration: none;
    font-weight: 500;
  }
  .footer-link:hover { color: var(--ochre-300); }

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

  /* ── EXPAND BAND (what you collect + community view) ─── */
  .expand-band {
    background: var(--paper-100);
  }

  .field-matrix {
    position: relative;
    margin: 36px 0 0;
    max-width: 720px;
    background: var(--ds-bg-elevated);
    border: 1px solid var(--ds-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(29,42,94,0.05);
  }
  /* continuous spotlight stripe behind the community column */
  .field-matrix::after {
    content: "";
    position: absolute; top: 0; bottom: 0; right: 0;
    width: 176px;
    background: rgba(197,138,42,0.06);
    pointer-events: none;
  }
  .fm-head, .fm-row, .fm-group { position: relative; z-index: 1; }
  .fm-head {
    display: grid;
    grid-template-columns: 1fr 140px 176px;
    align-items: center;
    padding: 15px 22px;
    background: #fcfaf3;
    border-bottom: 1px solid var(--ds-border);
  }
  .fm-h-field {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--ds-fg-muted);
  }
  .fm-h-col {
    text-align: center;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.02em; line-height: 1.25;
    color: var(--stone-500);
  }
  .fm-h-community { color: var(--ink-800); }

  .fm-row {
    display: grid;
    grid-template-columns: 1fr 140px 176px;
    align-items: center;
    padding: 12px 22px;
    border-bottom: 1px dashed var(--ds-border);
  }
  .fm-row:last-child { border-bottom: none; }
  .fm-field {
    font-size: 13.5px; color: var(--ink-800);
  }
  .fm-cell { display: flex; justify-content: center; }

  .fm-check {
    display: inline-flex; align-items: center; justify-content: center;
    color: var(--ochre-500);
  }
  .fm-check svg { width: 15px; height: 15px; }
  .fm-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 21px; height: 21px; border-radius: 50%;
    background: var(--ochre-500); color: #fff;
  }
  .fm-badge svg { width: 12px; height: 12px; }
  .fm-empty {
    display: inline-block;
    width: 14px; height: 2px; border-radius: 1px;
    background: var(--ds-border-strong);
  }

  .fm-group {
    padding: 11px 22px;
    background: rgba(29,42,94,0.03);
    border-top: 1px solid var(--ds-border);
    border-bottom: 1px dashed var(--ds-border);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.09em;
    text-transform: uppercase; color: var(--ds-fg-muted);
  }

  .fm-foot {
    max-width: 720px; margin: 16px 0 0;
    font-size: 12.5px; line-height: 1.55; color: var(--ds-fg-muted);
  }

  @media (max-width: 560px) {
    .fm-head, .fm-row { grid-template-columns: 1fr 60px 96px; padding-left: 16px; padding-right: 16px; }
    .fm-group { padding-left: 16px; padding-right: 16px; }
    .field-matrix::after { width: 96px; }
    .fm-field { font-size: 12.5px; }
    .fm-h-col { font-size: 10px; }
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

const arrowPath = "M3 7h8m0 0L7 3m4 4L7 11";

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#1d2a5e" />
      <path d="M7 9.5L14 6L21 9.5V18.5L14 22L7 18.5V9.5Z" stroke="#b8892c" strokeWidth="1.4" />
      <circle cx="14" cy="14" r="2.2" fill="#b8892c" />
    </svg>
  );
}

/**
 * Shared chrome (fonts, design-system CSS, sticky nav, footer) for the public
 * marketing pages. Nav links use root-relative paths so they resolve from any
 * marketing route (e.g. the section anchors jump back to the homepage).
 */
export function MarketingChrome({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Fraunces is used by the marketing CSS but not in the app's global next/font setup. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap"
      />
      <style dangerouslySetInnerHTML={{ __html: marketingCss }} />

      {/* NAV */}
      <header className="nav">
        <div className="container nav-inner">
          <Link className="brand" href="/">
            <BrandMark />
            <span className="serif brand-name">Jewish Engagement Insights</span>
          </Link>
          <nav className="nav-links">
            <Link href="/#expand">What you see</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/login">Log in</Link>
          </nav>
          <Link className="btn-primary" href="/signup">
            Get started
            <svg className="i" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d={arrowPath} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </header>

      {children}

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
          <div className="footer-meta">
            <Link href="/privacy" className="footer-link">Privacy</Link>
            <span style={{ fontSize: "13px", color: "var(--paper-300)" }}>Building a clearer understanding of Jewish community engagement.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
