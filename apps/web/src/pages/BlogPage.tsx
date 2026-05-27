import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { BLOG_ARTICLES } from '../data/blogArticles'

const CATEGORIES = ['Tout', 'TCF Canada', 'TEF Canada', 'NCLC', 'Immigration', 'Conjugaison & Grammaire']

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tout')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les articles
  const filteredArticles = BLOG_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'Tout' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 select-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Logo />
          <div className="flex items-center gap-4">
            <Link to="/calculateur-nclc" className="text-sm font-semibold text-gray-600 hover:text-gray-900 hidden sm:block">
              Calculateur NCLC
            </Link>
            <Link to="/register" className="text-sm font-bold text-[#1B3A6B] hover:underline">
              S'inscrire gratuitement →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1B3A6B] to-[#152e56] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full">
            Le Blog Officiel
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Réussir le TCF et TEF Canada
          </h1>
          <p className="text-blue-150 text-base md:text-lg max-w-2xl mx-auto opacity-90">
            Retrouvez les conseils de nos experts, des fiches grammaticales, des décryptages du barème NCLC et toute l'actualité pour immigrer au Canada.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un guide, un sujet d'actualité, une règle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-350 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-900 bg-white"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-2 pt-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1B3A6B] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grille d'articles */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredArticles.map(article => (
            <article
              key={article.slug}
              className="bg-white rounded-2xl border border-gray-250 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
            >
              {/* Image */}
              <div className="h-48 overflow-hidden bg-gray-100 relative">
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#1B3A6B] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  {article.category}
                </span>
              </div>

              {/* Infos */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                    <span>Par {article.author.name}</span>
                    <span>•</span>
                    <span>{article.publishedAt}</span>
                    <span>•</span>
                    <span>{article.readingTimeMin} min de lecture</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-950 leading-snug group-hover:text-[#1B3A6B] transition-colors">
                    <Link to={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/blog/${article.slug}`}
                    className="inline-flex items-center text-xs font-bold text-[#1B3A6B] hover:text-[#152e56] gap-1 group-hover:gap-1.5 transition-all"
                  >
                    Lire l'article complet
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Aucun résultat */}
        {filteredArticles.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <span className="text-5xl block">🔍</span>
            <h3 className="text-lg font-bold text-gray-900">Aucun article ne correspond à votre recherche</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Essayez de modifier vos filtres ou d'élargir vos termes de recherche pour trouver ce que vous cherchez.
            </p>
          </div>
        )}

        {/* Banner CTA d'inscription */}
        <section className="bg-gradient-to-r from-[#1B3A6B] to-[#2E75B6] rounded-3xl p-8 text-white text-center space-y-4 shadow-sm relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
          <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Prêt pour le grand saut ?</p>
          <h2 className="text-xl md:text-2xl font-extrabold max-w-lg mx-auto leading-snug">
            Obtenez votre score NCLC 9 en moins de 60 jours.
          </h2>
          <p className="text-sm text-blue-150 max-w-md mx-auto opacity-90">
            Rejoignez notre simulateur officiel pour débloquer 2000+ exercices corrigés par l'IA et vos plans d'entraînement personnalisés.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-block bg-white text-[#1B3A6B] font-extrabold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors text-sm shadow-md"
            >
              Créer mon compte gratuit →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 mt-12 text-center text-xs text-gray-500">
        <p className="max-w-xl mx-auto">
          ayePREP est un organisme indépendant de préparation linguistique. Les marques TCF et TEF appartiennent à leurs organismes respectifs.
        </p>
      </footer>
    </div>
  )
}
