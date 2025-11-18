import React from 'react'
import i18n from 'i18next'
import { initReactI18next, useTranslation as useTranslationBase, Trans } from 'react-i18next'
import moment from 'moment'

import enCommon from '../locales/en/common.json'
import esCommon from '../locales/es/common.json'
import enSidebar from '../locales/en/sidebar.json'
import esSidebar from '../locales/es/sidebar.json'

const DEFAULT_LOCALE = 'en'
const LOCALE_STORAGE_KEY = 'trudesk:locale'

const resources = {
  en: {
    common: enCommon,
    sidebar: enSidebar
  },
  es: {
    common: esCommon,
    sidebar: esSidebar
  }
}

const supportedLocales = Object.keys(resources)

const getStoredLocale = () => {
  if (typeof window === 'undefined') return null

  try {
    const persisted = window.localStorage ? window.localStorage.getItem(LOCALE_STORAGE_KEY) : null
    if (persisted && supportedLocales.includes(persisted)) {
      return persisted
    }
  } catch (err) {
    // Ignore storage access issues
  }

  const sessionUserLocale = window?.trudeskSessionService?.getUser?.()?.preferences?.locale
  if (sessionUserLocale && supportedLocales.includes(sessionUserLocale)) {
    return sessionUserLocale
  }

  const browserLocale = window?.navigator?.language?.split?.('-')?.[0]
  if (browserLocale && supportedLocales.includes(browserLocale)) {
    return browserLocale
  }

  return null
}

const initialLocale = getStoredLocale() || DEFAULT_LOCALE

const applyLocaleToDateLibraries = locale => {
  // Import moment locales dynamically based on need
  if (locale === 'es') {
    // Moment includes 'es' locale by default
    moment.locale('es')
  } else {
    moment.locale(locale)
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  }
})

applyLocaleToDateLibraries(initialLocale)

i18n.on('languageChanged', lng => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, lng)
    }
  } catch (err) {
    // Ignore storage errors
  }

  applyLocaleToDateLibraries(lng)
})

export const getAvailableLocales = () => [...supportedLocales]

export const getCurrentLocale = () => i18n.language

export const setLocale = locale => {
  if (!supportedLocales.includes(locale)) {
    return Promise.reject(new Error(`Unsupported locale: ${locale}`))
  }

  return i18n.changeLanguage(locale)
}

export const useTranslation = (...args) => useTranslationBase(...args)

// Export TranslationProvider from TranslationProvider.jsx
export { TranslationProvider, useTranslation as useTranslationCustom } from './TranslationProvider'

// Export Trans component from react-i18next
export { Trans }

// HOC for class components that need translation
export const withTranslation = (namespace = 'common') => Component => {
  return props => {
    const { t, i18n: i18nInstance } = useTranslationBase(namespace)
    return <Component {...props} t={t} i18n={i18nInstance} />
  }
}

export default i18n
