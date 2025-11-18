import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import en from './locales/en.json'
import es from './locales/es.json'

const STORAGE_KEY = 'helpone.locale'

const resources = {
  en,
  es
}

const TranslationContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: key => key
})

const getNestedValue = (resource, path) => {
  if (!resource || !path) return null
  return path.split('.').reduce((acc, segment) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, segment)) {
      return acc[segment]
    }
    return null
  }, resource)
}

const interpolate = (template, options) => {
  if (typeof template !== 'string') return template
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = options[key]
    if (value === null || value === undefined) return ''
    return String(value)
  })
}

const resolveInitialLocale = () => {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null
    if (stored && resources[stored]) return stored
  } catch (err) {}

  const docLang = typeof document !== 'undefined' && document.documentElement
    ? document.documentElement.getAttribute('lang')
    : null

  if (docLang && resources[docLang]) return docLang

  return 'en'
}

export const TranslationProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => resolveInitialLocale())

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, locale)
      }
    } catch (err) {}
  }, [locale])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleLocaleChange = event => {
      const nextLocale = event && event.detail ? event.detail.locale : null
      if (nextLocale && resources[nextLocale]) {
        setLocale(nextLocale)
      }
    }

    window.addEventListener('helpone:locale-change', handleLocaleChange)
    window.react = window.react || {}
    window.react.setLocale = lang => {
      if (resources[lang]) setLocale(lang)
    }

    return () => {
      window.removeEventListener('helpone:locale-change', handleLocaleChange)
    }
  }, [])

  const translate = useCallback(
    (key, options = {}) => {
      const activeResource = resources[locale] || resources.en
      const fallbackResource = resources.en
      const template =
        getNestedValue(activeResource, key) ??
        getNestedValue(fallbackResource, key) ??
        key

      return interpolate(template, options)
    },
    [locale]
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: translate
    }),
    [locale, translate]
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

TranslationProvider.propTypes = {
  children: PropTypes.node
}

export const useTranslation = () => {
  return useContext(TranslationContext)
}
