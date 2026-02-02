import { Mail, Phone, Send, MessageCircle } from 'lucide-react';
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

  if (!siteData) {
    return null;
  }

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

      toast.success(siteData.uiText.contact.toastSuccess);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error(siteData.uiText.contact.toastError);
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

  const getContactIcon = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes('телефон') || normalized.includes('phone')) {
      return Phone;
    }
    if (normalized.includes('email') || normalized.includes('почт')) {
      return Mail;
    }
    return MessageCircle;
  };

  const contactInfo = siteData.contactInfo.map((item) => ({
    ...item,
    icon: getContactIcon(item.label),
    link: item.link?.trim() || null
  }));

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4">
            {siteData.uiText.contact.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {siteData.uiText.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl text-gray-900 mb-6">{siteData.uiText.contact.infoTitle}</h3>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-lg flex items-center justify-center">
                      <item.icon size={20} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm text-gray-500">{item.label}</div>
                      {item.link ? (
                        <a href={item.link} className="text-gray-900 hover:text-teal-600 transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <div className="text-gray-900">{item.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl text-gray-900 mb-4">{siteData.uiText.contact.privacyTitle}</h3>
              <p className="text-gray-600 text-sm">
                {siteData.uiText.contact.privacyDescription}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl text-gray-900 mb-6">{siteData.uiText.contact.formTitle}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                    {siteData.uiText.contact.formLabels.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={siteData.uiText.contact.formPlaceholders.name}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                    {siteData.uiText.contact.formLabels.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={siteData.uiText.contact.formPlaceholders.email}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">
                    {siteData.uiText.contact.formLabels.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={siteData.uiText.contact.formPlaceholders.phone}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm text-gray-700 mb-2">
                    {siteData.uiText.contact.formLabels.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder={siteData.uiText.contact.formPlaceholders.message}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-teal-400"
                  disabled={isSubmitting}
                >
                  <Send size={20} />
                  {isSubmitting ? siteData.uiText.contact.submitLoading : siteData.uiText.contact.submitIdle}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  {siteData.uiText.contact.consentText}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
