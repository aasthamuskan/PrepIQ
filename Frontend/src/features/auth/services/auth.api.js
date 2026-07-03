import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Registration failed. Please try again."
        throw new Error(message)
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Login failed. Please try again."
        throw new Error(message)
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Logout failed."
        throw new Error(message)
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        // getMe fails when user is not logged in — that's expected, just throw
        throw err
    }
}