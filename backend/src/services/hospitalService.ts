import { PrismaClient } from '@prisma/client';
import { HospitalSearchParams } from '../types';

const prisma = new PrismaClient();

/**
 * Hospital Service — All database queries for hospitals.
 * Returns ONLY real database data.
 */
export const hospitalService = {
  /**
   * Search hospitals with optional filters.
   */
  async search(params: HospitalSearchParams) {
    const { city, country, specialty, accreditation } = params;

    const hospitals = await prisma.hospital.findMany({
      where: {
        ...(city && { city: { contains: city } }),
        ...(country && { country: { contains: country } }),
        ...(accreditation && { accreditation: { contains: accreditation } }),
      },
      include: {
        doctors: {
          include: {
            doctor: {
              include: { specialty: true },
            },
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    // Filter by specialty (stored as JSON string array)
    let filtered = hospitals;
    if (specialty) {
      filtered = hospitals.filter((h) => {
        const specs: string[] = JSON.parse(h.specialties);
        return specs.some((s) => s.toLowerCase().includes(specialty.toLowerCase()));
      });
    }

    return filtered.map((h) => ({
      id: h.id,
      name: h.name,
      nameAr: h.nameAr,
      city: h.city,
      cityAr: h.cityAr,
      country: h.country,
      countryAr: h.countryAr,
      address: h.address,
      rating: h.rating,
      accreditation: h.accreditation,
      specialties: JSON.parse(h.specialties),
      doctorCount: h.doctors.length,
      doctors: h.doctors.map((dh) => ({
        name: dh.doctor.name,
        nameAr: dh.doctor.nameAr,
        specialty: dh.doctor.specialty.name,
        specialtyAr: dh.doctor.specialty.nameAr,
        rating: dh.doctor.rating,
      })),
    }));
  },

  /**
   * List all hospitals.
   */
  async listAll() {
    return this.search({});
  },
};
