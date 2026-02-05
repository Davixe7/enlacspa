<script setup>
import { useAuthStore } from 'src/stores/user-store'
import { ref } from 'vue'

const authStore = useAuthStore()
const adminLinks = ref([
  { label: 'Notificaciones', link: '/notificaciones' },
  { label: 'Catálogo de Actividades', link: '/actividades' },
  { label: 'Administración de Grupos', link: '/grupos' },
  { label: 'Horarios de Equinoterapia', link: '/horarios-equinoterapia' },
  { label: 'Usuarios', link: '/usuarios' },
  { label: 'Areas', link: '/areas-de-trabajo' },
  { label: 'Puestos', link: '/puestos' },
  { label: 'Carrusel', link: '/carrusel' }
])
</script>

<template>
  <q-btn
    flat
    round
    color="white"
    icon="arrow_drop_down"
  >
    <q-menu :offset="[0, 15]">
      <q-list
        style="min-width: 255px"
        dense
      >
        <q-item
          clickable
          v-close-popup
        >
          <q-item-section avatar>
            <q-icon name="notifications" />
          </q-item-section>
          <q-item-section>Notificaciones</q-item-section>
        </q-item>
        <q-expansion-item
          v-if="authStore.data.user.is_admin"
          dense
          expand-separator
          icon="settings"
          label="Configuración"
        >
          <q-list
            dense
            style="padding-left: 22px"
          >
            <q-item
              clickable
              v-for="link in adminLinks"
              :key="link.link"
              :to="link.link"
            >
              <q-item-section>{{ link.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-item
          clickable
          v-close-popup
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section @click="authStore.attemptLogout()">Cerrar sesion</q-item-section>
        </q-item>
        <q-separator />
      </q-list>
    </q-menu>
  </q-btn>
</template>
