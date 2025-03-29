// src/components/Footer.jsx
import logoWhite from '../assets/logo-white.svg';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer
      className="py-6 w-full h-[60px] bg-[#243e87] text-white flex flex-col items-center justify-center px-6"
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} // Dynamic text direction
    >
      {/* Logo */}
      <div className="mb-2">
        <img className="h-6 w-auto max-w-[100px]" src={logoWhite} alt="logo" />
      </div>
      {/* Copyright Text */}
      <p className="text-xs sm:text-sm text-center">{t('copyright')}</p>
    </footer>
  );
};

export default Footer;
