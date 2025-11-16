import React from 'react'
import PropTypes from 'prop-types'
import { SUPPORTED_LANGUAGES, useTranslation } from 'i18n'

const LanguageSelector = ({ className }) => {
  const { locale, changeLanguage, t } = useTranslation()
  const languages = Object.keys(SUPPORTED_LANGUAGES)

  const handleChange = event => {
    changeLanguage(event.target.value)
  }

  return (
    <select
      className={`language-selector-select ${className || ''}`.trim()}
      value={locale}
      onChange={handleChange}
      aria-label={t('language.changeLanguage')}
      title={t('language.changeLanguage')}
    >
      {languages.map(code => (
        <option key={code} value={code}>
          {t(`language.options.${code}`, { defaultValue: code.toUpperCase() })}
        </option>
      ))}
    </select>
  )
}

LanguageSelector.propTypes = {
  className: PropTypes.string
}

export default LanguageSelector
