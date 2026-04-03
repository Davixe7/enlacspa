<script setup>
import { storeToRefs } from 'pinia'
import { useCandidateStore } from 'src/stores/candidate-store'
import { onMounted } from 'vue'

const props = defineProps({
  candidateId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    default: 'interview'
  }
})

const store = useCandidateStore()
const { errors } = storeToRefs(store)

const relationships = [
  { label: 'Abuelo(a)', value: 'abuelo' },
  { label: 'Hermano(a)', value: 'hermano' },
  { label: 'Hermanastro(a)', value: 'hermanastro' },
  { label: 'Madre/Padre', value: 'madre_padre' },
  { label: 'Padrastro/Madrastra', value: 'padrastro_madrastra' },
  { label: 'Primo(a)', value: 'primo' },
  { label: 'Tío(a)', value: 'tio' }
]

onMounted(async () => {
  if (!props.candidateId) {
    return
  }
  if (!store.full_name) {
    store.id = props.candidateId
    store.fetchCandidate()
  }
})
</script>

<template>
  <div class="flex" style="margin-bottom: 65px">
    <q-img width="174px" height="169px" color="grey" class="bg-grey-4" style="margin-right: 20px; object-fit: cover"
      :src="store.picture"></q-img>

    <div class="flex column justify-between q-px-md">
      <div>
        <label class="text-weight-bold">Nombre:</label>
        {{ store.full_name }}
      </div>
      <div>
        <label class="text-weight-bold">Fecha:</label>
        {{ store.birth_date }}
      </div>
      <div>
        <label class="text-weight-bold">Edad cronológica</label>
        {{ store.chronological_age }} meses
      </div>
      <div>
        <label class="text-weight-bold">Edad cronológica </label>
        {{ store.chronological_age2 }} años
      </div>
    </div>

    <div v-if="type == 'interview'" class="flex column justify-between q-px-md q-gutter-y-md">
      <div>
        <q-input label="Nombre del entrevistado" outlined stack-label v-model="store.interviewee.name"
          :error="!!errors['interviewee.name']" :error-message="errors['interviewee.name']" />
      </div>
      <div>
        <q-select outlined stack-label hide-bottom-space label="Parentesco" v-model="store.interviewee.relationship"
          :error="!!errors['interviewee.relationship']" :error-message="errors['interviewee.relationship']"
          :options="relationships" emit-value map-options />
      </div>
      <div style="margin-left: -8px">
        <q-radio v-model="store.interviewee.legal_relationship" val="biologico" label="Hijo Biológico"
          class="q-mr-md" />
        <q-radio v-model="store.interviewee.legal_relationship" val="adoptivo" label="Hijo Adoptivo" />
      </div>
    </div>

    <div v-else-if="store.evaluation_schedule?.evaluator?.name"
      class="flex column justify-between q-px-md q-gutter-y-md">
      <q-input label="Nombre del Evaluador" outlined stack-label v-model="store.evaluation_schedule.evaluator.name" />
    </div>
  </div>
</template>
