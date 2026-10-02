import { Router, Request, Response, NextFunction } from 'express';
import { doctorService } from '../services/doctorService';

const router = Router();

/**
 * GET /api/doctors
 * List/filter doctors. Supports query params: specialty, language, minRating, city
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialty, language, minRating, city } = req.query;

    const doctors = await doctorService.search({
      specialty: specialty as string,
      language: language as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      city: city as string,
    });

    res.json({ count: doctors.length, doctors });
  } catch (error) {
    next(error);
  }
});

export default router;
