<script setup>
import Notify from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { useCandidateStore } from 'src/stores/candidate-store'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['candidate', 'candidateId', 'evaluationId'])
const emits = defineEmits(['close'])

const store = useCandidateStore()
const router = useRouter()
const loading = ref(false)
const errors = ref({})
const programs = ref([])
const localCandidate = ref({ ...props.candidate, sign_evaluation: false })

onMounted(async () => {
  programs.value = (await api.get('programs')).data.data
  localCandidate.value = { ...store.$state }
  localCandidate.value.sign_evaluation = false
})

async function updateAcceptance() {
  errors.value = {}
  loading.value = true
  let route = `candidates/${props.candidateId}/admission`
  try {
    let data = {
      status: localCandidate.value.status,
      admission_comment: localCandidate.value.admission_comment,
      program_id: localCandidate.value.program_id,
      evaluation_id: props.evaluationId,
      _method: 'PUT'
    }
    if (localCandidate.value.sign_evaluation) {
      data.sign_evaluation = true
    }
    localCandidate.value = (await api.post(route, data)).data.data
    Notify.positive('Guardado con exito')
    emits('close')
    setTimeout(() => router.push('/candidatos'), 2500)
  } catch (error) {
    errors.value = error.formatted ? error.formatted : {}
    Notify.negative('Por favor, valide la informacion')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-card>
    <q-card-section>
      <div class="page-title q-mb-none">Es candidato para formar parte del instituto ENLAC?</div>
    </q-card-section>
    <q-card-section>
      <div style="padding-bottom: 40px; margin-left: -10px">
        <q-radio label="Si" :val="'aceptado'" v-model="localCandidate.status" />
        <q-radio label="No" :val="'rechazado'" v-model="localCandidate.status" />
      </div>
      <template v-if="localCandidate.status">
        <div class="text-weight-bold q-pb-lg">Seleccione las opciones del programa</div>
        <div class="row q-col-gutter-lg q-pb-lg">
          <q-radio class="col-6" v-for="program in programs" :key="program.id" :label="program.name" :val="program.id"
            v-model="localCandidate.program_id" />
        </div>
      </template>
      <q-input outlined stack-label type="textarea"
        :label="localCandidate.status ? 'Comentarios (opcionales)' : '¿Por qué no?'"
        v-model="localCandidate.admission_comment" :error="!!errors.admission_comment"
        :error-message="errors.admission_comment" />
    </q-card-section>
    <q-card-section class="flex justify-between">
      <q-checkbox v-model="localCandidate.sign_evaluation" label="Firmar evaluacion" />
      <q-btn :loading="loading" @click="updateAcceptance" unelevated color="primary" label="Guardar" />
    </q-card-section>
  </q-card>
</template>
