export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolResults?: ToolResultDisplay[];
  timestamp: Date;
}

export interface ToolResultDisplay {
  type: 'doctors' | 'hospitals' | 'triage' | 'specialty';
  data: any;
}

export interface DoctorInfo {
  id: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  yearsExperience: number;
  languages: string[];
  rating: number;
  bio: string;
  bioAr: string;
  consultationFee: number;
  availability: { days: string[]; hours: string } | null;
  hospitals: HospitalBrief[];
}

export interface HospitalBrief {
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  country: string;
  countryAr: string;
}

export interface HospitalInfo {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  country: string;
  countryAr: string;
  address: string;
  rating: number;
  accreditation: string;
  specialties: string[];
  doctorCount: number;
  doctors: {
    name: string;
    nameAr: string;
    specialty: string;
    specialtyAr: string;
    rating: number;
  }[];
}

export interface TriageInfo {
  urgencyLevel: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  recommendedSpecialty: string;
  shouldVisitER: boolean;
  reasoning: string;
}

export type Language = 'en' | 'ar';
