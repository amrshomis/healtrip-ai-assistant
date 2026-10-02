import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

/**
 * Gemini function-calling tool definitions.
 * These define what tools the AI agent can call and their parameters.
 */
export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'searchDoctors',
    description:
      'Search for doctors in the HealTrip network. Use this tool when you need to find doctors for a specific specialty, language, or location. Always call this before recommending any doctor.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        specialty: {
          type: SchemaType.STRING,
          description:
            'Medical specialty to search for, e.g. "Cardiology", "Orthopedics", "Neurology", "Oncology", "Gastroenterology", "General Surgery"',
        },
        language: {
          type: SchemaType.STRING,
          description: 'Preferred language of the doctor, e.g. "Arabic", "English", "Turkish"',
        },
        minRating: {
          type: SchemaType.NUMBER,
          description: 'Minimum doctor rating (0-5 scale)',
        },
        city: {
          type: SchemaType.STRING,
          description: 'City where the doctor practices, e.g. "Istanbul", "Dubai", "Amman", "Ankara"',
        },
      },
    },
  },
  {
    name: 'searchHospitals',
    description:
      'Search for hospitals in the HealTrip network. Use this tool when you need to find hospitals by location, specialty, or accreditation.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        city: {
          type: SchemaType.STRING,
          description: 'City to search in, e.g. "Istanbul", "Dubai", "Amman", "Ankara"',
        },
        country: {
          type: SchemaType.STRING,
          description: 'Country to search in, e.g. "Turkey", "UAE", "Jordan"',
        },
        specialty: {
          type: SchemaType.STRING,
          description: 'Medical specialty the hospital should offer',
        },
        accreditation: {
          type: SchemaType.STRING,
          description: 'Accreditation type, e.g. "JCI"',
        },
      },
    },
  },
  {
    name: 'triageAssessment',
    description:
      'Assess the urgency level of patient symptoms. Use this BEFORE recommending any specific course of action. This tool uses rule-based logic (not AI) to classify urgency.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        symptoms: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'List of reported symptoms, e.g. ["chest pain", "shortness of breath"]',
        },
        duration: {
          type: SchemaType.STRING,
          description: 'How long the patient has had symptoms, e.g. "2 hours", "3 days", "1 week"',
        },
        severity: {
          type: SchemaType.NUMBER,
          description: 'Patient-reported severity on a 1-10 scale',
        },
        age: {
          type: SchemaType.NUMBER,
          description: 'Patient age in years (optional, helps with risk assessment)',
        },
      },
      required: ['symptoms', 'duration', 'severity'],
    },
  },
  {
    name: 'getSpecialtyInfo',
    description:
      'Get information about a medical specialty and how many doctors are available. Use when the patient asks about what kind of specialist they need.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        specialtyName: {
          type: SchemaType.STRING,
          description: 'Name of the specialty to look up',
        },
      },
      required: ['specialtyName'],
    },
  },
];
