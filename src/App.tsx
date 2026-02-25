import { useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Industries from './components/Industries';
import Projects from './components/Projects';
import Clients from './components/Clients';
import Contact from './components/Contact';
import Footer from './components/Footer';
import PublicProfilePage from './components/PublicProfilePage';
import AdminPublicProfilesPage from './components/AdminPublicProfilesPage';
import { stripBase } from './lib/basePath';

function AppContent() {
  const { language } = useLanguage();
  const pathname = stripBase(window.location.pathname);
  const isAdminPanel = pathname.startsWith('/admin/public-profiles');
  const isPublicProfile = pathname.startsWith('/profile/public');
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  if (isPublicProfile) {
    return <PublicProfilePage />;
  }

  if (isAdminPanel) {
    return <AdminPublicProfilesPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <About />
      <Services />
      <Industries />
      <Projects />
      <Clients />
      <Contact />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}