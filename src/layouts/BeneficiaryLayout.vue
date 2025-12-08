<script setup>
import BeneficiaryProfile from 'components/BeneficiaryProfile.vue'

defineProps({
  candidateId: { required: true }
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
