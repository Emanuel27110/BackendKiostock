import { Router } from "express";
import { 
  getVendedores, 
  getVendedorRendimiento, 
  getTodosVendedoresRendimiento, 
  getHistorialVendedor 
} from "../controllers/rendimiento.controller.js";

const router = Router();

// Ruta para obtener todos los vendedores
router.get("/vendedores",  getVendedores);

// Ruta para obtener el rendimiento general de todos los vendedores
router.get("/rendimiento",  getTodosVendedoresRendimiento);

// Ruta para obtener el rendimiento específico de un vendedor
router.get("/rendimiento/:vendedor",  getVendedorRendimiento);

// Ruta para obtener el historial de ventas de un vendedor
router.get("/historial/:vendedor",  getHistorialVendedor);

export default router;