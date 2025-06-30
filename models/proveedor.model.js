import mongoose from "mongoose";

const ProveedorSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    trim: true
  },
  contacto: { 
    type: String, 
    required: true,
    trim: true
  },
  telefono: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    trim: true
  },
  categoria: { 
    type: String, 
    required: true,
    trim: true
  },
  condicionesPago: { 
    type: String, 
    required: true,
    trim: true
  },
  direccion: { 
    type: String,
    trim: true
  },
  sitioWeb: { 
    type: String,
    trim: true
  },
  cuit: { 
    type: String,
    trim: true
  },
  notas: { 
    type: String,
    trim: true
  },
  activo: { 
    type: Boolean, 
    default: true 
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
ProveedorSchema.pre("findOneAndUpdate", function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Proveedor = mongoose.model("Proveedor", ProveedorSchema);

export default Proveedor;