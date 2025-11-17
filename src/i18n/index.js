const translations = {
  en: require('./en.json'),
  es: require('./es.json')
}

const defaultLocale = 'es'
const fallbackLocale = 'en'

const normalizeLocale = locale => {
  if (!locale || typeof locale !== 'string') return defaultLocale
  return locale.toLowerCase().split('-')[0]
}

const getTranslations = locale => {
  const normalized = normalizeLocale(locale)
  return translations[normalized] || translations[defaultLocale] || translations[fallbackLocale]
}

const getLocaleFromRequest = req => {
  if (!req) return defaultLocale
  const potentialLocales = []

  if (req.cookies && req.cookies.locale) potentialLocales.push(req.cookies.locale)

  if (typeof req.acceptsLanguages === 'function') {
    const accepted = req.acceptsLanguages()
    if (Array.isArray(accepted)) potentialLocales.push(...accepted)
  }

  if (req.headers && req.headers['accept-language']) {
    potentialLocales.push(req.headers['accept-language'])
  }

  potentialLocales.push(defaultLocale)

  for (const locale of potentialLocales) {
    const normalized = normalizeLocale(locale)
    if (translations[normalized]) return normalized
  }

  return defaultLocale
}

module.exports = {
  defaultLocale,
  fallbackLocale,
  getTranslations,
  getLocaleFromRequest,
  translations
}
