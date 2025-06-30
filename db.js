import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conexión a MongoDB Atlas exitosa");
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos", error);
    process.exit(1); // Termina el proceso si la conexión falla
  }
};