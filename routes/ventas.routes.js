import express from "express";
import { createVenta, getVentas, deleteVenta, getVentasPorRango } from "../controllers/venta.controller.js"; 


const router = express.Router();

// Ruta para crear una nueva venta
router.post("/ventas", createVenta);

// Ruta para obtener todas las ventas
router.get("/ventas", getVentas);

// Ruta para eliminar una venta por su ID
router.delete("/ventas/:id", deleteVenta);

// Ruta para obtener ventas por rango de fechas
router.get("/caja", getVentasPorRango);


export default router;
