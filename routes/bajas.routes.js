// bajas.routes.js
import { Router } from "express";
import { authRequired } from '../middlewares/validaToken.js';
import {
  getBajas,
  createBaja,
  getBaja,
  updateBaja,
  deleteBaja,
  getEstadisticasBajas,
  getBajasPorFecha
} from "../controllers/bajas.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { bajaSchema } from "../schemas/baja.schema.js";

const router = Router();

// Rutas para las bajas
router.get('/bajas', authRequired, getBajas);
router.post('/bajas', authRequired, validateSchema(bajaSchema), createBaja);
router.put('/bajas/:id', authRequired, validateSchema(bajaSchema), updateBaja);
router.get('/bajas/estadisticas', authRequired, getEstadisticasBajas);
router.get('/bajas/por-fecha', authRequired, getBajasPorFecha);
router.get('/bajas/:id', authRequired, getBaja);
router.delete('/bajas/:id', authRequired, deleteBaja,);

export default router;