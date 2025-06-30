import {Schema, z} from "zod"  

export const registerSchema = z.object({
    nombre: z.string({
        required_error: "El nombre es requerido"
    }).min(2, {
        message: "El nombre debe tener al menos 2 caracteres"
    }),
    email: z.string({
        required_error: "El email es requerido"
    }).email({
        message: "Email inválido"
    }),
    contraseña: z.string({
        required_error: "La contraseña es requerida"
    }).min(8, {
        message: "La contraseña debe tener al menos 8 caracteres"
    }),
    rol: z.enum(['vendedor', 'administrador'], {
        required_error: "El rol es requerido"
    })
});

export const loginSchema= z.object ({
    email: z.string({
        required_error:"Email is required"
    }).email({
        message:"invalid email"
    }),
    contraseña: z.string({
        required_error:"Contraseña is required"
    }).min (8,{
        message:"la contraseña requiere un minimo de 8 caracteres"
    })
})