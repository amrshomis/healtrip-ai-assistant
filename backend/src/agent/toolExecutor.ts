import { PrismaClient } from '@prisma/client';
import { doctorService } from '../services/doctorService';
import { hospitalService } from '../services/hospitalService';
import { TriageInput, TriageResult } from '../types';

const prisma = new PrismaClient();

/**
 * EMERGENCY symptom keywords — triggers immediate ER advice.
 */
const EMERGENCY_SYMPTOMS = [
  'chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'difficulty breathing',
  'severe bleeding', 'unconscious', 'seizure', 'anaphylaxis', 'severe allergic',
  'ألم في الصدر', 'نوبة قلبية', 'سكتة دماغية', 'صعوبة في التنفس', 'نزيف حاد',
  'فقدان الوعي', 'تشنجات', 'حساسية شديدة',
];

/**
 * Symptom-to-specialty mapping for triage routing.
 * Rule-based, NOT AI-generated — ensures deterministic, safe triage.
 */
const SYMPTOM_SPECIALTY_MAP: Record<string, string> = {
  // Cardiology
  'chest pain': 'Cardiology', 'heart palpitations': 'Cardiology', 'shortness of breath': 'Cardiology',
  'high blood pressure': 'Cardiology', 'irregular heartbeat': 'Cardiology',
  'ألم في الصدر': 'Cardiology', 'خفقان القلب': 'Cardiology', 'ضيق التنفس': 'Cardiology',
  // Orthopedics
  'joint pain': 'Orthopedics', 'back pain': 'Orthopedics', 'knee pain': 'Orthopedics',
  'fracture': 'Orthopedics', 'sports injury': 'Orthopedics', 'hip pain': 'Orthopedics',
  'ألم المفاصل': 'Orthopedics', 'ألم الظهر': 'Orthopedics', 'كسر': 'Orthopedics',
  // Neurology
  'headache': 'Neurology', 'migraine': 'Neurology', 'numbness': 'Neurology',
  'dizziness': 'Neurology', 'seizures': 'Neurology', 'memory loss': 'Neurology',
  'صداع': 'Neurology', 'دوخة': 'Neurology', 'تنميل': 'Neurology',
  // Oncology
  'tumor': 'Oncology', 'cancer': 'Oncology', 'lump': 'Oncology',
  'unexplained weight loss': 'Oncology',
  'ورم': 'Oncology', 'سرطان': 'Oncology',
  // Gastroenterology
  'stomach pain': 'Gastroenterology', 'acid reflux': 'Gastroenterology', 'nausea': 'Gastroenterology',
  'bloating': 'Gastroenterology', 'abdominal pain': 'Gastroenterology', 'diarrhea': 'Gastroenterology',
  'ألم المعدة': 'Gastroenterology', 'حرقة المعدة': 'Gastroenterology', 'غثيان': 'Gastroenterology',
  // General Surgery
  'hernia': 'General Surgery', 'appendicitis': 'General Surgery', 'gallstones': 'General Surgery',
  'فتق': 'General Surgery', 'التهاب الزائدة': 'General Surgery',
};

/**
 * Tool Executor — Executes tool calls requested by the AI model.
 * All results come from the database or deterministic rules.
 * NEVER fabricates data.
 */
export const toolExecutor = {
  /**
   * Execute a tool call by name with given arguments.
   */
  async execute(toolName: string, args: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'searchDoctors':
        return this.searchDoctors(args);
      case 'searchHospitals':
        return this.searchHospitals(args);
      case 'triageAssessment':
        return this.triageAssessment(args);
      case 'getSpecialtyInfo':
        return this.getSpecialtyInfo(args);
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  },

  async searchDoctors(args: Record<string, any>) {
    const results = await doctorService.search({
      specialty: args.specialty,
      language: args.language,
      minRating: args.minRating,
      city: args.city,
    });

    if (results.length === 0) {
      return {
        found: false,
        message: 'No doctors found matching the criteria in the HealTrip network.',
        suggestion: 'Try broadening your search criteria (different city or removing filters).',
      };
    }

    return {
      found: true,
      count: results.length,
      doctors: results,
    };
  },

  async searchHospitals(args: Record<string, any>) {
    const results = await hospitalService.search({
      city: args.city,
      country: args.country,
      specialty: args.specialty,
      accreditation: args.accreditation,
    });

    if (results.length === 0) {
      return {
        found: false,
        message: 'No hospitals found matching the criteria in the HealTrip network.',
        suggestion: 'Try searching in a different city or country.',
      };
    }

    return {
      found: true,
      count: results.length,
      hospitals: results,
    };
  },

  /**
   * Rule-based triage assessment.
   * Deterministic logic — NOT AI-generated — for safety.
   */
  triageAssessment(args: Record<string, any>): TriageResult {
    const { symptoms, duration, severity, age } = args as TriageInput;
    const symptomsLower = symptoms.map((s) => s.toLowerCase());

    // Check for emergency symptoms
    const isEmergency = symptomsLower.some((s) =>
      EMERGENCY_SYMPTOMS.some((es) => s.includes(es))
    );

    // Determine specialty from symptoms
    let recommendedSpecialty = 'General Surgery'; // default
    for (const symptom of symptomsLower) {
      for (const [key, specialty] of Object.entries(SYMPTOM_SPECIALTY_MAP)) {
        if (symptom.includes(key.toLowerCase())) {
          recommendedSpecialty = specialty;
          break;
        }
      }
    }

    // Calculate urgency
    let urgencyLevel: TriageResult['urgencyLevel'] = 'ROUTINE';

    if (isEmergency || severity >= 9) {
      urgencyLevel = 'EMERGENCY';
    } else if (severity >= 7 || (duration.includes('hour') && severity >= 5)) {
      urgencyLevel = 'URGENT';
    } else if (age && age > 60 && severity >= 5) {
      urgencyLevel = 'URGENT'; // Higher risk for elderly
    }

    const reasoning = this.buildTriageReasoning(urgencyLevel, symptomsLower, severity, duration);

    return {
      urgencyLevel,
      recommendedSpecialty,
      shouldVisitER: urgencyLevel === 'EMERGENCY',
      reasoning,
    };
  },

  buildTriageReasoning(
    urgency: string,
    symptoms: string[],
    severity: number,
    duration: string
  ): string {
    const parts: string[] = [];
    parts.push(`Symptoms reported: ${symptoms.join(', ')}.`);
    parts.push(`Duration: ${duration}. Severity: ${severity}/10.`);

    if (urgency === 'EMERGENCY') {
      parts.push('Assessment: EMERGENCY — Immediate medical attention recommended.');
    } else if (urgency === 'URGENT') {
      parts.push('Assessment: URGENT — Should see a specialist within 24-48 hours.');
    } else {
      parts.push('Assessment: ROUTINE — Schedule an appointment at your convenience.');
    }

    return parts.join(' ');
  },

  async getSpecialtyInfo(args: Record<string, any>) {
    const specialty = await prisma.specialty.findFirst({
      where: {
        name: { contains: args.specialtyName },
      },
      include: {
        _count: { select: { doctors: true } },
      },
    });

    if (!specialty) {
      return {
        found: false,
        message: `Specialty "${args.specialtyName}" not found in our network.`,
      };
    }

    return {
      found: true,
      name: specialty.name,
      nameAr: specialty.nameAr,
      description: specialty.description,
      availableDoctors: specialty._count.doctors,
    };
  },
};
