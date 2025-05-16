import api, { handler } from "./api";

export const fetchSession = () => handler(() => api.get(`auth`));

export const register = (name: string, password: string, email?: string) =>
  handler(() => api.post(`auth/register`, { name, password, email }));

export const fetchUsername = (name: string) =>
  handler(() => api.get(`auth/username/${name}`));

export const login = (name: string, password: string) =>
  handler(() => api.post(`auth/login`, { name, password }));

export const updateUser = (name: string, email: string) =>
  handler(() => {
    api.patch(`auth`, { name, email });
  });

export const logout = () => handler(() => api.post(`auth/logout`));

export const sendMail = (email: string, password?: string) =>
  handler(() => api.post(`auth/sendmail`, { email, password }));

export const verifyMail = (token: string) =>
  handler(() => api.post(`auth/verifymail`, { token }));
