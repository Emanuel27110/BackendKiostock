import { Router } from "express";
import {
  crearNota,
  obtenerNotas,
  marcarLeida,
  obtenerNotasNuevas,
  marcarNotasComoVistas,
  eliminarNota
} from "../controllers/notas.controller.js";

const router = Router();

// Crear una nueva nota
router.post("/notas", crearNota);

// Obtener todas las notas
router.get("/notas", obtenerNotas);

// Marcar una nota como leída
router.put("/notas/:id/leida", marcarLeida);

// Obtener notas no vistas por el administrador
router.get("/notas/nuevas", obtenerNotasNuevas);

// Marcar todas las notas no vistas como vistas
router.put("/notas/marcar-vistas", marcarNotasComoVistas);

// Eliminar una nota
router.delete("/notas/:id", eliminarNota);


export default router;
