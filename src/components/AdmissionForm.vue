<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

const props = defineProps(['candidateId'])
const emits = defineEmits(['close'])
const loading = ref(false)
const localCandidate = ref({ ...props.candidate })
const programs = ref([])
const forPrograms = ref([])

onMounted(async () => {
  await fetchCandidate()
  await fetchPrograms()
})
async function updateAcceptance() {
  loading.value = true
  try {
    let data = {
      acceptance_status: localCandidate.value.acceptance_status,
      rejection_comment: localCandidate.value.rejection_comment,
      programs: [...forPrograms.value],
      _method: 'PUT'
    }
    localCandidate.value = (await api.post(`candidates/${props.candidateId}/admission`, data)).data.data
    emits('close')
  } catch (error) {
    console.log(error);
  }
  loading.value = false
}
async function fetchCandidate() {
  try {
    localCandidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
    localCandidate.value.acceptance_status = localCandidate.value.acceptance_status == null ? 1 : localCandidate.value.acceptance_status;
    forPrograms.value = [...localCandidate.value.programs]
  } catch (error) {
    console.log(error);
  }
}
async function fetchPrograms() {
  try {
    programs.value = (await api.get('programs')).data.data
  } catch (error) {
    console.log(error);
  }
}
</script>

<template>
  <q-card>
    <q-card-section>
      <div class="page-title">Es candidato para formar parte del instituto ENLAC?</div>
    </q-card-section>
    <q-card-section>
      <div style="padding-bottom: 40px; margin-left: -10px;">
        <q-radio
          label="Si"
          :val="1"
          v-model="localCandidate.acceptance_status"
        ></q-radio>
        <q-radio
          label="No"
          :val="0"
          v-model="localCandidate.acceptance_status"
        ></q-radio>
      </div>
      <template v-if="localCandidate.acceptance_status">
        <div class="text-weight-bold q-pb-lg">Seleccione las opciones del programa</div>
        <div class="row q-col-gutter-lg">
          <q-checkbox
            class="col-6"
            v-for="program in programs"
            :key="program.id"
            :label="program.name"
            :val="program.id"
            v-model="forPrograms"
          ></q-checkbox>
        </div>
      </template>
      <template v-else>
        <q-input
          outlined
          stack-label
          type="textarea"
          label="¿Por qué no?"
          v-model="localCandidate.rejection_comment"
        ></q-input>
      </template>
    </q-card-section>
    <q-card-section class="flex justify-end">
      <q-btn
        @click="emits('close')"
        class="q-mr-sm"
        unelevated
        outline
        color="primary"
      >Cerrar</q-btn>
      <q-btn
        :loading="loading"
        @click="updateAcceptance"
        unelevated
        color="primary"
      >Guardar</q-btn>
    </q-card-section>
  </q-card>
</template>
