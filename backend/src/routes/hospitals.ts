import { Router, Request, Response, NextFunction } from 'express';
import { hospitalService } from '../services/hospitalService';

const router = Router();

/**
 * GET /api/hospitals
 * List/filter hospitals. Supports query params: city, country, specialty, accreditation
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, country, specialty, accreditation } = req.query;

    const hospitals = await hospitalService.search({
      city: city as string,
      country: country as string,
      specialty: specialty as string,
      accreditation: accreditation as string,
    });

    res.json({ count: hospitals.length, hospitals });
  } catch (error) {
    next(error);
  }
});

export default router;
