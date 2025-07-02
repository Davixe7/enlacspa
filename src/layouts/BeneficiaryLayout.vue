<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import BeneficiaryProfile from 'components/BeneficiaryProfile.vue'

const props = defineProps({
  candidateId: { required: true }
})
const loading = ref(false)
const candidate = ref({})

onMounted(async () => {
  try {
    loading.value = true
    candidate.value = (await api.get(`/candidates/${props.candidateId}`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <q-page>
    <BeneficiaryProfile
      :candidateId="candidateId"
      class="q-mb-lg"
    />
    <router-view></router-view>
  </q-page>
</template>
