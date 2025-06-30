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

// Ruta para crear un nuevo proveedor
router.post("/proveedores", createProveedor);

// Ruta para obtener todos los proveedores
router.get("/proveedores", getProveedores);

// Ruta para obtener un proveedor por ID
router.get("/proveedores/:id", getProveedorById);

// Ruta para actualizar un proveedor
router.put("/proveedores/:id", updateProveedor);

// Ruta para eliminar un proveedor (borrado lógico)
router.delete("/proveedores/:id", deleteProveedor);

// Ruta para eliminar permanentemente un proveedor (borrado físico)
router.delete("/proveedores/:id/permanente", deleteProveedorPermanente);

// Ruta para obtener las compras de un proveedor
router.get("/proveedores/:id/compras", getComprasPorProveedor);

// Ruta para obtener estadísticas para el dashboard
router.get("/proveedores/dashboard/stats", getDashboardStats);

export default router;