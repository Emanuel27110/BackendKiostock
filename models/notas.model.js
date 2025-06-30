import mongoose from "mongoose";

const notaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  creadaPor: { type: String, enum: ['vendedor'], required: true },
  leida: { type: Boolean, default: false },
  vistoPorAdmin: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now }, // Fecha y hora de creación
});

export default mongoose.model("Nota", notaSchema);
