import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  duration: string;
  price: string;
}

export interface Certificate {
  id: string;
  title: string;
  imageUrl: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  contact: string;
}

export interface AboutHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface WorkFormat {
  title: string;
  description: string;
  bullets: string[];
}

export interface UiText {
  navigation: {
    home: string;
    about: string;
    services: string;
    contact: string;
  };
  hero: {
    primaryCta: string;
    secondaryCta: string;
    experienceLabel: string;
  };
  about: {
    educationTitle: string;
    certificatesTitle: string;
    highlights: AboutHighlight[];
  };
  services: {
    title: string;
    subtitle: string;
    formatTitle: string;
    formats: WorkFormat[];
    noteTitle: string;
    noteItems: string[];
  };
  contact: {
    title: string;
    subtitle: string;
    infoTitle: string;
    contactInfoTitles: {
      phone: string;
      email: string;
      contact: string;
    };
    privacyTitle: string;
    privacyDescription: string;
    formTitle: string;
    formLabels: {
      name: string;
      email: string;
      phone: string;
      message: string;
    };
    formPlaceholders: {
      name: string;
      email: string;
      phone: string;
      message: string;
    };
    submitIdle: string;
    submitLoading: string;
    consentText: string;
    toastSuccess: string;
    toastError: string;
  };
  footer: {
    descriptionPrefix: string;
    descriptionSuffix: string;
    quickLinksTitle: string;
    contactsTitle: string;
    rightsSuffix: string;
    roleLabel: string;
    adminLabel: string;
    consentLabel: string;
    consentTitle: string;
    consentText: string;
  };
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
  certificates: Certificate[];
  services: Service[];
  contactInfo: ContactInfo;
  uiText: UiText;
}

interface SiteDataContextType {
  siteData: SiteData | null;
  isLoading: boolean;
  updateSiteData: (data: Partial<SiteData>) => Promise<boolean>;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL ?? '';

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
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
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [apiBase]);

  const isEqualValue = (a: unknown, b: unknown) => {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  };

  const buildPartialUpdate = (current: SiteData, updates: Partial<SiteData>) => {
    const diff: Partial<SiteData> = {};
    for (const [key, value] of Object.entries(updates)) {
      const currentValue = current[key as keyof SiteData];
      if (!isEqualValue(currentValue, value)) {
        diff[key as keyof SiteData] = value as SiteData[keyof SiteData];
      }
    }
    return diff;
  };

  const updateSiteData = async (data: Partial<SiteData>) => {
    if (!siteData) {
      return false;
    }
    const payload = buildPartialUpdate(siteData, data);
    if (Object.keys(payload).length === 0) {
      return true;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${apiBase}/api/site-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
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
    <SiteDataContext.Provider value={{ siteData, isLoading, updateSiteData }}>
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
