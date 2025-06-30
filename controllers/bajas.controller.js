// controllers/bajas.controller.js
import Baja from '../models/baja.model.js';
import Producto from '../models/producto.model.js';

// Obtener todas las bajas
export const getBajas = async (req, res) => {
  try {
    const bajas = await Baja.find()
      .populate('producto')
      .populate('user', 'nombre email username') // Agregamos campos para usuario
      .sort({ createdAt: -1 }); // Ordenar por fecha, las más recientes primero
    res.json(bajas);
  } catch (error) {
    console.error("Error al obtener bajas:", error);
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva baja
export const createBaja = async (req, res) => {
  const { productoId, cantidad, motivo, descripcion } = req.body;

  // Validar cantidad
  const cantidadNumerica = parseInt(cantidad, 10);
  if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
    return res.status(400).json({ message: 'Cantidad no válida' });
  }

  try {
    // Buscar producto
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar que haya suficiente stock
    if (producto.stock < cantidadNumerica) {
      return res.status(400).json({ 
        message: 'No hay suficiente stock para registrar esta baja',
        stockActual: producto.stock
      });
    }

    // Calcular valor de pérdida (usando precioVenta si existe, o precio si no)
    const precioProducto = producto.precioVenta || producto.precio;
    const valorPerdida = precioProducto * cantidadNumerica;

    // Crear la baja
    const nuevaBaja = new Baja({
      producto: productoId,
      cantidad: cantidadNumerica,
      motivo,
      descripcion,
      valorPerdida,
      user: req.user.id,
      date: new Date()
    });

    // Actualizar stock del producto
    producto.stock -= cantidadNumerica;
    await producto.save();

    // Guardar la baja
    const savedBaja = await nuevaBaja.save();
    
    // Devolver la baja con datos del producto
    const bajaConProducto = await Baja.findById(savedBaja._id)
      .populate('producto')
      .populate('user', 'nombre email username');
    
    res.status(201).json(bajaConProducto);
  } catch (error) {
    console.error('Error al registrar la baja:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener una baja por ID
export const getBaja = async (req, res) => {
  try {
    const baja = await Baja.findById(req.params.id)
      .populate('producto')
      .populate('user', 'nombre email username');
    
    if (!baja) {
      return res.status(404).json({ message: 'Baja no encontrada' });
    }
    
    return res.json(baja);
  } catch (error) {
    console.error('Error al obtener la baja:', error);
    res.status(500).json({ message: error.message });
  }
};

// Alias para mantener compatibilidad con ambas versiones
export const getBajaById = getBaja;

// Actualizar una baja existente
export const updateBaja = async (req, res) => {
  try {
    const { productoId, cantidad, motivo, descripcion } = req.body;
    
    // Obtener la baja actual
    const bajaActual = await Baja.findById(req.params.id).populate('producto');
    if (!bajaActual) {
      return res.status(404).json({ message: 'Baja no encontrada' });
    }
    
    // Obtener el producto nuevo si cambió
    const producto = productoId === bajaActual.producto._id.toString()
      ? bajaActual.producto
      : await Producto.findById(productoId);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Si el producto o la cantidad cambió, actualizar stock
    let stockDiferencia = 0;
    if (productoId !== bajaActual.producto._id.toString()) {
      // Si cambió el producto, devolver stock al producto anterior y restar al nuevo
      bajaActual.producto.stock += bajaActual.cantidad;
      await bajaActual.producto.save();
      
      // Verificar stock suficiente del nuevo producto
      if (producto.stock < cantidad) {
        return res.status(400).json({ message: 'Stock insuficiente para realizar la baja' });
      }
      
      stockDiferencia = cantidad;
    } else if (cantidad !== bajaActual.cantidad) {
      // Si solo cambió la cantidad, calcular diferencia
      stockDiferencia = cantidad - bajaActual.cantidad;
      
      // Verificar stock suficiente si aumentó la cantidad
      if (stockDiferencia > 0 && producto.stock < stockDiferencia) {
        return res.status(400).json({ message: 'Stock insuficiente para aumentar la baja' });
      }
    }
    
    // Actualizar stock del producto
    producto.stock -= stockDiferencia;
    await producto.save();
    
    // Calcular valor perdido (usando precioVenta si existe, o precio si no)
    const precioProducto = producto.precioVenta || producto.precio;
    const valorPerdida = precioProducto * cantidad;
    
    // Actualizar la baja
    const bajaActualizada = await Baja.findByIdAndUpdate(
      req.params.id,
      {
        producto: productoId,
        cantidad,
        motivo,
        descripcion,
        valorPerdida,
        // No actualizamos el usuario para mantener quién hizo el registro original
      },
      { new: true }
    )
    .populate('producto')
    .populate('user', 'nombre email username');
    
    res.json(bajaActualizada);
  } catch (error) {
    console.error('Error al actualizar baja:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar una baja
export const deleteBaja = async (req, res) => {
  try {
    // Obtener la baja
    const baja = await Baja.findById(req.params.id);
    if (!baja) {
      return res.status(404).json({ message: 'Baja no encontrada' });
    }
    
    // Obtener el producto
    const producto = await Producto.findById(baja.producto);
    if (producto) {
      // Devolver stock al producto
      producto.stock += baja.cantidad;
      await producto.save();
    }
    
    // Eliminar la baja
    await Baja.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Baja eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar baja:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener estadísticas de bajas
export const getEstadisticasBajas = async (req, res) => {
  try {
    // Estadísticas por motivo
    const estadisticasPorMotivo = await Baja.aggregate([
      {
        $group: {
          _id: '$motivo',
          cantidad: { $sum: '$cantidad' },
          valorTotal: { $sum: '$valorPerdida' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Total de pérdidas
    const totalPerdidas = await Baja.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$valorPerdida' },
          cantidadTotal: { $sum: '$cantidad' },
          countTotal: { $sum: 1 }
        }
      }
    ]);

    // Productos con más bajas
    const productosMasBajas = await Baja.aggregate([
      {
        $group: {
          _id: '$producto',
          cantidad: { $sum: '$cantidad' },
          valorTotal: { $sum: '$valorPerdida' },
          count: { $sum: 1 }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 5 }
    ]);

    // Poblar datos de productos
    const productosIds = productosMasBajas.map(item => item._id);
    const productosInfo = await Producto.find({ 
      _id: { $in: productosIds } 
    });

    const productosMasBajasConInfo = productosMasBajas.map(item => {
      const productoInfo = productosInfo.find(p => p._id.toString() === item._id.toString());
      return {
        ...item,
        descripcion: productoInfo ? productoInfo.descripcion : 'Producto no encontrado'
      };
    });

    res.json({
      porMotivo: estadisticasPorMotivo,
      total: totalPerdidas[0] || { total: 0, cantidadTotal: 0, countTotal: 0 },
      productosMasBajas: productosMasBajasConInfo
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de bajas' });
  }
};

// Obtener bajas por rango de fechas
export const getBajasPorFecha = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  try {
    const query = {};
    
    if (fechaInicio && fechaFin) {
      query.createdAt = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }
    
    const bajas = await Baja.find(query)
      .populate('producto')
      .populate('user', 'nombre email username')
      .sort({ createdAt: -1 });
      
    res.json(bajas);
  } catch (error) {
    console.error('Error al obtener bajas por fecha:', error);
    res.status(500).json({ message: error.message });
  }
};