import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { BLOG_ARTICLES } from '../data/blogArticles'
import { useDocumentMetadata } from '../hooks/useDocumentMetadata'

// Questions démo interactives pour l'inclusion dans les articles
const DEMO_EXERCISES: Record<string, {
  question: string
  options: Record<string, string>
  correct: string
  explanation: string
  module: string
}> = {
  'demo-1': {
    module: 'Compréhension Orale',
    question: 'Dans un dialogue, Marie dit à Paul : "Tu aurais pu me prévenir avant de partir !" Quel reproche lui fait-elle ?',
    options: {
      A: "Il est parti sans lui dire au revoir",
      B: "Il ne l'a pas informée de son départ à l'avance",
      C: "Il l'a empêchée de partir avec lui",
      D: "Il est parti trop tôt le matin"
    },
    correct: 'B',
    explanation: "L'expression 'tu aurais pu me prévenir' = reprocher de ne pas avoir informé à l'avance. Le conditionnel passé exprime un regret sur une action qui aurait dû être faite."
  },
  'demo-3': {
    module: 'Compréhension Écrite',
    question: 'Lisez : "Bien que les résultats soient encourageants, les chercheurs restent prudents quant aux conclusions définitives." Quelle est l\'attitude des chercheurs ?',
    options: {
      A: "Ils sont certains que leurs résultats sont corrects",
      B: "Ils sont déçus par leurs résultats",
      C: "Ils sont satisfaits mais ne tirent pas de conclusions hâtives",
      D: "Ils abandonnent leurs recherches"
    },
    correct: 'C',
    explanation: "'Bien que' introduit une concession — les résultats sont bons MAIS les chercheurs restent mesurés. 'Prudents quant aux conclusions' = ne pas conclure trop vite."
  }
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({})

  const article = BLOG_ARTICLES.find(a => a.slug === slug)

  useDocumentMetadata({
    title: article ? `${article.title} | Blog ayePREP` : "Blog | ayePREP",
    description: article?.metaDescription || "",
  })

  useEffect(() => {
    // Faire remonter la page en haut lors du changement d'article
    window.scrollTo(0, 0)
    // Reset answers
    setSelectedAnswers({})
    setShowExplanations({})
  }, [slug])

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
        <div className="text-center space-y-4 max-w-sm">
          <span className="text-6xl">⚠️</span>
          <h1 className="text-2xl font-extrabold text-gray-900">Article introuvable</h1>
          <p className="text-sm text-gray-500">
            L'article que vous recherchez n'existe pas ou a été déplacé.
          </p>
          <Link
            to="/blog"
            className="inline-block py-2.5 px-6 bg-[#1B3A6B] text-white rounded-xl font-bold text-sm hover:bg-[#152e56] transition-colors"
          >
            ← Retour au blog
          </Link>
        </div>
      </div>
    )
  }

  // Articles suggérés (2 autres articles différents)
  const relatedArticles = BLOG_ARTICLES
    .filter(a => a.slug !== article.slug)
    .slice(0, 2)

  // Gérer le clic sur une réponse de QCM démo
  const handleAnswerSelect = (qId: string, optionKey: string) => {
    if (selectedAnswers[qId]) return // Déjà répondu
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionKey }))
    setShowExplanations(prev => ({ ...prev, [qId]: true }))
  }

  // Partage WhatsApp & Mail
  const shareUrl = encodeURIComponent(window.location.href)
  const shareTitle = encodeURIComponent(article.title)
  const whatsappUrl = `https://wa.me/?text=${shareTitle}%20-%20${shareUrl}`
  const mailUrl = `mailto:?subject=${shareTitle}&body=Voici%20un%20article%20intéressant%20:%20${shareUrl}`

  // Balisage de données structurées Schema.org
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription,
    "image": article.image,
    "datePublished": "2026-05-27",
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "jobTitle": article.author.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "ayePREP",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ayeprep.com/logo.png"
      }
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Balises JSON-LD Schema.org */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {article.faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 select-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Logo />
          <Link to="/blog" className="text-sm font-bold text-[#1B3A6B] hover:underline">
            ← Tous les articles
          </Link>
        </div>
      </header>

      {/* Hero Image */}
      <div className="h-64 md:h-96 w-full relative bg-gray-100">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className="max-w-4xl mx-auto space-y-2">
            <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm w-fit inline-block">
              {article.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-snug">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article Content Layout */}
      <div className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Article Body (2/3) */}
          <main className="md:col-span-2 space-y-6">
            
            {/* Meta infos */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#1B3A6B]/15 text-[#1B3A6B] flex items-center justify-center font-bold text-sm">
                {article.author.name.charAt(0)}
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-900">{article.author.name}</p>
                <p className="text-gray-400">{article.author.role} · Publié le {article.publishedAt}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-full">
                ⏱️ {article.readingTimeMin} min
              </span>
            </div>

            {/* Sections */}
            <article className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 space-y-6 text-gray-800 leading-relaxed shadow-sm">
              {article.sections.map((sec, idx) => {
                switch (sec.type) {
                  case 'paragraph':
                    return <p key={idx} className="text-gray-700 text-sm md:text-base">{sec.content}</p>
                  
                  case 'heading-2':
                    return <h2 key={idx} className="text-lg md:text-xl font-extrabold text-[#1B3A6B] pt-4">{sec.content}</h2>
                  
                  case 'heading-3':
                    return <h3 key={idx} className="text-base md:text-lg font-bold text-gray-900 pt-2">{sec.content}</h3>
                  
                  case 'list':
                    return (
                      <ul key={idx} className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                        {sec.items?.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )
                  
                  case 'quote':
                    return (
                      <blockquote key={idx} className="bg-blue-50 border-l-4 border-[#1B3A6B] rounded-r-xl p-4 my-4 text-sm italic text-gray-800 font-medium">
                        {sec.content}
                      </blockquote>
                    )

                  case 'demo-box': {
                    const ex = DEMO_EXERCISES[sec.demoQuestionId || '']
                    if (!ex) return null
                    const qId = sec.demoQuestionId || ''
                    const selected = selectedAnswers[qId]
                    const showExp = showExplanations[qId]

                    return (
                      <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden my-6 bg-gray-50 shadow-inner">
                        <div className="px-5 py-3.5 bg-[#1B3A6B] text-white flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider">{ex.module} — Mini-test</span>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Niveau B2</span>
                        </div>
                        <div className="p-5 space-y-4">
                          <p className="font-bold text-sm text-gray-900 leading-snug">{ex.question}</p>
                          <div className="space-y-2">
                            {Object.entries(ex.options).map(([key, val]) => {
                              let btnStyle = 'border-gray-200 bg-white hover:border-[#1B3A6B]'
                              if (selected) {
                                if (key === ex.correct) {
                                  btnStyle = 'border-green-500 bg-green-50 text-green-800'
                                } else if (key === selected) {
                                  btnStyle = 'border-red-400 bg-red-50 text-red-700'
                                } else {
                                  btnStyle = 'border-gray-100 bg-white text-gray-400 opacity-60'
                                }
                              }

                              return (
                                <button
                                  key={key}
                                  onClick={() => handleAnswerSelect(qId, key)}
                                  disabled={!!selected}
                                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-start gap-2 ${btnStyle}`}
                                >
                                  <span className="font-bold text-gray-400">{key}.</span>
                                  <span>{val}</span>
                                </button>
                              )
                            })}
                          </div>
                          {showExp && (
                            <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                              selected === ex.correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}>
                              <p className="font-bold mb-1">
                                {selected === ex.correct ? '✓ Correct !' : `✗ Faux (La bonne réponse est ${ex.correct})`}
                              </p>
                              <p>{ex.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  case 'cta':
                    return (
                      <div key={idx} className="bg-gradient-to-r from-[#1B3A6B] to-[#2E75B6] text-white p-6 rounded-2xl text-center space-y-3 my-6">
                        <p className="font-bold text-sm leading-snug">{sec.content}</p>
                        <Link
                          to="/register"
                          className="inline-block bg-white text-[#1B3A6B] font-extrabold px-6 py-2 rounded-full text-xs hover:bg-blue-50 transition-colors shadow-sm"
                        >
                          S'inscrire gratuitement
                        </Link>
                      </div>
                    )

                  default:
                    return null
                }
              })}
            </article>

            {/* FAQs Accordion */}
            {article.faqs.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-950">Questions fréquentes (FAQ)</h2>
                <div className="space-y-2">
                  {article.faqs.map((faq, i) => (
                    <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                      <summary className="px-4 py-3 cursor-pointer font-bold text-gray-900 text-xs md:text-sm hover:bg-gray-50 flex justify-between items-center list-none select-none">
                        <span>{faq.q}</span>
                        <span className="text-[#1B3A6B] group-open:rotate-45 transition-transform font-bold text-lg">+</span>
                      </summary>
                      <div className="px-4 pb-4 pt-2 text-xs md:text-sm text-gray-600 border-t border-gray-50 leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sticky Sidebar (1/3) */}
          <aside className="md:col-span-1 space-y-6">
            
            {/* Box Action */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 sticky top-6">
              <h3 className="font-extrabold text-gray-950 text-base leading-snug">
                Préparez votre TCF / TEF Canada
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Préparez-vous efficacement avec nos modules d'apprentissage et corrections IA en temps réel.
              </p>
              
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Simulations officielles chronométrées</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Corrections IA instantanées EE/EO</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Parcours adaptatifs sur 30 ou 60 jours</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="block w-full text-center py-2.5 bg-[#1B3A6B] hover:bg-[#152e56] text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Démarrer mon essai gratuit
                </Link>
                <Link
                  to="/packs"
                  className="block w-full text-center py-2.5 mt-2 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Voir les packs d'examen
                </Link>
              </div>

              {/* Partage Social */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Partager l'article</span>
                <div className="flex gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center hover:bg-green-100 transition-colors text-base"
                    title="Partager sur WhatsApp"
                  >
                    💬
                  </a>
                  <a
                    href={mailUrl}
                    className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-150 transition-colors text-sm"
                    title="Partager par E-mail"
                  >
                    ✉️
                  </a>
                </div>
              </div>

              {/* Articles Suggérés */}
              {relatedArticles.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">À lire aussi</h4>
                  <div className="space-y-3">
                    {relatedArticles.map(art => (
                      <div key={art.slug} className="space-y-1 group">
                        <span className="text-[9px] font-extrabold text-[#1B3A6B] bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {art.category}
                        </span>
                        <Link
                          to={`/blog/${art.slug}`}
                          className="block text-xs font-bold text-gray-800 leading-snug group-hover:text-[#1B3A6B] transition-colors"
                        >
                          {art.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 mt-12 text-center text-xs text-gray-500">
        <p className="max-w-xl mx-auto">
          ayePREP est un organisme indépendant de préparation linguistique. Les marques TCF et TEF appartiennent à leurs organismes respectifs.
        </p>
      </footer>
    </div>
  )
}
