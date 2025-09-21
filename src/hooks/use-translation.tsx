
'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSettings } from './use-settings';
import { translations } from '@/lib/i18n/all';
import type { Locale } from '@/lib/types';

type TranslationFunction = (key: keyof (typeof translations)['en'], options?: any) => string;

interface TranslationContextType {
  t: TranslationFunction;
  locale: Locale;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const locale = settings.locale || 'en';

  const t = useMemo((): TranslationFunction => (key, options) => {
    let text = translations[locale]?.[key as keyof typeof translations.bn] || translations['en'][key];
    if (options) {
      Object.keys(options).forEach(k => {
        const regex = new RegExp(`{{${k}}}`, 'g');
        text = text.replace(regex, options[k]);
      });
    }
    return text;
  }, [locale]);
  
  const value = useMemo(() => ({ t, locale }), [t, locale]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
