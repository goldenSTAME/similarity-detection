// // src/services/authService.ts
// import axios from "axios";
//
// const API_BASE = "/api/auth";
//
// export const register = async (email: string, password: string, is_admin = false) => {
//     const response = await axios.post(`${API_BASE}/register`, { email, password, is_admin });
//     return response.data;
// };
//
// export const login = async (email: string, password: string) => {
//     const response = await axios.post(`${API_BASE}/login`, { email, password });
//     const { access_token } = response.data.data;
//     axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
//     localStorage.setItem("access_token", access_token);
//     return response.data;
// };
//
// export const logout = async () => {
//     const response = await axios.post(`${API_BASE}/logout`);
//     delete axios.defaults.headers.common["Authorization"];
//     localStorage.removeItem("access_token");
//     return response.data;
// };
//
// export const getUser = async () => {
//     const token = localStorage.getItem("access_token");
//     if (token) {
//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     }
//     const response = await axios.get(`${API_BASE}/user`);
//     return response.data;
// };
