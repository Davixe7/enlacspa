<script setup>
import { nextTick, ref } from 'vue'
import CandidateProfile from 'components/CandidateProfile.vue'
import { onMounted } from 'vue'
import { api } from 'src/boot/axios'
import Notify from 'src/utils/notify'
import { scrollToFirstError } from 'src/utils/focusError'
import { useCandidateStore } from 'src/stores/candidate-store'

const props = defineProps(['candidateId'])
const store = useCandidateStore()

onMounted(async () => {
  store.id = props.candidateId
  await store.fetchCandidate()
  await fetchQuestions()
  await fetchInterview()
})

const loading = ref(false)
const errors = ref({})
const interviewQuestions = ref([])

const interview = ref({
  id: null,
  interviewee_name: 'John Doe',
  interviewee_relationship: 'padre',
  candidate_id: props.candidateId,
  content: '',
  observation: '',
  apgar_rank: 1,
  sphincters_control: 1,
  signed_at: null,
  answers: []
})

async function fetchInterview() {
  try {
    interview.value = (await api.get(`/interviews/?candidate_id=${props.candidateId}`)).data.data
  } catch (error) {
    if (error.status == 404) return
  }
}

async function fetchQuestions() {
  interviewQuestions.value = (await api.get('interview_questions')).data.data
}

async function storeInterview() {
  loading.value = true
  let route = interview.value.id ? `interviews/${interview.value.id}` : 'interviews'
  let data = { ...interview.value, interviewee: store.interviewee }
  if (interview.value.id) {
    data._method = 'PUT'
  }

  try {
    interview.value = (await api.post(route, data)).data.data
    Notify.positive('Guardado con éxito')
  } catch (error) {
    Notify.negative('Error. Revise la informacion')
    errors.value = error.formatted ? error.formatted : errors.value.formatted
    nextTick(() => scrollToFirstError())
  }
  loading.value = false
}

async function signInterview() {
  interview.value.signed_at = new Date()
  await storeInterview()
}
</script>

<template>
  <q-page>
    <div class="page-title">Entrevista</div>

    <CandidateProfile
      :candidate-id="candidateId"
      type="interview"
    >
    </CandidateProfile>

    <div class="label-alt-2">Lista de preguntas</div>

    <div class="row q-mb-xl">
      <div class="col-6">
        <q-list dense>
          <q-item
            :clickable="!Boolean(interview.signed_at)"
            v-for="(question, n) in interviewQuestions"
            :key="question.id"
          >
            <q-item-section
              side
              top
            >
              <q-checkbox
                :disable="Boolean(interview.signed_at)"
                v-model="interview.answers"
                :val="question.id"
              ></q-checkbox>
            </q-item-section>
            <q-item-section> {{ n + 1 }} - {{ question.question_text }} </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="col-6">
        <q-editor
          dense
          v-model="interview.content"
          :disable="Boolean(interview.signed_at)"
          :class="{ 'q-field--error': !!errors.content }"
          :error-message="errors.content"
          style="height: 100%"
        ></q-editor>
      </div>
    </div>

    <div class="label-alt">29 - Que calificacion APGAR tuvo al nacer? Seleccione una opción</div>
    <div class="flex q-mb-xl">
      <div
        v-for="n in 10"
        :key="n"
        class="btn-rank"
        :class="{ 'btn-rank--active': interview.apgar_rank == n }"
        @click="!interview.signed_at ? (interview.apgar_rank = n) : ''"
      >
        {{ n }}
      </div>
    </div>

    <div class="label-alt">30 - ¿Controla esfínteres?</div>
    <div class="q-mb-xl">
      <q-radio
        v-model="interview.sphincters_control"
        label="Si"
        :val="1"
        :disable="!!interview.signed_at"
      ></q-radio>
      <q-radio
        v-model="interview.sphincters_control"
        label="No"
        :val="0"
        :disable="!!interview.signed_at"
      ></q-radio>
    </div>

    <div class="label-alt">31 - Observaciones adicionales por parte del evaluador:</div>
    <div class="q-mb-xl">
      <q-input
        outlined
        type="textarea"
        v-model="interview.observation"
        :disable="!!interview.signed_at"
        :readonly="!!interview.signed_at"
      ></q-input>
    </div>

    <div
      v-if="!interview.signed_at"
      class="flex justify-end items-center q-py-xl"
    >
      <div class="q-mr-lg">
        <q-tooltip
          anchor="top right"
          self="bottom end"
          class="bg-black text-white q-py-sm q-px-md"
          style="font-size: 14px; width: 154px"
        >
          Al guardarlo podrá seguir editando
        </q-tooltip>
        <q-icon
          name="info"
          size="24px"
          class="q-mr-sm"
        >
        </q-icon>

        <q-btn
          :loading="loading"
          outline
          color="primary"
          @click="storeInterview()"
        >
          Guardar
        </q-btn>
      </div>

      <div
        class="q-mr-lg"
        v-if="interview.id"
      >
        <q-tooltip
          anchor="top right"
          self="bottom end"
          class="bg-black text-white q-py-sm q-px-md"
          style="font-size: 14px; width: 154px"
        >
          Al firmar ya no podrá editarlo
        </q-tooltip>
        <q-icon
          name="info"
          size="24px"
          class="q-mr-sm"
        >
        </q-icon>

        <q-btn
          :loading="loading"
          color="primary"
          @click="signInterview()"
        >
          Firmar
        </q-btn>
      </div>
    </div>

    <div v-else>
      <div class="label-alt">Firmado el: {{ interview.signed_at }}</div>
    </div>
  </q-page>
</template>

<style>
.q-list--dense .q-item {
  min-height: 0;
  padding-left: 0;
  margin-bottom: 24px;
}

.q-item__section--side {
  padding: 0;
}

.q-item__section--main {
  color: #111827;
  font-size: 16px;
  font-weight: 600;
}

.q-item__section--side .q-checkbox {
  margin-left: -10px;
  padding-right: 0;
}

.q-checkbox__inner {
  font-size: 32px;
}

.q-checkbox__bg {
  border: 1px solid #4b5563;
}

.btn-rank {
  color: #001f6d;
  text-align: center;
  font-size: 25px;
  font-weight: 700;
  padding: 16px;
  border-radius: 8px;
  background: #e5e7eb;
  flex: 1 1 auto;
  margin: 0 10px 10px 0;
  cursor: pointer;
}

.btn-rank--active {
  background: #001f6d;
  color: #e5e7eb;
}

.btn-rank:last-child {
  margin-right: 0;
}

.label-alt {
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 24px;
}

.label-alt-2 {
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
}
</style>
