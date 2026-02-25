import { Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-gray-900"
      style={{
        backgroundImage:
          'url(https://images.pexels.com/photos/35761/pexels-photo.jpg?cs=srgb&dl=pexels-mloky96-35761.jpg&fm=jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/90 to-blue-900/85"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">

          <h1
            style={{ lineHeight: 1.3 }}
            className="block text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 break-words whitespace-normal overflow-visible"
          >
            {t('hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-[1.7] break-words">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => scrollToSection('#services')}
              className="px-8 py-4 bg-amber-500 text-white rounded-lg font-semibold text-lg hover:bg-amber-600 transition-all transform hover:scale-105 shadow-xl"
            >
              {t('hero_cta_services')}
            </button>

            <button
              onClick={() => scrollToSection('#contact')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              {t('hero_cta_contact')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
