import { useEffect } from 'react'

export interface DocumentMetadataOptions {
  title: string
  description?: string
}

export function useDocumentMetadata({ title, description }: DocumentMetadataOptions) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    let metaDescription = document.querySelector('meta[name="description"]')
    const prevDescription = metaDescription?.getAttribute('content') || ''

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
    }

    return () => {
      document.title = prevTitle
      if (metaDescription && prevDescription) {
        metaDescription.setAttribute('content', prevDescription)
      }
    }
  }, [title, description])
}
