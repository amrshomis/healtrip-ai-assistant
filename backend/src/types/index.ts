// ============================================
// HealTrip AI Assistant — Type Definitions
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  lang: 'en' | 'ar';
  conversationId?: string;
}

export interface ChatResponse {
  reply: string;
  toolResults?: ToolResultDisplay[];
  conversationId: string;
}

export interface ToolResultDisplay {
  type: 'doctors' | 'hospitals' | 'triage' | 'specialty';
  data: any;
}

export interface DoctorSearchParams {
  specialty?: string;
  language?: string;
  minRating?: number;
  city?: string;
}

export interface HospitalSearchParams {
  city?: string;
  country?: string;
  specialty?: string;
  accreditation?: string;
}

export interface TriageInput {
  symptoms: string[];
  duration: string;
  severity: number;
  age?: number;
}

export interface TriageResult {
  urgencyLevel: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  recommendedSpecialty: string;
  shouldVisitER: boolean;
  reasoning: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
