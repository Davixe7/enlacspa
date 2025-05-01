<script setup>
import { useCandidateStore } from 'src/stores/candidate-store';
import { onMounted, ref } from 'vue';

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

onMounted(async () => {
  if (!props.candidateId) { return }
  if (!store.full_name) {
    store.id = props.candidateId
    store.fetchCandidate()
  }
})

const store = useCandidateStore();
const errors = ref({})

const relationships = [
  { label: "Abuelo(a)", value: "abuelo" },
  { label: "Hermano(a)", value: "hermano" },
  { label: "Hermanastro(a)", value: "hermanastro" },
  { label: "Madre/Padre", value: "madre_padre" },
  { label: "Padrastro/Madrastra", value: "padrastro_madrastra" },
  { label: "Primo(a)", value: "primo" },
  { label: "Tío(a)", value: "tio" },
];
</script>

<template>
  <div
    class="flex"
    style="margin-bottom: 65px;"
  >
    <q-img
      width="174px"
      height="169px"
      color="grey"
      class="bg-grey-4"
      style="margin-right: 20px; object-fit: cover;"
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
        <label class="text-weight-bold">Folio:</label>
        {{ store.sheet }}
      </div>
    </div>

    <div
      v-if="type == 'interview'"
      class="flex column justify-between q-px-md q-gutter-y-md"
    >
      <div>
        <q-input
          label="Nombre del entrevistado"
          outlined
          stack-label
          v-model="store.interviewee.name"
          :error="errors.name"
          :error-message="errors.name"
        ></q-input>
      </div>
      <div>
        <q-select
          outlined
          stack-label
          hide-bottom-space
          label="Parentesco"
          v-model="store.interviewee.relationship"
          :error="!!errors.relationship"
          :error-message="errors.relationship"
          :options="relationships"
          emit-value
          map-options
        ></q-select>
      </div>
      <div style="margin-left: -8px;">
        <q-radio
          v-model="store.interviewee.legal_relationship"
          val="biologico"
          label="Hijo Biológico"
          class="q-mr-md"
        ></q-radio>
        <q-radio
          v-model="store.interviewee.legal_relationship"
          val="adoptivo"
          label="Hijo Adoptivo"
        ></q-radio>
      </div>
    </div>

    <div
      v-else-if="store.evaluation_schedule"
      class="flex column justify-between q-px-md q-gutter-y-md"
    >
      <q-input
        label="Nombre del Evaluador"
        outlined
        stack-label
        v-model="store.evaluation_schedule.evaluator.name"
      ></q-input>
    </div>
  </div>

</template>
