import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const { language, t } = useLanguage();

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('contact_title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('contact_subtitle')}</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="text-blue-900" size={28} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact_address')}</h3>
                  <p className="text-gray-700">{t('address_line1')}</p>
                  <p className="text-gray-700">{t('address_line2')}</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Phone className="text-amber-600" size={28} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact_phone')}</h3>
                  <a
                    href="tel:+966556831061"
                    className="text-blue-900 hover:text-blue-700 font-semibold text-lg"
                    dir="ltr"
                  >
                    +966 55 683 1061
                  </a>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="text-blue-900" size={28} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact_email')}</h3>
                  <a
                    href="mailto:info@almajd.sa"
                    className="text-blue-900 hover:text-blue-700 font-semibold text-lg"
                  >
                    info@almajd.sa
                  </a>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="text-green-600" size={28} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact_whatsapp')}</h3>
                  <a
                    href="https://wa.me/966556831061"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle size={20} />
                    {t('contact_whatsapp')}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 font-semibold" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'س.ت: ٧٠٥٠٦٠٧٩٥٦' : 'CR: 7050607956'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
