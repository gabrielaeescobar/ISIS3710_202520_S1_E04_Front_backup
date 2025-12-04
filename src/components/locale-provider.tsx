'use client';

import {createContext, useContext, useMemo, useState, useEffect } from "react";
import {getDictionary, getTranslationByKey, type Locale, type FlatDictionary} from '@/lib/i18n'

type LocaleContextValue = {
  currentLocale: Locale;
  setCurrentLocale: (newLocale: Locale) => void;
  translate: (key: string, fallbackText?: string) => string;
};
const LocaleContext = createContext<LocaleContextValue | null>(null); 

export function LocaleProvider({children}:{children:React.ReactNode}){ 
    const[currentLocale, setCurrentLocale] = useState<Locale>('es');

    useEffect(()=>{
        const savedLocale = window.localStorage.getItem('locale') as Locale | null;
        if (savedLocale == 'en'|| savedLocale =='es'){
            setCurrentLocale(savedLocale) 
        }
    }, []);

    useEffect(()=>{
        window.localStorage.setItem('locale',currentLocale); 
        document.documentElement.lang = currentLocale;
    }, [currentLocale]);

const currentDictionary: FlatDictionary = useMemo(
    () => getDictionary(currentLocale),
    [currentLocale]
  );

  const contextValue: LocaleContextValue = useMemo(
    () => ({
      currentLocale,
      setCurrentLocale,
      translate: (key, fallbackText) =>
        getTranslationByKey(currentDictionary, key, fallbackText),
    }),
    [currentLocale, currentDictionary]
  );

    
  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside <LocaleProvider/>');
  }
  return context;
}
