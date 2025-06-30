import Embutido from "../models/embutido.model.js";

// Registrar un nuevo embutido
export const createEmbutido = async (req, res) => {
  try {
    const { nombre, precioPorCienGramos, stockGramos } = req.body;
    const embutido = new Embutido({ nombre, precioPorCienGramos, stockGramos });
    await embutido.save();
    res.status(201).json(embutido);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el embutido", error });
  }
};


// Actualizar stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    const embutido = await Embutido.findById(id);

    if (!embutido) {
      return res.status(404).json({ message: "Embutido no encontrado" });
    }

    embutido.stockGramos += cantidad;
    if (embutido.stockGramos < 0) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    await embutido.save();
    res.json(embutido);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el stock", error });
  }
};

// Vender por gramos
export const sellByGrams = async (req, res) => {
  try {
    const { id } = req.params;
    const { gramos } = req.body;

    const embutido = await Embutido.findById(id);
    if (!embutido) {
      return res.status(404).json({ message: "Embutido no encontrado" });
    }

    if (embutido.stockGramos < gramos) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    embutido.stockGramos -= gramos;
    const precioTotal = (gramos / 100) * embutido.precioPorCienGramos;

    await embutido.save();
    res.json({ embutido, precioTotal });
  } catch (error) {
    res.status(500).json({ message: "Error al vender embutido", error });
  }
};

// Obtener todos los embutidos
export const getEmbutidos = async (req, res) => {
  try {
    const embutidos = await Embutido.find();
    res.status(200).json(embutidos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener embutidos", error });
  }
};

// Delete an embutido
export const deleteEmbutido = async (req, res) => {
  try {
    const { id } = req.params;
    const embutido = await Embutido.findByIdAndDelete(id);

    if (!embutido) {
      return res.status(404).json({ message: "Embutido no encontrado" });
    }

    res.status(200).json({ message: "Embutido eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar embutido", error });
  }
};

export const updateEmbutido = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precioPorCienGramos, stockGramos } = req.body;

    const embutido = await Embutido.findByIdAndUpdate(
      id, 
      { nombre, precioPorCienGramos, stockGramos }, 
      { new: true }
    );

    if (!embutido) {
      return res.status(404).json({ message: "Embutido no encontrado" });
    }

    res.json(embutido);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar embutido", error });
  }
};
