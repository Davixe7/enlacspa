import { defineStore, acceptHMRUpdate } from "pinia";
import { api } from "src/boot/axios";

export const useContactStore = defineStore("contact", {
  state: () => ({
    loading: false,
    errors: {},
  }),

  actions: {
    async validate(data) {
      try {
        await api.post(`contacts/validate`, data);
        this.errors = {};
        return true;
      } catch (error) {
        if (error.status == 422) {
          this.errors = error.response.data.errors;
        }
        return false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useContactStore, import.meta.hot));
}
