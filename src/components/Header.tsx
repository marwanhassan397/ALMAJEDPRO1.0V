import { useState, useEffect } from 'react';
import { Menu, X, LogIn, User, LogOut } from 'lucide-react';
import almajdLogo from '../assets/almajd-logo.svg';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';

export default function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { key: 'nav_home', href: '#home' },
    { key: 'nav_about', href: '#about' },
    { key: 'nav_services', href: '#services' },
    { key: 'nav_industries', href: '#industries' },
    { key: 'nav_projects', href: '#projects' },
    { key: 'nav_clients', href: '#clients' },
    { key: 'nav_contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 flex-nowrap">
          <div className="flex items-center gap-4 shrink-0 min-w-0">
            <img
              src={almajdLogo}
              alt="Almajd logo"
              className="w-12 h-12 object-contain bg-transparent shrink-0"
            />
            <div
              className={`flex flex-col ${
                language === 'ar' ? 'items-end' : 'items-start'
              } min-w-0`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <span
                className={`text-lg font-bold text-gray-900 leading-tight whitespace-nowrap ${
                  language === 'ar' ? 'w-full text-right' : 'text-left'
                }`}
              >
                {language === 'ar' ? 'المجد العربي الحديث' : 'Al-Majd Al-Arabi'}
              </span>
              <span
                className={`text-xs text-gray-600 leading-tight whitespace-nowrap ${
                  language === 'ar' ? 'w-full text-right' : 'text-left'
                }`}
              >
                {language === 'ar' ? 'للمقاولات والتصنيع' : 'Contracting & Fabrication'}
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center min-w-0 flex-nowrap whitespace-nowrap">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors whitespace-nowrap"
              >
                {t(link.key)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 sm:gap-4" dir="ltr">
              {user ? (
                <>
                  <button
                    onClick={() => setShowUserProfile(true)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap"
                  >
                    <User size={20} />
                    {t('profile')}
                  </button>
                  <button
                    onClick={signOut}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors whitespace-nowrap"
                  >
                    <LogOut size={20} />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap"
                >
                  <LogIn size={20} />
                  {t('login')}
                </button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-blue-900"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              {language === 'ar' ? 'EN' : 'ع'}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-700 hover:text-blue-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                {t(link.key)}
              </button>
            ))}
            <div className="border-t pt-2 mt-2 space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setShowUserProfile(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 text-gray-700 hover:text-blue-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <User size={20} />
                    {t('profile')}
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 font-medium py-3 px-4 rounded-lg hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={20} />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginForm(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-gray-700 hover:text-blue-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <LogIn size={20} />
                  {t('login')}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} />}
      {showUserProfile && <UserProfile onClose={() => setShowUserProfile(false)} />}
    </header>
  );
}
