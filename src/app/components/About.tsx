import { Award, BookOpen, Heart, Users } from 'lucide-react';
import { useSiteData } from '@/app/context/SiteDataContext';

export function About() {
  const { siteData } = useSiteData();

  if (!siteData) {
    return null;
  }

  const highlightIcons: Record<string, typeof Award> = {
    Award,
    Users,
    BookOpen,
    Heart
  };

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4">
            {siteData.aboutTitle}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <p className="text-gray-700">
              {siteData.aboutDescription1}
            </p>
            <p className="text-gray-700">
              {siteData.aboutDescription2}
            </p>
            <p className="text-gray-700">
              {siteData.aboutDescription3}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-teal-50 p-6 rounded-xl">
              <h3 className="text-xl text-gray-900 mb-4">{siteData.uiText.about.educationTitle}</h3>
              <ul className="space-y-3 text-gray-700">
                {siteData.education.map((edu, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>{edu}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteData.uiText.about.highlights.map((item, index) => {
            const Icon = highlightIcons[item.icon] ?? Award;
            return (
            <div key={index} className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-600 text-white rounded-lg mb-4">
                <Icon size={24} />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
}
