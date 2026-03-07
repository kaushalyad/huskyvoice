import { defineStore } from "pinia";
import { apiRequest } from "../lib/api";

const STORAGE_KEY = "huskyvoice_leave_auth";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(value) {
  try {
    if (!value) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    user: null,
    loading: false,
  }),
  getters: {
    isAuthed: (s) => Boolean(s.token && s.user),
    role: (s) => s.user?.role || null,
    companyCode: (s) => s.user?.companyCode || null,
    companyName: (s) => s.user?.companyName || null,
    managerName: (s) => s.user?.managerName || null,
    managerEmail: (s) => s.user?.managerEmail || null,
    leaveBalance: (s) => s.user?.leaveBalance ?? null,
  },
  actions: {
    init() {
      const saved = loadFromStorage();
      if (saved?.token && saved?.user) {
        this.token = saved.token;
        this.user = saved.user;
      }
    },
    async login({ email, password }) {
      this.loading = true;
      try {
        const data = await apiRequest("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        this.token = data.token;
        this.user = data.user;
        saveToStorage({ token: this.token, user: this.user });
        return data;
      } finally {
        this.loading = false;
      }
    },
    async register({ name, email, password, role, companyCode, companyName }) {
      this.loading = true;
      try {
        const data = await apiRequest("/api/auth/register", {
          method: "POST",
          body: { name, email, password, role, companyCode, companyName },
        });
        this.token = data.token;
        this.user = data.user;
        saveToStorage({ token: this.token, user: this.user });
        return data;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      saveToStorage(null);
    },
  },
});

