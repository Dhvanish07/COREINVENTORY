"use client";

const TOKEN_KEY = "coreinventory_token";

export const authStorage = {
  getToken: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};