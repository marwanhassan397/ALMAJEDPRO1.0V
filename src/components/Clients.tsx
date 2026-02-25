import { Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Clients() {
  const { t } = useLanguage();

  const clients = [
    { key: 'client1' },
    { key: 'client2' },
    { key: 'client3' },
    { key: 'client4' },
    { key: 'client5' },
    { key: 'client6' },
  ];

  return (
    <section id="clients" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('clients_title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('clients_subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clients.map((client, index) => (
            <div
              key={index}
              className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-900 hover:shadow-xl transition-all transform hover:scale-105 duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="text-white" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t(client.key)}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
