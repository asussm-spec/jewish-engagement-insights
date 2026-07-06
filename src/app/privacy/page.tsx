import type { Metadata } from "next";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";

export const metadata: Metadata = {
  title: "Privacy — Jewish Engagement Insights",
  description:
    "How Jewish Engagement Insights protects identities: personal details stay sealed in the Identity Vault, and only anonymous IDs power cross-organization insights.",
};

export default function PrivacyPage() {
  return (
    <MarketingChrome>
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
      <section className="proof-strip">
        <div className="container proof-inner">
          <div className="lead">Privacy isn&apos;t a feature on a list. It&apos;s the architecture of the diagram above.</div>
          <div className="proof-points">
            <div className="pp"><span className="v">Isolated vault</span><span className="l">PII never leaves</span></div>
            <div className="pp"><span className="v">Anonymous IDs only</span><span className="l">Cross orgs and time</span></div>
            <div className="pp"><span className="v">Delete anytime</span><span className="l">One request, both DBs</span></div>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
