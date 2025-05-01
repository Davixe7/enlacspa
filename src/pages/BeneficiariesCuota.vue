<script setup>
import PaymentConfigForm from 'src/components/PaymentConfigForm.vue';
import SponsorForm from 'src/components/SponsorForm.vue';
import { onMounted, ref } from 'vue';

defineProps(['candidateId', 'sponsorId'])
const dialog = ref(false)
onMounted(() => { console.log('Works!') })
</script>

<template>
  <div>
    <PaymentConfigForm
      :sponsorId="sponsorId"
      :candidateId="candidateId"
      @requestSponsor="() => { dialog = true; }"
    />

    <q-dialog v-model="dialog">
      <SponsorForm />
    </q-dialog>
  </div>
</template>
