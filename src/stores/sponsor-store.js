import { defineStore } from "pinia";
import { api } from "src/boot/axios";
import Notify from "src/utils/notify";

export const useSponsorStore = defineStore("sponsor", {
  state: () => ({
    loading: false,
    errors: {},
    sponsors: [],
  }),
  actions: {
    async saveData(sponsor) {
      this.loading = true;
      try {
        let route = sponsor.id ? `/sponsors/${sponsor.id}` : "/sponsors";
        let data = sponsor.id ? { ...sponsor, _method: "PUT" } : { ...sponsor };
        let newSponsor = (await api.post(route, data)).data.data;

        if (!sponsor.id) {
          this.sponsors.push(newSponsor);
        } else {
          let index = this.sponsors.findIndex((i) => i.id == sponsor.id);
          this.sponsors.splice(index, 1, newSponsor);
        }

        Notify.positive("Guardado con éxito");
      } catch (error) {
        console.log(error);
        this.errors = error.status == 422 ? error.formatted : {};
        Notify.negative("No se pudo guardar");
      }
      this.loading = false;
    },
    async fetchSponsors() {
      try {
        this.loading = true;
        this.sponsors = (await api.get("sponsors")).data.data;
      } catch (error) {
        this.errors =
          error.status == 422 && error.formatted ? error.formatted : {};
      }
      this.loading = false;
    },
  },
});
