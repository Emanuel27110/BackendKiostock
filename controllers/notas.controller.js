import Nota from "../models/notas.model.js";

// Crear una nueva nota
export const crearNota = async (req, res) => {
  try {
    const { titulo, contenido, creadaPor } = req.body;

    if (creadaPor !== "vendedor") {
      return res.status(403).json({ message: "Solo los vendedores pueden crear notas." });
    }

    const nuevaNota = new Nota({ titulo, contenido, creadaPor });
    await nuevaNota.save();
    res.status(201).json(nuevaNota);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la nota", error });
  }
};

// Obtener todas las notas
export const obtenerNotas = async (req, res) => {
  try {
    const notas = await Nota.find()
      .sort({ fechaCreacion: -1 })
      .lean(); // Convierte documentos a objetos JS simples para modificaciones
    
    res.json(
      notas.map((nota) => ({
        ...nota,
        fechaCreacion: new Date(nota.fechaCreacion).toLocaleString(), // Formato legible
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las notas", error });
  }
};

// Marcar una nota como leída
export const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await Nota.findByIdAndUpdate(id, { leida: true }, { new: true });
    res.json(nota);
  } catch (error) {
    res.status(500).json({ message: "Error al marcar la nota como leída", error });
  }
};

// Obtener notas no vistas por el administrador y notificar al admin
export const obtenerNotasNuevas = async (req, res) => {
  try {
    const notasNuevas = await Nota.find({ vistoPorAdmin: false });
    
    if (notasNuevas.length > 0) {
      // Aquí podrías integrar algún servicio de notificación (como correos electrónicos o WebSocket)
      console.log("Tienes nuevas notas sin leer.");
      // Si usas WebSocket o alguna otra librería, podrías enviar una notificación aquí
    }

    res.status(200).json(notasNuevas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notas nuevas", error });
  }
};


// Marcar todas las notas no vistas como vistas
export const marcarNotasComoVistas = async (req, res) => {
  try {
    await Nota.updateMany({ vistoPorAdmin: false }, { $set: { vistoPorAdmin: true } });
    res.status(200).json({ message: "Notas marcadas como vistas" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar notas", error });
  }
};

// Eliminar una nota
export const eliminarNota = async (req, res) => {
  try {
    const { id } = req.params;
    const notaEliminada = await Nota.findByIdAndDelete(id);

    if (!notaEliminada) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    res.status(200).json({ message: "Nota eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la nota", error });
  }
};
