<template>
  <q-page>
    <q-carousel
      autoplay
      infinite
      v-model="slide"
      transition-prev="fade"
      transition-next="fade"
      control-color="white"
      swipeable
      animated
      navigation
      arrows
      height="366px"
      class="bg-grey-13 text-white rounded-borders q-mb-lg"
    >
      <q-carousel-slide
        v-for="slide in slides"
        :key="slide.id"
        :name="slide.id"
        class="column no-wrap flex-center"
        :img-src="slide.picture"
      >
      </q-carousel-slide>
    </q-carousel>

    <div>
      <div class="row q-col-gutter-lg">
        <div
          class="col col-12 col-md-3"
          v-for="module in modules"
          :key="module.name"
        >
          <q-card
            class="module-card"
            :style="{ background: module.color }"
          >
            <div
              @click="navigateTo(module)"
              style="cursor: pointer"
            >
              <q-card-section style="padding: 36px">
                <q-img
                  :src="`/${module.icon}.png`"
                  width="74px"
                  fit="contain"
                ></q-img>
                <div>
                  {{ module.label }}
                </div>
              </q-card-section>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null) // Variable para almacenar la información del usuario
const navigateTo = (module) => {
  if (module.external) {
    // Si es externo, abre la URL fuera de tu sistema
    // '_blank' abre en pestaña nueva. Usa '_self' si quieres que sea en la misma pestaña.
    window.open(module.path, '_blank', 'noopener,noreferrer')
  } else {
    // Si es interno, navega usando Vue Router
    router.push(module.path)
  }
}
const fetchUser = async () => {
  user.value = (await api.get('user')).data.data
  console.log('Usuario actual:', user.value) // Muestra la información del usuario en la consola
  if (user.value.is_admin || user.value.work_area_id === 6 || user.value.work_area_id === 11) {
    /**
     * Si el usuario es administrador o pertenece a las áreas de trabajo 6:Administración o 11: Recursos Humanos, actualiza la ruta del módulo "Personal ENLAC" con el ID del usuario codificado en base64.
     * Esto permite que el módulo "Personal ENLAC" tenga una URL personalizada para cada usuario, asegurando que solo los usuarios autorizados puedan acceder a la información correspondiente.
     */
    updatePersonalModulePath()
  }
}
const updatePersonalModulePath = () => {
  const moduloPersonal = modules.value.find((m) => m.label === 'Personal ENLAC')
  if (moduloPersonal) {
    const base64_id = btoa(user.value.id) // Codifica el ID del usuario en base64
    moduloPersonal.path = 'https://sistemaenlac.com/personal_enlac?key=' + base64_id
    moduloPersonal.external = true // Asegura que el módulo se abra en una nueva pestaña
  }
}

onMounted(async () => {
  slides.value = (await api.get('dashboard-slides')).data.data
  slide.value = slides.value.length ? slides.value[0].id : null
  fetchUser()
})
const slides = ref([])
const slide = ref(null)
const modules = ref([
  {
    label: 'Candidatos y Evaluaciones',
    color: '#EE8B0080',
    icon: 'candidatos',
    path: '/candidatos'
  },
  {
    label: 'Admisiones y Beneficiarios',
    color: '#DD004A80',
    icon: 'beneficiarios',
    path: '/beneficiarios'
  },
  {
    label: 'Tesorería',
    color: '#8DAF1280',
    icon: 'tesoreria',
    path: '/tesoreria'
  },
  {
    label: 'Padrinos',
    color: '#00659180',
    icon: 'padrinos',
    path: '/padrinos'
  },
  {
    label: 'Reportes de Programas',
    color: '#98007780',
    icon: 'administracion',
    path: '/reportes'
  },
  {
    label: 'Capacitaciones',
    color: '#D4242980',
    icon: 'capacitaciones',
    path: '/capacitaciones'
  },
  {
    label: 'Donantes',
    color: '#36087680',
    icon: 'fondos',
    path: '/donors'
  },
  {
    label: 'Personal ENLAC',
    color: '#A3B8FF',
    icon: 'personal',
    path: ``,
    external: false // Inicialmente no es externo, se actualizará después de obtener el usuario
  }
])
</script>

<style>
.row.q-col-gutter-xl {
  margin-left: -36px;
  margin-top: -36px;
}

.q-col-gutter-xl > * {
  padding-left: 36px;
  padding-top: 36px;
}

.module-card {
  text-align: center;
  border-radius: 8px;
}

.module-card .q-img {
  margin-bottom: 8px;
}

.module-card a {
  color: #111827;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
}
</style>
