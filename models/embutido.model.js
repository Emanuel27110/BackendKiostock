import mongoose from "mongoose";

const embutidoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    precioPorCienGramos: {
      type: Number,
      required: true,
      min: 0,
    },
    stockGramos: {
      type: Number,
      required: true,
      min: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Embutido", embutidoSchema);
