<script setup>
import PaymentConfigControl from './beneficiaries/PaymentConfigControl.vue'
const props = defineProps(['candidateId'])
</script>
<template>
  <div class="flex">
    <h1 class="page-title">Tesoreria / Control de Cuotas</h1>
    <router-link
      class="q-mr-md q-ml-auto"
      :to="`/tesoreria/${props.candidateId}/historial`"
      >Historial de pagos</router-link
    >
    <router-link :to="`/tesoreria`">Regresar</router-link>
  </div>
  <PaymentConfigControl :candidateId="props.candidateId" />
</template>
