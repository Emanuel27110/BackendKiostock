import { Router } from "express";
import { login, register, logout, profile } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/validaToken.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', logout);

router.get('/profile', authRequired, profile);

router.get('/users', authRequired, async (req, res) => {
  try {
    const users = await User.find({}, { contraseña: 0 });
    console.log('Usuarios encontrados:', users);
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', authRequired, async (req, res) => {
  try {
    const { nombre, email, rol, contraseña } = req.body;
    const updateData = { nombre, email, rol };
    
    // Solo actualizar la contraseña si se proporciona una nueva
    if (contraseña) {
      const contraseñaHash = await bcrypt.hash(contraseña, 10);
      updateData.contraseña = contraseñaHash;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    ).select("-contraseña");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado por otro usuario" });
    }
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', authRequired, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;