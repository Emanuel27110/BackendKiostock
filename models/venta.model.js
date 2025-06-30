import mongoose from "mongoose";

const VentaSchema = new mongoose.Schema({
  productos: [
    {
      productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
      descripcion: { type: String, required: true },
      precio: { type: Number, required: true },
      cantidad: { type: Number, required: true },
      subtotal: { type: Number, required: true },
    },
  ],
  promociones: [
    {
      promocionId: { type: String, required: true },
      nombre: { type: String, required: true },
      precio: { type: Number, required: true },
      cantidad: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      tipoPromocion: { type: String, required: true },
      productosPromocion: [
        {
          productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
          cantidad: { type: Number, required: true }
        }
      ]
    }
  ],
  vendedor: { type: String, required: true },
  metodoPago: { type: String, required: true },
  total: { type: Number, required: true },
  qrLink: { type: String }, // Para MercadoPago
  createdAt: { type: Date, default: Date.now },
});

const Venta = mongoose.model("Venta", VentaSchema);

export default Venta;