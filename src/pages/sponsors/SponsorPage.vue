<script setup>
import { api } from 'src/boot/axios'
import SponsorProfile from 'src/components/SponsorProfile.vue'
import SponsorshipsTable from 'src/pages/sponsors/SponsorshipsTable.vue'
import { onMounted, ref } from 'vue'

const props = defineProps(['sponsorId'])
const sponsor = ref({})
const loading = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    sponsor.value = (await api.get(`/sponsors/${props.sponsorId}`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex items-center justify-between q-mb-md">
    <h1 class="page-title q-my-none">Detalles del Padrino</h1>
    <q-btn
      color="primary"
      :to="`${props.sponsorId}/editar`"
      label="Editar perfil"
    />
  </div>
  <SponsorProfile :sponsorId="sponsorId" />

  <h2 class="page-subtitle">Patrocinios / ahijados</h2>
  <SponsorshipsTable :sponsorId="sponsorId" />
</template>
