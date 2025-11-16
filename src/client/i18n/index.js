/*
 * Internationalization context
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import Cookies from 'jscookie'

import en from './en.json'
import es from './es.json'

const LANGUAGE_COOKIE = 'trudesk_locale'
const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LANGUAGES = {
  en,
  es
}

let currentDictionary = SUPPORTED_LANGUAGES[DEFAULT_LOCALE]
let currentLocale = DEFAULT_LOCALE

const applyReplacements = (text, values) => {
  if (!values) return text
  return text.replace(/\{(.*?)\}/g, (match, token) => {
    if (Object.prototype.hasOwnProperty.call(values, token)) {
      return values[token]
    }
    return match
  })
}

const translateKey = (key, options = {}, dictionary = currentDictionary) => {
  if (!key) return ''
  const segments = key.split('.')
  let value = segments.reduce((acc, segment) => {
    if (acc && typeof acc === 'object' && Object.prototype.hasOwnProperty.call(acc, segment)) {
      return acc[segment]
    }
    return undefined
  }, dictionary)

  if (typeof value === 'string') {
    return applyReplacements(value, options.values)
  }

  if (typeof value === 'number') return value

  if (typeof options.defaultValue !== 'undefined') return options.defaultValue

  return key
}

const noop = () => {}

export const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  changeLanguage: noop,
  t: (key, options) => translateKey(key, options, SUPPORTED_LANGUAGES[DEFAULT_LOCALE])
})

const isBrowser = typeof document !== 'undefined'

const safeCookie = {
  get: key => {
    if (!isBrowser) return undefined
    return Cookies.get(key)
  },
  set: (key, value) => {
    if (!isBrowser) return
    Cookies.set(key, value, { expires: 365 })
  }
}

const normalizeLocale = locale => {
  if (!locale || typeof locale !== 'string') return undefined
  return locale.toLowerCase().split('-')[0]
}

const getSupportedLocale = locale => {
  const normalized = normalizeLocale(locale)
  if (normalized && SUPPORTED_LANGUAGES[normalized]) return normalized
  return undefined
}

const getViewdataLocale = viewdata => {
  if (!viewdata) return undefined
  if (typeof viewdata.get === 'function') return viewdata.get('locale')
  return viewdata.locale
}

const resolveLocalePreference = (sessionUser, viewdata) => {
  return (
    getSupportedLocale(safeCookie.get(LANGUAGE_COOKIE)) ||
    getSupportedLocale(sessionUser && sessionUser.preferences && sessionUser.preferences.language) ||
    getSupportedLocale(sessionUser && sessionUser.language) ||
    getSupportedLocale(getViewdataLocale(viewdata)) ||
    getSupportedLocale(typeof navigator !== 'undefined' ? navigator.language : undefined) ||
    DEFAULT_LOCALE
  )
}

export const LanguageProvider = ({ children }) => {
  const sessionUser = useSelector(state => state.shared.sessionUser)
  const viewdata = useSelector(state => state.common.viewdata)

  const [locale, setLocale] = useState(() => resolveLocalePreference(sessionUser, viewdata))

  useEffect(() => {
    setLocale(resolveLocalePreference(sessionUser, viewdata))
  }, [sessionUser, viewdata])

  useEffect(() => {
    safeCookie.set(LANGUAGE_COOKIE, locale)
    currentLocale = locale
    currentDictionary = SUPPORTED_LANGUAGES[locale] || SUPPORTED_LANGUAGES[DEFAULT_LOCALE]
  }, [locale])

  const changeLanguage = useCallback(
    nextLocale => {
      const supported = getSupportedLocale(nextLocale) || DEFAULT_LOCALE
      setLocale(supported)
    },
    [setLocale]
  )

  const contextValue = useMemo(() => {
    return {
      locale,
      changeLanguage,
      t: (key, options) => translateKey(key, options, SUPPORTED_LANGUAGES[locale] || currentDictionary)
    }
  }, [locale, changeLanguage])

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

LanguageProvider.propTypes = {
  children: PropTypes.node
}

export const useTranslation = () => {
  const context = useContext(LanguageContext)
  return context
}

export const t = (key, options) => translateKey(key, options, currentDictionary)

export const getCurrentLocale = () => currentLocale

export default LanguageProvider
