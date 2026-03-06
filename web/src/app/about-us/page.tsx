import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div className="grid" style={{ gap: 18 }}>
      <section className="hero">
        <p className="eyebrow">About TK</p>
        <h1 className="hero-title">Engineered for wind, built for style.</h1>
        <p className="muted" style={{ maxWidth: 560 }}>
          TK Kitesurfing conçoit des planches performantes avec une esthétique sobre et affirmée. Nous associons
          design produit, matériaux robustes et identité digitale via NFC.
        </p>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h3>Vision</h3>
          <p className="muted">Créer des boards haut de gamme qui inspirent confiance dans toutes les conditions.</p>
        </article>
        <article className="feature-card">
          <h3>Craft</h3>
          <p className="muted">Chaque modèle est pensé pour équilibrer pop, contrôle, accroche et confort de ride.</p>
        </article>
        <article className="feature-card">
          <h3>Digital safety</h3>
          <p className="muted">Le tag NFC relie chaque board à une fiche publique sécurisée, sans exposition de données privées.</p>
        </article>
      </section>

      <section className="card">
        <h2 className="section-title">Notre philosophie</h2>
        <p className="muted" style={{ marginBottom: 8 }}>
          Une board premium doit être belle, précise et durable. Notre approche combine design outdoor contemporain,
          recherche de performance et protection du rider.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Avec TK, vous ridez plus fort, vous perdez moins, et vous gardez la maîtrise de votre matériel.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link href="/contact" className="btn">
            Contacter l’équipe TK
          </Link>
        </div>
      </section>
    </div>
  );
}
