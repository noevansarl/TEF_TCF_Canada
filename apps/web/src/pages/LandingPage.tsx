import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LandingPage() {
  // Données structurées Schema.org pour le SEO Google
  const schemaOrg = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ayePREP",
    "description": "Plateforme n°1 de préparation au TCF Canada et TEF Canada.",
    "url": "https://ayeprep.com",
    "inLanguage": "fr",
    "sameAs": ["https://www.youtube.com/@ayeprep"],
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "availableLanguage": "French" }
  })

  const schemaFaq = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Combien de questions y a-t-il au TCF Canada ?",
        "acceptedAnswer": { "@type": "Answer", "text": "39 QCM Compréhension Orale (35 min), 39 QCM Compréhension Écrite (35 min), 3 tâches Expression Écrite (60 min), 3 tâches Expression Orale (12 min). Durée totale : 2h22." }
      },
      {
        "@type": "Question",
        "name": "Quelle est la différence entre TCF Canada et TEF Canada ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Le TCF Canada dure 2h22, le TEF Canada 3h15. L'épreuve orale est de 12 min (TCF) vs 35 min (TEF). Les deux sont reconnus par IRCC pour l'immigration au Canada." }
      },
      {
        "@type": "Question",
        "name": "Comment convertir un score TCF Canada en NCLC ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Utilisez le calculateur NCLC gratuit de ayePREP pour convertir vos scores TCF/TEF en niveaux NCLC/CLB officiels IRCC." }
      }
    ]
  })
  const [burgerOpen, setBurgerOpen] = useState(false)
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [heroSeconds, setHeroSeconds] = useState(34 * 60 + 12)
  const [simSeconds, setSimSeconds] = useState(2 * 3600 + 22 * 60)
  const { user } = useAuthStore()

  // Load stylesheet dynamically

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/landing/style.css'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // Timer simulation countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSeconds(prev => (prev <= 1 ? 35 * 60 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setSimSeconds(prev => (prev <= 1 ? 2 * 3600 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (totalSeconds: number, includeHours = false) => {
    if (includeHours) {
      const h = Math.floor(totalSeconds / 3600).toString().padStart(1, '0')
      const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
      const s = (totalSeconds % 60).toString().padStart(2, '0')
      return `${h}:${m}:${s}`
    } else {
      const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
      const s = (totalSeconds % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    }
  }

  // Price calculations
  const getPrice = (plan: string) => {
    if (plan === 'essentiel') return pricingPeriod === 'monthly' ? '9,99 $' : '6,67 $'
    if (plan === 'avance') return pricingPeriod === 'monthly' ? '19,99 $' : '13,33 $'
    if (plan === 'premium') return pricingPeriod === 'monthly' ? '34,99 $' : '23,33 $'
    return '0 $'
  }

  return (
    <div className="landing-root bg-[#F8F9FA] text-[#1A1A2E] font-sans">
      {/* Schema.org données structurées SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: schemaOrg}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: schemaFaq}} />

      {/* ===== HEADER ===== */}
      <header className="header scrolled" id="header">
        <nav className="nav container">
          <Link to="/" className="nav__logo" aria-label="Accueil ayePREP" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logoayePREP.png" alt="ayePREP Logo" className="w-12 h-12 object-contain" />
          </Link>
          <div className={`nav__menu ${burgerOpen ? 'nav__menu--open' : ''}`}>
            <ul className="nav__links" role="list">
              <li><a href="#modules" onClick={() => setBurgerOpen(false)} className="nav__link">Modules</a></li>
              <li><a href="#tarifs" onClick={() => setBurgerOpen(false)} className="nav__link">Tarifs</a></li>
              <li><Link to="/calculateur-nclc" onClick={() => setBurgerOpen(false)} className="nav__link">Calculateur NCLC</Link></li>
              <li><Link to="/simulateur-crs" onClick={() => setBurgerOpen(false)} className="nav__link">Simulateur CRS</Link></li>
              <li><Link to="/reussites" onClick={() => setBurgerOpen(false)} className="nav__link">Témoignages</Link></li>
              <li><a href="#faq" onClick={() => setBurgerOpen(false)} className="nav__link">FAQ</a></li>
            </ul>
            <div className="nav__cta">
              {user ? (
                <Link to="/dashboard" className="btn btn--primary btn--sm">Mon Espace</Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn--ghost btn--sm">Connexion</Link>
                  <Link to="/register" className="btn btn--primary btn--sm">Essai gratuit</Link>
                </>
              )}
            </div>
          </div>
          <button 
            className="nav__burger" 
            aria-label="Menu" 
            aria-expanded={burgerOpen} 
            onClick={() => setBurgerOpen(!burgerOpen)}
          >
            <span></span><span></span><span></span>
          </button>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero" id="hero">
        <div className="hero__bg-animation" aria-hidden="true">
          <div className="hero__orb hero__orb--1"></div>
          <div className="hero__orb hero__orb--2"></div>
          <div className="hero__orb hero__orb--3"></div>
        </div>
        <div className="container hero__content">
          <div className="hero__badge">
            <span className="badge badge--primary">Nouveau</span>
            Correction IA par GPT-4o disponible sur tous les plans payants
          </div>
          <h1 className="hero__title">
            Décrochez le score C2<br/>
            <span className="gradient-text">au TCF & TEF Canada</span>
          </h1>
          <p className="hero__subtitle">
            La seule plateforme qui reproduit <strong>exactement</strong> les 4 épreuves 
            officielles — Compréhension Orale, Compréhension Écrite, Expression Écrite 
            et Expression Orale — avec des durées strictement identiques au jour J.
          </p>
          <div className="hero__actions">
            {user ? (
              <Link to="/dashboard" className="btn btn--primary btn--lg">
                Accéder à mon tableau de bord
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1">
                  <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/>
                </svg>
              </Link>
            ) : (
              <Link to="/register" className="btn btn--primary btn--lg">
                Commencer gratuitement
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1">
                  <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/>
                </svg>
              </Link>
            )}
            <Link to={user ? "/session/co-session-id" : "/login"} className="btn btn--ghost btn--lg">
              Voir une démonstration
            </Link>
          </div>
          <div className="hero__stats">
            <div className="stat">
              <span className="stat__number">25 000</span>
              <span className="stat__label">Candidats formés</span>
            </div>
            <div className="stat__divider" aria-hidden="true"></div>
            <div className="stat">
              <span className="stat__number">92 %</span>
              <span className="stat__label">de réussite B2+</span>
            </div>
            <div className="stat__divider" aria-hidden="true"></div>
            <div className="stat">
              <span className="stat__number">2 000</span>
              <span className="stat__label">Sujets originaux</span>
            </div>
          </div>
        </div>
        <div className="hero__mockup" aria-hidden="true">
          <div className="mockup-browser">
            <div className="mockup-browser__bar">
              <div className="mockup-browser__dots">
                <span></span><span></span><span></span>
              </div>
              <div className="mockup-browser__url">ayeprep.com/session</div>
            </div>
            <div className="mockup-browser__screen">
              <div className="mini-session">
                <div className="mini-session__header">
                  <span className="mini-badge">CO — TCF Canada</span>
                  <div className="mini-timer">{formatTime(heroSeconds)}</div>
                </div>
                <div className="mini-session__question">
                  <div className="mini-audio">
                    <button className="mini-play" aria-label="Lecture audio">▶</button>
                    <div className="mini-waveform" aria-hidden="true">
                      <span className="h-2"></span><span className="h-4"></span><span className="h-3"></span><span className="h-5"></span>
                      <span className="h-3"></span><span className="h-4"></span><span className="h-2"></span><span className="h-3"></span>
                    </div>
                    <span className="mini-listen">1/2 écoutes</span>
                  </div>
                  <p className="mini-q">Que fait Marc ce week-end selon le dialogue ?</p>
                  <ul className="mini-options" role="list">
                    <li className="mini-opt mini-opt--selected">A. Il visite sa famille à Lyon</li>
                    <li className="mini-opt">B. Il part en voyage d'affaires</li>
                    <li className="mini-opt">C. Il reste chez lui pour se reposer</li>
                    <li className="mini-opt">D. Il organise une fête d'anniversaire</li>
                  </ul>
                </div>
                <div className="mini-session__footer">
                  <span>Question 7 / 39</span>
                  <div className="mini-progress">
                    <div className="mini-progress__bar" style={{ width: '24%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BARRE AVANTAGES ===== */}
      <section className="bg-white border-b border-gray-100 py-3" aria-label="Points forts">
        <div className="container">
          <div className="benefits-row">
            {[
              { icon: '🕐', text: 'Accès 24h/24, 7j/7' },
              { icon: '📱', text: 'Web + iOS + Android' },
              { icon: '🔄', text: 'Sujets mis à jour chaque mois' },
              { icon: '🤖', text: 'Correction IA immédiate' },
              { icon: '🏆', text: '95% de taux de réussite' },
              { icon: '🌍', text: 'Paiement Mobile Money disponible' },
            ].map(item => (
              <span key={item.text} className="benefit-item">
                <span className="benefit-icon">{item.icon}</span>
                <span className="benefit-text">{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONFIANCE ===== */}
      <section className="trust" aria-label="Références et certifications">
        <div className="container trust__content">
          <p className="trust__label">Confiance accordée par des candidats de</p>
          <div className="trust__flags" aria-label="Pays représentés">
            <span>🇫🇷</span><span>🇨🇲</span><span>🇸🇳</span><span>🇲🇦</span>
            <span>🇩🇿</span><span>🇹🇳</span><span>🇨🇮</span><span>🇧🇯</span>
            <span>🇧🇫</span><span>🇭🇹</span><span>🇨🇩</span><span>🇧🇪</span>
          </div>
        </div>
      </section>

      {/* ===== MODULES ===== */}
      <section className="modules" id="modules">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">4 épreuves officielles</span>
            <h2 className="section-title">Tout ce que vous passerez le jour J</h2>
            <p className="section-subtitle">
              Durées identiques aux examens officiels. Aucun compromis. Aucune simulation.
            </p>
          </div>
          <div className="modules__grid">
            <Link to={user ? "/modules" : "/register"} className="block" style={{ textDecoration: 'none', color: 'inherit' }}>
              <article className="module-card" data-module="co">
                <div className="module-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" fill="#1B3A6B" opacity=".1"/>
                    <path d="M24 14 C18 14 13 18.5 13 24 S18 34 24 34 S35 29.5 35 24 S30 14 24 14Z M21 24 L21 20 L28 24 L21 28 Z" fill="#1B3A6B"/>
                  </svg>
                </div>
                <div className="module-card__content">
                  <h3 className="module-card__title">Compréhension de l'Oral</h3>
                  <div className="module-card__specs">
                    <div className="spec">
                      <span className="spec__label">TCF Canada</span>
                      <span className="spec__value">39 QCM · 35 min</span>
                    </div>
                    <div className="spec">
                      <span className="spec__label">TEF Canada</span>
                      <span className="spec__value">60 QCM · 40 min</span>
                    </div>
                  </div>
                  <p className="module-card__desc">
                    Accents parisien, québécois, africain et belge. Dialogues, monologues. 600+ enregistrements inédits.
                  </p>
                </div>
              </article>
            </Link>

            <Link to={user ? "/modules" : "/register"} className="block" style={{ textDecoration: 'none', color: 'inherit' }}>
              <article className="module-card" data-module="ce">
                <div className="module-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" fill="#C55A11" opacity=".1"/>
                    <rect x="13" y="14" width="22" height="3" rx="1.5" fill="#C55A11"/>
                    <rect x="13" y="21" width="18" height="3" rx="1.5" fill="#C55A11"/>
                    <rect x="13" y="28" width="20" height="3" rx="1.5" fill="#C55A11"/>
                  </svg>
                </div>
                <div className="module-card__content">
                  <h3 className="module-card__title">Compréhension des Écrits</h3>
                  <div className="module-card__specs">
                    <div className="spec">
                      <span className="spec__label">TCF Canada</span>
                      <span className="spec__value">39 QCM · 35 min</span>
                    </div>
                    <div className="spec">
                      <span className="spec__label">TEF Canada</span>
                      <span className="spec__value">50 QCM · 60 min</span>
                    </div>
                  </div>
                  <p className="module-card__desc">
                    Textes authentiques sur l'actualité, la culture, la science. 700+ textes. Vue split-screen.
                  </p>
                </div>
              </article>
            </Link>

            <Link to={user ? "/modules" : "/register"} className="block" style={{ textDecoration: 'none', color: 'inherit' }}>
              <article className="module-card module-card--premium" data-module="ee">
                <div className="module-card__badge">Correction IA GPT-4o</div>
                <div className="module-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" fill="#2E75B6" opacity=".1"/>
                    <path d="M16 14 H30 A2 2 0 0 1 32 16 V32 A2 2 0 0 1 30 34 H18 A2 2 0 0 1 16 32 V16 A2 2 0 0 1 18 14Z" stroke="#2E75B6" strokeWidth="2" fill="none"/>
                    <line x1="20" y1="20" x2="28" y2="20" stroke="#2E75B6" strokeWidth="2"/>
                    <line x1="20" y1="24" x2="28" y2="24" stroke="#2E75B6" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="module-card__content">
                  <h3 className="module-card__title">Expression Écrite</h3>
                  <div className="module-card__specs">
                    <div className="spec">
                      <span className="spec__label">TCF / TEF Canada</span>
                      <span className="spec__value">2 rédactions · 60 min</span>
                    </div>
                  </div>
                  <p className="module-card__desc">
                    Correction automatique par GPT-4o sur 5 critères officiels. 500+ sujets variés.
                  </p>
                </div>
              </article>
            </Link>

            <Link to={user ? "/modules" : "/register"} className="block" style={{ textDecoration: 'none', color: 'inherit' }}>
              <article className="module-card module-card--premium" data-module="eo">
                <div className="module-card__badge">Whisper & GPT-4o</div>
                <div className="module-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" fill="#1E7145" opacity=".1"/>
                    <rect x="20" y="12" width="8" height="14" rx="4" fill="#1E7145"/>
                    <path d="M14 25 C14 31 34 31 34 25" stroke="#1E7145" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="module-card__content">
                  <h3 className="module-card__title">Expression Orale</h3>
                  <div className="module-card__specs">
                    <div className="spec">
                      <span className="spec__label">TCF / TEF Canada</span>
                      <span className="spec__value">Tâches variées · 12 à 35 min</span>
                    </div>
                  </div>
                  <p className="module-card__desc">
                    Enregistrement micro, transcription automatique par Whisper et analyse prosodique immédiate.
                  </p>
                </div>
              </article>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SIMULATION ===== */}
      <section className="simulation-cta">
        <div className="container simulation-cta__content">
          <div className="simulation-cta__text">
            <h2>Mode simulation officiel</h2>
            <p>
              Passez l'examen complet en conditions réelles. Minuteur bloquant, aucun retour arrière.
            </p>
            <ul className="simulation-cta__list" role="list">
              <li>Interface plein écran — notifications bloquées</li>
              <li>Chronomètre global + par épreuve</li>
              <li>Rapport NCLC détaillé à la fin avec radar</li>
            </ul>
          </div>
          <div className="simulation-cta__visual" aria-hidden="true">
            <div className="clock-ring">
              <div className="clock-time">
                <span className="clock-time__value">{formatTime(simSeconds, true)}</span>
                <span className="clock-time__label">TCF Canada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TARIFS ===== */}
      <section className="pricing" id="tarifs">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Tarification</span>
            <h2 className="section-title">Un plan pour chaque objectif</h2>
          </div>
          <div className="pricing__toggle" role="group">
            <button 
              className={`toggle-btn ${pricingPeriod === 'monthly' ? 'toggle-btn--active' : ''}`}
              onClick={() => setPricingPeriod('monthly')}
            >
              Mensuel
            </button>
            <button 
              className={`toggle-btn ${pricingPeriod === 'yearly' ? 'toggle-btn--active' : ''}`}
              onClick={() => setPricingPeriod('yearly')}
            >
              Annuel <span className="saving-badge">−33%</span>
            </button>
          </div>
          <div className="pricing__grid">
            <div className="pricing-card">
              <div className="pricing-card__header">
                <h3>Gratuit</h3>
                <div className="pricing-card__price">
                  <span className="price">0 $</span>
                  <span className="period">/mois</span>
                </div>
              </div>
              <ul className="pricing-card__features" role="list">
                <li className="feature--yes">10 exercices CO par module</li>
                <li className="feature--yes">10 exercices CE par module</li>
                <li className="feature--yes">1 simulation / mois</li>
                <li className="feature--no">Exercices EE / EO</li>
                <li className="feature--no">Correction IA</li>
              </ul>
              {user ? (
                <Link to="/dashboard" className="btn btn--outline btn--full">Accéder au plan Gratuit</Link>
              ) : (
                <Link to="/register" className="btn btn--outline btn--full">Commencer</Link>
              )}
            </div>

            <div className="pricing-card">
              <div className="pricing-card__header">
                <h3>Essentiel</h3>
                <div className="pricing-card__price">
                  <span className="price">{getPrice('essentiel')}</span>
                  <span className="period">/mois</span>
                </div>
              </div>
              <ul className="pricing-card__features" role="list">
                <li className="feature--yes">CO illimité avec correction IA</li>
                <li className="feature--yes">CE illimité avec correction IA</li>
                <li className="feature--yes">5 simulations / mois</li>
                <li className="feature--no">Exercices EE / EO</li>
              </ul>
              {user ? (
                <Link to="/subscribe?plan=essentiel" className="btn btn--outline btn--full">S'abonner</Link>
              ) : (
                <Link to="/register?plan=essentiel" className="btn btn--outline btn--full">Choisir</Link>
              )}
            </div>

            <div className="pricing-card pricing-card--popular">
              <div className="pricing-card__badge">Plus populaire</div>
              <div className="pricing-card__header">
                <h3>Avancé</h3>
                <div className="pricing-card__price">
                  <span className="price">{getPrice('avance')}</span>
                  <span className="period">/mois</span>
                </div>
              </div>
              <ul className="pricing-card__features" role="list">
                <li className="feature--yes">Tous les modules illimités</li>
                <li className="feature--yes">Correction IA tous modules</li>
                <li className="feature--yes">15 simulations / mois</li>
                <li className="feature--yes">Dashboard progression</li>
              </ul>
              {user ? (
                <Link to="/subscribe?plan=avance" className="btn btn--primary btn--full">S'abonner</Link>
              ) : (
                <Link to="/register?plan=avance" className="btn btn--primary btn--full">Choisir</Link>
              )}
            </div>

            <div className="pricing-card">
              <div className="pricing-card__header">
                <h3>Premium+</h3>
                <div className="pricing-card__price">
                  <span className="price">{getPrice('premium')}</span>
                  <span className="period">/mois</span>
                </div>
              </div>
              <ul className="pricing-card__features" role="list">
                <li className="feature--yes">Tout du plan Avancé</li>
                <li className="feature--yes">Simulations illimitées</li>
                <li className="feature--yes">8 corrections humaines EE/mois</li>
                <li className="feature--yes">8 corrections humaines EO/mois</li>
              </ul>
              {user ? (
                <Link to="/subscribe?plan=premium" className="btn btn--outline btn--full">S'abonner</Link>
              ) : (
                <Link to="/register?plan=premium" className="btn btn--outline btn--full">Choisir</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PACKS À DURÉE LIMITÉE ===== */}
      <section className="py-20 bg-white" id="packs">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Packs · Accès immédiat · Sans abonnement</span>
            <h2 className="section-title">Choisissez votre durée de préparation</h2>
            <p className="section-subtitle">
              Achetez un pack, activez-le et commencez immédiatement. Pas de renouvellement automatique.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { emoji: '🥉', name: 'Découverte', price: '14,99 $', cfa: '9 800 FCFA', days: 5,  ai: 3,  border: 'border-amber-300' },
              { emoji: '🥈', name: 'Préparation', price: '29,99 $', cfa: '19 600 FCFA', days: 30, ai: 8,  border: 'border-slate-300', badge: 'Populaire' },
              { emoji: '🥇', name: 'Intensif',    price: '49,99 $', cfa: '32 700 FCFA', days: 60, ai: 15, border: 'border-yellow-400', badge: 'Meilleure valeur' },
              { emoji: '💎', name: 'Champion',    price: '79,99 $', cfa: '52 300 FCFA', days: 90, ai: 30, border: 'border-indigo-300', badge: 'Tout illimité' },
            ].map(pack => (
              <div key={pack.name} className={`relative bg-gray-50 rounded-2xl border-2 ${pack.border} p-5 flex flex-col hover:-translate-y-1 transition-transform`}>
                {pack.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B3A6B] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {pack.badge}
                  </span>
                )}
                <div className="text-3xl mb-2 mt-2">{pack.emoji}</div>
                <p className="font-extrabold text-gray-900 text-lg">{pack.name}</p>
                <p className="text-2xl font-extrabold text-[#1B3A6B] my-2">{pack.price}</p>
                <p className="text-xs text-gray-400 mb-3">{pack.cfa} · Mobile Money</p>
                <ul className="text-sm text-gray-700 space-y-1 mb-4 flex-1">
                  <li>✓ {pack.days} jours d'accès</li>
                  <li>✓ {pack.ai} corrections IA EE/EO</li>
                  <li>✓ Tests CO et CE inclus</li>
                  <li>✓ Simulations officielles</li>
                </ul>
                <Link
                  to={user ? `/subscribe?pack=${pack.name.toLowerCase()}` : `/register?pack=${pack.name.toLowerCase()}`}
                  className="block text-center py-2 rounded-xl font-bold text-sm bg-[#1B3A6B] text-white hover:bg-[#152e56] transition-colors"
                >
                  Activer ce pack
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/packs" className="text-[#1B3A6B] font-semibold hover:underline text-sm">
              Voir tous les détails et options de paiement (Mobile Money, FCFA) →
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <span>🟠 Orange Money</span>
            <span>🟡 MTN Mobile Money</span>
            <span>🔵 Wave</span>
            <span>💳 Visa / Mastercard</span>
            <span>🌍 Prix FCFA avec −40%</span>
          </div>
        </div>
      </section>

      {/* ===== CALCULATEUR NCLC CTA ===== */}
      <section className="py-14 bg-gradient-to-r from-[#1E7145] to-[#2E8B57] text-white">
        <div className="container text-center">
          <p className="text-sm font-semibold opacity-75 mb-2">Outil gratuit · Sans inscription</p>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Calculez votre niveau NCLC / CLB en 30 secondes
          </h2>
          <p className="opacity-80 mb-6 max-w-lg mx-auto">
            Entrez vos scores TCF ou TEF Canada et obtenez immédiatement votre niveau NCLC officiel
            reconnu par IRCC — sans créer de compte.
          </p>
          <Link
            to="/calculateur-nclc"
            className="inline-block bg-white text-[#1E7145] font-extrabold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            Accéder au calculateur NCLC gratuit →
          </Link>
        </div>
      </section>

      {/* ===== TEMOIGNAGES ===== */}
      <section className="testimonials" id="temoignages">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Témoignages</span>
            <h2 className="section-title">Ils ont réussi. Vous le pouvez aussi.</h2>
          </div>
          <div className="testimonials__slider" role="region" aria-label="Témoignages clients">
            <div className="testimonials__track" style={{ gap: '24px' }}>
              <article className="testimonial-card">
                <div className="testimonial-card__rating">★★★★★</div>
                <blockquote className="testimonial-card__quote">
                  "Après 3 mois sur ayePREP, j'ai obtenu C1 au TCF Canada 
                  avec 498 points. Les simulations en conditions réelles m'ont préparée. Les corrections IA étaient parfaites."
                </blockquote>
                <cite className="testimonial-card__author">
                  <div className="testimonial-card__avatar">AS</div>
                  <div>
                    <strong>Aminata S.</strong>
                    <span>Sénégal → Montréal</span>
                    <span className="testimonial-card__score text-success font-bold block text-xs">TCF: 498 pts (C1)</span>
                  </div>
                </cite>
              </article>
            </div>
          </div>
          {/* CTA vers la page témoignages complète */}
          <div className="text-center mt-8">
            <Link
              to="/reussites"
              className="inline-flex items-center gap-2 text-[#1B3A6B] font-bold hover:underline text-sm"
            >
              🌟 Voir tous les témoignages (4 800+ candidats) →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Questions fréquentes</h2>
          </div>
          <div className="faq__list">
            {[
              {
                q: 'Combien de questions y a-t-il au TCF Canada ?',
                a: '39 questions de Compréhension de l\'Oral (35 min), 39 questions de Compréhension des Écrits (35 min), 3 tâches d\'Expression Écrite (60 min) et 3 tâches d\'Expression Orale (12 min). Durée totale : 2h22. Toutes nos simulations respectent ces durées exactes.',
              },
              {
                q: 'Quelle différence entre TCF Canada et TEF Canada ?',
                a: 'Le TCF Canada dure 2h22 (épreuve orale de 12 min). Le TEF Canada dure 3h15 (épreuve orale de 35 min avec 4 tâches). Les deux sont reconnus par IRCC. Consultez notre page de comparaison détaillée pour choisir.',
              },
              {
                q: 'Les durées des épreuves sont-elles vraiment identiques aux examens officiels ?',
                a: 'Oui, absolument. CO TCF = 35 min, CE TCF = 35 min, EE = 60 min, EO TCF = 12 min. Le minuteur est bloquant — la session se soumet automatiquement à expiration, exactement comme lors du vrai examen.',
              },
              {
                q: 'Comment fonctionne la correction IA ?',
                a: 'Pour l\'Expression Écrite, GPT-4o analyse votre rédaction sur 5 critères officiels CECRL (respect de la tâche, cohérence, lexique, morphosyntaxe, conventions) en moins de 20 secondes. Pour l\'Expression Orale, Whisper transcrit votre audio puis GPT-4o analyse la transcription.',
              },
              {
                q: 'Puis-je payer en FCFA ou Mobile Money ?',
                a: 'Oui. Les utilisateurs d\'Afrique subsaharienne bénéficient automatiquement de −40% et peuvent payer en FCFA via Orange Money, MTN Mobile Money, Wave ou Moov. Sélectionnez "Packs FCFA" sur la page de paiement.',
              },
              {
                q: 'L\'application fonctionne-t-elle hors connexion ?',
                a: 'Oui, sur mobile (iOS et Android) avec un abonnement payant ou un pack Silver/Gold/Platinum. Téléchargez les modules en Wi-Fi, puis accédez aux exercices et audios sans connexion. Vos résultats se synchronisent automatiquement à la reconnexion.',
              },
            ].map((item) => (
              <details key={item.q} className="faq-item">
                <summary className="faq-item__question">
                  {item.q}
                  <span className="faq-item__icon">+</span>
                </summary>
                <div className="faq-item__answer"><p>{item.a}</p></div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/aide" className="text-[#1B3A6B] font-semibold hover:underline text-sm">
              Voir toutes les questions →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="final-cta">
        <div className="container final-cta__content">
          <h2 className="final-cta__title">
            Votre score <span style={{ background: 'linear-gradient(135deg, #C55A11 0%, #F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>C2</span> commence aujourd'hui.
          </h2>
          <p style={{ opacity: 0.85, marginBottom: '24px', fontSize: '1.125rem' }}>
            Rejoignez 25 000 candidats qui ont choisi la rigueur des conditions réelles.
          </p>
          <Link to={user ? "/dashboard" : "/register"} className="btn btn--white btn--lg">
            Créer mon compte gratuit — c'est immédiat
          </Link>
          <p style={{ opacity: 0.7, fontSize: '0.875rem', marginTop: '16px' }}>
            Sans carte bancaire · Annulation en 1 clic · Données hébergées en Europe
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container footer__content">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logoayePREP.png" alt="ayePREP Logo" className="w-12 h-12 object-contain" />
            </Link>
            <p className="footer__tagline">Préparez-vous comme si c'était le vrai jour J.</p>
            <div className="footer__social">
              <a href="#" aria-label="Instagram">Insta</a>
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="YouTube">YT</a>
              <a href="#" aria-label="TikTok">TikTok</a>
            </div>
          </div>
          <nav className="footer__nav" aria-label="Liens du bas de page">
            <div className="footer__col">
              <h4>Produit</h4>
              <ul>
                <li><a href="#modules">Modules</a></li>
                <li><a href="#tarifs">Tarifs</a></li>
                <li><Link to="/packs">Packs à durée limitée</Link></li>
                <li><Link to="/reussites">Témoignages</Link></li>
                <li><Link to="/affiliation">Programme d'affiliation</Link></li>
                <li><Link to="/blog">Le Blog SEO</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Outils gratuits</h4>
              <ul>
                <li><Link to="/calculateur-nclc">Calculateur NCLC</Link></li>
                <li><Link to="/simulateur-crs">Simulateur CRS / Entrée Express</Link></li>
                <li><Link to="/tcf-vs-tef-canada">TCF vs TEF Canada</Link></li>
                <li><Link to="/test-rapide">Test de niveau gratuit</Link></li>
                <li><Link to="/aide">Centre d'aide</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Légal</h4>
              <ul>
                <li><Link to="/mentions-legales">Mentions légales</Link></li>
                <li><Link to="/confidentialite">Confidentialité</Link></li>
                <li><Link to="/cookies">Gestion des cookies</Link></li>
                <li><Link to="/remboursement">Remboursement</Link></li>
                <li><Link to="/cgv">CGV</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Support</h4>
              <ul>
                <li><a href="https://wa.me/22890116744" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a></li>
                <li><a href="mailto:support@ayeprep.com">Email support</a></li>
                <li><Link to="/aide">Centre d'aide</Link></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="footer__bottom">
          <p>© 2026 ayePREP. Tous droits réservés. Hébergé en Europe (RGPD conforme).</p>
        </div>
      </footer>
    </div>
  )
}
