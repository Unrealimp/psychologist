import { Header } from '@/app/components/Header';
import { Hero } from '@/app/components/Hero';
import { About } from '@/app/components/About';
import { Services } from '@/app/components/Services';
import { Contact } from '@/app/components/Contact';
import { Footer } from '@/app/components/Footer';

export function HomePage() {
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
