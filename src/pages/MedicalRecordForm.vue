<script setup>
import { api } from 'src/boot/axios'
import Notify from 'src/utils/notify'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import MedicationsPage from './candidates/MedicationsPage.vue'
//subir imagenes
const rows = ref([])
const files = ref([])

const loading = ref(true)
const isProccesing = ref(true)
const dialog = ref(false)
const errors = ref({})
// Inicializamos el enrutador para leer la URL actual
const route = useRoute()
const idAppoiment = route.query.id
const typeId = route.query.type_id
const appointment_type = route.query.appointment_type
const read_only = route.query.ro
const evaluationFields = ref([])
const props = defineProps({
  candidateId: Number
})
const infoChannels = ref([
  'Publicidad impresa',
  'Publicidad en radio',
  'Recomendación de escuela',
  'Recomendación de personal médico',
  'Recomendación de otra persona',
  'Otro'
])
const cellMonthsMap = {
  7: 0.25,
  8: 0.5,
  9: 1.0,
  10: 1.5,
  11: 2.0,
  12: 2.5,
  13: 3.25,
  14: 4.0,
  15: 4.75,
  16: 5.5,
  17: 6.25,
  18: 7.0,
  19: 7.75,
  20: 8.5,
  21: 9.25,
  22: 10.0,
  23: 11.0,
  24: 12.0,
  25: 13.0,
  26: 14.0,
  27: 15.0,
  28: 16.0,
  29: 17.0,
  30: 18.0,
  31: 21.0,
  32: 24.0,
  33: 27.0,
  34: 30.0,
  35: 33.0
}
const candidate = ref({
  id: null,
  first_name: '',
  middle_name: '',
  last_name: '',
  birth_date: null,
  age: null,
  chronological_age: null,
  diagnosis: '',
  info_channel: infoChannels.value[infoChannels.value.length - 1],
  status: 'pendiente'
})
const medicalRecord = ref({
  id_medical_record: null,
  candidate_id: null,
  date_medical_record: null,
  hereditary_family_history: null,
  non_pathological_personal_history: null,
  perinatal_history: null,
  andrological_gynecological_obstetric_history: null,
  medical_history: null,
  psychiatric_mental_status: null,
  nervous_system: null,
  respiratory_system: null,
  cardiovascular_system: null,
  digestive_system: null,
  genitourinary_system: null,
  musculoskeletal_system: null,
  endocrine_system: null,
  sensory_system: null,
  integumentary_system: null,
  weight: null,
  height: null,
  head_circumference: null,
  heart_rate: null,
  initial_weight: null,
  weight_age: null,
  height_age: null,
  weight_height: null,
  waist_cm: null,
  hip_cm: null,
  chest_cm: null,
  brain_perimeter_cm: null,
  brachial_circumference_cm: null,
  wrist_circumference_cm: null,
  calf_circumference_cm: null,
  other: null,
  imc: null,
  respiratory_rate: null,
  temperature: null,
  general_inspection: null,
  head: null,
  mental_status: null,
  hair: null,
  neck: null,
  thorax: null,
  abdomen: null,
  genitalia: null,
  anorectal: null,
  spine: null,
  upper_lower_limbs: null,
  peripheral_vascular_system: null,
  skin_appendages: null,
  areas_dryness_excessive_sweating: null,
  diagnostic_impression: null,
  treatment: null,
  case_analysis: null,
  created_at: null,
  updated_at: null,
  status: null,
  subjetive: null,
  objective: null,
  assessment: null,
  plan: null,
  appointment_id: null,
  type_id: null,
  appointment_type: null
})
//Relationships
const medications = ref([])

onMounted(async () => {
  loading.value = true
  await fetchBeneficiario()
  await fetchMedicalRecord()
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  medications.value = candidate.value.medications
  await fetchImages()
  loading.value = false
  // console.log("candidate: ", candidate.value);
  // console.log("medications: ", medications.value);
})

const beneficiario = ref({
  candidate_id: null,
  candidate_name: '',
  entry_date: '--',
  birth_date: '',
  diagnosis: '',
  program_name: '',
  responsible_name: '',
  responsible_relationship: '',
  brain_level: '',
  brain_function: '',
  hours_of_attention: '',
  date_of_attention: '',
  profile_picture_url: null,
  chronological_age: null
})
const allRanks = computed(() => {
  var newRanks = []
  evaluationFields.value.map((level) => {
    if (level.P > beneficiario.value.chronological_age) return
    newRanks = newRanks.concat(Object.values(level.ranks))
  })
  return newRanks
})

async function fetchImages() {
  try {
    loading.value = true
    rows.value = (
      await api.get(`medical-records/${medicalRecord.value.id_medical_record}/showMedicalFiles`)
    ).data.data
    // console.log("media: ", rows.value);
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
async function fetchBeneficiario() {
  try {
    loading.value = true
    beneficiario.value = (await api.get(`beneficiaries/${props.candidateId}/by-id`)).data.data
    // console.log(beneficiario.value)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
async function fetchMedicalRecord() {
  try {
    loading.value = true
    medicalRecord.value = (await api.get(`beneficiaries/${idAppoiment}/medical-records`)).data.data
    // console.log(medicalRecord.value)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
async function save() {
  loading.value = true
  isProccesing.value = true
  errors.value = {}
  medicalRecord.value.appointment_id = idAppoiment
  medicalRecord.value.type_id = typeId
  medicalRecord.value.appointment_type = appointment_type
  medicalRecord.value.candidate_id = props.candidateId
  let route =
    medicalRecord.value.id_medical_record != 0
      ? `medical-records/${medicalRecord.value.id_medical_record}/update`
      : 'medical-records'
  let data =
    medicalRecord.value.id_medical_record != 0
      ? { ...medicalRecord.value, _method: 'PUT' }
      : { ...medicalRecord.value }
  // let actionLabel = medicalRecord.value.id_medical_record != 0 ? 'actualizado' : 'creado'
  try {
    ;(await api.post(route, data)).data.data
    // console.log("new " + newMedicalRecord);

    // medicalRecord.value = newMedicalRecord
    dialog.value = false
    // Notify.positive(`Seguimiento ${actionLabel} exitosamente`)
    fetchMedicalRecord()
  } catch (error) {
    errors.value = error.status == 422 && error.formatted ? error.formatted : {}
    // Notify.negative(`No se pudo guardar`)
  }
  loading.value = false
  isProccesing.value = false
}
async function last_save() {
  loading.value = true
  errors.value = {}
  medicalRecord.value.appointment_id = idAppoiment
  medicalRecord.value.type_id = typeId
  medicalRecord.value.appointment_type = appointment_type
  medicalRecord.value.candidate_id = props.candidateId
  let route =
    medicalRecord.value.id_medical_record != 0
      ? `medical-records/${medicalRecord.value.id_medical_record}/update`
      : 'medical-records'
  let data =
    medicalRecord.value.id_medical_record != 0
      ? { ...medicalRecord.value, _method: 'PUT' }
      : { ...medicalRecord.value }
  let actionLabel = medicalRecord.value.id_medical_record != 0 ? 'actualizado' : 'creado'
  try {
    ;(await api.post(route, data)).data.data
    // console.log("new " + newMedicalRecord);

    // medicalRecord.value = newMedicalRecord
    dialog.value = false
    Notify.positive(`Seguimiento ${actionLabel} exitosamente`)
    fetchMedicalRecord()
  } catch (error) {
    errors.value = error.status == 422 && error.formatted ? error.formatted : {}
    Notify.negative(`No se pudo guardar`)
  }
  loading.value = false
}
async function uploadFile(collectionName) {
  try {
    loading.value = true
    let data = new FormData()
    data.append('_method', 'PUT')
    data.append('collection_name', collectionName)
    // Adjuntar todos los archivos uno por uno
    if (files.value && files.value.length > 0) {
      files.value.forEach((file) => {
        data.append('upload[]', file)
      })
    }
    data.append('detail', '')
    let response = (
      await api.post(`medical-records/${medicalRecord.value.id_medical_record}/medicalFiles`, data)
    ).data.data
    await fetchImages()
    //refrescar input file
    files.value = []
    // media.value[response.collection_name] = response
    console.log('response: ', response)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
async function deleteFile(fileId) {
  try {
    loading.value = true
    await api.delete(
      `medical-records/${medicalRecord.value.id_medical_record}/medicalFiles/${fileId}`
    )
    // console.log("Archivo eliminado");
    await fetchImages()
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const developmentRateA = computed(() => {
  let evaluated = allRanks.value.length
  let evaluatedFP = allRanks.value.filter((rank) => ['F', 'P'].includes(rank.caracteristic)).length
  if (evaluatedFP <= 5) {
    return 'Menos que recién nacido.'
  }
  if (evaluatedFP == 6) {
    return 'Recién nacido.'
  }
  let months = cellMonthsMap[evaluatedFP]
  return ((months / evaluated) * 100).toFixed(2)
})
const neurologicalAge = computed(() => {
  if (isNaN(developmentRate.value)) {
    return 0
  }
  return ((beneficiario.value.chronological_age * developmentRateA.value) / 100).toFixed(2)
})
const developmentRate = computed(() =>
  ((neurologicalAge.value / beneficiario.value.chronological_age) * 100).toFixed(2)
)
</script>

<template>
  <q-page>
    <h1 class="page-title">Historia Clínica General</h1>
    <div class="profile q-mb-lg">
      <div class="profile__avatar">
        <div
          class="q-img q-img--menu"
          role="img"
          color="grey"
          style="width: 100%; height: 100%; background: lightgrey"
        >
          <div style="padding-bottom: 106.445%"></div>
          <div class="q-img__container absolute-full">
            <img
              class="q-img__image q-img__image--with-transition q-img__image--loaded"
              height="100%"
              width="100%"
              loading="lazy"
              fetchpriority="auto"
              aria-hidden="true"
              draggable="false"
              :src="beneficiario.profile_picture_url || '/assets/default-profile-picture.png'"
              style="object-fit: cover; object-position: 50% 50%"
            />
          </div>
          <div class="q-img__content absolute-full q-anchor--skip"></div>
        </div>
      </div>
      <div class="profile__content">
        <div class="form-row">
          <div class="form-group">
            <div class="form-label">Nombre del beneficiario</div>
            <div class="form-value">{{ beneficiario.candidate_name }}</div>
          </div>
          <div class="form-group">
            <div class="form-label">Fecha de ingreso</div>
            <div class="form-value">{{ beneficiario.entry_date }}</div>
          </div>
          <div class="form-group">
            <div class="form-label">Folio</div>
            <div class="form-value">{{ beneficiario.candidate_id }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <div class="form-label">Responsable del beneficiario</div>
            <div class="form-value">{{ beneficiario.responsible_name }}</div>
          </div>
          <div class="form-group">
            <div class="form-label">Parentesco</div>
            <div class="form-value">{{ beneficiario.responsible_relationship }}</div>
          </div>
          <div class="form-group">
            <div class="form-label">Programa</div>
            <div class="form-value">{{ beneficiario.program_name }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <div class="form-label">Edad Cronológica</div>
            <div class="form-value">{{ beneficiario.chronological_age }} meses</div>
          </div>
          <div class="form-group">
            <div class="form-label">Edad Neurológica</div>
            <div class="form-value">{{ neurologicalAge.value }} meses</div>
          </div>
          <div class="form-group">
            <div class="form-label">Sexo</div>
            <div class="form-value">{{ beneficiario.gender }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <div class="form-label">Fecha</div>
            <div class="form-value">
              <input
                :readonly="read_only == 1 ? true : false"
                type="date"
                name="date_of_attention"
                id="date_of_attention"
                v-model="medicalRecord.date_medical_record"
                class="q-input__native q-placeholder"
                :min="medicalRecord.date_medical_record"
                style="width: 30%; padding: 8px; border: 1px solid #ccc; border-radius: 4px"
              />
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">Hora</div>
            <div class="form-value">{{ beneficiario.hours_of_attention }}</div>
          </div>
          <div class="form-group"></div>
        </div>
      </div>
    </div>
    <div
      class="form-section"
      style="margin-bottom: 30px"
    >
      <h2 class="page-subtitle">
        IMPORTANTE:
        <span style="font-size: 17px"
          >Recuerda solicitar a Recepción los formatos de Autorización Médica para Realizar el
          Programa Físico y Autorización Médica para Equinoterapia.</span
        >
      </h2>
    </div>

    <div class="form-section">
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        label="Diagnóstico"
        v-model="beneficiario.diagnosis"
        @blur="save"
      ></q-input>
    </div>
    <br />
    <MedicationsPage
      :readonly="read_only == 1 ? true : false"
      v-model="medications"
      :candidateId="candidate.id"
      :errors="errors"
    >
    </MedicationsPage>

    <div class="form-section">
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        label="Antecedentes Heredo-Familiares"
        placeholder="(Padre, madre, abuelos paternos y abuelos maternos)"
        v-model="medicalRecord.hereditary_family_history"
      ></q-input>
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        label="Antecedentes Personales No Patológicos"
        placeholder="(De vivienda, hábitos de higiene, sueño, alimentación…)"
        v-model="medicalRecord.non_pathological_personal_history"
        @blur="save"
      ></q-input>
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        label="Antecedentes Perinatales"
        placeholder="(Cómo fue el embarazo, si fue cesárea o parto, etc…)"
        v-model="medicalRecord.perinatal_history"
        @blur="save"
      ></q-input>
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        label="Antecedentes Andrológicos y/o Gineco-Obstétricos"
        v-model="medicalRecord.andrological_gynecological_obstetric_history"
        @blur="save"
      ></q-input>
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        label="Antecedentes Patológicos (en orden cronológico)"
        placeholder="(Padecimientos previos, antecedentes traumáticos, alergias, cirugías, transfusiones…)"
        v-model="medicalRecord.medical_history"
        @blur="save"
      ></q-input>
    </div>

    <div class="form-section">
      <div style="margin-top: 25px; font-size: 15px; color: #111827">
        Revisión por Aparatos y Sistemas
      </div>
      <q-markup-table
        flat
        bordered
        style="margin-top: 10px"
      >
        <tbody>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Esfera Psíquica
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.psychiatric_mental_status"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Sistema Nervioso
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.nervous_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Aparato Respiratorio
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.respiratory_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Aparato Cardiovascular
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.cardiovascular_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Aparato Digestivo
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.digestive_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Aparato Genitourinario
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.genitourinary_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Músculo-Esquelético
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.musculoskeletal_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Sistema Endócrino
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.endocrine_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Órgano de los Sentidos
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.sensory_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Piel y Anexos
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                v-model="medicalRecord.integumentary_system"
                @blur="save"
              ></q-input>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>

    <div class="form-section">
      <div style="margin-top: 25px; font-size: 15px; color: #111827">Exploración Física</div>
      <q-markup-table
        flat
        bordered
        style="margin-top: 10px"
      >
        <tbody>
          <tr>
            <td
              class="text-left"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                stack-label
                hide-bottom-space
                v-model="medicalRecord.weight"
                label="Peso"
                @blur="save"
              />
            </td>
            <td
              class="text-left"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                stack-label
                hide-bottom-space
                v-model="medicalRecord.height"
                label="Talla"
                @blur="save"
              />
            </td>
            <td
              class="text-left"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                stack-label
                hide-bottom-space
                label="Pc"
                v-model="medicalRecord.head_circumference"
                @blur="save"
              />
            </td>
            <td
              class="text-left"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                stack-label
                hide-bottom-space
                v-model="medicalRecord.heart_rate"
                label="Fc"
                @blur="save"
              />
            </td>
            <td
              class="text-left"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                stack-label
                hide-bottom-space
                label="Fr"
                v-model="medicalRecord.respiratory_rate"
                @blur="save"
              />
            </td>
            <td
              class="text-left"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                stack-label
                hide-bottom-space
                label="Temperatura"
                v-model="medicalRecord.temperature"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="6"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="textarea"
                outlined
                stack-label
                hide-bottom-space
                label="Inspección General"
                v-model="medicalRecord.general_inspection"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Cabeza
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.head"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Esfera Psicológica
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.mental_status"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Pelo
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.hair"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Cuello
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.neck"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Tórax
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.thorax"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Abdomen
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.abdomen"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Genitales
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.genitalia"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Ano-Recto
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.anorectal"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Columna Vertebral
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.spine"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Extremidades Superiores e Inferiores
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.upper_lower_limbs"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Aparato Vascular Periférico
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.peripheral_vascular_system"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Piel y Faneras
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.skin_appendages"
                @blur="save"
              />
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              colspan="2"
              style="width: auto; font-size: 14px; color: #111827"
            >
              Áreas de Resequedad y Áreas de Hiper-Sudoración
            </td>
            <td
              class="text-right"
              colspan="4"
              style="width: auto"
            >
              <q-input
                :readonly="read_only == 1 ? true : false"
                type="text"
                outlined
                v-model="medicalRecord.areas_dryness_excessive_sweating"
                @blur="save"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>

    <div class="form-section">
      <div style="margin-top: 25px; margin-bottom: -20px; font-size: 15px; color: #111827">
        Exámenes de Laboratorio Previos
      </div>
      <q-file
        :readonly="read_only == 1 ? true : false"
        v-model="files"
        outlined
        counter
        filled
        max-files="5"
        multiple
        label=""
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
        <template v-slot:after>
          <q-btn
            round
            dense
            flat
            icon="send"
            label="Subir Archivos"
            style="font-size: 15px; color: #001f6d"
            :disable="files.length === 0"
            @click="uploadFile('soapFile_')"
          />
        </template>
      </q-file>
      <q-markup-table
        flat
        bordered
        style="margin-top: 10px"
        v-if="rows.length != 0"
        :loading="loading"
      >
        <tbody
          v-if="rows.length > 0"
          style="margin-top: 10px"
        >
          <tr
            v-for="(file, index) in rows"
            :key="file.name"
          >
            <td
              class="text-left"
              style="width: auto; font-size: 14px; color: #111827"
            >
              {{ index + 1 }}{{ file.file_name }}
            </td>
            <td
              class="text-right"
              style="width: auto"
            >
              <q-btn
                type="a"
                :href="file.original_url"
                target="_blank"
                class="q-btn q-btn-item non-selectable no-outline q-btn--flat q-btn--round q-btn--actionable q-focusable q-hoverable"
                tabindex="0"
                icon="visibility"
                flat
                round
                dense
              />
              <q-btn
                v-if="read_only != 1"
                style="flex: 0 0"
                @click="deleteFile(file.id)"
                flat
                round
                dense
                icon="delete"
                :loading="loading"
              />
            </td>
          </tr>
          <!-- <tr>
            <td class="text-left" style="width:auto; font-size: 14px; color: #111827;">Archivo 2</td>
            <td class="text-right" style="width:auto"><button
                class="q-btn q-btn-item non-selectable no-outline q-btn--flat q-btn--round q-btn--actionable q-focusable q-hoverable"
                tabindex="0" type="button"><span class="q-focus-helper"></span><span
                  class="q-btn__content text-center col items-center q-anchor--skip justify-center row"><i
                    class="q-icon notranslate material-icons" aria-hidden="true" role="img">delete</i></span></button>
            </td>
          </tr> -->
        </tbody>
      </q-markup-table>
    </div>

    <div class="form-section">
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        v-model="medicalRecord.diagnostic_impression"
        label="Impresión Diagnóstica"
        @blur="save"
      ></q-input>
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        v-model="medicalRecord.treatment"
        label="Tratamiento"
        @blur="save"
      ></q-input>
      <q-input
        :readonly="read_only == 1 ? true : false"
        type="textarea"
        style="margin-top: 25px"
        outlined
        stack-label
        hide-bottom-space
        v-model="medicalRecord.case_analysis"
        label="Análisis del Caso"
        @blur="save"
      ></q-input>
    </div>
    <br />
    <div class="flex justify-end">
      <q-btn
        v-if="read_only != 1"
        color="primary"
        @click="last_save"
        :loading="loading"
      >
        Guardar
      </q-btn>
    </div>
  </q-page>
</template>

<style scoped>
label {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
  margin-right: 0.5rem;
  display: block;
  transform: none;
}

.impact-btn {
  font-weight: 700;
  font-size: 25px;
  color: #001f6d;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 109px;
  height: 65px;
  border: 1px solid grey;
  border-radius: 8px;
}

.spl-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.q-table td,
.q-table th {
  width: 90px;
}

.q-table td:first-child {
  padding: 24px 33px !important;
  max-width: 177px;
}

.q-table th:nth-child(1) {
  padding: 24px 33px !important;
  max-width: 177px;
}
</style>
