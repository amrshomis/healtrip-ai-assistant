import { PrismaClient } from '@prisma/client';
import { DoctorSearchParams } from '../types';

const prisma = new PrismaClient();

/**
 * Doctor Service — All database queries for doctors.
 * Returns ONLY real database data. No fabrication.
 */
export const doctorService = {
  /**
   * Search doctors with optional filters.
   */
  async search(params: DoctorSearchParams) {
    const { specialty, language, minRating, city } = params;

    const doctors = await prisma.doctor.findMany({
      where: {
        ...(specialty && {
          specialty: {
            name: { contains: specialty },
          },
        }),
        ...(minRating && { rating: { gte: minRating } }),
      },
      include: {
        specialty: true,
        hospitals: {
          include: {
            hospital: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    // Filter by language (stored as JSON string array)
    let filtered = doctors;
    if (language) {
      filtered = doctors.filter((d) => {
        const langs: string[] = JSON.parse(d.languages);
        return langs.some((l) => l.toLowerCase().includes(language.toLowerCase()));
      });
    }

    // Filter by city (via hospital)
    if (city) {
      filtered = filtered.filter((d) =>
        d.hospitals.some((dh) =>
          dh.hospital.city.toLowerCase().includes(city.toLowerCase())
        )
      );
    }

    // Format for AI consumption
    return filtered.map((d) => ({
      id: d.id,
      name: d.name,
      nameAr: d.nameAr,
      specialty: d.specialty.name,
      specialtyAr: d.specialty.nameAr,
      yearsExperience: d.yearsExp,
      languages: JSON.parse(d.languages),
      rating: d.rating,
      bio: d.bio,
      bioAr: d.bioAr,
      consultationFee: d.consultationFee,
      availability: d.availability ? JSON.parse(d.availability) : null,
      hospitals: d.hospitals.map((dh) => ({
        name: dh.hospital.name,
        nameAr: dh.hospital.nameAr,
        city: dh.hospital.city,
        cityAr: dh.hospital.cityAr,
        country: dh.hospital.country,
        countryAr: dh.hospital.countryAr,
      })),
    }));
  },

  /**
   * List all doctors.
   */
  async listAll() {
    return this.search({});
  },
};
