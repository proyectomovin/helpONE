const getNestedValue = (source, path) => {
  if (!source || !path) return undefined
  return path.split('.').reduce((acc, segment) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, segment)) {
      return acc[segment]
    }

    return undefined
  }, source)
}

export const getCurrentLocale = () => {
  if (typeof window === 'undefined') return 'en'
  if (!window.__i18n || !window.__i18n.locale) return 'en'
  return window.__i18n.locale
}

const getTranslations = () => {
  if (typeof window === 'undefined') return {}
  if (!window.__i18n || !window.__i18n.translations) return {}
  return window.__i18n.translations
}

const getFallbackTranslations = () => {
  if (typeof window === 'undefined') return {}
  if (!window.__i18n || !window.__i18n.fallback) return {}
  return window.__i18n.fallback
}

const interpolate = (value, params = {}) => {
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, token) => {
    return Object.prototype.hasOwnProperty.call(params, token) ? params[token] : match
  })
}

const t = (key, params = {}) => {
  if (!key) return ''
  const translations = getTranslations()
  const fallback = getFallbackTranslations()
  const result = getNestedValue(translations, key) ?? getNestedValue(fallback, key)

  if (typeof result === 'string') {
    return interpolate(result, params)
  }

  return result || key
}

export default t
export { getTranslations, getFallbackTranslations }
