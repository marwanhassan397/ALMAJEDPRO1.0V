import { X, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { withBase } from '../lib/basePath';

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  if (!user) return null;

  const initials = user.username
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User size={28} />
            {t('my_profile')}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            aria-label={t('close')}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {initials || 'A'}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">{user.username}</h3>
              <p className="text-gray-600">{language === 'ar' ? 'مسؤول النظام' : 'Administrator'}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                onClick={() => {
                  window.location.href = withBase('admin/public-profiles');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-900 text-white py-3 px-5 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                <Settings size={20} />
                {t('admin_panel')}
              </button>
              <button
                onClick={onClose}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition-all transform hover:scale-105"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
