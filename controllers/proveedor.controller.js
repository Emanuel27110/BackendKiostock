import Proveedor from "../models/proveedor.model.js";
import Compra from "../models/compra.model.js";

// Crear un nuevo proveedor
export const createProveedor = async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, categoria, condicionesPago, direccion, sitioWeb, cuit, notas } = req.body;

    // Validar campos obligatorios
    if (!nombre || !contacto || !telefono || !email || !categoria || !condicionesPago) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const nuevoProveedor = new Proveedor({
      nombre,
      contacto,
      telefono,
      email,
      categoria,
      condicionesPago,
      direccion,
      sitioWeb,
      cuit,
      notas
    });

    await nuevoProveedor.save();

    res.status(201).json(nuevoProveedor);
  } catch (error) {
    console.error("Error al crear el proveedor:", error);
    res.status(500).json({ message: "Error al crear el proveedor", error: error.message });
  }
};

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
  try {
    const { activo } = req.query;
    let filtro = {};
    
    // Si se especifica el parámetro activo, filtrar por ese valor
    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }
    
    const proveedores = await Proveedor.find(filtro);
    res.status(200).json(proveedores);
  } catch (error) {
    console.error("Error al obtener los proveedores:", error);
    res.status(500).json({ message: "Error al obtener los proveedores", error: error.message });
  }
};

// Obtener un proveedor por ID
export const getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findById(id);
    
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    
    res.status(200).json(proveedor);
  } catch (error) {
    console.error("Error al obtener el proveedor:", error);
    res.status(500).json({ message: "Error al obtener el proveedor", error: error.message });
  }
};

// Actualizar un proveedor
export const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, contacto, telefono, email, categoria, condicionesPago, direccion, sitioWeb, cuit, notas, activo } = req.body;
    
    // Verificar si el proveedor existe
    const proveedor = await Proveedor.findById(id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    
    // Preparar objeto con datos a actualizar
    const datosActualizados = {
      nombre,
      contacto,
      telefono,
      email,
      categoria,
      condicionesPago,
      direccion,
      sitioWeb,
      cuit,
      notas
    };
    
    // Solo incluye el campo activo si se proporciona
    if (activo !== undefined) {
      datosActualizados.activo = activo;
    }
    
    // Actualizar el proveedor
    const proveedorActualizado = await Proveedor.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true }
    );
    
    res.status(200).json(proveedorActualizado);
  } catch (error) {
    console.error("Error al actualizar el proveedor:", error);
    res.status(500).json({ message: "Error al actualizar el proveedor", error: error.message });
  }
};

// Eliminar un proveedor (borrado lógico)
export const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el proveedor existe
    const proveedor = await Proveedor.findById(id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    
    // Realizar borrado lógico (cambiar estado a inactivo)
    proveedor.activo = false;
    await proveedor.save();
    
    res.status(200).json({ message: "Proveedor eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error);
    res.status(500).json({ message: "Error al eliminar el proveedor", error: error.message });
  }
};

// Eliminar permanentemente un proveedor (borrado físico)
export const deleteProveedorPermanente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el proveedor existe
    const proveedor = await Proveedor.findById(id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    
    // Verificar si hay compras asociadas
    const comprasAsociadas = await Compra.findOne({ proveedor: id });
    if (comprasAsociadas) {
      return res.status(400).json({ 
        message: "No se puede eliminar el proveedor porque tiene compras asociadas",
        sugerencia: "Considere usar el borrado lógico en su lugar" 
      });
    }
    
    // Eliminar el proveedor físicamente
    await Proveedor.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Proveedor eliminado permanentemente" });
  } catch (error) {
    console.error("Error al eliminar permanentemente el proveedor:", error);
    res.status(500).json({ message: "Error al eliminar permanentemente el proveedor", error: error.message });
  }
};

// Obtener compras por proveedor
export const getComprasPorProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el proveedor existe
    const proveedor = await Proveedor.findById(id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    
    // Buscar compras asociadas al proveedor
    const compras = await Compra.find({ proveedor: id }).sort({ fechaCompra: -1 });
    
    res.status(200).json(compras);
  } catch (error) {
    console.error("Error al obtener las compras del proveedor:", error);
    res.status(500).json({ message: "Error al obtener las compras del proveedor", error: error.message });
  }
};

// Obtener estadísticas para el dashboard
export const getDashboardStats = async (req, res) => {
  try {
    // Total de proveedores
    const totalProveedores = await Proveedor.countDocuments({ activo: true });
    
    // Proveedores por categoría
    const proveedoresPorCategoria = await Proveedor.aggregate([
      { $match: { activo: true } },
      { $group: { _id: "$categoria", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Compras recientes (últimos 30 días)
    const fechaHace30Dias = new Date();
    fechaHace30Dias.setDate(fechaHace30Dias.getDate() - 30);
    
    const comprasRecientes = await Compra.find({
      fechaCompra: { $gte: fechaHace30Dias }
    }).populate('proveedor', 'nombre').sort({ fechaCompra: -1 }).limit(10);
    
    // Gastos por proveedor (top 5)
    const gastosPorProveedor = await Compra.aggregate([
      { 
        $group: { 
          _id: "$proveedor", 
          totalGastado: { $sum: "$montoTotal" },
          cantidadCompras: { $sum: 1 }
        } 
      },
      { $sort: { totalGastado: -1 } },
      { $limit: 5 },
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
          totalGastado: 1,
          cantidadCompras: 1,
          nombreProveedor: { $arrayElemAt: ["$proveedorInfo.nombre", 0] }
        }
      }
    ]);
    
    // Estado de compras
    const estadoCompras = await Compra.aggregate([
      { $group: { _id: "$estado", count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      totalProveedores,
      proveedoresPorCategoria,
      comprasRecientes,
      gastosPorProveedor,
      estadoCompras
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ message: "Error al obtener estadísticas del dashboard", error: error.message });
  }
};