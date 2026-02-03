import { useEffect, useRef, useState, type WheelEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSiteData, type Certificate } from '@/app/context/SiteDataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

export function About() {
  const { siteData } = useSiteData();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const certificatesRef = useRef<HTMLDivElement | null>(null);

  const updateScrollButtons = () => {
    const container = certificatesRef.current;
    if (!container) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 1);
  };

  const handleCertificatesScroll = (direction: 'left' | 'right') => {
    const container = certificatesRef.current;
    if (!container) {
      return;
    }

    const scrollAmount = Math.round(container.clientWidth * 0.75);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };
  const handleCertificatesWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!certificatesRef.current || event.shiftKey) {
      return;
    }

    event.preventDefault();

    certificatesRef.current.scrollBy({
      left: event.deltaY + event.deltaX,
      behavior: 'auto'
    });
  };

  useEffect(() => {
    updateScrollButtons();
    const container = certificatesRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => updateScrollButtons();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [siteData?.certificates.length]);

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
            <p className="text-gray-700">{siteData.aboutDescription1}</p>
            <p className="text-gray-700">{siteData.aboutDescription2}</p>
            <p className="text-gray-700">{siteData.aboutDescription3}</p>
            <p className="text-gray-700">{siteData.aboutDescription4}</p>
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
          <div className="mb-6">
            <h3 className="text-2xl text-gray-900 text-center sm:text-left">
              {siteData.uiText.about.certificatesTitle}
            </h3>
          </div>
          {siteData.certificates.length > 0 ? (
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-50 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-50 to-transparent" />
              <button
                type="button"
                onClick={() => handleCertificatesScroll('left')}
                aria-label="Прокрутить сертификаты влево"
                disabled={!canScrollLeft}
                className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-40"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleCertificatesScroll('right')}
                aria-label="Прокрутить сертификаты вправо"
                disabled={!canScrollRight}
                className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-40"
              >
                <ArrowRight size={18} />
              </button>
              <div
                ref={certificatesRef}
                onWheel={handleCertificatesWheel}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain overscroll-y-none [&::-webkit-scrollbar]:hidden"
              >
                {siteData.certificates.map((certificate) => (
                  <button
                    key={certificate.id}
                    type="button"
                    onClick={() => setSelectedCertificate(certificate)}
                    className="min-w-[260px] w-[280px] flex-shrink-0 snap-start text-left rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={certificate.imageUrl}
                        alt={certificate.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-3 text-sm font-medium text-gray-800">{certificate.title}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center">
              Здесь можно разместить сертификаты и дипломы для клиентов.
            </p>
          )}
        </div>

        <Dialog
          open={Boolean(selectedCertificate)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCertificate(null);
            }
          }}
        >
          {/* МОДАЛКА: ширина = ширина изображения, изображение видно полностью */}
          <DialogContent
            className="
              !w-fit !max-w-none
              !p-0
              overflow-visible
            "
          >
            {selectedCertificate ? (
              <div className="flex flex-col">
                {/* Заголовок не должен раздувать ширину сильнее изображения */}
                <DialogHeader className="p-4">
                  <DialogTitle className="max-w-[95vw] break-words">
                    {selectedCertificate.title}
                  </DialogTitle>
                </DialogHeader>

                {/* Важно: никаких w-full/h-full у картинки */}
                <div className="px-4 pb-4">
                  <img
                    src={selectedCertificate.imageUrl}
                    alt={selectedCertificate.title}
                    className="
                      block
                      w-auto h-auto
                      max-w-[95vw]
                      max-h-[85vh]
                      object-contain
                      rounded-lg
                      bg-gray-100
                    "
                  />
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
