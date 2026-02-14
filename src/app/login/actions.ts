"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function loginAction(prevState: unknown, formData: FormData) {
    try {
        await signIn("credentials", formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email ou senha inválidos." }
                default:
                    return { error: "Ocorreu um erro. Tente novamente." }
            }
        }
        throw error // Re-throw redirect error
    }
}
