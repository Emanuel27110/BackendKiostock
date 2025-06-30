// productos.controller.js
import Producto from '../models/producto.model.js';

export const getProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('user');
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

export const createProductos = async (req, res) => {
  const { categoria, descripcion, date, precio, stock } = req.body;

  const precioNumerico = parseFloat(precio);
  const stockNumerico = parseInt(stock, 10);

  if (isNaN(precioNumerico) || isNaN(stockNumerico)) {
    return res.status(400).json({ message: 'Precio o stock no válidos' });
  }

  const nuevoProducto = new Producto({
    categoria,
    descripcion,
    date,
    precio: precioNumerico,
    stock: stockNumerico,
    user: req.user.id
  });

  try {
    const savedProducto = await nuevoProducto.save();
    res.json(savedProducto);
  } catch (error) {
    console.error('Error al guardar el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};

export const getProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate('user');
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.json(producto);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

export const deleteProductos = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};

export const updateProductos = async (req, res) => {
  const { precio, stock } = req.body;

  const precioNumerico = parseFloat(precio);
  const stockNumerico = parseInt(stock, 10);

  if (isNaN(precioNumerico) || isNaN(stockNumerico)) {
    return res.status(400).json({ message: 'Precio o stock no válidos' });
  }

  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { ...req.body, precio: precioNumerico, stock: stockNumerico },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

export const actualizarStockProducto = async (req, res) => {
  const { cantidadVendida } = req.body;

  if (isNaN(cantidadVendida) || cantidadVendida <= 0) {
    return res.status(400).json({ message: 'Cantidad vendida inválida' });
  }

  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (producto.stock >= cantidadVendida) {
      producto.stock -= cantidadVendida;
      await producto.save();
      return res.json(producto);
    } else {
      return res.status(400).json({ message: "No hay suficiente stock disponible." });
    }
  } catch (error) {
    console.error("Error al actualizar el stock del producto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const consultarStock = async (req, res) => {
  const { descripcion } = req.params;

  try {
    const producto = await Producto.findOne({ descripcion: new RegExp(descripcion, 'i') });
    
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ descripcion: producto.descripcion, stock: producto.stock });
  } catch (error) {
    console.error("Error al consultar stock:", error);
    res.status(500).json({ message: "Error al consultar el stock" });
  }
};

// Nueva función para obtener productos con stock bajo
export const getProductosBajoStock = async (req, res) => {
  try {
    const productosBajoStock = await Producto.find({
      stock: { $gt: 0, $lte: 10 }
    });
    res.json(productosBajoStock);
  } catch (error) {
    console.error("Error al obtener productos con bajo stock:", error);
    res.status(500).json({ message: 'Error al obtener productos con bajo stock' });
  }
};
