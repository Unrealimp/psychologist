import { useSiteData } from '@/app/context/SiteDataContext';

export function About() {
  const { siteData } = useSiteData();

  if (!siteData) {
    return null;
  }

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

        <div className="bg-gray-50 p-8 rounded-2xl">
          <h3 className="text-2xl text-gray-900 mb-6 text-center">{siteData.uiText.about.certificatesTitle}</h3>
          {siteData.certificates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {siteData.certificates.map((certificate) => (
                <figure key={certificate.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={certificate.imageUrl}
                      alt={certificate.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm text-gray-700">
                    {certificate.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center">
              Здесь можно разместить сертификаты и дипломы для клиентов.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
