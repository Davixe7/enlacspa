<script setup>
import { useCandidateStore } from 'src/stores/candidate-store'
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import BeneficiaryProfile from 'src/components/BeneficiaryProfile.vue'
import ProgramsTable from './ProgramsTable.vue'
import ProgramCopy from './ProgramCopy.vue'

const loading = ref(true)
const props = defineProps(['candidateId'])
const store = useCandidateStore()
const groups = ref([])
const copyDialog = ref(false)
const newCopy = ref(null)

function appendCopy(data) {
  newCopy.value = data
  copyDialog.value = false
}

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

  <div class="flex items-center justify-between">
    <div class="page-title">Programa Individual</div>

    <div>
      <q-btn
        v-if="!loading && groups.length < 1"
        outline
        class="q-mr-md"
        color="primary"
        icon="sym_o_content_copy"
        label="Copiar"
        @click="copyDialog = true"
      />

      <q-btn
        v-if="!loading && groups.length < 1"
        color="primary"
        icon="sym_o_add"
        label="Nuevo"
        :to="{
          name: 'programs.create',
          params: { candidateId: props.candidateId, groupId: store.group_id }
        }"
      />
    </div>
  </div>

  <q-dialog v-model="copyDialog">
    <ProgramCopy
      :groupId="store.group_id"
      @save="appendCopy"
    />
  </q-dialog>

  <ProgramsTable
    v-if="!loading"
    :newCopy="newCopy"
    :groupId="store.group_id"
  />
</template>
