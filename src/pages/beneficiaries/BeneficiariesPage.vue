<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/formatDate'
import { useAuthStore } from 'src/stores/user-store'

const authStore = useAuthStore()
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  rows.value = (await api.get('beneficiaries')).data.data
  loading.value = false
})

const rows = ref([])
const columns = ref([
  {
    name: 'name',
    label: 'Nombre del Beneficiario',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'sheet',
    label: 'Folio',
    field: 'id',
    align: 'left',
    sortable: true
  },
  {
    name: 'entry_status',
    label: 'Estatus',
    field: 'entry_status',
    align: 'left',
    sortable: true
  },
  {
    name: 'entry_date',
    label: 'Fecha de ingreso',
    field: (row) => (row.onboard_at ? formatDate(row.entry_date) : '--'),
    align: 'left',
    sortable: true
  },
  {
    name: 'program_name',
    label: 'Programa',
    field: 'program_name',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'right'
  }
])

const entryStatuses = [
  { value: 'pendiente_ingresar', label: 'Pendiente de ingresar' },
  { value: 'listo_ingresar', label: 'Listo para ingresar' },
  { value: 'programar_ingreso', label: 'Programar ingreso' },
  { value: 'activo', label: 'Activo' },
  { value: 'permiso_temporal', label: 'Permiso temporal' },
  { value: 'prueba_vida', label: 'Prueba de vida' },
  { value: 'inactivo', label: 'Inactivo' }
]

const actions = ref([
  { disable: false, icon: 'visibility', route: 'perfil', label: 'Perfil' },
  { disable: false, icon: 'content_paste', route: 'evaluar', label: 'Evaluar' },
  { disable: !authStore.can('kardexes.update'), icon: 'folder', route: 'kardex', label: 'Kardex' },
  { disable: false, icon: 'calendar_month', route: 'citas', label: 'Citas' },
  { disable: false, icon: 'attach_money', route: 'cuotas', label: 'Control de Cuotas' },
  { disable: false, icon: 'list_alt_check', route: 'planes', label: 'Programacion Individual' }
])
</script>

<template>
  <h1 class="page-title">Admisiones y Beneficiarios</h1>
  <q-table
    bordered
    flat
    hide-bottom
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    :loading="loading"
  >
    <template v-slot:loading>
      <div class="flex q-my-lg justify-center">
        <div>
          <q-spinner
            size="30px"
            color="primary"
            class="q-mr-md"
          ></q-spinner>
          Cargando...
        </div>
      </div>
    </template>
    <template v-slot:body-cell-entry_status="props">
      <q-td>
        <q-select
          dense
          outlined
          hide-bottom-space
          :options="entryStatuses"
          v-model="props.row.entry_status"
          emit-value
          map-options
        />
      </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right q-py-xs">
        <div q-table__actions>
          <q-btn
            v-for="action in actions"
            :key="action.icon"
            :disable="action.disable"
            round
            unelevated
            dense
            :icon="`sym_o_${action.icon}`"
            :to="`beneficiarios/${props.row.id}/${action.route}`"
            ><q-tooltip
              :offset="[0, 0]"
              anchor="top middle"
              self="bottom middle"
            >
              {{ action.label }}
            </q-tooltip>
          </q-btn>
        </div>
      </q-td>
    </template>
  </q-table>
</template>
