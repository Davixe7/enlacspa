<script setup>
import { api } from 'src/boot/axios'
import { watch, ref, onMounted } from 'vue'
import EnlacDate from 'src/components/EnlacDate.vue'
import notify from 'src/utils/notify'
import { useCategoryStore } from 'src/stores/category-store'

const props = defineProps(['categoryName'])

const workAreaId = ref(null)
const categoryStore = useCategoryStore()
const candidates = ref([])
const currentAttendances = ref([])
const loading = ref(false)
const dateISO = ref(new Date().toISOString().split('T')[0])

watch(dateISO, async function () {
  await fetchCandidates()
  await fetchAttendances()
  mapAttendances()
})

function mapAttendances() {
  currentAttendances.value = candidates.value.map(function (iCandidate) {
    let matchAttendance = currentAttendances.value.find(
      (attendance) => attendance.candidate_id == iCandidate.id
    )
    return {
      candidate_id: iCandidate.id,
      name: iCandidate.name,
      done_activities: iCandidate.done_activities,
      total_activities: iCandidate.total_activities,
      work_area_id: workAreaId.value,
      status: matchAttendance ? matchAttendance.status : 'absent'
    }
  })
}

async function fetchAttendances() {
  let params = {
    work_area_id: workAreaId.value,
    date: dateISO.value
  }
  currentAttendances.value = (await api.get('attendances', { params })).data.data
}

async function fetchCandidates() {
  let params = {
    work_area_id: workAreaId.value,
    date: dateISO.value
  }
  candidates.value = (await api.get(`attendances/candidates`, { params })).data.data
}

onMounted(async () => {
  workAreaId.value = (await categoryStore.getCategoryByName(props.categoryName)).id
  await fetchCandidates()
  await fetchAttendances()
  mapAttendances()
})

const columns = ref([
  { align: 'left', name: 'name', label: 'Beneficiario', field: 'name' },
  {
    align: 'left',
    name: 'activitiesCount',
    label: 'Actividades Programadas',
    field: 'total_activities'
  },
  {
    align: 'left',
    name: 'activitiesMade',
    label: 'Actividades Realizadas',
    field: 'done_activities'
  },
  { align: 'left', name: 'actions', label: 'Asistencia' }
])

async function storeAttendances() {
  try {
    loading.value = true
    let data = { attendances: currentAttendances.value }
    await api.post('attendances', data)
    notify.positive('Lista de asistencia actualizada')
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo actualizar la lista de asistencia')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center q-mb-md">
    <h1 class="page-title q-mb-none">Control de Asistencias</h1>

    <enlac-date
      v-model="dateISO"
      class="q-ml-auto q-mr-md"
    />

    <q-btn
      color="primary"
      :loading="loading"
      @click="storeAttendances"
      label="Guardar lista"
    />
  </div>

  <q-table
    v-if="candidates && candidates.length"
    flat
    bordered
    dense
    :loading="loading"
    :columns="columns"
    :rows="currentAttendances"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body-cell-actions="props">
      <q-td>
        <q-checkbox
          v-model="props.row.status"
          :false-value="'absent'"
          :true-value="'present'"
          :style="{'pointer-events': props.row.done_activities ? 'none' : 'all'}"
        />
      </q-td>
    </template>
  </q-table>

  <div class="flex justify-end q-mt-md">
    <q-btn
      color="primary"
      :loading="loading"
      @click="storeAttendances"
      label="Guardar lista"
    />
  </div>
</template>
