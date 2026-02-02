import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteData } from '@/app/context/SiteDataContext';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export function AdminPage() {
  const navigate = useNavigate();
  const { siteData, isLoading, updateSiteData } = useSiteData();
  const [formData, setFormData] = useState(siteData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(siteData);
  }, [siteData]);

  const handleProfileImageUpload = (file: File | null) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({
          ...prev,
          profileImageUrl: reader.result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) {
      return;
    }
    setIsSaving(true);
    const ok = await updateSiteData(formData);
    setIsSaving(false);
    if (ok) {
      toast.success('Изменения сохранены!');
    } else {
      toast.error('Не удалось сохранить изменения. Попробуйте снова.');
    }
  };

  const handleAddService = () => {
    const newService = {
      id: Date.now().toString(),
      icon: 'Brain',
      title: '',
      description: '',
      duration: '',
      price: ''
    };
    if (!formData) return;
    setFormData({
      ...formData,
      services: [...formData.services, newService]
    });
  };

  const handleRemoveService = (id: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      services: formData.services.filter(s => s.id !== id)
    });
  };

  const handleServiceChange = (id: string, field: string, value: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      services: formData.services.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      )
    });
  };

  const handleEducationChange = (index: number, value: string) => {
    if (!formData) return;
    const newEducation = [...formData.education];
    newEducation[index] = value;
    setFormData({ ...formData, education: newEducation });
  };

  const handleAddEducation = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      education: [...formData.education, '']
    });
  };

  const handleRemoveEducation = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  const handleCertificateChange = (id: string, field: 'title' | 'imageUrl', value: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      certificates: formData.certificates.map((certificate) =>
        certificate.id === id ? { ...certificate, [field]: value } : certificate
      )
    });
  };

  const handleCertificateUpload = (id: string, file: File | null) => {
    if (!formData || !file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleCertificateChange(id, 'imageUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCertificate = () => {
    if (!formData) return;
    const newCertificate = {
      id: Date.now().toString(),
      title: '',
      imageUrl: ''
    };
    setFormData({
      ...formData,
      certificates: [...formData.certificates, newCertificate]
    });
  };

  const handleRemoveCertificate = (id: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      certificates: formData.certificates.filter((certificate) => certificate.id !== id)
    });
  };

  const updateServicesText = (
    updater: (current: NonNullable<typeof formData>['uiText']['services']) => NonNullable<typeof formData>['uiText']['services']
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        uiText: {
          ...prev.uiText,
          services: updater(prev.uiText.services)
        }
      };
    });
  };

  const handleFormatChange = (index: number, field: 'title' | 'description', value: string) => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      formats: servicesText.formats.map((format, i) =>
        i === index ? { ...format, [field]: value } : format
      )
    }));
  };

  const handleFormatBulletChange = (formatIndex: number, bulletIndex: number, value: string) => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      formats: servicesText.formats.map((format, i) =>
        i === formatIndex
          ? {
              ...format,
              bullets: format.bullets.map((bullet, bIndex) => (bIndex === bulletIndex ? value : bullet))
            }
          : format
      )
    }));
  };

  const handleAddFormatBullet = (formatIndex: number) => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      formats: servicesText.formats.map((format, i) =>
        i === formatIndex ? { ...format, bullets: [...format.bullets, ''] } : format
      )
    }));
  };

  const handleRemoveFormatBullet = (formatIndex: number, bulletIndex: number) => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      formats: servicesText.formats.map((format, i) =>
        i === formatIndex
          ? { ...format, bullets: format.bullets.filter((_, bIndex) => bIndex !== bulletIndex) }
          : format
      )
    }));
  };

  const handleAddFormat = () => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      formats: [
        ...servicesText.formats,
        {
          title: '',
          description: '',
          bullets: ['']
        }
      ]
    }));
  };

  const handleRemoveFormat = (index: number) => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      formats: servicesText.formats.filter((_, i) => i !== index)
    }));
  };

  const handleNoteItemChange = (index: number, value: string) => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      noteItems: servicesText.noteItems.map((item, i) => (i === index ? value : item))
    }));
  };

  const handleAddNoteItem = () => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      noteItems: [...servicesText.noteItems, '']
    }));
  };

  const handleRemoveNoteItem = (index: number) => {
    updateServicesText((servicesText) => ({
      ...servicesText,
      noteItems: servicesText.noteItems.filter((_, i) => i !== index)
    }));
  };

  const updateContactText = (
    updater: (current: NonNullable<typeof formData>['uiText']['contact']) => NonNullable<typeof formData>['uiText']['contact']
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        uiText: {
          ...prev.uiText,
          contact: updater(prev.uiText.contact)
        }
      };
    });
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Вернуться на сайт
          </button>
          <h1 className="text-2xl">Панель управления</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl mb-4">Основная информация</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Имя психолога</label>
                <input
                  type="text"
                  value={formData.psychologistName}
                  onChange={(e) => setFormData({ ...formData, psychologistName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Фотография профиля</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 overflow-hidden rounded-xl border bg-gray-50">
                      <img
                        src={formData.profileImageUrl}
                        alt={`Психолог ${formData.psychologistName}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        type="url"
                        value={formData.profileImageUrl}
                        onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                        placeholder="Ссылка на изображение"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProfileImageUpload(e.target.files?.[0] ?? null)}
                        className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Можно указать ссылку или загрузить файл — изображение сохранится в браузере.
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2">Заголовок на главной</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Описание на главной</label>
                <textarea
                  value={formData.heroDescription}
                  onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

            </div>
          </div>

          {/* О себе */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl mb-4">О себе</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Первый абзац</label>
                <textarea
                  value={formData.aboutDescription1}
                  onChange={(e) => setFormData({ ...formData, aboutDescription1: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Второй абзац</label>
                <textarea
                  value={formData.aboutDescription2}
                  onChange={(e) => setFormData({ ...formData, aboutDescription2: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Третий абзац</label>
                <textarea
                  value={formData.aboutDescription3}
                  onChange={(e) => setFormData({ ...formData, aboutDescription3: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Образование */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl">Образование</h2>
              <button
                type="button"
                onClick={handleAddEducation}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Plus size={16} />
                Добавить
              </button>
            </div>
            <div className="space-y-3">
              {formData.education.map((edu, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={edu}
                    onChange={(e) => handleEducationChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Сертификаты и дипломы */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl">Сертификаты и дипломы</h2>
              <button
                type="button"
                onClick={handleAddCertificate}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Plus size={16} />
                Добавить
              </button>
            </div>
            <div className="space-y-4">
              {formData.certificates.map((certificate) => (
                <div key={certificate.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm text-gray-500">Сертификат #{certificate.id}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(certificate.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Название</label>
                    <input
                      type="text"
                      value={certificate.title}
                      onChange={(e) => handleCertificateChange(certificate.id, 'title', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Ссылка на изображение</label>
                    <input
                      type="url"
                      value={certificate.imageUrl}
                      onChange={(e) => handleCertificateChange(certificate.id, 'imageUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Загрузка изображения</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCertificateUpload(certificate.id, e.target.files?.[0] ?? null)}
                      className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
                    />
                  </div>
                  {certificate.imageUrl ? (
                    <img
                      src={certificate.imageUrl}
                      alt={certificate.title || 'Сертификат'}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  ) : null}
                </div>
              ))}
              {formData.certificates.length === 0 ? (
                <p className="text-sm text-gray-500">Добавьте изображения сертификатов или дипломов.</p>
              ) : null}
            </div>
          </div>

          {/* Услуги */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl">Услуги</h2>
              <button
                type="button"
                onClick={handleAddService}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Plus size={16} />
                Добавить услугу
              </button>
            </div>
            <div className="space-y-6">
              {formData.services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm text-gray-500">Услуга #{service.id}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Название</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => handleServiceChange(service.id, 'title', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Описание</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Длительность</label>
                      <input
                        type="text"
                        value={service.duration}
                        onChange={(e) => handleServiceChange(service.id, 'duration', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Цена</label>
                      <input
                        type="text"
                        value={service.price}
                        onChange={(e) => handleServiceChange(service.id, 'price', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Формат работы */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Формат работы</h2>
              <button
                type="button"
                onClick={handleAddFormat}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Plus size={16} />
                Добавить блок
              </button>
            </div>

            <div>
              <label className="block text-sm mb-2">Заголовок секции</label>
              <input
                type="text"
                value={formData.uiText.services.formatTitle}
                onChange={(e) =>
                  updateServicesText((servicesText) => ({
                    ...servicesText,
                    formatTitle: e.target.value
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-6">
              {formData.uiText.services.formats.map((format, index) => (
                <div key={`${format.title}-${index}`} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm text-gray-500">Блок формата #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveFormat(index)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Заголовок</label>
                    <input
                      type="text"
                      value={format.title}
                      onChange={(e) => handleFormatChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Описание</label>
                    <textarea
                      value={format.description}
                      onChange={(e) => handleFormatChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm">Пункты списка</label>
                      <button
                        type="button"
                        onClick={() => handleAddFormatBullet(index)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100"
                      >
                        <Plus size={14} />
                        Добавить пункт
                      </button>
                    </div>
                    {format.bullets.map((bullet, bulletIndex) => (
                      <div key={`${bulletIndex}`} className="flex gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleFormatBulletChange(index, bulletIndex, e.target.value)}
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFormatBullet(index, bulletIndex)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg">Важно знать</h3>
              <div>
                <label className="block text-sm mb-2">Заголовок блока</label>
                <input
                  type="text"
                  value={formData.uiText.services.noteTitle}
                  onChange={(e) =>
                    updateServicesText((servicesText) => ({
                      ...servicesText,
                      noteTitle: e.target.value
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm">Пункты</label>
                  <button
                    type="button"
                    onClick={handleAddNoteItem}
                    className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100"
                  >
                    <Plus size={14} />
                    Добавить пункт
                  </button>
                </div>
                {formData.uiText.services.noteItems.map((item, index) => (
                  <div key={`${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleNoteItemChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNoteItem(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Политика конфиденциальности */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl mb-4">Политика конфиденциальности</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={formData.uiText.contact.privacyTitle}
                    onChange={(e) =>
                      updateContactText((contactText) => ({
                        ...contactText,
                        privacyTitle: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Описание</label>
                  <textarea
                    value={formData.uiText.contact.privacyDescription}
                    onChange={(e) =>
                      updateContactText((contactText) => ({
                        ...contactText,
                        privacyDescription: e.target.value
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl mb-4">Контактная информация</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Телефон</label>
                <input
                  type="text"
                  value={formData.contactInfo.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactInfo: { ...formData.contactInfo, phone: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactInfo: { ...formData.contactInfo, email: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Контакт</label>
                <input
                  type="text"
                  value={formData.contactInfo.contact}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactInfo: { ...formData.contactInfo, contact: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Кнопка сохранения */}
          <div className="sticky bottom-4 bg-white rounded-lg shadow-lg p-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving}
            >
              <Save size={20} />
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
