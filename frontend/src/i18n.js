import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import bn from './locales/bn.json';
import en from './locales/en.json';
import hi from './locales/hi.json';

const resources = {
	en: { translation: en },
	hi: { translation: hi },
	bn: { translation: bn }
};

i18n.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false
		},
		detection: {
			order: ['localStorage', 'navigator'],
			caches: ['localStorage']
		}
	});

export default i18n;
