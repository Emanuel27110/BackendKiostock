import { Router } from "express";
import { authRequired } from "../middlewares/validaToken.js";
import { createEmbutido, updateStock, sellByGrams, getEmbutidos, deleteEmbutido, updateEmbutido } from "../controllers/embutidos.controller.js";

const router = Router();

// Obtener todos los embutidos
router.get("/embutidos", getEmbutidos);

// Crear un nuevo embutido
router.post("/embutidos",  createEmbutido);

// Actualizar stock
router.put("/embutidos/:id/actualizar-stock", updateStock);

// Vender por gramos
router.post("/embutidos/:id/vender",sellByGrams);

// Delete an embutido
router.delete("/embutidos/:id", deleteEmbutido);

// Add route for updating embutido
router.put("/embutidos/:id", updateEmbutido);

export default router;
