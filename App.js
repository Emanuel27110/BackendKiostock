import express from "express";
import morgan from "morgan";
import authRoutes from './routes/auth.routes.js';
import productoRoutes from './routes/productos.routes.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import ventasRoutes from "./routes/ventas.routes.js";
import notasRoutes from './routes/notas.routes.js';
import embutidosRoutes from './routes/embutidos.routes.js';
import ventasEmbutidosRoutes from './routes/ventasEmbutidos.routes.js';
import rendimientoRoutes from './routes/rendimiento.routes.js';
import bajasRoutes from './routes/bajas.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js'; // Importamos las rutas de proveedores
import compraRoutes from './routes/compra.routes.js'; // Importamos las rutas de compras
import promocionesRoutes from './routes/promociones.routes.js'; // Importamos las rutas de promociones

const app = express();

// CORS - funcionará igual que antes en desarrollo
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Puerto - usará 4000 en desarrollo
const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api", authRoutes);
app.use("/api", productoRoutes);
app.use("/api", ventasRoutes);
app.use("/api", notasRoutes);
app.use("/api", embutidosRoutes);
app.use("/api", ventasEmbutidosRoutes);
app.use("/api", rendimientoRoutes);
app.use("/api", bajasRoutes);
app.use("/api", proveedoresRoutes); // Añadimos las rutas de proveedores
app.use("/api", compraRoutes); // Añadimos las rutas de compras
app.use("/api", promocionesRoutes); // Añadimos las rutas de promociones

export default app;