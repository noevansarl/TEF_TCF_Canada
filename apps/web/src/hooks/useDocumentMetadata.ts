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

    return () => {
      document.title = prevTitle
      cleanups.forEach(cleanup => cleanup())
    }
  }, [title, description, image, url, type])
}

