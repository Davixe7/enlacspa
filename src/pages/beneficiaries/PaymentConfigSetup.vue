<script setup>
import BeneficiaryProfile from 'src/components/BeneficiaryProfile.vue'
import SponsorProfile from 'src/components/SponsorProfile.vue'
import PaymentConfigForm from 'src/components/PaymentConfigForm.vue'
defineProps(['candidateId', 'sponsorId'])
</script>

<template>
  <div class="row q-col-gutter-x-md">
    <div class="col-12 col-sm-6 col-md-3">
      <BeneficiaryProfile :candidateId="candidateId" />
    </div>
    <div class="col-12 col-sm-6 col-md-3">
      <SponsorProfile :sponsorId="sponsorId" />
    </div>
    <div class="col-12 col-md-6">
      <PaymentConfigForm
        :candidateId="candidateId"
        :sponsorId="sponsorId"
        @save="$router.push(`/beneficiarios/${candidateId}/cuotas`)"
      />
    </div>
  </div>
</template>
