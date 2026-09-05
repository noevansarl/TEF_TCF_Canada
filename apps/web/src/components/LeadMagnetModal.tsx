import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { trackMarketingEvent } from '../lib/tracking'

export interface LeadMagnetProps {
  isOpen?: boolean
  onClose?: () => void
  inline?: boolean
  initialExam?: 'TCF_CANADA' | 'TEF_CANADA'
  suggestedNclc?: string
  className?: string
}

export function LeadMagnetModal({
  isOpen = false,
  onClose,
  inline = false,
  initialExam = 'TCF_CANADA',
  suggestedNclc,
  className = ''
}: LeadMagnetProps) {
  const [email, setEmail] = useState('')
  const [exam, setExam] = useState<'TCF_CANADA' | 'TEF_CANADA'>(initialExam)
  const [targetNclc, setTargetNclc] = useState(suggestedNclc || 'NCLC 9')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!inline && !isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMsg('Veuillez entrer une adresse email valide.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      // 1. Sauvegarde dans Supabase si table 'leads' configurée, sinon fallback gracieux
      try {
        await supabase.from('leads').insert({
          email: email.trim().toLowerCase(),
          target_exam: exam,
          target_nclc: targetNclc,
          source: inline ? 'inline_calculator_banner' : 'lead_magnet_modal',
          created_at: new Date().toISOString()
        })
      } catch (dbErr) {
        // En cas d'erreur de schéma ou RLS publique, stockage local pour ne jamais perdre le lead
        const storedLeads = JSON.parse(localStorage.getItem('ayeprep_leads') || '[]')
        storedLeads.push({
          email: email.trim().toLowerCase(),
          exam,
          targetNclc,
          date: new Date().toISOString()
        })
        localStorage.setItem('ayeprep_leads', JSON.stringify(storedLeads))
      }

      // 2. Télémétrie marketing
      trackMarketingEvent('lead_magnet_downloaded', {
        exam,
        target_nclc: targetNclc,
        source: inline ? 'inline' : 'modal'
      })

      setSuccess(true)
    } catch (err: any) {
      console.error('Erreur soumission lead magnet:', err)
      setErrorMsg('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    // Génère un fichier texte / guide de démarrage structuré immédiatement disponible
    const guideContent = `# GUIDE ULTIME & CHECKLIST 30 JOURS — ayePREP
Préparation officielle au TCF & TEF Canada — Objectif NCLC 7 à 12

Bonjour et félicitations pour votre démarche d'immigration au Canada !

Votre objectif déclaré : ${targetNclc} (${exam === 'TCF_CANADA' ? 'TCF Canada' : 'TEF Canada'})

------------------------------------------------------------------------
1. LE CALENDRIER STRATÉGIQUE EN 30 JOURS
------------------------------------------------------------------------
SEMAINE 1 : FONDATIONS & DIAGNOSTIC
- J1 : Test diagnostique complet sur https://ayeprep.com/diagnostic
- J2 : Analyse de vos points faibles (Compréhension Orale vs Écrite)
- J3 : Révision des connecteurs logiques de niveau C1 (néanmoins, or, dès lors que...)
- J4-J7 : 3 séries quotidiennes de 15 questions QCM en conditions chronométrées (54s/question)

SEMAINE 2 : COMPRÉHENSION ORALE & PIÈGES DE L'ACCENT CANADIEN
- J8 : Écoute de dialogues avec bruits de fond et annonces aéroport/gare
- J9 : Distinction des nuances de conditionnel et de subjonctif
- J10-J14 : Simulations CO complètes avec gestion stricte du temps sans retour arrière

SEMAINE 3 : EXPRESSION ÉCRITE (MÉTHODOLOGIE 3 TÂCHES)
- Tâche 1 (TCF) : Courriel formel / message amical — Ne pas dépasser 10 min
- Tâche 2 : Exprimer son opinion argumentée avec 3 arguments étayés
- Tâche 3 : Synthèse de deux documents opposés (clarté, neutralité, syntaxe C2)
- Entraînez-vous avec la correction IA d'ayePREP pour obtenir votre note en 20 secondes !

SEMAINE 4 : EXPRESSION ORALE & SIMULATION EN CONDITIONS RÉELLES
- J22-J25 : Pratique de l'enregistrement voix en face-à-face
- J26-J28 : 2 Simulations complètes 4 épreuves enchaînées sur https://ayeprep.com
- J29 : Relecture des fiches de vocabulaire thématique (environnement, travail, tech)
- J30 : Repos mental avant le grand jour !

------------------------------------------------------------------------
2. LES 5 CONNECTEURS QUI FONT MONTER LE SCORE EN C1/C2
------------------------------------------------------------------------
1. "Il n'en demeure pas moins que..." (au lieu de "Mais")
2. "Force est de constater que..." (pour introduire un constat indiscutable)
3. "À supposer que..." + subjonctif (hypothèse poussée)
4. "Nonobstant ces réserves..." (concession élégante)
5. "Dans cette optique..." (conclusion / transition)

Accédez à plus de 2 000 sujets réels et simulations chronométrées sur :
👉 https://ayeprep.com
`
    const blob = new Blob([guideContent], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Checklist_30_Jours_${exam}_ayePREP.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const content = (
    <div className={`bg-gradient-to-br from-[#1B3A6B] via-[#152e55] to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl border border-blue-400/20 ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/15 rounded-full filter blur-3xl pointer-events-none"></div>

      {!inline && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-all"
          aria-label="Fermer"
        >
          ✕
        </button>
      )}

      {success ? (
        <div className="text-center py-6 space-y-4 relative z-10 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-3xl mx-auto">
            🍁
          </div>
          <h3 className="text-2xl font-black font-display text-white">
            Votre guide est prêt !
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Votre plan d'action personnalisé vers <strong className="text-amber-400">{targetNclc}</strong> a été validé. Cliquez ci-dessous pour télécharger votre checklist immédiatement.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleDownload}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>📥</span> Télécharger le Guide (Format PDF/MD)
            </button>
            <a
              href="/register"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center"
            >
              Créer mon compte d'entraînement →
            </a>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            <span>🎁</span> Guide Offert 2026
          </div>
          <h3 className="text-xl md:text-2xl font-black font-display tracking-tight text-white mb-2">
            Téléchargez la Checklist 30 Jours & Guide Ultime {exam === 'TCF_CANADA' ? 'TCF' : 'TEF'} Canada
          </h3>
          <p className="text-xs md:text-sm text-slate-300 mb-6 leading-relaxed">
            Rejoignez plus de 25 000 candidats. Découvrez les 39 pièges fréquents, les connecteurs indispensables pour C1/C2 et le calendrier d'entraînement quotidien.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Votre examen visé
                </label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="TCF_CANADA">TCF Canada (2h22)</option>
                  <option value="TEF_CANADA">TEF Canada (3h15)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Niveau ciblé (IRCC)
                </label>
                <select
                  value={targetNclc}
                  onChange={(e) => setTargetNclc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="NCLC 7">NCLC 7 (Seuil Express Entry B2)</option>
                  <option value="NCLC 8">NCLC 8 (Intermédiaire supérieur B2+)</option>
                  <option value="NCLC 9">NCLC 9 (+50 points CRS Bonus C1)</option>
                  <option value="NCLC 10+">NCLC 10+ (Excellence C1+/C2)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                Adresse email pour recevoir le guide
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? 'Envoi...' : 'Recevoir le guide →'}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>
            )}

            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">🔒 100% Gratuit & sans spam</span>
              <span className="flex items-center gap-1">⚡ Téléchargement direct</span>
            </div>
          </form>
        </div>
      )}
    </div>
  )

  if (inline) {
    return content
  }

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full animate-scale-up">
        {content}
      </div>
    </div>
  )
}
