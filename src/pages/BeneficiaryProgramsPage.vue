<script setup>
import { useCandidateStore } from 'src/stores/candidate-store'
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import ProgramsTable from './PlansTable.vue'
import ProgramCopy from './ProgramCopy.vue'

const loading = ref(true)
const props = defineProps({
  candidateId: { required: true }
})
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
  <div class="flex items-center justify-between">
    <div class="page-title">Programa Individual</div>
    <div>
      <q-btn v-if="!loading && groups.length < 1" outline class="q-mr-md" color="primary" icon="sym_o_content_copy"
        label="Copiar" @click="copyDialog = true" />

      <q-btn v-if="!loading && groups.length < 1" color="primary" icon="sym_o_add" label="Nuevo"
        :to="{ name: 'programs.create', params: { candidateId: props.candidateId } }" />
    </div>
  </div>

  <q-dialog v-model="copyDialog">
    <ProgramCopy :groupId="store.group_id" @save="appendCopy" @close="copyDialog = false" />
  </q-dialog>

  <div v-if="!loading">
    <ProgramsTable :newCopy="newCopy" :groupId="store.group_id" :candidateId="props.candidateId" />

    <div v-if="!loading && groups.length > 0">
      <q-card flat bordered class="q-pa-md q-mt-md">
        <q-card-section>
          <div class="text-h6">
            Este beneficiario pertenece al grupo <span>{{ groups[0].name }}</span>
          </div>
          <div class="text-subtitle1 flex items-center">
            <q-icon name="groups" color="secondary" class="q-mr-sm" />
            <q-btn flat color="primary" label="Ver grupo" :href="`/#/grupos/${groups[0].id}`" target="_blank"
              class="q-mr-sm" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
