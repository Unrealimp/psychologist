import { useSiteData } from '@/app/context/SiteDataContext';
import { Link } from 'react-router-dom';

export function Footer() {
  const { siteData } = useSiteData();
  const currentYear = new Date().getFullYear();

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
              <li>{siteData.contactInfo.phone}</li>
              <li>{siteData.contactInfo.email}</li>
              <li>{siteData.contactInfo.address}</li>
              <li className="pt-2 text-xs">{siteData.contactInfo.workHours}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              © {currentYear} {siteData.psychologistName}. {siteData.uiText.footer.rightsSuffix}
            </p>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
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
    </footer>
  );
}
