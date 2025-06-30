import Compra from "../models/compra.model.js";
import Proveedor from "../models/proveedor.model.js";

// Crear una nueva compra
export const createCompra = async (req, res) => {
  try {
    const { proveedor, productos, numeroFactura, fechaCompra, montoTotal, formaPago, estado, observaciones } = req.body;

    // Validar campos obligatorios
    if (!proveedor || !productos?.length || !numeroFactura || !montoTotal || !formaPago) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Verificar si el proveedor existe
    const proveedorExiste = await Proveedor.findById(proveedor);
    if (!proveedorExiste) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    // Calcular subtotales si no vienen calculados
    const productosConSubtotal = productos.map(producto => {
      if (!producto.subtotal) {
        producto.subtotal = producto.cantidad * producto.precioUnitario;
      }
      return producto;
    });

    // Crear la nueva compra
    const nuevaCompra = new Compra({
      proveedor,
      productos: productosConSubtotal,
      numeroFactura,
      fechaCompra: fechaCompra || new Date(),
      montoTotal,
      formaPago,
      estado: estado || 'Pendiente',
      observaciones
    });

    await nuevaCompra.save();

    res.status(201).json(nuevaCompra);
  } catch (error) {
    console.error("Error al crear la compra:", error);
    res.status(500).json({ message: "Error al crear la compra", error: error.message });
  }
};

// Obtener todas las compras
export const getCompras = async (req, res) => {
  try {
    const { estado, desde, hasta } = req.query;
    let filtro = {};
    
    // Filtrar por estado si se proporciona
    if (estado) {
      filtro.estado = estado;
    }
    
    // Filtrar por rango de fechas si se proporcionan
    if (desde || hasta) {
      filtro.fechaCompra = {};
      if (desde) {
        filtro.fechaCompra.$gte = new Date(desde);
      }
      if (hasta) {
        filtro.fechaCompra.$lte = new Date(hasta);
      }
    }
    
    const compras = await Compra.find(filtro)
      .populate('proveedor', 'nombre contacto telefono email')
      .sort({ fechaCompra: -1 });
    
    res.status(200).json(compras);
  } catch (error) {
    console.error("Error al obtener las compras:", error);
    res.status(500).json({ message: "Error al obtener las compras", error: error.message });
  }
};

// Obtener una compra por ID
export const getCompraById = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await Compra.findById(id)
      .populate('proveedor', 'nombre contacto telefono email categoria condicionesPago');
    
    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }
    
    res.status(200).json(compra);
  } catch (error) {
    console.error("Error al obtener la compra:", error);
    res.status(500).json({ message: "Error al obtener la compra", error: error.message });
  }
};

// Actualizar una compra
export const updateCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { productos, numeroFactura, fechaCompra, montoTotal, formaPago, estado, observaciones } = req.body;
    
    // Verificar si la compra existe
    const compra = await Compra.findById(id);
    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }
    
    // Calcular subtotales si no vienen calculados
    let productosActualizados = productos;
    if (productos) {
      productosActualizados = productos.map(producto => {
        if (!producto.subtotal) {
          producto.subtotal = producto.cantidad * producto.precioUnitario;
        }
        return producto;
      });
    }
    
    // Preparar objeto con datos a actualizar
    const datosActualizados = {};
    if (productosActualizados) datosActualizados.productos = productosActualizados;
    if (numeroFactura) datosActualizados.numeroFactura = numeroFactura;
    if (fechaCompra) datosActualizados.fechaCompra = fechaCompra;
    if (montoTotal) datosActualizados.montoTotal = montoTotal;
    if (formaPago) datosActualizados.formaPago = formaPago;
    if (estado) datosActualizados.estado = estado;
    if (observaciones !== undefined) datosActualizados.observaciones = observaciones;
    
    // Actualizar la compra
    const compraActualizada = await Compra.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true }
    ).populate('proveedor', 'nombre contacto telefono email');
    
    res.status(200).json(compraActualizada);
  } catch (error) {
    console.error("Error al actualizar la compra:", error);
    res.status(500).json({ message: "Error al actualizar la compra", error: error.message });
  }
};

// Eliminar una compra
export const deleteCompra = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la compra existe
    const compra = await Compra.findById(id);
    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }
    
    // Eliminar la compra
    await Compra.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Compra eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la compra:", error);
    res.status(500).json({ message: "Error al eliminar la compra", error: error.message });
  }
};

// Obtener estadísticas de compras
export const getEstadisticasCompras = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    let filtroFecha = {};
    if (desde || hasta) {
      filtroFecha = {};
      if (desde) {
        filtroFecha.$gte = new Date(desde);
      }
      if (hasta) {
        filtroFecha.$lte = new Date(hasta);
      }
    }
    
    // Total gastado en el período
    const totalGastado = await Compra.aggregate([
      { $match: { fechaCompra: filtroFecha } },
      { $group: { _id: null, total: { $sum: "$montoTotal" } } }
    ]);
    
    // Gastos por proveedor
    const gastosPorProveedor = await Compra.aggregate([
      { $match: { fechaCompra: filtroFecha } },
      { 
        $group: { 
          _id: "$proveedor", 
          total: { $sum: "$montoTotal" },
          cantidadCompras: { $sum: 1 }
        } 
      },
      { $sort: { total: -1 } },
      {
        $lookup: {
          from: "proveedores",
          localField: "_id",
          foreignField: "_id",
          as: "proveedorInfo"
        }
      },
      {
        $project: {
          _id: 1,
          total: 1,
          cantidadCompras: 1,
          proveedor: { $arrayElemAt: ["$proveedorInfo.nombre", 0] }
        }
      }
    ]);
    
    // Gastos por mes
    const gastosPorMes = await Compra.aggregate([
      { $match: { fechaCompra: filtroFecha } },
      {
        $group: {
          _id: {
            year: { $year: "$fechaCompra" },
            month: { $month: "$fechaCompra" }
          },
          total: { $sum: "$montoTotal" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Gastos por forma de pago
    const gastosPorFormaPago = await Compra.aggregate([
      { $match: { fechaCompra: filtroFecha } },
      { $group: { _id: "$formaPago", total: { $sum: "$montoTotal" } } },
      { $sort: { total: -1 } }
    ]);
    
    res.status(200).json({
      totalGastado: totalGastado.length > 0 ? totalGastado[0].total : 0,
      gastosPorProveedor,
      gastosPorMes,
      gastosPorFormaPago
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de compras:", error);
    res.status(500).json({ message: "Error al obtener estadísticas de compras", error: error.message });
  }
};