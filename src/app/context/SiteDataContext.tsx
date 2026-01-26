import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  duration: string;
  price: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  workHours: string;
}

export interface SiteData {
  psychologistName: string;
  profileImageUrl: string;
  heroTitle: string;
  heroDescription: string;
  yearsOfExperience: string;
  aboutTitle: string;
  aboutDescription1: string;
  aboutDescription2: string;
  aboutDescription3: string;
  education: string[];
  membership: string[];
  services: Service[];
  contactInfo: ContactInfo;
}

const defaultSiteData: SiteData = {
  psychologistName: 'Диана Попович',
  profileImageUrl: 'https://images.unsplash.com/photo-1669627961229-987550948857?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwc3ljaG9sb2dpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjkzMTY1NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  heroTitle: 'Ваш путь к внутреннему равновесию',
  heroDescription: 'Психолог Диана Попович. Индивидуальные консультации для взрослых и подростков: тревога, стресс, отношения, самооценка.',
  yearsOfExperience: '12+',
  aboutTitle: 'О себе',
  aboutDescription1: 'Здравствуйте! Я Диана Попович, практикующий психолог с более чем 12-летним опытом работы. Моя специализация — помощь людям в преодолении эмоциональных трудностей, работа с тревогой, депрессией, отношениями и самооценкой.',
  aboutDescription2: 'Я использую современные методы психотерапии, включая когнитивно-поведенческую терапию (КПТ) и гештальт-подход. Верю, что каждый человек обладает ресурсами для изменений, а моя задача — помочь их раскрыть.',
  aboutDescription3: 'Работаю онлайн, что позволяет получать помощь независимо от вашего местоположения. Гарантирую полную конфиденциальность и безопасное пространство для ваших переживаний.',
  education: [
    'МГУ им. М.В. Ломоносова, факультет психологии',
    'Сертификация по когнитивно-поведенческой терапии',
    'Обучение гештальт-терапии (4 года)',
    'Регулярная супервизия и повышение квалификации'
  ],
  membership: [
    'Российское психологическое общество',
    'Ассоциация когнитивно-поведенческой психотерапии'
  ],
  services: [
    {
      id: '1',
      icon: 'Brain',
      title: 'Работа с тревогой и стрессом',
      description: 'Помощь в преодолении тревожных состояний, панических атак и хронического стресса',
      duration: '50 минут',
      price: '5000 ₽'
    },
    {
      id: '2',
      icon: 'HeartHandshake',
      title: 'Консультирование по отношениям',
      description: 'Работа с трудностями в паре, семейные конфликты, вопросы расставания',
      duration: '50 минут',
      price: '5000 ₽'
    },
    {
      id: '3',
      icon: 'Smile',
      title: 'Самооценка и самопринятие',
      description: 'Работа с самооценкой, внутренним критиком, поиск себя',
      duration: '50 минут',
      price: '5000 ₽'
    },
    {
      id: '4',
      icon: 'Shield',
      title: 'Преодоление депрессии',
      description: 'Поддержка при депрессивных состояниях, апатии, потере смысла',
      duration: '50 минут',
      price: '5000 ₽'
    },
    {
      id: '5',
      icon: 'Users',
      title: 'Работа с подростками',
      description: 'Помощь подросткам в период взросления, школьные трудности, конфликты',
      duration: '50 минут',
      price: '4500 ₽'
    },
    {
      id: '6',
      icon: 'Lightbulb',
      title: 'Личностный рост',
      description: 'Раскрытие потенциала, поиск жизненного пути, принятие решений',
      duration: '50 минут',
      price: '5000 ₽'
    }
  ],
  contactInfo: {
    phone: '+7 (925) 123-45-67',
    email: 'diana.popovich@psychology.ru',
    address: 'Москва, ул. Арбат, д. 15',
    workHours: 'Пн-Пт: 10:00-20:00, Сб: 11:00-17:00'
  }
};

interface SiteDataContextType {
  siteData: SiteData;
  updateSiteData: (data: Partial<SiteData>) => Promise<boolean>;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData>(defaultSiteData);
  const apiBase = import.meta.env.VITE_API_URL ?? '';
  const useServer = !import.meta.env.DEV || Boolean(import.meta.env.VITE_API_URL);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!useServer) {
        const saved = localStorage.getItem('siteData');
        if (saved && isMounted) {
          setSiteData(JSON.parse(saved));
        }
        return;
      }
      try {
        const response = await fetch(`${apiBase}/api/site-data`);
        if (!response.ok) {
          throw new Error('Failed to load site data');
        }
        const data = (await response.json()) as SiteData;
        if (isMounted) {
          setSiteData(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [apiBase, useServer]);

  const updateSiteData = async (data: Partial<SiteData>) => {
    if (!useServer) {
      setSiteData(prev => {
        const next = { ...prev, ...data };
        localStorage.setItem('siteData', JSON.stringify(next));
        return next;
      });
      return true;
    }
    try {
      const response = await fetch(`${apiBase}/api/site-data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update site data');
      }
      const updated = (await response.json()) as SiteData;
      setSiteData(updated);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <SiteDataContext.Provider value={{ siteData, updateSiteData }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within SiteDataProvider');
  }
  return context;
}
