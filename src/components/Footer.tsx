import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import almajdLogo from '../assets/almajd-logo.svg';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { language, t } = useLanguage();

  const currentYear = new Date().getFullYear();
  const arabicYear = currentYear.toString().split('').map(digit => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return arabicDigits[parseInt(digit)];
  }).join('');

  const displayYear = language === 'ar' ? arabicYear : currentYear;

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={almajdLogo}
                alt="Almajd logo"
                className="w-12 h-12 object-contain bg-transparent"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight">
                  {language === 'ar' ? 'المجد العربي الحديث' : 'Al-Majd Al-Arabi'}
                </span>
              </div>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">{t('footer_about_text')}</p>
            <p className="text-gray-500 text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('footer_cr')}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">{t('footer_contact_title')}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-amber-500 flex-shrink-0 mt-1" size={18} />
                <div className="text-gray-400 text-sm">
                  <p>{t('address_line1')}</p>
                  <p>{t('address_line2')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-amber-500 flex-shrink-0" size={18} />
                <a
                  href="tel:+966556831061"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  dir="ltr"
                >
                  +966 55 683 1061
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-amber-500 flex-shrink-0" size={18} />
                <a
                  href="mailto:info@almajd.sa"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  info@almajd.sa
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="text-amber-500 flex-shrink-0" size={18} />
                <a
                  href="https://www.almajd.sa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  www.almajd.sa
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">{t('footer_links_title')}</h3>
            <div className="space-y-3">
              {[
                { key: 'nav_home', href: '#home' },
                { key: 'nav_about', href: '#about' },
                { key: 'nav_services', href: '#services' },
                { key: 'nav_industries', href: '#industries' },
                { key: 'nav_projects', href: '#projects' },
                { key: 'nav_contact', href: '#contact' },
              ].map((link) => (
                <button
                  key={link.key}
                  onClick={() => scrollToSection(link.href)}
                  className="block text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {t(link.key)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">{t('footer_services_title')}</h3>
            <div className="space-y-3">
              {[
                'service1_title',
                'service2_title',
                'service3_title',
                'service5_title',
                'service6_title',
              ].map((serviceKey) => (
                <p key={serviceKey} className="text-gray-400 text-sm">
                  {t(serviceKey)}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-500 text-sm">
            {t('footer_copyright').replace('{year}', displayYear.toString())}
          </p>
        </div>
      </div>
    </footer>
  );
}
