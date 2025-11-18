import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import enSidebar from '../locales/en/sidebar.json'
import esSidebar from '../locales/es/sidebar.json'

const resources = {
  en: {
    sidebar: enSidebar
  },
  es: {
    sidebar: esSidebar
  }
}

export const SUPPORTED_LOCALES = Object.keys(resources)

const getValueFromTree = (tree, segments) =>
  segments.reduce((acc, segment) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, segment)) {
      return acc[segment]
    }

    return undefined
  }, tree)

const safeLocalStorageGet = key => {
  if (typeof window === 'undefined' || !window.localStorage) return null

  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    return null
  }
}

const safeLocalStorageSet = (key, value) => {
  if (typeof window === 'undefined' || !window.localStorage) return

  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    // ignore storage failures
  }
}

const detectLocale = () => {
  if (typeof window === 'undefined') return 'en'

  const storedLocale = safeLocalStorageGet('td.locale')
  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale)) {
    return storedLocale
  }

  const htmlLocale = document?.documentElement?.getAttribute('lang')
  if (htmlLocale && SUPPORTED_LOCALES.includes(htmlLocale)) {
    return htmlLocale
  }

  const navigatorLocale = window.navigator?.language?.split('-')[0]
  if (navigatorLocale && SUPPORTED_LOCALES.includes(navigatorLocale)) {
    return navigatorLocale
  }

  return 'en'
}

const TranslationContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: key => key
})

TranslationContext.displayName = 'TranslationContext'

export const TranslationProvider = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState(initialLocale || detectLocale())

  const changeLocale = useCallback(
    nextLocale => {
      if (!nextLocale || !SUPPORTED_LOCALES.includes(nextLocale)) return

      setLocaleState(nextLocale)
      safeLocalStorageSet('td.locale', nextLocale)

      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('lang', nextLocale)
      }
    },
    []
  )

  const translate = useCallback(
    key => {
      if (!key) return ''

      const path = key.split('.')
      const languageResources = resources[locale] || resources.en
      const fallbackResources = resources.en

      const value = getValueFromTree(languageResources, path)
      if (value !== undefined) {
        return value
      }

      const fallbackValue = getValueFromTree(fallbackResources, path)
      return fallbackValue !== undefined ? fallbackValue : key
    },
    [locale]
  )

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale: changeLocale,
      t: translate
    }),
    [locale, changeLocale, translate]
  )

  return <TranslationContext.Provider value={contextValue}>{children}</TranslationContext.Provider>
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  return { t: context.t, locale: context.locale, setLocale: context.setLocale }
}

export const withTranslation = (namespace = null) => WrappedComponent => {
  const ComponentWithTranslation = props => {
    const translationProps = useTranslation()
    return <WrappedComponent {...props} {...translationProps} />
  }

  const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component'
  const namespaceLabel = namespace ? `${namespace}:` : ''
  ComponentWithTranslation.displayName = `withTranslation(${namespaceLabel}${wrappedName})`

  return ComponentWithTranslation
}
