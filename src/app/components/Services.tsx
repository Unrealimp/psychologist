import { Brain, HeartHandshake, Lightbulb, Shield, Smile, Users } from 'lucide-react';
import { useSiteData } from '@/app/context/SiteDataContext';

export function Services() {
  const { siteData } = useSiteData();
  
  const iconMap: Record<string, any> = {
    Brain,
    HeartHandshake,
    Lightbulb,
    Shield,
    Smile,
    Users
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4">
            Услуги
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Индивидуальный подход к каждому клиенту и работа с широким спектром запросов
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {siteData.services.map((service) => {
            const Icon = iconMap[service.icon] || Brain;
            return (
              <div key={service.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-600 rounded-lg mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{service.duration}</span>
                  <span className="text-lg text-teal-600">{service.price}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl text-gray-900 mb-8 text-center">Формат работы</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-teal-100 rounded-xl p-6">
              <h4 className="text-xl text-gray-900 mb-2">Очные встречи</h4>
              <p className="text-gray-600 mb-4">Консультации в комфортном кабинете в центре Москвы</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-600 mr-2">✓</span>
                  Личный контакт
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-600 mr-2">✓</span>
                  Удобное расположение
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-600 mr-2">✓</span>
                  Конфиденциальность
                </li>
              </ul>
            </div>

            <div className="border-2 border-teal-100 rounded-xl p-6">
              <h4 className="text-xl text-gray-900 mb-2">Онлайн-сессии</h4>
              <p className="text-gray-600 mb-4">Консультации по видеосвязи из любой точки мира</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-600 mr-2">✓</span>
                  Экономия времени
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-600 mr-2">✓</span>
                  Привычная обстановка
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-600 mr-2">✓</span>
                  Гибкий график
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-teal-50 rounded-xl">
            <h4 className="text-lg text-gray-900 mb-2">Важно знать</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Первая консультация — знакомство, обсуждение запроса и формата работы</li>
              <li>• Рекомендуемая частота встреч: 1-2 раза в неделю</li>
              <li>• Продолжительность терапии зависит от вашего запроса</li>
              <li>• Предусмотрена система отмены за 24 часа</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}