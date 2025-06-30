// productos.routes.js
import { Router } from "express";
import { authRequired } from '../middlewares/validaToken.js';
import {
  getProductos,
  createProductos,
  getProducto,
  updateProductos,
  deleteProductos,
  actualizarStockProducto,
  consultarStock,
  getProductosBajoStock
} from "../controllers/productos.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { productoSchema } from "../schemas/producto.schema.js";

const router = Router();

// Primero las rutas específicas
router.get('/productos/bajo-stock', authRequired, getProductosBajoStock); // Mover esta ruta arriba
router.get('/productos/consultar-stock/:descripcion', authRequired, consultarStock);

// Luego las rutas con parámetros
router.get('/productos', authRequired, getProductos);
router.get('/productos/:id', authRequired, getProducto);
router.post('/productos', authRequired, validateSchema(productoSchema), createProductos);
router.delete('/productos/:id', authRequired, deleteProductos);
router.put('/productos/:id', authRequired, updateProductos);
router.put('/productos/:id/actualizar-stock', authRequired, actualizarStockProducto);

export default router;