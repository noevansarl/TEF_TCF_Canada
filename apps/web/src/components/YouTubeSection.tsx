import { useState } from 'react'

interface VideoItem {
  id: string
  title: string
  description: string
  duration: string
  youtubeId: string
  module: 'CO' | 'CE' | 'EE' | 'EO' | 'GENERAL'
  thumbnail: string
}

const VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'TCF Canada : Tout savoir sur l\'examen 2026',
    description: 'Une présentation complète des 4 épreuves, du barème des points NCLC et de la méthodologie globale pour réussir.',
    duration: '18:45',
    youtubeId: 'ECT45RoWtPI',
    module: 'GENERAL',
    thumbnail: 'https://img.youtube.com/vi/ECT45RoWtPI/hqdefault.jpg',
  },
  {
    id: 'vid-2',
    title: 'Compréhension Orale : Stratégies clés & Pièges',
    description: 'Comment écouter efficacement les dialogues rapides et répondre aux questions de niveaux A1 à C2 sous pression.',
    duration: '35:00',
    youtubeId: 'UfB6AgvWtik',
    module: 'CO',
    thumbnail: 'https://img.youtube.com/vi/UfB6AgvWtik/hqdefault.jpg',
  },
  {
    id: 'vid-3',
    title: 'Compréhension Écrite : Stratégie & Sujet Corrigé',
    description: 'Des techniques de lecture rapide et de repérage des mots clés pour finir la compréhension écrite sous conditions réelles.',
    duration: '14:20',
    youtubeId: 'tERG7izz9KQ',
    module: 'CE',
    thumbnail: 'https://img.youtube.com/vi/tERG7izz9KQ/hqdefault.jpg',
  },
  {
    id: 'vid-4',
    title: 'Expression Écrite : Méthodologie et Conseils',
    description: 'Le guide complet pour réussir la rédaction des trois tâches de l\'Expression Écrite en respectant les critères d\'évaluation.',
    duration: '20:15',
    youtubeId: 'gCN-u6-81D0',
    module: 'EE',
    thumbnail: 'https://img.youtube.com/vi/gCN-u6-81D0/hqdefault.jpg',
  },
  {
    id: 'vid-5',
    title: 'Expression Orale : Simulation d\'entretien C1',
    description: 'Une simulation complète de l\'épreuve d\'Expression Orale (tâches 1, 2 et 3) avec des exemples de réponses de niveau C1.',
    duration: '22:40',
    youtubeId: 'q52ZWO-ZOlE',
    module: 'EO',
    thumbnail: 'https://img.youtube.com/vi/q52ZWO-ZOlE/hqdefault.jpg',
  },
]

const CATEGORIES = [
  { value: 'ALL', label: 'Toutes les vidéos' },
  { value: 'GENERAL', label: 'Guides Généraux' },
  { value: 'CO', label: 'Compréhension Orale' },
  { value: 'CE', label: 'Compréhension Écrite' },
  { value: 'EE', label: 'Expression Écrite' },
  { value: 'EO', label: 'Expression Orale' },
]

export function YouTubeSection() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL')
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const filteredVideos = VIDEOS.filter(
    (vid) => selectedCat === 'ALL' || vid.module === selectedCat
  )

  const activeVideo = VIDEOS.find((vid) => vid.youtubeId === activeVideoId)

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🎥 Vidéos de Préparation Officielles
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Visionnez nos guides méthodologiques pour perfectionner vos techniques d'examen.
          </p>
        </div>

        {/* Catégories de filtres */}
        <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100 self-start md:self-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCat(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCat === cat.value
                  ? 'bg-[#1B3A6B] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des vidéos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => setActiveVideoId(video.youtubeId)}
            className="group cursor-pointer bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-[#1B3A6B]/30 hover:shadow-md transition-all flex flex-col"
          >
            {/* Thumbnail avec surimpression bouton play */}
            <div className="relative aspect-video w-full overflow-hidden bg-gray-150">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                <span className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center text-[#1B3A6B] shadow-lg group-hover:scale-110 transition-transform">
                  ▶
                </span>
              </div>
              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {video.duration}
              </span>
            </div>

            {/* Détails */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-[#1B3A6B]/10 text-[#1B3A6B] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                  {video.module === 'GENERAL' ? 'Examen Général' : video.module}
                </span>
                <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#1B3A6B] transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
                  {video.description}
                </p>
              </div>
              <span className="text-[#1B3A6B] text-xs font-bold mt-4 flex items-center gap-1">
                Regarder la vidéo →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Visionneuse Modale Vidéo */}
      {activeVideoId && activeVideo && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setActiveVideoId(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-950/40 hover:bg-slate-950/60 text-white flex items-center justify-center text-lg font-bold transition-colors"
              aria-label="Fermer la vidéo"
            >
              &times;
            </button>

            {/* Iframe aspect-ratio vidéo */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-none"
              ></iframe>
            </div>

            {/* Détails modale */}
            <div className="p-5">
              <span className="inline-block bg-[#1B3A6B]/10 text-[#1B3A6B] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                {activeVideo.module === 'GENERAL' ? 'Guide Général' : `Module ${activeVideo.module}`}
              </span>
              <h3 className="font-extrabold text-gray-900 text-lg">{activeVideo.title}</h3>
              <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">
                {activeVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
