import { useState, useRef, useEffect } from 'react';
import { imageCategories } from '../data';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';

const CardSelector = () => {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [name, setName] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [namePosition, setNamePosition] = useState({ x: 200, y: 356 });
  const [photoPosition, setPhotoPosition] = useState({ x: 200, y: 356 });
  const [font, setFont] = useState('Cairo');
  const [fontStyle, setFontStyle] = useState('normal');
  const [activeTab, setActiveTab] = useState('RHC');
  const [fontSize, setFontSize] = useState(40);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [positionForName, setPositionForName] = useState(true);
  const canvasRef = useRef(null);
  const tabRefs = useRef([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: '0px' });

  useEffect(() => {
    const loadFonts = async () => {
      const fontPromises = [
        'Cairo',
        'Tajawal',
        'Amiri',
        'Noto Naskh Arabic',
        'Scheherazade',
        'Lateef',
        'Arial',
        'Roboto',
        'Lora',
        'Playfair Display',
      ].map((fontName) => {
        const font = new FontFace(
          fontName,
          `url(https://fonts.googleapis.com/css2?family=${fontName.replace(
            ' ',
            '+'
          )}:wght@400;700&display=swap)`
        );
        return font
          .load()
          .then(() => document.fonts.add(font))
          .catch((err) =>
            console.warn(`Font ${fontName} failed to load:`, err)
          );
      });

      await Promise.all(fontPromises);
      setFontsLoaded(true);
      debouncedDrawPreview();
    };

    loadFonts();
  }, []);

  const handleTabChange = (tab) => setActiveTab(tab);

  const getUnderlinePosition = () => {
    const index = Object.keys(imageCategories).indexOf(activeTab);
    const tab = tabRefs.current[index];
    if (tab) {
      const tabWidth = tab.offsetWidth;
      const tabLeft = tab.offsetLeft;
      const isRTL = i18n.dir() === 'rtl';
      const container = tab.parentElement;
      const containerWidth = container.offsetWidth;

      if (isRTL) {
        const rightEdge = containerWidth - (tabLeft + tabWidth);
        const underlineRight = rightEdge + (tabWidth - 60) / 2;
        return { right: `${underlineRight}px`, left: 'auto' };
      } else {
        const underlineLeft = tabLeft + (tabWidth - 60) / 2;
        return { left: `${underlineLeft}px`, right: 'auto' };
      }
    }
    return { left: '0px', right: 'auto' };
  };

  useEffect(() => {
    const updatePosition = () => setUnderlineStyle(getUnderlinePosition());
    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    tabRefs.current.forEach((tab) => tab && resizeObserver.observe(tab));
    return () => resizeObserver.disconnect();
  }, [activeTab, i18n.language]);

  const selectCard = (imgSrc) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      setSelectedImage(img);
      const centerX = img.width / 2;
      const centerY = img.height / 2;
      setNamePosition({ x: centerX + 100, y: centerY });
      setPhotoPosition({ x: centerX - 100, y: centerY });
    };
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        setUploadedPhoto(img);
        debouncedDrawPreview();
      };
    }
  };

  const drawPreview = () => {
    if (!selectedImage || !canvasRef.current || !fontsLoaded) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const originalWidth = selectedImage.width;
    const originalHeight = selectedImage.height;

    canvas.width = originalWidth;
    canvas.height = originalHeight;

    const containerWidth = canvas.parentElement.clientWidth;
    const previewWidth = Math.min(originalWidth, containerWidth * 0.9);
    const previewScale = previewWidth / originalWidth;
    canvas.style.width = `${previewWidth}px`;
    canvas.style.height = `${originalHeight * previewScale}px`;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(selectedImage, 0, 0, canvas.width, canvas.height);

    const baseFontSize = Math.min(originalWidth, originalHeight) * 0.25;
    const adjustedFontSize = fontSize || baseFontSize;
    const extraFontSize = adjustedFontSize * 0.7;

    const nameFontString = `${fontStyle === 'bold' ? 'bold ' : ''}${
      fontStyle === 'italic' ? 'italic ' : ''
    }${adjustedFontSize}px "${font}"`;
    const extraFontString = `${fontStyle === 'bold' ? 'bold ' : ''}${
      fontStyle === 'italic' ? 'italic ' : ''
    }${extraFontSize}px "${font}"`;

    const text = name || t('enter_name');
    const extraText = extraInfo || '';
    const textWidth = ctx.measureText(text).width;
    const extraWidth = ctx.measureText(extraText).width;
    const textBlockWidth = Math.max(textWidth, extraWidth);
    const isRTL = i18n.dir() === 'rtl';

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (uploadedPhoto) {
      const photoSize = adjustedFontSize * 2.0;
      const minGap = 60;
      const baseGap = isRTL ? adjustedFontSize * 0.6 : adjustedFontSize * 0.5;
      const gap = Math.max(baseGap, minGap);

      const photoX = photoPosition.x - photoSize / 2;
      const textX = namePosition.x;

      const photoRight = photoX + photoSize;
      const textLeft = textX - textBlockWidth / 2;
      if (photoRight + gap > textLeft) {
        setNamePosition({
          ...namePosition,
          x: photoRight + gap + textBlockWidth / 2,
        });
        return debouncedDrawPreview();
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        photoX + photoSize / 2,
        photoPosition.y,
        photoSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        uploadedPhoto,
        photoX,
        photoPosition.y - photoSize / 2,
        photoSize,
        photoSize
      );
      ctx.restore();

      const nameY = extraText
        ? namePosition.y - (isRTL ? extraFontSize + 2 : extraFontSize / 2 + 2)
        : namePosition.y;
      const extraY = extraText
        ? namePosition.y + (isRTL ? extraFontSize + 2 : extraFontSize / 2 + 2)
        : null;

      ctx.font = nameFontString;
      ctx.fillText(text, textX, nameY);

      if (extraText) {
        ctx.font = extraFontString;
        ctx.fillText(extraText, textX, extraY);
      }
    } else {
      const nameY = extraText
        ? namePosition.y - (isRTL ? extraFontSize + 2 : extraFontSize / 2 + 2)
        : namePosition.y;
      const extraY = extraText
        ? namePosition.y + (isRTL ? extraFontSize + 2 : extraFontSize / 2 + 2)
        : null;

      ctx.font = nameFontString;
      ctx.fillText(text, namePosition.x, nameY);

      if (extraText) {
        ctx.font = extraFontString;
        ctx.fillText(extraText, namePosition.x, extraY);
      }
    }
  };

  const debouncedDrawPreview = debounce(drawPreview, 100);

  const handleCanvasClick = (e) => {
    if (!selectedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const previewWidth = parseFloat(canvas.style.width);
    const previewHeight = parseFloat(canvas.style.height);
    const scaleX = selectedImage.width / previewWidth;
    const scaleY = selectedImage.height / previewHeight;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (positionForName) {
      setNamePosition({ x, y });
    } else {
      setPhotoPosition({ x, y });
    }
    debouncedDrawPreview();
  };

  const downloadCard = () => {
    if (!selectedImage) {
      alert(t('select_card_alert'));
      return;
    }
    try {
      drawPreview();
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png', 0.7);
      if (!dataUrl || dataUrl === 'data:,')
        throw new Error('Canvas failed to generate image data');
      const link = document.createElement('a');
      link.download = 'card.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert(t('download_error') || 'Failed to save image. Try again.');
    }
  };

  const shareCard = async () => {
    if (!selectedImage) {
      alert(t('select_card_alert'));
      return;
    }
    try {
      drawPreview();
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png', 0.7);
      if (!dataUrl || dataUrl === 'data:,')
        throw new Error('Canvas failed to generate image data');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'card.png', { type: 'image/png' });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: t('share_title'),
          text: t('share_text'),
        });
      } else {
        const link = document.createElement('a');
        link.download = file.name;
        link.href = dataUrl;
        link.click();
        alert(t('share_fallback'));
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      alert(
        t('share_error') ||
          'Failed to share image. Please download and share manually.'
      );
    }
  };

  useEffect(() => {
    if (!selectedImage || !fontsLoaded) return;
    debouncedDrawPreview();
    const handleResize = () => debouncedDrawPreview();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedDrawPreview.cancel();
    };
  }, [
    selectedImage,
    name,
    extraInfo,
    color,
    namePosition,
    photoPosition,
    font,
    fontStyle,
    fontSize,
    i18n.language,
    fontsLoaded,
    uploadedPhoto,
  ]);

  const whatsappCards = imageCategories[activeTab]?.filter(
    (_, index) => index % 2 === 0
  );
  const linkedinCards = imageCategories[activeTab]?.filter(
    (_, index) => index % 2 !== 0
  );

  return (
    <div
      className="min-h-screen bg-gray-200 flex flex-col items-center py-4 sm:py-8 overflow-hidden"
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
    >
      <h1 className="text-xl sm:text-2xl font-bold text-[#243e87] mb-4 fade-in">
        (1) {t('select_card')}
      </h1>

      <div className="flex flex-col lg:flex-row flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-0">
        <div className="w-full lg:w-1/2 p-4 overflow-y-auto flex flex-col items-center gap-4">
          {/* Tabs */}
          <div className="w-full max-w-md mx-auto py-1 px-1 flex items-center justify-between mb-6 bg-[#F6F8FA] text-black text-sm font-medium leading-5 rounded-lg relative overflow-x-auto">
            {Object.keys(imageCategories).map((category, index) => (
              <button
                key={category}
                ref={(el) => (tabRefs.current[index] = el)}
                className={`border-none transition-all duration-300 cursor-pointer text-[#4e4e4e] rounded-[6px] py-1 px-4 hover:bg-white hover:text-black hover:shadow-2xl whitespace-nowrap ${
                  activeTab === category
                    ? 'bg-white text-black shadow-2xl scale-105'
                    : 'bg-transparent'
                }`}
                onClick={() => handleTabChange(category)}
              >
                {category}
              </button>
            ))}
            <span
              className="absolute bottom-0 h-1 bg-[#ee2e3a] transition-all duration-300"
              style={{ width: '60px', ...underlineStyle }}
            />
          </div>
          {/* Cards Section */}
          <div className="w-full flex flex-col gap-6 py-6">
            <div>
              <h2 className="text-lg font-semibold text-[#243e87] mb-4">
                {i18n.language === 'ar' ? 'قصة واتساب' : 'WhatsApp Story'}
              </h2>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                {whatsappCards?.map((src, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer w-40 h-64 sm:w-48 sm:h-80"
                    onClick={() => selectCard(src)}
                  >
                    <img
                      src={src}
                      alt={`WhatsApp Card ${index + 1}`}
                      className="w-full h-full object-contain rounded-t-lg group-hover:opacity-90 transition-opacity duration-200"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#243e87] mb-4">
                {i18n.language === 'ar' ? 'منشور لينكدإن' : 'LinkedIn Post'}
              </h2>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                {linkedinCards?.map((src, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer w-40 h-64 sm:w-48 sm:h-80"
                    onClick={() => selectCard(src)}
                  >
                    <img
                      src={src}
                      alt={`LinkedIn Card ${index + 1}`}
                      className="w-full h-full object-contain rounded-t-lg group-hover:opacity-90 transition-opacity duration-200"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="w-full max-w-md flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#243e87] font-medium">
                (2) {t('guide_name')}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('enter_name')}
                className="p-2 w-full bg-white border border-gray-300 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#243e87] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#243e87] font-medium">
                {t('guide_extra_info') || 'Extra Info'}
              </span>
              <input
                type="text"
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder={t('enter_extra_info')}
                className="p-2 w-full bg-white border border-gray-300 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#243e87] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#243e87] font-medium">
                {t('guide_photo') || 'Upload Photo'}
              </span>
              <label className="relative block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="p-2 w-full bg-white border border-gray-300 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#243e87] opacity-0 absolute"
                />
                <div className="p-2 w-full bg-white border border-gray-300 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.1)] text-gray-500 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                  {uploadedPhoto ? t('photo_uploaded') : t('choose_photo')}
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#243e87] font-medium">
                {t('guide_color')}
              </span>
              <input
                type="color"
                id="colorPicker"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 bg-transparent border-none cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#243e87] font-medium">
                {t('guide_font')}
              </span>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="p-1 w-full sm:w-32 bg-white border border-gray-300 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#243e87]"
              >
                <option value="Cairo">Cairo</option>
                <option value="Tajawal">Tajawal</option>
                <option value="Amiri">Amiri</option>
                <option value="Noto Naskh Arabic">Noto Naskh Arabic</option>
                <option value="Scheherazade">Scheherazade</option>
                <option value="Lateef">Lateef</option>
                <option value="Arial">Arial</option>
                <option value="Roboto">Roboto</option>
                <option value="Lora">Lora</option>
                <option value="Playfair Display">Playfair Display</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#243e87] font-medium">
                {t('guide_font_style')}
              </span>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="p-1 w-full sm:w-32 bg-white border border-gray-300 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#243e87]"
              >
                <option value="normal">{t('normal')}</option>
                <option value="bold">{t('bold')}</option>
                <option value="italic">{t('italic')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#243e87] font-medium">
                {t('guide_font_size')}
              </span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="p-1 w-full sm:w-32 bg-white border border-gray-300 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#243e87]"
              >
                <option value="20">20px</option>
                <option value="24">24px</option>
                <option value="28">28px</option>
                <option value="32">32px</option>
                <option value="36">36px</option>
                <option value="40">40px</option>
                <option value="60">60px</option>
                <option value="80">80px</option>
                <option value="100">100px</option>
                <option value="120">120px</option>
                <option value="150">150px</option>
                <option value="200">200px</option>
                <option value="250">250px</option>
                <option value="300">300px</option>
              </select>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-4 flex flex-col items-center justify-center gap-4">
          {/* Toggle Switch */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-[#243e87] font-medium">
              {positionForName ? t('name') || 'Name' : t('photo') || 'Photo'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!positionForName}
                onChange={() => setPositionForName(!positionForName)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#243e87] transition-colors duration-300 relative">
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    i18n.dir() === 'rtl'
                      ? positionForName
                        ? 'translate-x-5'
                        : 'translate-x-0'
                      : positionForName
                      ? 'translate-x-0'
                      : 'translate-x-5'
                  }`}
                ></div>
              </div>
            </label>
            <span className="text-sm text-gray-500">
              {i18n.language === 'ar'
                ? `(اضغط لتحديد موقع ${positionForName ? 'الاسم' : 'الصورة'})`
                : `(Click to set ${
                    positionForName ? 'name' : 'photo'
                  } position)`}
            </span>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-auto border border-gray-300 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.15)] cursor-crosshair"
            onClick={handleCanvasClick}
          />
          <div className="flex gap-4">
            <button
              onClick={downloadCard}
              className="cursor-pointer px-6 py-2 bg-[#ee2e3a] text-white font-semibold rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#ee2e3a]/80 hover:shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 bounce-slow"
            >
              {t('save_card')}
            </button>
            <button
              onClick={shareCard}
              className="cursor-pointer px-6 py-2 bg-[#25D366] text-white font-semibold rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#25D366]/80 hover:shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 bounce-slow"
            >
              {t('share_card')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSelector;
