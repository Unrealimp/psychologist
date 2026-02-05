import { useSiteData } from '@/app/context/SiteDataContext';
import { buildSrcSet, getResponsiveMeta, normalizeImageSrc } from '@/app/utils/responsiveImages';

export function Hero() {
  const { siteData } = useSiteData();

  if (!siteData) {
    return null;
  }

  const normalizedProfileSrc = normalizeImageSrc(siteData.profileImageUrl);
  const profileMeta = getResponsiveMeta(siteData.profileImageUrl);
  const profileSrcSet = profileMeta ? buildSrcSet(siteData.profileImageUrl, profileMeta.widths) : undefined;
  
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-16 bg-gradient-to-br from-teal-50 via-white to-blue-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900">
              {siteData.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              {siteData.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToContact}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                {siteData.uiText.hero.primaryCta}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={normalizedProfileSrc}
                alt={`Психолог ${siteData.psychologistName}`}
                srcSet={profileSrcSet}
                sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 90vw"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                width={profileMeta?.width}
                height={profileMeta?.height}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
