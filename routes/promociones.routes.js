import express from 'express';
import * as promocionesController from '../controllers/promocion.controller.js';
import { authRequired } from '../middlewares/validaToken.js';

const router = express.Router();

// ✅ ORDEN CORRECTO: Rutas específicas ANTES que rutas con parámetros

// Rutas específicas primero
router.get('/promociones/estadisticas', authRequired, promocionesController.obtenerEstadisticas);
router.get('/promociones/estadisticas-completas', authRequired, promocionesController.getEstadisticasCompletas);

// Rutas generales
router.get('/promociones', authRequired, promocionesController.obtenerPromociones);
router.post('/promociones', authRequired, promocionesController.crearPromocion);

// Rutas con parámetros AL FINAL
router.get('/promociones/:id', authRequired, promocionesController.obtenerPromocionPorId);
router.put('/promociones/:id', authRequired, promocionesController.actualizarPromocion);
router.delete('/promociones/:id', authRequired, promocionesController.eliminarPromocion);
router.post('/promociones/:id/finalizar', authRequired, promocionesController.finalizarPromocion);
router.post('/promociones/:id/incrementar-ventas', authRequired, promocionesController.incrementarVentas);

export default router;