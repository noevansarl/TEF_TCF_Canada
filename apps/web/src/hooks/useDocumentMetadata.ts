import { useEffect } from 'react'

export interface DocumentMetadataOptions {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}

export function useDocumentMetadata({
  title,
  description,
  image = 'https://ayeprep.com/logoayePREP.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://ayeprep.com',
  type = 'website'
}: DocumentMetadataOptions) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const setOrCreateMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`)
      const prevContent = el?.getAttribute('content') || null

      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attrName, attrValue)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)

      return () => {
        if (el) {
          if (prevContent !== null) {
            el.setAttribute('content', prevContent)
          } else {
            el.remove()
          }
        }
      }
    }

    const cleanups: (() => void)[] = []

    if (description) {
      cleanups.push(setOrCreateMeta('name', 'description', description))
      cleanups.push(setOrCreateMeta('property', 'og:description', description))
      cleanups.push(setOrCreateMeta('name', 'twitter:description', description))
    }

    cleanups.push(setOrCreateMeta('property', 'og:title', title))
    cleanups.push(setOrCreateMeta('name', 'twitter:title', title))
    cleanups.push(setOrCreateMeta('property', 'og:type', type))
    cleanups.push(setOrCreateMeta('property', 'og:url', url))
    cleanups.push(setOrCreateMeta('property', 'og:image', image))
    cleanups.push(setOrCreateMeta('name', 'twitter:card', 'summary_large_image'))
    cleanups.push(setOrCreateMeta('name', 'twitter:image', image))

    // Canonical URL (évite le contenu dupliqué aux yeux de Google, ex: query strings, trailing slash)
    const prevCanonical = document.querySelector('link[rel="canonical"]')
    const prevCanonicalHref = prevCanonical?.getAttribute('href') || null
    let canonicalEl = prevCanonical
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', url.split('?')[0].split('#')[0])

    return () => {
      document.title = prevTitle
      cleanups.forEach(cleanup => cleanup())
      if (canonicalEl) {
        if (prevCanonicalHref !== null) {
          canonicalEl.setAttribute('href', prevCanonicalHref)
        } else {
          canonicalEl.remove()
        }
      }
    }
  }, [title, description, image, url, type])
}

