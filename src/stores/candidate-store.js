import { defineStore, acceptHMRUpdate } from "pinia";
import { api } from "src/boot/axios";

export const useCandidateStore = defineStore("candidate", {
  state: () => ({
    id: null,
    full_name: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    birth_date: null,
    age: null,
    chronological_age: null,
    diagnosis: "",
    info_channel: null,
    sheet: 1,
    loading: false,
    contacts: [],
    interviewee: {},
    errors: {},
  }),

  actions: {
    async fetchCandidate() {
      if (!this.id) return;
      let data = (await api.get(`candidates/${this.id}`)).data.data;
      this.$patch(data);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCandidateStore, import.meta.hot));
}
