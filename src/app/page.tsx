import Link from "next/link";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";

const collectedFields = [
  "Name",
  "Email",
  "People in family",
  "Programs attended",
];

const communityFields = [
  "Belongs to a synagogue",
  "Denomination",
  "Interfaith household",
  "Attends Jewish overnight camp",
  "Attended Jewish day school",
  "Kids in Jewish day school",
];

function FmCheck() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7.5 6 11 11.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <MarketingChrome>
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
            <div className="eyebrow">The community layer</div>
            <h2>A richer view of the people you already serve.</h2>
            <p>You collect a handful of fields on your members and events. Joined
            to the anonymized network, every record picks up a community-wide
            layer no single organization can see on its own.</p>
          </div>

          <div className="field-matrix">
            <div className="fm-head">
              <span className="fm-h-field">Field</span>
              <span className="fm-h-col">You collect</span>
              <span className="fm-h-col fm-h-community">With community data</span>
            </div>

            {collectedFields.map((field) => (
              <div className="fm-row" key={field}>
                <span className="fm-field">{field}</span>
                <span className="fm-cell"><span className="fm-check"><FmCheck /></span></span>
                <span className="fm-cell fm-cell-community"><span className="fm-badge"><FmCheck /></span></span>
              </div>
            ))}

            <div className="fm-group">+ Added by the anonymized network</div>

            {communityFields.map((field) => (
              <div className="fm-row" key={field}>
                <span className="fm-field">{field}</span>
                <span className="fm-cell"><span className="fm-empty" aria-hidden="true"></span></span>
                <span className="fm-cell fm-cell-community"><span className="fm-badge"><FmCheck /></span></span>
              </div>
            ))}
          </div>

          <p className="fm-foot">Every added field comes from anonymized records
          other organizations contributed — matched by pattern, never by name.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="band" id="how">
        <div className="container">
          <div className="band-header">
            <h2>How it works</h2>
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
    </MarketingChrome>
  );
}
