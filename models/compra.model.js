import mongoose from "mongoose";

const CompraSchema = new mongoose.Schema({
  proveedor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Proveedor", 
    required: true 
  },
  productos: [
    {
      descripcion: { type: String, required: true },
      cantidad: { type: Number, required: true },
      precioUnitario: { type: Number, required: true },
      subtotal: { type: Number, required: true }
    }
  ],
  numeroFactura: { 
    type: String, 
    required: true,
    trim: true
  },
  fechaCompra: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  montoTotal: { 
    type: Number, 
    required: true 
  },
  formaPago: { 
    type: String, 
    required: true,
    trim: true
  },
  estado: { 
    type: String, 
    required: true,
    enum: ['Pendiente', 'Pagada', 'Cancelada'],
    default: 'Pendiente'
  },
  observaciones: { 
    type: String,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware para actualizar la fecha cuando se modifica un documento
CompraSchema.pre("findOneAndUpdate", function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Compra = mongoose.model("Compra", CompraSchema);

export default Compra;