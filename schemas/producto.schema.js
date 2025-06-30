import { z } from "zod";

export const productoSchema = z.object({
  categoria: z.string({
    required_error: "Se requiere una categoría",
  }),
  descripcion: z.string({
    required_error: "Debe proporcionar una descripción",
  }),
  precio: z.number({
    required_error: "Debe ingresar un precio válido",
  }).nonnegative("El precio no puede ser negativo"), // Validación para precios negativos
  stock: z.number({
    required_error: "Debe ingresar un stock válido",
  }).int().nonnegative("El stock no puede ser negativo"), // Validación para stock negativo
  date: z.string().datetime().optional(),
});
