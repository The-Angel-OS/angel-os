import Script from 'next/script'
import React from 'react'

import { defaultTheme, themeLocalStorageKey } from '../shared'

export const InitTheme: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  (function () {
    // Apply critical styles immediately to prevent flash
    var criticalStyles = {
      dark: {
        backgroundColor: 'hsl(222.2 84% 4.9%)',
        color: 'hsl(210 40% 98%)'
      },
      light: {
        backgroundColor: 'hsl(0 0% 100%)',
        color: 'hsl(222.2 84% 4.9%)'
      }
    };

    function getImplicitPreference() {
      var mediaQuery = '(prefers-color-scheme: dark)'
      var mql = window.matchMedia(mediaQuery)
      var hasImplicitPreference = typeof mql.matches === 'boolean'

      if (hasImplicitPreference) {
        return mql.matches ? 'dark' : 'light'
      }

      return null
    }

    function themeIsValid(theme) {
      return theme === 'light' || theme === 'dark'
    }

    var themeToSet = '${defaultTheme}'
    var preference = window.localStorage.getItem('${themeLocalStorageKey}')

    if (themeIsValid(preference)) {
      themeToSet = preference
    } else {
      var implicitPreference = getImplicitPreference()

      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }

    // Apply critical styles immediately
    var styles = criticalStyles[themeToSet] || criticalStyles.light;
    document.documentElement.style.backgroundColor = styles.backgroundColor;
    document.documentElement.style.color = styles.color;

    document.documentElement.setAttribute('data-theme', themeToSet)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(themeToSet)
  })();
  `,
      }}
      id="theme-script"
      strategy="beforeInteractive"
    />
  )
}
