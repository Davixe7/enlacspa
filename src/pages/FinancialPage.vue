<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref, computed } from 'vue'

const loading = ref(false)
const search = ref('')
const rows = ref([])
const columns = ref([
  { name: 'name', label: 'Beneficiario', field: 'full_name', align: 'left', sortable: true },
  { name: 'id', label: 'Folio', field: 'id', align: 'left', sortable: true },
  { name: 'program', label: 'Programa', field: (row) => row.program.name, align: 'left' },
  { name: 'parents', label: 'Cuota Padres (mes)', align: 'left' },
  { name: 'sponsors', label: 'Cuota Padrinos (mes)', align: 'left' },
  { name: 'enlac', label: 'Beca ENLAC (mes)', field: (row) => row.enlacs_amount, align: 'left' }
])

const fecha = new Date()
const mesActual = fecha.getMonth() + 1 // 1–12
const anioActual = fecha.getFullYear()

// Si es antes de agosto, el ciclo inició el año anterior
const inicioCiclo = mesActual < 8 ? anioActual - 1 : anioActual

// Nombres de los meses (usamos índice 1–12)
const nombresMeses = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

// Computamos los meses válidos del ciclo hasta el mes actual
const mesesDisponibles = computed(() => {
  const opciones = []

  // Agosto a diciembre del año de inicio
  for (let i = 8; i < 20; i++) {
    let labelIndex = i > 12 ? i - 12 : i
    let inicioCicloIndex = i > 12 ? inicioCiclo + 1 : inicioCiclo
    opciones.push({
      label: `${inicioCicloIndex} - ${nombresMeses[labelIndex]}`,
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
    loading.value = true
  }
}
onMounted(async () => {
  month.value = {
    value: { month: mesActual, year: anioActual },
    label: nombresMeses[mesActual]
  }
  fetchFinancial()
})
</script>

<template>
  <div class="flex">
    <div class="page-title">Tesoreria</div>
    <q-input
      outlined
      v-model="search"
      hide-bottom-space
      clearable
      class="q-ml-auto q-mr-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-select
      dense
      outlined
      v-model="month"
      @update:modelValue="fetchFinancial"
      :options="mesesDisponibles"
    />
  </div>
  <q-table
    bordered
    hide-bottom
    :filter="search"
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: -1 }"
  >
    <template v-slot:body-cell-name="props">
      <q-td>
        <router-link :to="{ name: 'financial.control', params: { candidateId: props.row.id } }">
          {{ props.row.full_name }}
        </router-link>
      </q-td>
    </template>
    <template v-slot:body-cell-parents="props">
      <q-td :class="[`bg-${props.row.parent_status}`]">
        {{ `${props.row.parent_paid} / ${props.row.parent_amount}` }}
        <div v-if="props.row.last_parent_payment_date">
          <small>
            {{ props.row.last_parent_payment_date }}
          </small>
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-sponsors="props">
      <q-td :class="[`bg-${props.row.sponsr_status}`]">
        {{ `${props.row.sponsr_paid} / ${props.row.sponsr_amount}` }}
        <div v-if="props.row.last_sponsr_payment_date">
          <small>
            {{ props.row.last_sponsr_payment_date }}
          </small>
        </div>
      </q-td>
    </template>
  </q-table>
</template>
