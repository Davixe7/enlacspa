<script setup>
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
  },
  errors: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const store = useCandidateStore()

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
  <div
    class="flex"
    style="margin-bottom: 65px"
  >
    <q-img
      width="174px"
      height="169px"
      color="grey"
      class="bg-grey-4"
      style="margin-right: 20px; object-fit: cover"
      :src="store.picture"
    ></q-img>

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

    <!-- <div
      v-if="store.evaluation_schedule?.evaluator?.name"
      class="flex column justify-between q-px-md q-gutter-y-md"
    >
      <q-input
        label="Nombre del Evaluador"
        outlined
        stack-label
        v-model="store.evaluation_schedule.evaluator.name"
      />
    </div> -->

    <slot></slot>
  </div>
</template>
