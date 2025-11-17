const i18n = require('./src/i18n')

console.log('=== DEBUG I18N ===')
console.log('Default locale:', i18n.defaultLocale)
console.log('Fallback locale:', i18n.fallbackLocale)

// Simular una request con locale español
const mockRequest = {
  cookies: { locale: 'es' },
  headers: { 'accept-language': 'es-ES,es;q=0.9' }
}

const localeFromRequest = i18n.getLocaleFromRequest(mockRequest)
console.log('Locale from request:', localeFromRequest)

const translations = i18n.getTranslations(localeFromRequest)
console.log('Translations keys:', Object.keys(translations))
console.log('Sidebar translations:', translations.sidebar)

const fallbackTranslations = i18n.getTranslations(i18n.fallbackLocale)
console.log('Fallback translations keys:', Object.keys(fallbackTranslations))
console.log('Fallback sidebar translations:', fallbackTranslations.sidebar)