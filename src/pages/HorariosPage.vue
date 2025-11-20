<script setup>
import { onMounted, ref, computed } from 'vue'
import { date } from 'quasar'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import BeneficiariesPicker from 'src/components/BeneficiariesPicker.vue'

const loading = ref(false)
const scheduleDialog = ref(false)
const selectedDate = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const schedules = ref([])
const candidateId = ref(null)

const slotTemplate = {
  candidate_id: null,
  date: null,
  comment: '',
  start_time: null,
  end_time: null,
  is_comodin: 0,
  departure_time: null,
  arrival_time: null
}

const defaultSlots = [
  { start_time: '09:00:00', end_time: '09:25:00' },
  { start_time: '09:25:00', end_time: '09:50:00' },
  { start_time: '09:50:00', end_time: '10:15:00' },
  { start_time: '10:15:00', end_time: '10:40:00' },
  { start_time: '10:40:00', end_time: '11:05:00' },
  { start_time: '11:05:00', end_time: '11:30:00' },
  { start_time: '11:30:00', end_time: '11:55:00' },
  { start_time: '11:55:00', end_time: '12:20:00' },
  { start_time: '12:20:00', end_time: '12:45:00' },
  { start_time: '12:45:00', end_time: '01:10:00' }
]

const rows = computed(() => {
  return defaultSlots.map((slot) => {
    return (
      schedules.value.find((schedule) => schedule.start_time == slot.start_time) || {
        ...slotTemplate,
        ...slot,
        candidate_id: candidateId.value,
        date: selectedDate.value
      }
    )
  })
})

async function fetchSchedules() {
  if (!selectedDate.value) return
  try {
    loading.value = true
    schedules.value = (
      await api.get(`equinotherapy_schedules/?date=${selectedDate.value}`)
    ).data.schedules
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo cargar la agenda del día seleccionado')
  } finally {
    loading.value = false
  }
}

const selectedRow = ref(null)

function setSchedule(row) {
  selectedRow.value = row
  scheduleDialog.value = true
}

async function saveSchedule() {
  try {
    loading.value = true
    let data = (await api.post('equinotherapy_schedules', selectedRow.value)).data.data
    notify.positive('Guardado exitosamente')
    let rowIndex = rows.value.findIndex((row) => row.start_time == selectedRow.value.start_time)
    rows.value.splice(rowIndex, 1, data)
    scheduleDialog.value = false
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo guardar el horario')
  } finally {
    loading.value = false
  }
}

const hourBlocks = [
  '09:00am - 09:25am',
  '09:25am - 09:50am',
  '09:50am - 10:15am',
  '10:15am - 10:40am',
  '10:40am - 11:05am',
  '11:05am - 11:30am',
  '11:30am - 11:55am',
  '11:55am - 12:20pm',
  '12:20pm - 12:45pm',
  '12:45pm - 01:10pm'
]

onMounted(async () => {
  await fetchSchedules()
})
</script>

<template>
  <q-page>
    <div class="row q-col-gutter-x-lg">
      <div class="col-md-3">
        <q-card>
          <q-card-section class="text-h6"> Seleccione el día </q-card-section>
          <q-separator />
          <q-date
            flat
            style="width: 100%"
            v-model="selectedDate"
            mask="YYYY-MM-DD"
            @update:model-value="fetchSchedules"
          />
        </q-card>
      </div>

      <div class="col-md-9">
        <q-markup-table style="width: 100%">
          <thead>
            <th>Horario</th>
            <th>Beneficiario</th>
            <th>Ida</th>
            <th>Regreso</th>
            <th>Comentarios</th>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in rows"
              :key="row.id"
            >
              <td>{{ hourBlocks[i] }}</td>
              <td>
                <div v-if="row.id">{{ row.candidate.full_name }}</div>
                <q-btn
                  v-else
                  unelevated
                  label="Seleccionar"
                  color="grey-5"
                  dense
                  @click="setSchedule(row)"
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </div>

    <q-dialog v-model="scheduleDialog">
      <q-card style="width: 400px">
        <q-card-section class="text-h6"> Programar horario</q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <div class="q-pb-sm q-field__label">Seleccionar beneficiario</div>
          <BeneficiariesPicker
            class="q-mb-md"
            v-model="selectedRow.candidate_id"
          />
          <div v-if="selectedRow.candidate_id">
            <table
              style="width: 100%"
              class="schedule-table"
            >
              <tr>
                <th>Fecha:</th>
                <td class="text-right">{{ selectedRow.date }}</td>
              </tr>
              <tr>
                <th>Hora inicio:</th>
                <td class="text-right">{{ selectedRow.start_time }}</td>
              </tr>
              <tr>
                <th>Hora fin:</th>
                <td class="text-right">{{ selectedRow.end_time }}</td>
              </tr>
            </table>

            <div class="flex justify-end q-pt-md">
              <q-btn
                unelevated
                color="primary"
                label="Guardar"
                @click="saveSchedule"
                :loading="loading"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style lang="scss">
.schedule-table td {
  padding: 0.25rem 0;
}
th:first-child {
  text-align: left;
}
th:nth-child(2) {
  text-align: left;
}
</style>
