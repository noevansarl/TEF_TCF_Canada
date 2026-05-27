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
    youtubeId: '5a2QjE54Q2k',
    module: 'GENERAL',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'vid-2',
    title: 'Compréhension Orale : Stratégies clés & Pièges',
    description: 'Comment écouter efficacement les dialogues rapides et répondre aux questions de niveaux A1 à C2 sous pression.',
    duration: '22:15',
    youtubeId: 'J7HwPz169-I',
    module: 'CO',
    thumbnail: 'https://images.unsplash.com/photo-1484755560693-a4074577af3a?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'vid-3',
    title: 'Compréhension Écrite : Lire plus vite pour le Jour J',
    description: 'Des techniques de lecture rapide et de repérage des mots clés pour finir les 39 questions dans les 35 minutes imparties.',
    duration: '15:30',
    youtubeId: 'gq3K-FjOpxU',
    module: 'CE',
    thumbnail: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'vid-4',
    title: 'Expression Écrite : Tâche 1 & Tâche 3 pas à pas',
    description: 'Le guide complet pour rédiger un fait divers ou une lettre formelle de niveau C1 en respectant la morphosyntaxe exigée.',
    duration: '31:10',
    youtubeId: 'zHkE5yGq4u8',
    module: 'EE',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'vid-5',
    title: 'Expression Orale : Simulation réelle d\'entretien',
    description: 'Une mise en situation sur la tâche 2 (poser des questions) et la tâche 3 (donner son opinion) pour atteindre NCLC 9+.',
    duration: '25:40',
    youtubeId: 'i0cE1dJpU-w',
    module: 'EO',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=640&q=80',
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
