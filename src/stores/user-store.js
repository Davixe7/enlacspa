import { defineStore, acceptHMRUpdate } from "pinia";
import { api } from "src/boot/axios";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loading: false,
    errors: {},
    baseUrl: new URL(api.defaults.baseURL).origin,
    data: {},
  }),

  actions: {
    async csrfCookie() {
      await api.get(`${baseUrl}/sanctum/csrf-cookie`);
    },
    async attemptLogin(data) {
      let router = useRouter();
      try {
        this.loading = true;
        await api.post(`${baseUrl}/login`, data);
        router.push("home");
      } catch (error) {
        if (!error.formated) return;
        this.errors = "Nombre de usuario o contrasenia incorrectos";
      }
      this.loading = false;
    },
    async fetchUser() {
      this.data.user = (await api.get("user")).data.data;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
