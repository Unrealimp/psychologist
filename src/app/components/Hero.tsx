import { useSiteData } from '@/app/context/SiteDataContext';

export function Hero() {
  const { siteData } = useSiteData();

  if (!siteData) {
    return null;
  }
  
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
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
              >
                {siteData.uiText.hero.secondaryCta}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={siteData.profileImageUrl}
                alt={`Психолог ${siteData.psychologistName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl text-teal-600">{siteData.yearsOfExperience}</div>
              <div className="text-sm text-gray-600">{siteData.uiText.hero.experienceLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
