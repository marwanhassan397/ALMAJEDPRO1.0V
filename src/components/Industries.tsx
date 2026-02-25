import { Fuel, Building, Droplets, Zap, Home, Factory } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Industries() {
  const { t } = useLanguage();

  const industries = [
    {
      icon: Fuel,
      titleKey: 'industry1_title',
      descKey: 'industry1_desc',
      image: 'https://images.pexels.com/photos/35566202/pexels-photo-35566202.jpeg?cs=srgb&dl=pexels-mumtaz-niazi-18390768-35566202.jpg&fm=jpg',
    },
    {
      icon: Building,
      titleKey: 'industry2_title',
      descKey: 'industry2_desc',
      image: 'https://images.pexels.com/photos/5623139/pexels-photo-5623139.jpeg?cs=srgb&dl=pexels-omar-ramadan-1877013-5623139.jpg&fm=jpg',
    },
    {
      icon: Droplets,
      titleKey: 'industry3_title',
      descKey: 'industry3_desc',
      image: 'https://images.pexels.com/photos/5625713/pexels-photo-5625713.jpeg?cs=srgb&dl=pexels-konevi-5625713.jpg&fm=jpg',
    },
    {
      icon: Zap,
      titleKey: 'industry4_title',
      descKey: 'industry4_desc',
      image: 'https://images.pexels.com/photos/35596450/pexels-photo-35596450.jpeg?cs=srgb&dl=pexels-mumtaz-niazi-18390768-35596450.jpg&fm=jpg',
    },
    {
      icon: Home,
      titleKey: 'industry5_title',
      descKey: 'industry5_desc',
      image: 'https://unsplash.com/photos/kh_c-f0o-tc/download?ixid=M3w2MDM4NjJ8MXwxfGFsbHx8fHx8fHx8fDE3MzcwNTIyNTd8&force=true',
    },
    {
      icon: Factory,
      titleKey: 'industry6_title',
      descKey: 'industry6_desc',
      image: 'https://images.pexels.com/photos/31277318/pexels-photo-31277318.jpeg?cs=srgb&dl=pexels-mumtaz-niazi-18390768-31277318.jpg&fm=jpg',
    },
  ];

  return (
    <section id="industries" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('industries_title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('industries_subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={industry.image}
                    alt={t(industry.titleKey)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-2xl font-bold">{t(industry.titleKey)}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">{t(industry.descKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
