import Venta from "../models/venta.model.js";
import VentaEmbutido from "../models/ventaEmbutido.model.js";
import User from "../models/user.model.js";

// Obtener todos los vendedores
export const getVendedores = async (req, res) => {
  try {
    const { incluirAdmins } = req.query;
    
    // Construir el filtro basado en si incluimos admins o no
    let filtro = {};
    
    if (incluirAdmins === "true") {
      // No aplicamos filtro de rol para incluir todos los usuarios
      filtro = {};
    } else {
      // Si no incluimos admins, filtramos por rol 'vendedor'
      filtro = { rol: 'vendedor' };
    }
    
    // Obtener usuarios según el filtro
    const vendedores = await User.find(filtro, { nombre: 1, email: 1, rol: 1 });
    
    // Mapear los resultados para incluir el campo esAdmin basado en el rol
    const vendedoresConEsAdmin = vendedores.map(vendedor => {
      return {
        _id: vendedor._id,
        nombre: vendedor.nombre,
        email: vendedor.email,
        rol: vendedor.rol,
        esAdmin: vendedor.rol === 'administrador'
      };
    });
    
    res.json(vendedoresConEsAdmin);
  } catch (error) {
    console.error('Error al obtener vendedores:', error);
    res.status(500).json({ message: 'Error al obtener vendedores', error: error.message });
  }
};

// Función auxiliar para obtener fechas
const getFechas = (periodo) => {
  const hoy = new Date();
  let fechaInicio = new Date();

  switch (periodo) {
    case 'diario':
      fechaInicio.setHours(0, 0, 0, 0);
      break;
    case 'semanal':
      // Retroceder hasta el inicio de la semana (domingo = 0)
      const dia = fechaInicio.getDay();
      fechaInicio.setDate(fechaInicio.getDate() - dia);
      fechaInicio.setHours(0, 0, 0, 0);
      break;
    case 'mensual':
      // Establecer el primer día del mes actual
      fechaInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
      break;
    default:
      fechaInicio.setHours(0, 0, 0, 0);
  }

  return { fechaInicio, fechaFin: hoy };
};

// Obtener rendimiento de un vendedor específico
export const getVendedorRendimiento = async (req, res) => {
  try {
    const { vendedor } = req.params;
    const { periodo = 'diario' } = req.query;
    
    const { fechaInicio, fechaFin } = getFechas(periodo);
    
    // Verificar si el vendedor existe y obtener su información
    const vendedorInfo = await User.findOne({ 
      $or: [
        { nombre: vendedor }, 
        { _id: vendedor }
      ]
    });
    
    if (!vendedorInfo) {
      return res.status(404).json({ message: 'Vendedor no encontrado' });
    }
    
    // Determinar si es admin basado en el rol
    const esAdmin = vendedorInfo.rol === 'administrador';
    
    // Buscar ventas regulares del vendedor
    const ventas = await Venta.find({ 
      vendedor: vendedorInfo.nombre,
      createdAt: { $gte: fechaInicio, $lte: fechaFin }
    });
    
    // Buscar ventas de embutidos del vendedor
    const ventasEmbutidos = await VentaEmbutido.find({
      vendedor: vendedorInfo.nombre,
      createdAt: { $gte: fechaInicio, $lte: fechaFin }
    }).populate('embutido');
    
    // Calcular métricas
    const totalVentasRegulares = ventas.length;
    const totalVentasEmbutidos = ventasEmbutidos.length;
    const totalVentas = totalVentasRegulares + totalVentasEmbutidos;
    
    const totalImporteRegulares = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const totalImporteEmbutidos = ventasEmbutidos.reduce((sum, venta) => sum + venta.precioTotal, 0);
    const totalImporte = totalImporteRegulares + totalImporteEmbutidos;
    
    // Agrupar ventas por día
    const ventasPorDia = {};
    
    // Procesar ventas regulares por día
    ventas.forEach(venta => {
      const fecha = venta.createdAt.toISOString().split('T')[0];
      if (!ventasPorDia[fecha]) {
        ventasPorDia[fecha] = {
          cantidadRegulares: 0,
          cantidadEmbutidos: 0,
          importeRegulares: 0,
          importeEmbutidos: 0
        };
      }
      ventasPorDia[fecha].cantidadRegulares += 1;
      ventasPorDia[fecha].importeRegulares += venta.total;
    });
    
    // Procesar ventas de embutidos por día
    ventasEmbutidos.forEach(venta => {
      const fecha = venta.createdAt.toISOString().split('T')[0];
      if (!ventasPorDia[fecha]) {
        ventasPorDia[fecha] = {
          cantidadRegulares: 0,
          cantidadEmbutidos: 0,
          importeRegulares: 0,
          importeEmbutidos: 0
        };
      }
      ventasPorDia[fecha].cantidadEmbutidos += 1;
      ventasPorDia[fecha].importeEmbutidos += venta.precioTotal;
    });
    
    // Convertir el objeto a array para la respuesta
    const ventasDiariaArray = Object.keys(ventasPorDia).map(fecha => ({
      fecha,
      cantidadRegulares: ventasPorDia[fecha].cantidadRegulares,
      cantidadEmbutidos: ventasPorDia[fecha].cantidadEmbutidos,
      importeRegulares: ventasPorDia[fecha].importeRegulares,
      importeEmbutidos: ventasPorDia[fecha].importeEmbutidos,
      cantidadTotal: ventasPorDia[fecha].cantidadRegulares + ventasPorDia[fecha].cantidadEmbutidos,
      importeTotal: ventasPorDia[fecha].importeRegulares + ventasPorDia[fecha].importeEmbutidos
    })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    // Obtener productos más vendidos por este vendedor
    const productosMasVendidos = [];
    ventas.forEach(venta => {
      venta.productos.forEach(producto => {
        const index = productosMasVendidos.findIndex(p => p.descripcion === producto.descripcion);
        if (index !== -1) {
          productosMasVendidos[index].cantidad += producto.cantidad;
          productosMasVendidos[index].importe += producto.subtotal;
        } else {
          productosMasVendidos.push({
            descripcion: producto.descripcion,
            cantidad: producto.cantidad,
            importe: producto.subtotal
          });
        }
      });
    });
    
    // Ordenar productos por cantidad vendida (descendente)
    productosMasVendidos.sort((a, b) => b.cantidad - a.cantidad);
    
    // Obtener embutidos más vendidos por este vendedor
    const embutidosMasVendidos = [];
    ventasEmbutidos.forEach(venta => {
      const index = embutidosMasVendidos.findIndex(e => e.nombre === venta.embutido.nombre);
      if (index !== -1) {
        embutidosMasVendidos[index].cantidadGramos += venta.cantidadGramos;
        embutidosMasVendidos[index].importe += venta.precioTotal;
      } else {
        embutidosMasVendidos.push({
          nombre: venta.embutido.nombre,
          cantidadGramos: venta.cantidadGramos,
          importe: venta.precioTotal
        });
      }
    });
    
    // Ordenar embutidos por cantidad vendida (descendente)
    embutidosMasVendidos.sort((a, b) => b.cantidadGramos - a.cantidadGramos);
    
    res.json({
      vendedor: vendedorInfo.nombre,
      esAdmin: esAdmin,
      periodo,
      metricas: {
        totalVentasRegulares,
        totalVentasEmbutidos,
        totalVentas,
        totalImporteRegulares,
        totalImporteEmbutidos,
        totalImporte,
        promedioImportePorVenta: totalVentas > 0 ? totalImporte / totalVentas : 0
      },
      detalleVentasDiarias: ventasDiariaArray,
      productosMasVendidos: productosMasVendidos.slice(0, 5), // Top 5
      embutidosMasVendidos: embutidosMasVendidos.slice(0, 5) // Top 5
    });
    
  } catch (error) {
    console.error('Error al obtener rendimiento del vendedor:', error);
    res.status(500).json({ message: 'Error al obtener rendimiento del vendedor', error: error.message });
  }
};

// Obtener rendimiento de todos los vendedores
export const getTodosVendedoresRendimiento = async (req, res) => {
  try {
    const { tipoVenta, periodo, fechaInicio: fechaInicioParam, fechaFin: fechaFinParam, incluirAdmins = "false" } = req.query;
    
    // Convertir el string "true"/"false" en un booleano
    const incluirAdminsBoolean = incluirAdmins === "true";
    
    // Si se proporcionan fechas específicas, úsalas; de lo contrario, usa las predeterminadas
    let fechaInicio, fechaFin;
    
    if (fechaInicioParam && fechaFinParam) {
      fechaInicio = new Date(fechaInicioParam);
      fechaFin = new Date(fechaFinParam);
      // Asegurarse de que la fecha fin sea hasta el final del día
      fechaFin.setHours(23, 59, 59, 999);
    } else {
      // Usar la función auxiliar anterior
      const fechas = getFechas(periodo || 'mensual');
      fechaInicio = fechas.fechaInicio;
      fechaFin = fechas.fechaFin;
    }
    
    // Construir el filtro para incluir o excluir administradores
    let filtroUsuarios = {};

    if (!incluirAdminsBoolean) {
      // Usamos el campo rol para filtrar
      filtroUsuarios = { rol: 'vendedor' };
    }
    // Si incluirAdminsBoolean es true, no aplicamos filtro para incluir a todos
    
    // Obtener todos los usuarios según el filtro
    const vendedores = await User.find(filtroUsuarios);
    
    // Para cada vendedor, obtener sus métricas agregadas
    const rendimientoData = await Promise.all(vendedores.map(async (vendedor) => {
      // Configurar el filtro de ventas según el tipo de venta seleccionado
      let filtroVentasRegulares = {
        vendedor: vendedor.nombre,
        createdAt: { $gte: fechaInicio, $lte: fechaFin }
      };
        
      let filtroVentasEmbutidos = {
        vendedor: vendedor.nombre,
        createdAt: { $gte: fechaInicio, $lte: fechaFin }
      };
        
      // Buscar ventas según el tipo seleccionado
      let ventas = [];
      let ventasEmbutidos = [];
        
      if (tipoVenta === 'todas' || tipoVenta === 'regular' || !tipoVenta) {
        ventas = await Venta.find(filtroVentasRegulares);
      }
        
      if (tipoVenta === 'todas' || tipoVenta === 'embutido' || !tipoVenta) {
        ventasEmbutidos = await VentaEmbutido.find(filtroVentasEmbutidos);
      }
        
      // Calcular métricas
      const cantidadVentas = ventas.length + ventasEmbutidos.length;
      const montoTotal = ventas.reduce((sum, venta) => sum + venta.total, 0) +
                      ventasEmbutidos.reduce((sum, venta) => sum + venta.precioTotal, 0);
        
      return {
        id: vendedor._id,
        nombre: vendedor.nombre,
        esAdmin: vendedor.rol === 'administrador', // Convertir rol a esAdmin
        cantidadVentas,
        montoTotal
      };
    }));

    // Filtramos vendedores sin ventas en el período si es necesario
    const resultado = rendimientoData
      .filter(item => item.cantidadVentas > 0)
      .sort((a, b) => b.montoTotal - a.montoTotal); // Ordenar por monto total (mayor a menor)
      
    res.json(resultado);
      
  } catch (error) {
    console.error('Error al obtener rendimiento general:', error);
    res.status(500).json({ message: 'Error al obtener rendimiento general', error: error.message });
  }
};

// Obtener historial de ventas de un vendedor
export const getHistorialVendedor = async (req, res) => {
  try {
    const { vendedor } = req.params;
    const { desde, hasta } = req.query;
    
    // Verificar si el vendedor existe y obtener su información
    const vendedorInfo = await User.findOne({ 
      $or: [
        { nombre: vendedor }, 
        { _id: vendedor }
      ]
    });
    
    if (!vendedorInfo) {
      return res.status(404).json({ message: 'Vendedor no encontrado' });
    }
    
    let filtroFecha = {};
    
    if (desde || hasta) {
      filtroFecha = {};
      if (desde) {
        const fechaDesde = new Date(desde);
        fechaDesde.setHours(0, 0, 0, 0);
        filtroFecha['$gte'] = fechaDesde;
      }
      if (hasta) {
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        filtroFecha['$lte'] = fechaHasta;
      }
    }
    
    // Buscar ventas regulares del vendedor
    const ventas = await Venta.find({ 
      vendedor: vendedorInfo.nombre,
      ...(Object.keys(filtroFecha).length > 0 ? { createdAt: filtroFecha } : {})
    }).sort({ createdAt: -1 });
    
    // Buscar ventas de embutidos del vendedor
    const ventasEmbutidos = await VentaEmbutido.find({
      vendedor: vendedorInfo.nombre,
      ...(Object.keys(filtroFecha).length > 0 ? { createdAt: filtroFecha } : {})
    }).populate('embutido').sort({ createdAt: -1 });
    
    // Combinar y ordenar por fecha (más reciente primero)
    const todasVentas = [
      ...ventas.map(venta => ({
        id: venta._id,
        tipo: 'regular',
        fecha: venta.createdAt,
        importe: venta.total,
        metodoPago: venta.metodoPago,
        detalle: venta.productos.map(p => `${p.cantidad} x ${p.descripcion}`)
      })),
      ...ventasEmbutidos.map(venta => ({
        id: venta._id,
        tipo: 'embutido',
        fecha: venta.createdAt,
        importe: venta.precioTotal,
        detalle: [`${venta.cantidadGramos}g de ${venta.embutido.nombre}`]
      }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    res.json({
      vendedor: vendedorInfo.nombre,
      esAdmin: vendedorInfo.rol === 'administrador',
      ventas: todasVentas
    });
    
  } catch (error) {
    console.error('Error al obtener historial del vendedor:', error);
    res.status(500).json({ message: 'Error al obtener historial del vendedor', error: error.message });
  }
};