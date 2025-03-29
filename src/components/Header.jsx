// src/components/Header.jsx
import logo from '../assets/logo.svg';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState('en'); // Default to English

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    i18n.changeLanguage(newLang); // Switch language in i18next
  };

  return (
    <header
      className="bg-gray-200 w-full border-b border-gray-300 shadow-lg px-4 sm:px-10 lg:px-20 py-6 sm:py-10"
      dir={language === 'ar' ? 'rtl' : 'ltr'} // Dynamic text direction
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div>
          <img
            className="h-8 sm:h-10 w-auto max-w-[200px] sm:max-w-[250px]"
            src={logo}
            alt="logo"
          />
        </div>

        {/* Language Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">AR</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={language === 'en'}
              onChange={toggleLanguage}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#ee2e3a] transition-colors duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">EN</span>
        </div>

        {/* Visit Website Button */}
        <a
          href="https://www.redahazardcontrol.com/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-[#ee2e3a] text-white font-semibold rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:bg-[#ee2e3a]/80 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 bounce-slow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span className="text-xs sm:text-sm md:text-base">
            {t('visit_website')}
          </span>
        </a>
      </div>
    </header>
  );
};

export default Header;
