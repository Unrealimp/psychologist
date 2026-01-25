import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useSiteData } from '@/app/context/SiteDataContext';

export function Header() {
  const { siteData } = useSiteData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl text-teal-700">
            {siteData.psychologistName}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              Главная
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              О мне
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              Услуги
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              Контакты
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Главная
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              О мне
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Услуги
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Контакты
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}