import { isAuthenticated, getToken, fetchAuthQuery } from "@/lib/auth-server"

export { isAuthenticated, getToken, fetchAuthQuery }

export interface AuthContext {
	userId: string
}
