import es from '@/i18n/es.json'
import en from '@/i18n/en.json'

export type Locale = 'es' | 'en'


export type FlatDictionary = Record<string, string>;

/** Mapa de diccionarios por locale */
const dictionaries: Record<Locale, FlatDictionary> = {
  es: es as FlatDictionary,
  en: en as FlatDictionary,
};

/** Devuelve el diccionario plano del idioma solicitado */
export function getDictionary(locale: Locale): FlatDictionary {
  return dictionaries[locale];
}

export function getTranslationByKey(
  dictionary: FlatDictionary,
  key: string,
  fallbackText?: string
): string {
  return dictionary[key] ?? fallbackText ?? key;
}