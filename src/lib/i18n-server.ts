type Locale = 'es' | 'en';

import serverEs from './locales/server-es.json';
import serverEn from './locales/server-en.json';

// Tipos para los diccionarios (formato plano)
type ServerDictionary = Record<string, string>;

const serverDictionaries: Record<Locale, ServerDictionary> = {
  es: serverEs,
  en: serverEn
};

export function getServerDictionary(locale: Locale = 'es'): ServerDictionary {
  return serverDictionaries[locale];
}

export function translateServer(key: string, locale: Locale = 'es', fallback?: string): string {
  const dict = getServerDictionary(locale);
  return dict[key] || fallback || key;
}

export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get('accept-language');
  if (acceptLanguage?.includes('en')) return 'en';
  return 'es';
}

export function getServerMessages(locale: Locale = 'es') {
  const dict = getServerDictionary(locale);
  return {
    tripNotFound: dict['errors.trip.notFound'],
    tripCreateError: dict['errors.trip.create'],
    tripUpdateError: dict['errors.trip.update'],
    tripUnknownError: dict['errors.trip.unknown'],
    tripValidationError: dict['errors.trip.validation'],
    tripInvalidDates: dict['errors.trip.invalidDates'],
    genericError: dict['errors.generic'],
    validationError: dict['errors.validation'],
    tripCreated: dict['success.trip.created'],
    tripUpdated: dict['success.trip.updated']
  };
}