<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref, computed } from 'vue'

const loading = ref(false)
const search = ref('')
const rows = ref([])
const columns = ref([
  { field: 'sheet', label: 'Folio', align: 'left', sortable: true },
  { field: 'candidateName', label: 'Beneficiario', align: 'left' },
  { field: 'programName', label: 'Programa', align: 'left' },
  { field: 'parents', label: 'Cuota Padres (mes)', align: 'left', name: 'parents' },
  { field: 'sponsors', label: 'Aportación de Padrinos (mes)', align: 'left', name: 'sponsors' },
  { field: 'enlac', label: 'Cuota ENLAC (mes)', align: 'left' }
])

const fecha = new Date()
const mesActual = fecha.getMonth() + 1 // 1–12
const anioActual = fecha.getFullYear()
const inicioCiclo = mesActual >= 8 ? anioActual : anioActual - 1

// Nombres de los meses (usamos índice 1–12)
const calendarMonths = [
  {},
  { label: 'Agosto', month: 1 },
  { label: 'Septiembre', month: 2 },
  { label: 'Octubre', month: 3 },
  { label: 'Noviembre', month: 4 },
  { label: 'Diciembre', month: 5 },
  { label: 'Enero', month: 6 },
  { label: 'Febrero', month: 7 },
  { label: 'Marzo', month: 8 },
  { label: 'Abril', month: 9 },
  { label: 'Mayo', month: 10 },
  { label: 'Junio', month: 11 },
  { label: 'Julio', month: 12 }
]

function toSchoolMonth(calendarMonth) {
  return calendarMonth >= 8 ? calendarMonth - 7 : calendarMonth + 5
}

// Computamos los meses válidos del ciclo hasta el mes actual
const mesesDisponibles = computed(() => {
  const opciones = []

  // Agosto a diciembre del año de inicio
  for (let i = 1; i <= 12; i++) {
    let monthYear = i <= 5 ? inicioCiclo : inicioCiclo + 1
    opciones.push({
      label: `${monthYear} - ${calendarMonths[i].label}`,
      value: { year: inicioCiclo, month: i }
    })
  }

  return opciones
})

const month = ref(null)

async function fetchFinancial() {
  try {
    loading.value = true
    rows.value = (
      await api.get(`financial/?month=${month.value.value.month}&year=${month.value.value.year}`)
    ).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const sponsorStatusFilter = ref(null)
const parentStatusFilter = ref(null)

const results = computed(() => {
  let results = [...rows.value]

  if (parentStatusFilter.value) {
    results = results.filter((row) => row.parentStatus == parentStatusFilter.value)
  }

  if (sponsorStatusFilter.value) {
    results = results.filter((row) => row.sponsorStatus == sponsorStatusFilter.value)
  }

  return results
})

onMounted(async () => {
  console.log(mesActual)
  console.log(toSchoolMonth(mesActual))

  month.value = {
    value: { month: toSchoolMonth(mesActual), year: inicioCiclo },
    label: calendarMonths[toSchoolMonth(mesActual)].label
  }
  fetchFinancial()
})
</script>

<template>
  <div class="flex q-mb-lg">
    <div class="page-title">Tesorería</div>

    <q-select
      style="width: 200px"
      outlined
      stack-label
      label="Cuota de Padres"
      class="q-ml-auto q-mr-md"
      v-model="parentStatusFilter"
      emit-value
      map-options
      clearable
      :options="[
        { label: 'Solvente', value: 'green-3' },
        { label: 'Pendiente', value: 'red-3' },
        { label: 'Todos', value: null }
      ]"
    />

    <q-select
      style="width: 200px"
      label="Cuota de Padrinos"
      outlined
      class="q-mr-md"
      v-model="sponsorStatusFilter"
      emit-value
      map-options
      clearable
      :options="[
        { label: 'Solvente', value: 'green-3' },
        { label: 'Pendiente', value: 'red-3' },
        { label: 'Todos', value: null }
      ]"
    />

    <q-input
      outlined
      v-model="search"
      hide-bottom-space
      clearable
      class="q-mr-md"
      stack-label
      label="Beneficiario"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-select
      outlined
      stack-label
      label="Mes"
      v-model="month"
      @update:modelValue="fetchFinancial"
      :options="mesesDisponibles"
    />
  </div>

  <q-table
    :rows="results"
    :columns="columns"
    :pagination="{ rowsPerPage: -1 }"
    :filter="search"
  >
    <template v-slot:body-cell-parents="props">
      <q-td :class="`bg-${props.row.parentStatus}`">
        {{ props.row.parents }}
      </q-td>
    </template>

    <template v-slot:body-cell-sponsors="props">
      <q-td :class="`bg-${props.row.sponsorStatus}`">
        {{ props.row.sponsors }}
      </q-td>
    </template>
  </q-table>
</template>
