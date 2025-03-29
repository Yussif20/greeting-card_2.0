// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      visit_website: 'Visit Our Website',
      select_card: 'Select a Card by Clicking',
      enter_name: 'Enter your name here',
      choose_color: 'Choose Name Color:',
      save_high_quality: 'Save in High Quality (300 DPI)',
      save_card: 'Save Card',
      select_card_alert: 'Please select a card first!',
      copyright: '© 2025 All rights reserved.', // Added English footer text
      high_res_error: 'Failed to save high-resolution image. Try normal resolution or a smaller image.',
      "guide_name": "Enter your name here",
      "guide_color": "Pick a text color",
      "guide_font": "Choose a font style",
      "guide_font_style": "Select text style",
      "guide_font_size": "Set text size",
      "guide_high_res": "Save in high quality",
      "normal": "Normal",
      "bold": "Bold",
      "italic": "Italic",
      "share_card": "Share",
      "share_title": "My Custom Card",
      "share_text": "Check out this card I created!",
      "share_fallback": "Sharing not supported. Image downloaded—please share it manually.",
      "share_error": "Failed to share image. Please download and share manually."
    },
  },
  ar: {
    translation: {
      visit_website: 'زوروا موقعنا الإلكتروني',
      select_card: 'اختر احدى الصور بالضغط عليها',
      enter_name: 'اكتب اسمك هنا',
      choose_color: 'اختر لون الاسم:',
      save_high_quality: 'حفظ بجودة عالية (300 DPI)',
      save_card: 'حفظ البطاقة',
      select_card_alert: 'اختار بطاقة أولًا!',
      copyright: '© 2025 جميع الحقوق محفوظة', // Added Arabic footer text
      high_res_error: 'فشل حفظ الصورة عالية الدقة. جرب الدقة العادية أو صورة أصغر.',
      "guide_name": "أدخل اسمك هنا",
      "guide_color": "اختر لون النص",
      "guide_font": "اختر نمط الخط",
      "guide_font_style": "حدد أسلوب النص",
      "guide_font_size": "حدد حجم النص",
      "guide_high_res": "حفظ بجودة عالية",
      "normal": "عادي",
      "bold": "غامق",
      "italic": "مائل",
      "share_card": "مشاركة",
      "share_title": "بطاقتي المخصصة",
      "share_text": "شاهد هذه البطاقة التي أنشأتها!",
      "share_fallback": "المشاركة غير مدعومة. تم تنزيل الصورة—يرجى مشاركتها يدويًا.",
      "share_error": "فشل في مشاركة الصورة. يرجى تنزيلها ومشاركتها يدويًا."
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language remains English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;