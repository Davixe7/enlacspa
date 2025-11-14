import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import Notify from 'src/utils/notify'

export const useSponsorStore = defineStore('sponsor', {
  state: () => ({
    loading: false,
    errors: {},
    sponsors: []
  }),
  actions: {
    validateAddresses(addresses) {
      const requiredFields = [
        'street',
        'inner_number',
        'outer_number',
        'neighborhood',
        'city',
        'state',
        'country',
        'email',
        'phone',
        'whatsapp'
      ]
      return addresses.filter((address) =>
        Object.values(requiredFields).some((field) => !!address[field])
      )
    },
    async saveData(sponsor) {
      this.loading = true
      this.errors = {}

      let data = new FormData()

      Object.keys(sponsor).forEach((key) => {
        if (sponsor[key] == null || key == 'addresses') return
        data.append(key, sponsor[key])
      })

      let addresses = this.validateAddresses(sponsor.addresses)
      addresses.forEach((address, i) => {
        Object.keys(address).forEach((key) => {
          console.log(address[key])
          data.append(`addresses[${i}][${key}]`, address[key])
        })
      })

      if (sponsor.id) {
        data.append('_method', 'PUT')
      }

      try {
        let route = sponsor.id ? `/sponsors/${sponsor.id}` : '/sponsors'
        let newSponsor = (await api.post(route, data)).data.data

        if (!sponsor.id) {
          this.sponsors.push(newSponsor)
        } else {
          let index = this.sponsors.findIndex((i) => i.id == sponsor.id)
          this.sponsors.splice(index, 1, newSponsor)
        }

        Notify.positive('Guardado con éxito')
        let redirectTo =
          this.router.currentRoute.value.name == 'sponsors.edit'
            ? `/padrinos/${sponsor.id}`
            : `/beneficiarios/${sponsor.candidate_id}/padrinos/${newSponsor.id}`
        this.router.push(redirectTo)
      } catch (error) {
        console.log(error)
        this.errors = error.status == 422 ? error.formatted : {}
        Notify.negative('No se pudo guardar')
      } finally {
        this.loading = false
      }
    },
    async fetchSponsors() {
      try {
        this.loading = true
        this.sponsors = (await api.get('sponsors')).data.data
      } catch (error) {
        this.errors = error.status == 422 && error.formatted ? error.formatted : {}
      }
      this.loading = false
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSponsorStore, import.meta.hot))
}
