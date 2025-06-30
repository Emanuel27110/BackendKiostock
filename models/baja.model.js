// models/baja.model.js
import mongoose from 'mongoose';

const bajaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1 // Mínimo una unidad
  },
  motivo: {
    type: String,
    enum: ['vencimiento', 'rotura', 'defecto', 'otro'], // Tipos de motivos
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  valorPerdida: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // El campo date se mantuvo del modelo original
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Baja', bajaSchema);