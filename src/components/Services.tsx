import { Building2, Wrench, Factory, Layers, Flame, Zap, Palette } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    { icon: Building2, titleKey: 'service1_title', descKey: 'service1_desc', color: 'blue' },
    { icon: Wrench, titleKey: 'service2_title', descKey: 'service2_desc', color: 'amber' },
    { icon: Factory, titleKey: 'service3_title', descKey: 'service3_desc', color: 'blue' },
    { icon: Layers, titleKey: 'service4_title', descKey: 'service4_desc', color: 'amber' },
    { icon: Flame, titleKey: 'service5_title', descKey: 'service5_desc', color: 'blue' },
    { icon: Zap, titleKey: 'service6_title', descKey: 'service6_desc', color: 'amber' },
    { icon: Palette, titleKey: 'service7_title', descKey: 'service7_desc', color: 'blue' },
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('services_title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('services_subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            const bgColor = service.color === 'blue' ? 'bg-blue-900' : 'bg-amber-500';
            const hoverColor = service.color === 'blue' ? 'group-hover:bg-blue-800' : 'group-hover:bg-amber-600';

            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300"
              >
                <div className={`w-16 h-16 ${bgColor} ${hoverColor} rounded-xl flex items-center justify-center mb-6 transition-colors`}>
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t(service.titleKey)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(service.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
