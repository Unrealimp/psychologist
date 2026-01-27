import { Header } from '@/app/components/Header';
import { Hero } from '@/app/components/Hero';
import { About } from '@/app/components/About';
import { Services } from '@/app/components/Services';
import { Contact } from '@/app/components/Contact';
import { Footer } from '@/app/components/Footer';
import { useSiteData } from '@/app/context/SiteDataContext';

export function HomePage() {
  const { isLoading, siteData } = useSiteData();

  if (isLoading || !siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Загрузка...
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
