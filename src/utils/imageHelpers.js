// Utility helpers for working with image payloads from the backend

/**
 * Extracts a thumbnail data URL from an array of image payloads.
 * Accepts either plain base64 strings or objects containing file/data/imagen/base64.
 *
 * @param {Array<any>} images
 * @returns {string|null} data URL for the first image or null if not available
 */
export function extractThumbnailUrl(images) {
  if (!Array.isArray(images) || images.length === 0) return null

  const first = images[0]
  let base64 = null

  if (typeof first === 'string') {
    base64 = first
  } else if (first && typeof first === 'object') {
    base64 = first.file || first.data || first.imagen || first.base64 || null
  }

  if (!base64) return null

  const cleanBase64 = base64.toString()
    .replace(/\s/g, '')
    .replace(/^data:image\/[a-z]+;base64,/, '')

  return `data:image/png;base64,${cleanBase64}`
}
