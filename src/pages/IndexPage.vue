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
            <router-link :to="module.path">
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
            </router-link>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { api } from "src/boot/axios";
import { onMounted, ref } from "vue";
onMounted(async () => {
  slides.value = (await api.get('dashboard-slides')).data.data
  slide.value = slides.value[0].id
})
const slides = ref([])
const slide = ref(null);
const modules = ref([
  {
    label: "Candidatos y Evaluaciones",
    color: "#EE8B0080",
    icon: "candidatos",
    path: "/candidatos",
  },
  {
    label: "Beneficiarios",
    color: "#DD004A80",
    icon: "beneficiarios",
    path: "/beneficiarios",
  },
  {
    label: "Modulo 3",
    color: "#8DAF1280",
    icon: "rectangle",
    path: "/",
  },
  {
    label: "Padrinos",
    color: "#00659180",
    icon: "padrinos",
    path: "/padrinos",
  },
  {
    label: "Administración de Programas",
    color: "#98007780",
    icon: "administracion",
    path: "/",
  },
  {
    label: "Capacitaciones",
    color: "#D4242980",
    icon: "capacitaciones",
    path: "/",
  },
  {
    label: "Procuración de Fondos",
    color: "#36087680",
    icon: "fondos",
    path: "/",
  },
  {
    label: "Personal ENLAC",
    color: "#A3B8FF",
    icon: "personal",
    path: "/",
  },
]);
</script>

<style>
.row.q-col-gutter-xl {
  margin-left: -36px;
  margin-top: -36px;
}

.q-col-gutter-xl>* {
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
