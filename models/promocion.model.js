// promocion.model.js
import mongoose from 'mongoose';

const PromocionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la promoción es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de promoción es obligatorio'],
    enum: ['2x1', 'Descuento por volumen', 'Descuento porcentaje', 'Pack combo']
  },
  producto1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: [true, 'Se requiere un producto principal']
  },
  producto2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    default: null
  },
  descuento: {
    type: Number,
    default: 0
  },
  cantidadMinima: {
    type: Number,
    default: 1,
    min: [1, 'La cantidad mínima debe ser al menos 1']
  },
  precio: {  // Nuevo campo añadido
    type: Number,
    required: true,
    min: 0
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria']
  },
  activa: {
    type: Boolean,
    default: true
  },
  ventasRealizadas: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pre-save para validaciones adicionales
PromocionSchema.pre('save', function(next) {
  // Validar que la fecha de fin sea posterior a la fecha de inicio
  if (this.fechaFin <= this.fechaInicio) {
    const error = new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    return next(error);
  }
  
  // Validaciones específicas por tipo de promoción
  if ((this.tipo === '2x1' || this.tipo === 'Pack combo') && !this.producto2Id) {
    const error = new Error(`El tipo de promoción ${this.tipo} requiere un segundo producto`);
    return next(error);
  }
  
  if ((this.tipo === 'Descuento por volumen' || this.tipo === 'Descuento porcentaje') && this.descuento <= 0) {
    const error = new Error('El descuento debe ser mayor que 0');
    return next(error);
  }
  
  if (this.tipo === 'Descuento por volumen' && this.cantidadMinima < 2) {
    const error = new Error('La cantidad mínima para descuento por volumen debe ser al menos 2');
    return next(error);
  }
  
  next();
});

export default mongoose.model('Promocion', PromocionSchema);
