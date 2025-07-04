<script setup>
import Notify from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { useCandidateStore } from 'src/stores/candidate-store'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['candidate', 'candidateId'])
const emits = defineEmits(['close'])

const store = useCandidateStore()
const router = useRouter()
const loading = ref(false)
const errors = ref({})
const programs = ref([])
const localCandidate = ref({ ...props.candidate })

onMounted(async () => {
  programs.value = (await api.get('programs')).data.data
  localCandidate.value = { ...store.$state }
  localCandidate.value.acceptance_status = localCandidate.value.acceptance_status == null ? 1 : localCandidate.value.acceptance_status
})

async function updateAcceptance() {
  errors.value = {}
  loading.value = true
  try {
    let data = {
      acceptance_status: localCandidate.value.acceptance_status,
      rejection_comment: localCandidate.value.rejection_comment,
      program_id: localCandidate.value.program_id,
      _method: 'PUT'
    }
    localCandidate.value = (await api.post(`candidates/${props.candidateId}/admission`, data)).data.data
    Notify.positive('Guardado con exito')
    emits('close')
    setTimeout(() => router.push('/candidatos'), 2500)
  } catch (error) {
    errors.value = error.formatted ? error.formatted : {}
    Notify.negative('Por favor, valide la informacion')
  }
  loading.value = false
}
</script>

<template>
  <q-card>
    <q-card-section>
      <div class="page-title q-mb-none">Es candidato para formar parte del instituto ENLAC?</div>
    </q-card-section>
    <q-card-section>
      <div style="padding-bottom: 40px; margin-left: -10px">
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
          <q-radio
            class="col-6"
            v-for="program in programs"
            :key="program.id"
            :label="program.name"
            :val="program.id"
            v-model="localCandidate.program_id"
          ></q-radio>
        </div>
      </template>
      <template v-else>
        <q-input
          outlined
          stack-label
          type="textarea"
          label="¿Por qué no?"
          v-model="localCandidate.rejection_comment"
          :error="!!errors.rejection_comment"
          :error-message="errors.rejection_comment"
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
        >Cerrar</q-btn
      >
      <q-btn
        :loading="loading"
        @click="updateAcceptance"
        unelevated
        color="primary"
        >Guardar</q-btn
      >
    </q-card-section>
  </q-card>
</template>
