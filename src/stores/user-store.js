import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let url = new URL(api.defaults.baseURL).origin
    return {
      loading: false,
      errors: {},
      baseUrl: url,
      data: {},
      notifications: []
    }
  },
  getters: {
    unreadNotificationsCount() {
      return this.notifications.length
    }
  },
  actions: {
    can(permission) {
      if (!this.data.user) return false
      return this.data.user.permissions.includes(permission)
    },
    async csrfCookie() {
      await api.get(`${this.baseUrl}/sanctum/csrf-cookie`)
    },
    async attemptLogout() {
      await api.post(`${this.baseUrl}/logout`)
      this.router.push('login')
    },
    async attemptLogin(data) {
      try {
        this.loading = true
        await api.post(`${this.baseUrl}/login`, data)
        this.router.push('home')
      } catch (error) {
        if (error.status == 422) {
          this.errors = {
            email: 'Nombre de usuario o contrasenia incorrectos'
          }
        }
      }
      this.loading = false
    },
    async fetchUser() {
      this.data.user = (await api.get('user')).data.data
      this.notifications = this.data.user.notifications
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
