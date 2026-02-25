import { MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Projects() {
  const { language, t } = useLanguage();

  const ongoingProjects = [
    {
      nameKey: 'project1_name',
      typeKey: 'project1_type',
      image: 'https://images.pexels.com/photos/35596448/pexels-photo-35596448.jpeg?cs=srgb&dl=pexels-mumtaz-niazi-18390768-35596448.jpg&fm=jpg',
    },
    {
      nameKey: 'project2_name',
      typeKey: 'project2_type',
      image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    },
    {
      nameKey: 'project3_name',
      typeKey: 'project3_type',
      image: 'https://images.pexels.com/photos/2830507/pexels-photo-2830507.jpeg?cs=srgb&dl=pexels-mohamed-saray-2830507.jpg&fm=jpg',
    },
    {
      nameKey: 'project4_name',
      typeKey: 'project4_type',
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    },
  ];

  const completedProjects = [
    {
      nameKey: 'project5_name',
      locationKey: 'project5_location',
      image: 'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    },
    {
      nameKey: 'project6_name',
      locationKey: null,
      image: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    },
    {
      nameKey: 'project7_name',
      locationKey: null,
      image: 'https://images.pexels.com/photos/31277318/pexels-photo-31277318.jpeg?cs=srgb&dl=pexels-mumtaz-niazi-18390768-31277318.jpg&fm=jpg',
    },
  ];

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('projects_title')}</h2>
        </div>

        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">{t('projects_ongoing')}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ongoingProjects.map((project, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={t(project.nameKey)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-semibold">
                      <Calendar size={14} />
                      {language === 'ar' ? '٢٠٢٤' : '2024'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{t(project.nameKey)}</h4>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-900" />
                    {t(project.typeKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-8">{t('projects_completed')}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {completedProjects.map((project, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={t(project.nameKey)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h4 className="text-xl font-bold text-white mb-2">{t(project.nameKey)}</h4>
                    {project.locationKey && (
                      <p className="text-blue-100 flex items-center gap-2">
                        <MapPin size={16} />
                        {t(project.locationKey)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
