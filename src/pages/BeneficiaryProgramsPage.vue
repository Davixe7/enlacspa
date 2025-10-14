<script setup>
import { useCandidateStore } from 'src/stores/candidate-store'
import { onMounted, ref } from 'vue'
import BeneficiaryProfile from 'src/components/BeneficiaryProfile.vue'
import ProgramsTable from './ProgramsTable.vue'
import { api } from 'src/boot/axios'

const loading = ref(true)
const props = defineProps(['candidateId'])
const store = useCandidateStore()
const groups = ref([])

onMounted(async () => {
  store.id = props.candidateId
  await store.fetchCandidate('beneficiary')
  groups.value = (await api.get(`groups/?candidate_id=${props.candidateId}`)).data.data
  loading.value = false
})
</script>

<template>
  <BeneficiaryProfile
    :candidateId="candidateId"
    class="q-mb-lg"
  />

  <div class="flex items-center">
    <div class="page-title">Programa Individual</div>

    <q-btn
      v-if="!loading && groups.length < 1"
      class="q-ml-auto"
      color="primary"
      icon="sym_o_add"
      label="Nuevo"
      :to="{
        name: 'programs.create',
        params: { candidateId: props.candidateId, groupId: store.group_id }
      }"
    />
  </div>

  <ProgramsTable
    v-if="!loading"
    :groupId="store.group_id"
  />
</template>
