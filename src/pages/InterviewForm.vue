<script setup>
import { ref } from 'vue';
import CandidateProfile from './../components/CandidateProfile.vue'
import { onMounted } from 'vue';
import { api } from 'src/boot/axios';

const props = defineProps(['candidateId'])

onMounted(async () => {
  await fetchInterview()
  await fetchAnswers()
})

const loading = ref(false)
const errors = ref({})

const interview = ref({
  candidate_id: props.candidateId,
  observation: '',
  content: '',
  signed_at: null,
})
const interviewAnswers = ref([])

async function fetchInterview() {
  try { interview.value = (await api.get(`/interviews/?candidate_id=${props.candidateId}`)).data.data }
  catch (error) { if (error.status == 404) return }
}

async function fetchAnswers() {
  let route = interview.value.id ? `interview_answers/?interview_id=${interview.value.id}` : '/interview_answers'
  interviewAnswers.value = (await api.get(route)).data.data
}


async function storeInterview(sign = false) {
  loading.value = true
  let data = { ...interview.value }
  let route = interview.value.id ? `interviews/${interview.value.id}` : 'interviews'
  data = interview.value.id ? { ...data, _method: 'PUT' } : data
  if (sign) {
    data.sign = 1;
  }

  try {
    interview.value = (await api.post(route, data)).data.data
  }
  catch (error) {
    if (error.formatted) {
      errors.value = errors.value.formatted
    }
  }
  loading.value = false
}

const selectedIndex = ref(0)

</script>

<template>
  <q-page>
    <div class="page-title">Entrevista</div>

    <CandidateProfile :candidate-id="candidateId">
    </CandidateProfile>

    <div class="label-alt-2">Lista de preguntas</div>

    <div
      class="row"
      style="margin-bottom: 56px;"
    >
      <div class="col-6">
        <q-list dense>
          <q-item
            :clickable="!Boolean(interview.signed_at)"
            @click="() => { selectedIndex = n }"
            v-for="(question, n) in interviewAnswers"
            v-show="n < 28"
            :key="question.id"
          >
            <q-item-section
              side
              top
            >
              <q-checkbox
                :disable="Boolean(interview.signed_at)"
                v-model="question.checked"
                :true-value="1"
                :false-value="0"
              ></q-checkbox>
            </q-item-section>
            <q-item-section>
              {{ n + 1 }} - {{ question.question_text }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="col-6">
        <q-editor
          dense
          v-model="interview.content"
          :disable="Boolean(interview.signed_at)"
        ></q-editor>
      </div>
    </div>

    <template v-if="interviewAnswers.length > 0">
      <div class="label-alt">
        29 - Que calificacion APGAR tuvo al nacer? Seleccione una opcion
      </div>
      <div
        class="flex"
        style="margin-bottom: 56px;"
      >
        <div
          v-for="n in 10"
          :key="n"
          class="btn-rank"
          :class="{ 'btn-rank--active': interviewAnswers[28].content == n }"
          @click="!interview.signed_at ? interviewAnswers[28].content = n : ''"
        >
          {{ n }}
        </div>
      </div>

      <div class="label-alt">
        31 - ¿Controla esfínteres?
      </div>
      <div style="margin-bottom: 56px;">
        <q-radio
          v-model="interviewAnswers[29].content"
          label="Si"
          val="1"
          :disabled="!!interview.signed_at"
        ></q-radio>
        <q-radio
          v-model="interviewAnswers[29].content"
          label="No"
          val="0"
          :disabled="!!interview.signed_at"
        ></q-radio>
      </div>

      <div class="label-alt">
        32 - Observaciones adicionales por parte del evaluador:
      </div>
      <div style="margin-bottom: 56px;">
        <q-input
          outlined
          type="textarea"
          v-model="interview.observation"
          :disabled="!!interview.signed_at"
          :readonly="!!interview.signed_at"
        ></q-input>
      </div>
    </template>

    <div
      v-if="!interview.signed_at"
      class="flex justify-end items-center"
      style="padding: 50px 0;"
    >
      <div class="q-mr-lg">
        <q-tooltip
          anchor="top right"
          self="bottom end"
          class="bg-black text-white q-py-sm q-px-md"
          style="font-size: 14px; width: 154px;"
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
          @click="storeInterview(false)"
        >
          Guardar
        </q-btn>
      </div>

      <div class="q-mr-lg">
        <q-tooltip
          anchor="top right"
          self="bottom end"
          class="bg-black text-white q-py-sm q-px-md"
          style="font-size: 14px; width: 154px;"
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
          @click="storeInterview(true)"
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
  border: 1px solid #4B5563;
}

.btn-rank {
  color: #001F6D;
  text-align: center;
  font-size: 25px;
  font-weight: 700;
  padding: 16px;
  border-radius: 8px;
  background: #E5E7EB;
  flex: 1 1 auto;
  margin: 0 10px 10px 0;
  cursor: pointer;
}

.btn-rank--active {
  background: #001F6D;
  color: #E5E7EB;
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
