import app from './App.js';
import { connectDB } from './db.js';

// Conectar a la base de datos
connectDB();

// Iniciar el servidor
const PORT = process.env.PORT || 4000;           // ← LÍNEA NUEVA
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // ← CAMBIO MÍNIMO
});