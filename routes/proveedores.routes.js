import express from "express";
import { 
  createProveedor, 
  getProveedores, 
  getProveedorById, 
  updateProveedor, 
  deleteProveedor, 
  deleteProveedorPermanente,
  getComprasPorProveedor,
  getDashboardStats
} from "../controllers/proveedor.controller.js";

const router = express.Router();

// Rutas específicas primero
router.get("/proveedores/dashboard/stats", getDashboardStats);

// Rutas con parámetros después
router.get("/proveedores/:id", getProveedorById);
router.get("/proveedores/:id/compras", getComprasPorProveedor);

// Resto de rutas
router.get("/proveedores", getProveedores);
router.post("/proveedores", createProveedor);
router.put("/proveedores/:id", updateProveedor);
router.delete("/proveedores/:id", deleteProveedor);
router.delete("/proveedores/:id/permanente", deleteProveedorPermanente);

export default router;