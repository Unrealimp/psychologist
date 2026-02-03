import { useSiteData } from '@/app/context/SiteDataContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function Footer() {
  const { siteData } = useSiteData();
  const currentYear = new Date().getFullYear();
  const [isConsentOpen, setIsConsentOpen] = useState(false);

  if (!siteData) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl mb-4">{siteData.psychologistName}</h3>
            <p className="text-gray-400 text-sm">
              {siteData.uiText.footer.descriptionPrefix}
              {siteData.yearsOfExperience}
              {siteData.uiText.footer.descriptionSuffix}
            </p>
          </div>

          <div>
            <h3 className="text-lg mb-4">{siteData.uiText.footer.quickLinksTitle}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <button
                  onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-teal-400 transition-colors"
                >
                  {siteData.uiText.navigation.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-teal-400 transition-colors"
                >
                  {siteData.uiText.navigation.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-teal-400 transition-colors"
                >
                  {siteData.uiText.navigation.services}
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-teal-400 transition-colors"
                >
                  {siteData.uiText.navigation.contact}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-4">{siteData.uiText.footer.contactsTitle}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              {siteData.contactInfo.map((item) => (
                <li key={item.id}>
                  <span className="font-medium text-gray-300">{item.label}:</span>{' '}
                  {item.link ? (
                    <a href={item.link} className="hover:text-teal-400 transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              © {currentYear} {siteData.psychologistName}. {siteData.uiText.footer.rightsSuffix}
            </p>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <button
                type="button"
                onClick={() => setIsConsentOpen(true)}
                className="text-xs text-gray-400 hover:text-teal-400 transition-colors"
              >
                {siteData.uiText.footer.consentLabel}
              </button>
              <p>{siteData.uiText.footer.roleLabel}</p>
              <Link 
                to="/login" 
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {siteData.uiText.footer.adminLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isConsentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h4 className="text-lg font-semibold">{siteData.uiText.footer.consentTitle}</h4>
              <button
                type="button"
                onClick={() => setIsConsentOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="space-y-6 text-sm sm:text-base leading-relaxed text-gray-700">
                {siteData.uiText.footer.consentSections.map((section, sectionIndex) => (
                  <section key={`${section.title}-${sectionIndex}`} className="space-y-3">
                    <h5 className="text-base sm:text-lg font-semibold text-gray-900">{section.title}</h5>
                    <div className="space-y-3">
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={`${section.title}-${paragraphIndex}`} className="indent-6">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsConsentOpen(false)}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
