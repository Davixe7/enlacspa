<script setup>
import { api } from 'src/boot/axios'
import { reactive, ref, watch } from 'vue'
import MedicationLogs from './../../components/MedicationLogs.vue'
import notify from 'src/utils/notify'

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  readonly: { type: Boolean, default: false },
  errors: { type: Object, required: false, default: () => ({}) },
  candidateId: { type: Number, required: false, default: null },
  modelValue: {
    type: Array,
    default: () => [],
    required: true
  }
})

const loading = ref(false)
const localMedications = ref([...props.modelValue])
const logsDialog = ref(false)

watch(
  () => props.modelValue,
  (newValue) => {
    localMedications.value = newValue
  },
  { deep: true }
)

watch(
  () => localMedications.value,
  (newValue) => {
    emits('update:modelValue', newValue)
  },
  { deep: true }
)

const medication = reactive({
  status: 1,
  name: '',
  dose: '',
  frequency: '',
  duration: ''
})

function addMedication() {
  medication.status = 1
  medication.name = ''
  medication.dose = ''
  medication.frequency = ''
  medication.duration = ''
  medication.observations = ''
  localMedications.value.push({ ...medication })
}

async function logStatus(status, med) {
  if (!med.id) {
    return
  }
  try {
    loading.value = true
    let route = `/medication_logs/${med.id}`
    let data = { ...med, status }
    await api.post(route, data)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function saveMedication(med) {
  try {
    loading.value = true
    let route = med.id ? `/medications/${med.id}` : 'medications'
    let data = { ...med, _method: med.id ? 'PUT' : 'POST', candidate_id: props.candidateId }
    let action = med.id ? 'actualizado' : 'guardado'
    let response = (await api.post(route, data)).data.data
    localMedications.value.splice(localMedications.value.indexOf(med), 1, response)
    notify.positive(`Medicamento ${action} exitosamente`)
  } catch (error) {
    console.log(error)
    notify.negative(`No se pudo guardar`)
  } finally {
    loading.value = false
  }
}

async function deleteMedication(med) {
  if (!med.id) {
    localMedications.value.splice(localMedications.value.indexOf(med, 1), 1)
    return
  }

  try {
    loading.value = true
    await api.post(`medications/${med.id}`, { _method: 'DELETE' })
    localMedications.value.splice(localMedications.value.indexOf(med), 1)
  } catch (error) {
    console.log(error)
    notify.negative(`No se pudo actualizar`)
  } finally {
    loading.value = false
  }
}

const columns = ref([
  {
    name: 'status',
    field: 'status',
    label: 'Estado',
    align: 'left'
  },
  {
    name: 'name',
    field: 'name',
    label: 'Nombre del medicamento',
    align: 'left'
  },
  { name: 'dosis', field: 'dose', label: 'Dosis', align: 'left' },
  {
    name: 'frecuencia',
    field: 'frequency',
    label: 'Frecuencia',
    align: 'left'
  },
  {
    name: 'tiempo',
    field: 'duration',
    label: 'Tiempo de tomarlo',
    align: 'left'
  },
  {
    name: 'observaciones',
    field: () => 'Lörem ipsum orade kövis då antivaxxare. Sanys infrafede de stenosamma plagen. ',
    label: 'Observaciones',
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'right'
  }
])
</script>

<template>
  <div class="form-section">
    <div class="page-title">Tabla de Medicamentos</div>

    <q-table
      class="q-mb-lg"
      hide-bottom
      wrap-cells
      flat
      bordered
      :columns="columns"
      :rows="localMedications"
      :pagination="{ rowsPerPage: 0 }"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td>
            <q-toggle
              @update:model-value="(value, event) => logStatus(value, props.row)"
              v-model="props.row.status"
              :true-value="1"
              :false-value="0"
              color="positive"
            />
          </q-td>
          <q-td>
            <q-input
              outlined
              placeholder="Ej: Paracetamol"
              v-model="props.row.name"
              :error="!!errors[`medications.${props.rowIndex}.name`]"
              :error-message="errors[`medications.${props.rowIndex}.name`]"
            ></q-input>
          </q-td>
          <q-td>
            <q-input
              outlined
              placeholder="Ej: 500 mg"
              v-model="props.row.dose"
              :error="!!errors[`medications.${props.rowIndex}.dose`]"
              :error-message="errors[`medications.${props.rowIndex}.dose`]"
            ></q-input>
          </q-td>
          <q-td>
            <q-input
              outlined
              placeholder="Ej: 2 Veces al dia"
              v-model="props.row.frequency"
              :error="!!errors[`medications.${props.rowIndex}.frequency`]"
              :error-message="errors[`medications.${props.rowIndex}.frequency`]"
            ></q-input>
          </q-td>
          <q-td>
            <q-input
              outlined
              placeholder="Ej: 1 Semana"
              v-model="props.row.duration"
              :error="!!errors[`medications.${props.rowIndex}.duration`]"
              :error-message="errors[`medications.${props.rowIndex}.duration`]"
            ></q-input>
          </q-td>
          <q-td>
            <q-input
              type="textarea"
              outlined
              v-model="props.row.observations"
            ></q-input>
          </q-td>
          <q-td>
            <div class="q-table__actions">
              <q-btn
                flat
                round
                icon="delete"
                @click="deleteMedication(props.row)"
              />
              <q-btn
                v-if="candidateId"
                flat
                round
                icon="save"
                @click="saveMedication(props.row)"
              />
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="logsDialog">
      <q-card style="width: 460px">
        <q-card-section>
          <div class="page-subtitle">Historial de Medicacion</div>
        </q-card-section>
        <MedicationLogs :candidateId="props.candidateId" />
      </q-card>
    </q-dialog>

    <div class="flex justify-end">
      <q-btn
        outline
        color="primary"
        @click="logsDialog = true"
        label="Ver historial"
        class="q-mr-md"
      />
      <q-btn
        :disable="props.readonly"
        color="primary"
        icon="add"
        @click="addMedication"
      >
        Agregar Medicamento
      </q-btn>
    </div>
  </div>
</template>

<style>
.q-table td {
  vertical-align: middle;
}

.q-table td:nth-child(5) {
  font-size: 14px;
  width: 185px;
  padding: 10px;
  box-sizing: border-box;
}

.q-table tr:nth-child(even) {
  background-color: #f3f4f6;
  /* Color de fondo para filas pares */
}
</style>
