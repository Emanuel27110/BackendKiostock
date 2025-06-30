import Venta from "../models/venta.model.js";
import Producto from "../models/producto.model.js";
import VentaEmbutido from "../models/ventaEmbutido.model.js";
import mercadopago from "mercadopago";
import dotenv from "dotenv";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Crear una venta
export const createVenta = async (req, res) => {
  try {
    const { productos = [], promociones = [], vendedor, metodoPago } = req.body;

    // Validar que existan productos O promociones, y que vendedor y metodoPago estén presentes
    if ((!productos?.length && !promociones?.length) || !vendedor || !metodoPago) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    let total = 0;
    const productosConSubtotal = [];
    const productosBajoStock = [];

    // Procesar productos regulares
    for (const producto of productos) {
      const productoDb = await Producto.findById(producto.productoId);
      if (!productoDb)
        return res
          .status(404)
          .json({ message: `Producto no encontrado: ${producto.productoId}` });

      if (productoDb.stock < producto.cantidad)
        return res
          .status(400)
          .json({ message: `Stock insuficiente para: ${productoDb.descripcion}` });

      const subtotal = productoDb.precio * producto.cantidad;
      total += subtotal;

      const nuevoStock = productoDb.stock - producto.cantidad;
      
      // Verificar si el nuevo stock estará bajo
      if (nuevoStock > 0 && nuevoStock <= 10) {
        productosBajoStock.push({
          descripcion: productoDb.descripcion,
          stock: nuevoStock
        });
      }

      productoDb.stock = nuevoStock;
      await productoDb.save();

      productosConSubtotal.push({
        ...producto,
        precio: productoDb.precio,
        subtotal,
        descripcion: productoDb.descripcion,
      });
    }

    // Procesar promociones
    const promocionesConSubtotal = [];
    for (const promocion of promociones) {
      // Agregar la promoción al total
      total += promocion.subtotal || promocion.precio * promocion.cantidad;

      // Procesar los productos de la promoción para descontar stock
      if (promocion.productosPromocion && promocion.productosPromocion.length > 0) {
        for (const prodPromocion of promocion.productosPromocion) {
          const productoDb = await Producto.findById(prodPromocion.productoId);
          if (!productoDb) {
            return res
              .status(404)
              .json({ message: `Producto no encontrado en promoción: ${prodPromocion.productoId}` });
          }

          const cantidadTotal = prodPromocion.cantidad * promocion.cantidad;
          if (productoDb.stock < cantidadTotal) {
            return res
              .status(400)
              .json({ message: `Stock insuficiente para: ${productoDb.descripcion} (promoción)` });
          }

          const nuevoStock = productoDb.stock - cantidadTotal;
          
          // Verificar si el nuevo stock estará bajo
          if (nuevoStock > 0 && nuevoStock <= 10) {
            productosBajoStock.push({
              descripcion: productoDb.descripcion,
              stock: nuevoStock
            });
          }

          productoDb.stock = nuevoStock;
          await productoDb.save();
        }
      }

      promocionesConSubtotal.push({
        ...promocion,
      });
    }

    const nuevaVenta = new Venta({
      productos: productosConSubtotal,
      promociones: promocionesConSubtotal, // Agregar promociones si el modelo lo soporta
      vendedor,
      metodoPago,
      total,
    });

    if (metodoPago === "mercadopago") {
      // Crear items para MercadoPago incluyendo productos y promociones
      const items = [
        ...productosConSubtotal.map((p) => ({
          title: p.descripcion,
          unit_price: p.precio,
          currency_id: "ARS",
          quantity: p.cantidad,
        })),
        ...promocionesConSubtotal.map((p) => ({
          title: p.nombre,
          unit_price: p.precio,
          currency_id: "ARS",
          quantity: p.cantidad,
        }))
      ];

      const preference = {
        items,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/success`,
          failure: `${process.env.FRONTEND_URL}/failure`,
          pending: `${process.env.FRONTEND_URL}/pending`,
        },
        auto_return: "approved",
      };

      const response = await mercadopago.preferences.create(preference);
      nuevaVenta.qrLink = response.body.init_point;
    }

    await nuevaVenta.save();
    
    // Devolver la venta y los productos con stock bajo
    res.status(201).json({
      venta: nuevaVenta,
      productosBajoStock: productosBajoStock
    });
  } catch (error) {
    console.error("Error al crear la venta:", error);
    res.status(500).json({ message: "Error al crear la venta", error });
  }
};

// Obtener todas las ventas
export const getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().populate("productos.productoId");
    res.status(200).json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las ventas", error });
  }
};

// Eliminar una venta por ID
export const deleteVenta = async (req, res) => {
  const { id } = req.params;

  try {
    const ventaEliminada = await Venta.findByIdAndDelete(id);

    if (!ventaEliminada) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    // Restaurar el stock de productos regulares
    for (const producto of ventaEliminada.productos) {
      const productoDb = await Producto.findById(producto.productoId);
      if (productoDb) {
        productoDb.stock += producto.cantidad;
        await productoDb.save();
      }
    }

    // Restaurar el stock de productos en promociones
    if (ventaEliminada.promociones) {
      for (const promocion of ventaEliminada.promociones) {
        if (promocion.productosPromocion && promocion.productosPromocion.length > 0) {
          for (const prodPromocion of promocion.productosPromocion) {
            const productoDb = await Producto.findById(prodPromocion.productoId);
            if (productoDb) {
              const cantidadTotal = prodPromocion.cantidad * promocion.cantidad;
              productoDb.stock += cantidadTotal;
              await productoDb.save();
            }
          }
        }
      }
    }

    res.status(200).json({ message: "Venta eliminada con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la venta", error });
  }
};

// Función para obtener ganancias por rango de fechas (incluyendo ventas de embutidos)
export const getVentasPorRango = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Fechas no proporcionadas' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ganancias Diarias de ventas regulares
    const ventasDiarias = await Venta.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$total" } } },
      { $sort: { _id: 1 } },
    ]);

    // Ganancias Diarias de ventas de embutidos
    const ventasEmbutidosDiarias = await VentaEmbutido.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$precioTotal" } } },
      { $sort: { _id: 1 } },
    ]);

    // Combinar ventas regulares y ventas de embutidos por día
    const ventasDiariasCombinadas = combinarVentas(ventasDiarias, ventasEmbutidosDiarias);

    // Ganancias Semanales de ventas regulares
    const ventasSemanales = await Venta.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $isoWeek: "$createdAt" }, total: { $sum: "$total" } } },
      { $sort: { _id: 1 } },
    ]);

    // Ganancias Semanales de ventas de embutidos
    const ventasEmbutidosSemanales = await VentaEmbutido.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $isoWeek: "$createdAt" }, total: { $sum: "$precioTotal" } } },
      { $sort: { _id: 1 } },
    ]);

    // Combinar ventas regulares y ventas de embutidos por semana
    const ventasSemanalesCombinadas = combinarVentas(ventasSemanales, ventasEmbutidosSemanales);

    // Ganancias Mensuales de ventas regulares
    const ventasMensuales = await Venta.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$total" } } },
      { $sort: { _id: 1 } },
    ]);

    // Ganancias Mensuales de ventas de embutidos
    const ventasEmbutidosMensuales = await VentaEmbutido.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$precioTotal" } } },
      { $sort: { _id: 1 } },
    ]);

    // Combinar ventas regulares y ventas de embutidos por mes
    const ventasMensualesCombinadas = combinarVentas(ventasMensuales, ventasEmbutidosMensuales);

    res.json({
      ventasDiarias: ventasDiariasCombinadas,
      ventasSemanales: ventasSemanalesCombinadas,
      ventasMensuales: ventasMensualesCombinadas,
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

// Función auxiliar para combinar los resultados de ventas normales y ventas de embutidos
const combinarVentas = (ventasRegulares, ventasEmbutidos) => {
  const ventasCombinadas = [...ventasRegulares];
  
  // Para cada venta de embutidos, buscar si ya existe una entrada con el mismo _id
  ventasEmbutidos.forEach(ventaEmbutido => {
    const ventaExistente = ventasCombinadas.find(venta => venta._id.toString() === ventaEmbutido._id.toString());
    
    if (ventaExistente) {
      // Si existe, sumar los totales
      ventaExistente.total += ventaEmbutido.total;
    } else {
      // Si no existe, agregar la venta de embutido a la lista combinada
      ventasCombinadas.push(ventaEmbutido);
    }
  });
  
  // Ordenar las ventas combinadas por _id
  return ventasCombinadas.sort((a, b) => {
    if (a._id < b._id) return -1;
    if (a._id > b._id) return 1;
    return 0;
  });
};