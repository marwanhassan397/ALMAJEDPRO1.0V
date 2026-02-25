import { Target, Eye, Award, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about_title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('about_subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">{t('about_description')}</p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="text-blue-900" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('mission_title')}</h3>
                  <p className="text-gray-700 leading-relaxed">{t('mission_text')}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Eye className="text-amber-600" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('vision_title')}</h3>
                  <p className="text-gray-700 leading-relaxed">{t('vision_text')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.pexels.com/photos/15839821/pexels-photo-15839821.jpeg?cs=srgb&dl=pexels-mohammed-azhar-478656558-15839821.jpg&fm=jpg"
              alt="Construction site"
              className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 mb-12 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl text-blue-900">"</div>
            <div className="flex-1">
              <p className="text-lg italic text-gray-800 mb-4 leading-relaxed">
                {t('chairman_message')}
              </p>
              <p className="text-blue-900 font-bold">{t('chairman_name')}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Award className="text-amber-400" size={32} />
              <h3 className="text-2xl font-bold">{t('quality_policy_title')}</h3>
            </div>
            <p className="text-blue-100 leading-relaxed">{t('quality_policy_text')}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-500 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-white" size={32} />
              <h3 className="text-2xl font-bold">{t('safety_policy_title')}</h3>
            </div>
            <p className="text-amber-100 leading-relaxed">{t('safety_policy_text')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
