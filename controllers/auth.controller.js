import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { creaToken } from '../libs/jwt.js';

export const register = async (req, res) => {
  try {
    const { nombre, email, contraseña, rol } = req.body;
    
    console.log('Datos recibidos en registro:', { nombre, email, rol });
    
    const contraseñahash = await bcrypt.hash(contraseña, 10);
    
    const newUser = new User({
      nombre,
      email,
      contraseña: contraseñahash,
      rol: rol
    });
    
    const userSaved = await newUser.save();
    
    console.log('Usuario guardado:', {
      nombre: userSaved.nombre,
      email: userSaved.email,
      rol: userSaved.rol
    });
    
    const token = await creaToken({ id: userSaved._id });
    res.cookie('token', token);
    
    res.json({
      id: userSaved._id,
      nombre: userSaved.nombre,
      email: userSaved.email,
      rol: userSaved.rol,
      createAt: userSaved.createdAt,
      updateAt: userSaved.updatedAt
    });
  } catch (error) {
    console.error('Error en registro:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, contraseña } = req.body;
  
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json({ message: "usuario no encontrado" });
    
    const isMatch = await bcrypt.compare(contraseña, userFound.contraseña);
    if (!isMatch) return res.status(400).json({ message: "contraseña incorrecta" });
    
    const token = await creaToken({ id: userFound._id });
    res.cookie('token', token);
    
    res.json({
      id: userFound._id,
      nombre: userFound.nombre,
      email: userFound.email,
      rol: userFound.rol,
      createAt: userFound.createdAt,
      updateAt: userFound.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie('token', "", {
    expires: new Date(0)
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  const usuarioEncontrado = await User.findById(req.user.id);
  if (!usuarioEncontrado) return res.status(400).json({ message: "usuario no encontrado" });
  
  return res.json({
    id: usuarioEncontrado._id,
    nombre: usuarioEncontrado.nombre,
    email: usuarioEncontrado.email,
    rol: usuarioEncontrado.rol,
    createdAt: usuarioEncontrado.createdAt,
    updateAt: usuarioEncontrado.updatedAt,
  });
};