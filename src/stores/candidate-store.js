import { farClosedCaptioning } from "@quasar/extras/fontawesome-v5";
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
    onboard_at: null,
    loading: farClosedCaptioning,
    contacts: [],
    picture: null,
    evaluation_schedule: null,
    interviewee: {},
    program: null,
    errors: {},
  }),

  actions: {
    async fetchCandidate() {
      if (!this.id) return;
      try {
        this.loading = true;
        let data = (await api.get(`candidates/${this.id}`)).data.data;
        this.$patch(data);
        this.loading = false;
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCandidateStore, import.meta.hot));
}
