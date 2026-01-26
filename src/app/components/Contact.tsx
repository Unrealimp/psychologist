import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSiteData } from '@/app/context/SiteDataContext';

export function Contact() {
  const { siteData } = useSiteData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      toast.success('Спасибо за обращение! Я свяжусь с вами в ближайшее время.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Не удалось отправить сообщение. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Телефон',
      content: siteData.contactInfo.phone,
      link: `tel:${siteData.contactInfo.phone.replace(/\s/g, '')}`
    },
    {
      icon: Mail,
      title: 'Email',
      content: siteData.contactInfo.email,
      link: `mailto:${siteData.contactInfo.email}`
    },
    {
      icon: MapPin,
      title: 'Адрес',
      content: siteData.contactInfo.address,
      link: null
    },
    {
      icon: Clock,
      title: 'Часы работы',
      content: siteData.contactInfo.workHours,
      link: null
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4">
            Контакты и запись
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Свяжитесь со мной удобным для вас способом, и мы обсудим возможность работы
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl text-gray-900 mb-6">Как со мной связаться</h3>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-lg flex items-center justify-center">
                      <item.icon size={20} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm text-gray-500">{item.title}</div>
                      {item.link ? (
                        <a href={item.link} className="text-gray-900 hover:text-teal-600 transition-colors">
                          {item.content}
                        </a>
                      ) : (
                        <div className="text-gray-900">{item.content}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-600 text-white rounded-2xl p-8">
              <h3 className="text-2xl mb-4">Первая консультация</h3>
              <p className="mb-4">
                На первой встрече мы познакомимся, обсудим ваш запрос и определим, 
                подходим ли мы друг другу для совместной работы.
              </p>
              <div className="space-y-2 text-teal-50">
                <p>✓ Продолжительность: 50 минут</p>
                <p>✓ Стоимость: 5000 ₽</p>
                <p>✓ Онлайн</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl text-gray-900 mb-4">Политика конфиденциальности</h3>
              <p className="text-gray-600 text-sm">
                Вся информация, которую вы сообщаете на консультациях, является строго конфиденциальной 
                и не разглашается третьим лицам. Я следую этическому кодексу психолога.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl text-gray-900 mb-6">Записаться на консультацию</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="ivan@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="+7 (925) 123-45-67"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm text-gray-700 mb-2">
                    Сообщение
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Кратко опишите ваш запрос или удобное время для звонка..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-teal-400"
                  disabled={isSubmitting}
                >
                  <Send size={20} />
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
