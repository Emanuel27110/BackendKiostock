import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  contraseña: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['vendedor', 'administrador'],
    required: true
  }
}, {
  timestamps: true
});

// Agregar un método virtual para proporcionar esAdmin basado en el rol
userSchema.virtual('esAdmin').get(function() {
  return this.rol === 'administrador';
});

// Asegurarse de que los virtuals se incluyan cuando se convierte a JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Mantener esAdmin como un valor booleano
    ret.esAdmin = ret.rol === 'administrador';
    return ret;
  }
});

export default mongoose.model('User', userSchema);