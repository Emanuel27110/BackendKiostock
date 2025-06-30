import { Router } from "express";
import {
  createVentaEmbutido,
  getVentasEmbutidos,
  deleteVentaEmbutido,
  getVentasByDate
} from "../controllers/ventasEmbutidos.controller.js";

const router = Router();

// Crear una nueva venta
router.post("/ventas-embutidos", createVentaEmbutido);

// Obtener todas las ventas
router.get("/ventas-embutidos", getVentasEmbutidos);

// Eliminar una venta
router.delete("/ventas-embutidos/:id", deleteVentaEmbutido);

// Obtener ventas por fecha
router.get("/ventas-embutidos/fecha/:fecha", getVentasByDate);



export default router;