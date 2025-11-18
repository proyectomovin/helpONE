import { useMemo } from 'react'
import enTicket from './locales/en/ticket.json'
import esTicket from './locales/es/ticket.json'

const STORAGE_KEY = 'td_locale'
const DEFAULT_LOCALE = 'en'

const resources = {
  en: { ticket: enTicket },
  es: { ticket: esTicket }
}

const normalizeLocale = value => {
  if (!value) return null
  return value.split('-')[0].toLowerCase()
}

const getStoredLocale = () => {
  if (typeof window === 'undefined') return null
  try {
    const persisted = window.localStorage.getItem(STORAGE_KEY)
    return persisted ? normalizeLocale(persisted) : null
  } catch (error) {
    return null
  }
}

const getBrowserLocale = () => {
  if (typeof navigator === 'undefined') return null
  const navLang = normalizeLocale(navigator.language)
  if (navLang && resources[navLang]) return navLang
  return null
}

const getDocumentLocale = () => {
  if (typeof document === 'undefined') return null
  const docLang = normalizeLocale(document.documentElement && document.documentElement.lang)
  if (docLang && resources[docLang]) return docLang
  return null
}

const getNamespaceResources = (locale, namespace) => {
  const bundle = resources[locale] && resources[locale][namespace]
  if (bundle) return bundle
  return (resources[DEFAULT_LOCALE] && resources[DEFAULT_LOCALE][namespace]) || {}
}

const getValueFromPath = (obj, segments) => {
  return segments.reduce((value, segment) => {
    if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
      return value[segment]
    }
    return undefined
  }, obj)
}

const interpolate = (template, options = {}) => {
  if (typeof template !== 'string') return template
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, token) => {
    return Object.prototype.hasOwnProperty.call(options, token) ? options[token] : ''
  })
}

const translate = (locale, namespace, key, options = {}) => {
  const segments = key.split('.')
  const resource = getNamespaceResources(locale, namespace)
  let value = getValueFromPath(resource, segments)

  if (value === undefined) {
    const fallback = getNamespaceResources(DEFAULT_LOCALE, namespace)
    value = getValueFromPath(fallback, segments)
  }

  if (typeof value === 'string') {
    return interpolate(value, options)
  }

  return value !== undefined ? value : options.defaultValue || key
}

const resolveLocale = () => {
  return getStoredLocale() || getDocumentLocale() || getBrowserLocale() || DEFAULT_LOCALE
}

export const useTranslation = (namespace = 'ticket') => {
  const locale = resolveLocale()
  const translator = useMemo(() => {
    return (key, options) => translate(locale, namespace, key, options)
  }, [locale, namespace])

  return { t: translator, locale }
}
