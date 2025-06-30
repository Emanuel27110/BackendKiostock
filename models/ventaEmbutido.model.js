import mongoose from "mongoose";

const ventaEmbutidoSchema = new mongoose.Schema(
  {
    embutido: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Embutido",
      required: true,
    },
    vendedor: {
      type: String,
      required: true,
    },
    cantidadGramos: {
      type: Number,
      required: true,
      min: 0,
    },
    precioTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    precioUnitario: {  // precio por 100g al momento de la venta
      type: Number,
      required: true,
      min: 0,
    },
    fecha: {
      type: Date,
      default: Date.now 
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("VentaEmbutido", ventaEmbutidoSchema);