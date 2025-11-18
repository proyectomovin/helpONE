import { useCallback, useMemo } from 'react'

import en from './locales/en.json'
import es from './locales/es.json'

const resources = { en, es }

const getValueFromKey = (resource, key) => {
  return key.split('.').reduce((acc, segment) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, segment)) {
      return acc[segment]
    }
    return null
  }, resource)
}

const formatMessage = (message, variables = {}) => {
  if (typeof message !== 'string') return message || ''

  return message.replace(/\{([^}]+)\}/g, (match, variable) => {
    if (Object.prototype.hasOwnProperty.call(variables, variable)) {
      return variables[variable]
    }

    return match
  })
}

const detectLocale = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedLocale = window.localStorage && window.localStorage.getItem('helpone_locale')
      if (storedLocale) return storedLocale
    } catch (e) {
      // Ignore access issues
    }

    if (window.__LOCALE__) return window.__LOCALE__
    if (window.navigator && window.navigator.language) return window.navigator.language
  }

  if (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) {
    return document.documentElement.lang
  }

  return 'en'
}

const normalizeLocale = locale => {
  if (!locale) return 'en'
  const normalized = locale.toLowerCase()
  if (normalized.startsWith('es')) return 'es'
  return 'en'
}

export const useTranslation = () => {
  const locale = useMemo(() => normalizeLocale(detectLocale()), [])
  const dictionary = useMemo(() => resources[locale] || resources.en, [locale])

  const t = useCallback(
    (key, variables = {}) => {
      const template = getValueFromKey(dictionary, key)
      if (!template) return key
      return formatMessage(template, variables)
    },
    [dictionary]
  )

  return { t, locale }
}

export default useTranslation
