import VentaEmbutido from "../models/ventaEmbutido.model.js";
import Embutido from "../models/embutido.model.js";

// Crear una nueva venta
export const createVentaEmbutido = async (req, res) => {
  try {
    const { embutidoId, vendedor, cantidadGramos } = req.body;

    // Buscar el embutido
    const embutido = await Embutido.findById(embutidoId);
    if (!embutido) {
      return res.status(404).json({ message: "Embutido no encontrado" });
    }

    // Verificar stock
    if (embutido.stockGramos < cantidadGramos) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    // Calcular precio total
    const precioTotal = (cantidadGramos / 100) * embutido.precioPorCienGramos;

    // Crear la venta
    const ventaEmbutido = new VentaEmbutido({
      embutido: embutidoId,
      vendedor,
      cantidadGramos,
      precioTotal,
      precioUnitario: embutido.precioPorCienGramos
    });

    // Actualizar stock
    embutido.stockGramos -= cantidadGramos;
    await embutido.save();

    // Guardar la venta
    await ventaEmbutido.save();

    // Populate embutido details
    await ventaEmbutido.populate('embutido');

    res.status(201).json(ventaEmbutido);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar la venta", error });
  }
};

// Obtener todas las ventas
export const getVentasEmbutidos = async (req, res) => {
  try {
    const ventas = await VentaEmbutido.find()
      .populate('embutido')
      .sort({ createdAt: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las ventas", error });
  }
};

// Eliminar una venta
export const deleteVentaEmbutido = async (req, res) => {
  try {
    const { id } = req.params;
    
    const venta = await VentaEmbutido.findById(id);
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    // Devolver el stock
    const embutido = await Embutido.findById(venta.embutido);
    if (embutido) {
      embutido.stockGramos += venta.cantidadGramos;
      await embutido.save();
    }

    await VentaEmbutido.findByIdAndDelete(id);
    res.json({ message: "Venta eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la venta", error });
  }
};

// Obtener ventas por fecha
export const getVentasByDate = async (req, res) => {
  try {
    const { fecha } = req.params;
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);

    const ventas = await VentaEmbutido.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('embutido');

    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las ventas por fecha", error });
  }
};

