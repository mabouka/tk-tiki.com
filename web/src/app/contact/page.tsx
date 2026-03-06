'use client';

import { FormEvent, useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    e.currentTarget.reset();
  }

  return (
    <div className="two-cols">
      <section className="card">
        <p className="eyebrow" style={{ color: '#5a666a' }}>Contact</p>
        <h1 className="section-title">Parlons de votre prochain ride</h1>
        <p className="muted">
          Pour une question produit, partenariat, distribution ou support rider, écrivez-nous via ce formulaire.
        </p>

        <form className="grid" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div>
            <label className="label">Nom</label>
            <input className="input" name="name" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" name="email" required />
          </div>
          <div>
            <label className="label">Sujet</label>
            <input className="input" name="subject" required />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="textarea" name="message" rows={6} required />
          </div>
          <button className="btn">Envoyer</button>
          {sent && <p className="notice">Message reçu. L’équipe TK vous répond rapidement.</p>}
        </form>
      </section>

      <section className="grid" style={{ gap: 12 }}>
        <article className="banner">
          <h2 className="h2" style={{ color: 'white' }}>Support rider</h2>
          <p style={{ marginBottom: 0, opacity: 0.92 }}>
            Pour une board perdue/volée, utilisez la page publique NFC de la board concernée.
          </p>
        </article>

        <article className="card contact-list">
          <div className="contact-item">
            <strong>Email</strong>
            <p className="muted" style={{ margin: '4px 0 0' }}>contact@tk.com</p>
          </div>
          <div className="contact-item">
            <strong>Instagram</strong>
            <p className="muted" style={{ margin: '4px 0 0' }}>@tk_kitesurfing</p>
          </div>
          <div className="contact-item">
            <strong>HQ</strong>
            <p className="muted" style={{ margin: '4px 0 0' }}>Europe / Atlantic Coast</p>
          </div>
        </article>
      </section>
    </div>
  );
}
