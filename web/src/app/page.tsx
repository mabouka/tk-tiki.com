import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <section className="hero">
        <p className="eyebrow">TK Kitesurfing</p>
        <h1 className="hero-title">Ride harder. Trace smarter.</h1>
        <p className="muted" style={{ maxWidth: 520 }}>
          Un univers kitesurf premium entre performance, design outdoor et sécurité NFC. Chaque planche TK est
          authentifiée, traçable et connectée à son rider.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <Link href="/register" className="btn">
            Rejoindre TK
          </Link>
          <Link href="/about-us" className="btn outline" style={{ color: '#f5fbfc', borderColor: '#f5fbfc' }}>
            Découvrir la marque
          </Link>
        </div>
        <div className="hero-metrics">
          <div className="metric">
            <strong>100%</strong>
            traçabilité NFC
          </div>
          <div className="metric">
            <strong>0 fuite</strong>
            de données personnelles en public
          </div>
          <div className="metric">
            <strong>24/7</strong>
            contact propriétaire via scan
          </div>
        </div>
      </section>

      <section className="grid" style={{ gap: 12 }}>
        <h2 className="section-title">Une expérience rider orientée premium</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Shape & performance</h3>
            <p className="muted">Collections TK01, TK02, TK03 avec variantes de tailles pour chaque style de ride.</p>
          </article>
          <article className="feature-card">
            <h3>Sécurité propriétaire</h3>
            <p className="muted">Claim protégé, historique des transferts, déclaration perdue/volée en un clic.</p>
          </article>
          <article className="feature-card">
            <h3>Scan instantané</h3>
            <p className="muted">La board trouvée sur plage peut être signalée immédiatement sans exposer vos contacts.</p>
          </article>
        </div>
      </section>

      <section className="banner">
        <h2 className="h2" style={{ color: 'white' }}>La board est votre signature sur l’eau</h2>
        <p style={{ margin: '8px 0 0', opacity: 0.92 }}>
          Explorez l’univers TK, configurez vos boards, et gardez le contrôle de votre matériel partout.
        </p>
      </section>
    </div>
  );
}
