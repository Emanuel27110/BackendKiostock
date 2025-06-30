// promocion.controller.js
import Promocion from '../models/promocion.model.js';
import Producto from "../models/producto.model.js";
import Venta from "../models/venta.model.js"; // ✅ AGREGAR ESTA LÍNEA

export const obtenerPromociones = async (req, res) => {
  try {
    const promociones = await Promocion.find();
    res.json(promociones);
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    res.status(500).json({ mensaje: 'Error al obtener promociones' });
  }
};

export const crearPromocion = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
      nombre,
      descripcion,
      tipo,
      producto1Id,
      producto2Id,
      descuento,
      cantidadMinima,
      precio,
      fechaInicio,
      fechaFin,
      activa
    } = req.body;

    // Validar datos requeridos
    if (!nombre || !descripcion || !tipo || !producto1Id || !precio || !fechaInicio || !fechaFin) {
      return res.status(400).json({ 
        mensaje: 'Faltan campos requeridos',
        detalles: 'Nombre, descripción, tipo, producto principal, fecha inicio y fecha fin son obligatorios'
      });
    }

    // Verificar que existe el producto principal
    const producto1 = await Producto.findById(producto1Id);
    if (!producto1) {
      return res.status(400).json({ mensaje: 'El producto principal no existe' });
    }

    // Si es de tipo 2x1 o Pack combo, verificar producto secundario
    if ((tipo === '2x1' || tipo === 'Pack combo') && !producto2Id) {
      return res.status(400).json({ mensaje: 'Se requiere un producto secundario para este tipo de promoción' });
    }

    // Si se especificó un producto secundario, verificar que existe
    if (producto2Id) {
      const producto2 = await Producto.findById(producto2Id);
      if (!producto2) {
        return res.status(400).json({ mensaje: 'El producto secundario no existe' });
      }
    }

    // Crear la nueva promoción
    const nuevaPromocion = new Promocion({
      nombre,
      descripcion,
      tipo,
      producto1Id,
      producto2Id: producto2Id || null,
      descuento: parseFloat(descuento) || 0,
      cantidadMinima: parseInt(cantidadMinima) || 1,
      precio: parseFloat(precio)|| 0,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      activa: activa !== undefined ? activa : true,
      ventasRealizadas: 0
    });

    // Guardar la promoción en la base de datos
    await nuevaPromocion.save();
    
    res.status(201).json({ 
      mensaje: 'Promoción creada exitosamente', 
      promocion: nuevaPromocion 
    });
  } catch (error) {
    console.error('Error al crear promoción:', error);
    res.status(500).json({ 
      mensaje: 'Error al crear la promoción',
      error: error.message 
    });
  }
};

export const obtenerPromocionPorId = async (req, res) => {
  try {
    const promocion = await Promocion.findById(req.params.id);
    if (!promocion) {
      return res.status(404).json({ mensaje: 'Promoción no encontrada' });
    }
    res.json(promocion);
  } catch (error) {
    console.error('Error al obtener promoción:', error);
    res.status(500).json({ mensaje: 'Error al obtener la promoción' });
  }
};

export const actualizarPromocion = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      tipo,
      producto1Id,
      producto2Id,
      descuento,
      cantidadMinima,
      precio,
      fechaInicio,
      fechaFin,
      activa
    } = req.body;

    // Validar datos requeridos
    if (!nombre || !descripcion || !tipo || !producto1Id || !precio || !fechaInicio || !fechaFin) {
      return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    const promocionActualizada = await Promocion.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        tipo,
        producto1Id,
        producto2Id: producto2Id || null,
        descuento: parseFloat(descuento) || 0,
        cantidadMinima: parseInt(cantidadMinima) || 1,
        precio: parseFloat(precio)|| 0,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        activa: activa !== undefined ? activa : true
      },
      { new: true }
    );

    if (!promocionActualizada) {
      return res.status(404).json({ mensaje: 'Promoción no encontrada' });
    }

    res.json({ 
      mensaje: 'Promoción actualizada exitosamente', 
      promocion: promocionActualizada 
    });
  } catch (error) {
    console.error('Error al actualizar promoción:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la promoción' });
  }
};

export const eliminarPromocion = async (req, res) => {
  try {
    const promocion = await Promocion.findByIdAndDelete(req.params.id);
    if (!promocion) {
      return res.status(404).json({ mensaje: 'Promoción no encontrada' });
    }
    res.json({ mensaje: 'Promoción eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la promoción' });
  }
};

export const finalizarPromocion = async (req, res) => {
  try {
    const promocion = await Promocion.findById(req.params.id);
    if (!promocion) {
      return res.status(404).json({ mensaje: 'Promoción no encontrada' });
    }

    promocion.activa = false;
    await promocion.save();

    res.json({ 
      mensaje: 'Promoción finalizada exitosamente', 
      promocion 
    });
  } catch (error) {
    console.error('Error al finalizar promoción:', error);
    res.status(500).json({ mensaje: 'Error al finalizar la promoción' });
  }
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const promociones = await Promocion.find();
    
    // Calcular estadísticas
    const totalPromociones = promociones.length;
    const promocionesActivas = promociones.filter(p => p.activa).length;
    const totalVentas = promociones.reduce((total, p) => total + (p.ventasRealizadas || 0), 0);
    
    // Agrupar por tipo
    const tiposPromociones = {};
    promociones.forEach(p => {
      if (!tiposPromociones[p.tipo]) {
        tiposPromociones[p.tipo] = 0;
      }
      tiposPromociones[p.tipo]++;
    });

    res.json({
      totalPromociones,
      promocionesActivas,
      totalVentas,
      tiposPromociones
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
};

export const incrementarVentas = async (req, res) => {
  try {
    const promocion = await Promocion.findById(req.params.id);
    if (!promocion) {
      return res.status(404).json({ mensaje: 'Promoción no encontrada' });
    }

    promocion.ventasRealizadas = (promocion.ventasRealizadas || 0) + 1;
    await promocion.save();

    res.json({ 
      mensaje: 'Ventas incrementadas exitosamente', 
      promocion 
    });
  } catch (error) {
    console.error('Error al incrementar ventas:', error);
    res.status(500).json({ mensaje: 'Error al incrementar ventas' });
  }
};
export const getEstadisticasCompletas = async (req, res) => {
  try {
    // Obtener todas las promociones
    const promociones = await Promocion.find();
    
    // Obtener todas las ventas que incluyen promociones
    const ventas = await Venta.find({ "promociones.0": { $exists: true } });
    
    // Calcular estadísticas por promoción
    const estadisticasPromociones = promociones.map(promocion => {
      // Filtrar ventas que incluyen esta promoción específica
      const ventasConPromocion = ventas.filter(venta => 
        venta.promociones.some(promo => promo.promocionId === promocion._id.toString())
      );
      
      // Calcular totales para esta promoción
      let totalVentas = 0;
      let totalIngresos = 0;
      let cantidadUnidadesVendidas = 0;
      
      ventasConPromocion.forEach(venta => {
        const promosEnVenta = venta.promociones.filter(promo => 
          promo.promocionId === promocion._id.toString()
        );
        
        promosEnVenta.forEach(promo => {
          totalVentas += promo.cantidad;
          totalIngresos += promo.subtotal;
          cantidadUnidadesVendidas += promo.cantidad;
        });
      });
      
      return {
        ...promocion.toObject(),
        ventasRealizadas: totalVentas,
        ingresosTotales: totalIngresos,
        unidadesVendidas: cantidadUnidadesVendidas,
        numeroTransacciones: ventasConPromocion.length
      };
    });
    
    // Calcular estadísticas generales
    const totalPromociones = promociones.length;
    const promocionesActivas = promociones.filter(p => p.activa).length;
    const totalVentasPromociones = estadisticasPromociones.reduce((sum, promo) => sum + promo.ventasRealizadas, 0);
    const totalIngresosPromociones = estadisticasPromociones.reduce((sum, promo) => sum + promo.ingresosTotales, 0);
    
    // Estadísticas por tipo de promoción
    const estadisticasPorTipo = {};
    estadisticasPromociones.forEach(promo => {
      if (!estadisticasPorTipo[promo.tipo]) {
        estadisticasPorTipo[promo.tipo] = {
          cantidad: 0,
          ventas: 0,
          ingresos: 0
        };
      }
      estadisticasPorTipo[promo.tipo].cantidad += 1;
      estadisticasPorTipo[promo.tipo].ventas += promo.ventasRealizadas;
      estadisticasPorTipo[promo.tipo].ingresos += promo.ingresosTotales;
    });
    
    res.json({
      promociones: estadisticasPromociones,
      resumen: {
        totalPromociones,
        promocionesActivas,
        totalVentasPromociones,
        totalIngresosPromociones,
        promedioVentasPorPromocion: totalPromociones > 0 ? (totalVentasPromociones / totalPromociones).toFixed(2) : 0,
        promedioIngresosPorPromocion: totalPromociones > 0 ? (totalIngresosPromociones / totalPromociones).toFixed(2) : 0
      },
      estadisticasPorTipo
    });
    
  } catch (error) {
    console.error("Error al obtener estadísticas completas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};