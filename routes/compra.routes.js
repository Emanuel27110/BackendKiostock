import express from "express";
import { 
  createCompra, 
  getCompras, 
  getCompraById, 
  updateCompra, 
  deleteCompra,
  getEstadisticasCompras
} from "../controllers/compra.controller.js";

const router = express.Router();

// Ruta para crear una nueva compra
router.post("/compras", createCompra);

// Ruta para obtener todas las compras
router.get("/compras", getCompras);

// Ruta para obtener estadísticas de compras - MOVED EARLIER!
router.get("/compras/estadisticas", getEstadisticasCompras);

// Ruta para obtener una compra por ID - MOVED AFTER the specific route
router.get("/compras/:id", getCompraById);

// Ruta para actualizar una compra
router.put("/compras/:id", updateCompra);

// Ruta para eliminar una compra
router.delete("/compras/:id", deleteCompra);

export default router;