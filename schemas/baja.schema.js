// baja.schema.js
import { z } from 'zod';

export const bajaSchema = z.object({
  productoId: z.string({
    required_error: "El ID del producto es requerido",
  }),
  cantidad: z.string().or(z.number()).transform(val => {
    const num = Number(val);
    if (isNaN(num)) throw new Error("La cantidad debe ser un número");
    if (num <= 0) throw new Error("La cantidad debe ser mayor que cero");
    return num;
  }),
  motivo: z.enum(["vencimiento", "rotura", "defecto", "otro"], {
    errorMap: () => ({ message: "Motivo no válido" }),
  }),
  descripcion: z.string({
    required_error: "La descripción es requerida",
  }).min(3, {
    message: "La descripción debe tener al menos 3 caracteres",
  }),
});