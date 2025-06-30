
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    categoria: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    precio: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0, // No permitir stock negativo
    },
    imagen: {
      type: String,
      default: '', // Puedes poner una URL por defecto si lo deseas
    },
    codigoBarras: {
      type: String,  // Puedes almacenar el código de barras como una cadena de texto
      default: '',   // Dejar vacío por defecto
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Producto", productoSchema);