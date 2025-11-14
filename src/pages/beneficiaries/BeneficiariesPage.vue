<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/formatDate'
import { useAuthStore } from 'src/stores/user-store'
import { useQuasar } from 'quasar'
import ProgramarIngresoDialog from './ProgramarIngresoDialog.vue'

const authStore = useAuthStore()
const $q = useQuasar()

const loading = ref(false)

onMounted(async () => {
  loading.value = true
  rows.value = (await api.get('beneficiaries')).data.data
  loading.value = false
})

const openStatusDialog = (row, newStatus) => {
  $q.dialog({
    title: 'Cambiar estatus',
    message: 'Ingrese comentario para el cambio de estatus',
    prompt: {
      model: '',
      type: 'text'
    },
    cancel: true,
    ok: {
      label: 'Guardar',
      color: 'primary'
    }
  }).onOk(async (comment) => {
    if (!comment) {
      $q.notify({ type: 'negative', message: 'El comentario es obligatorio' })
      return
    }
    await changeStatus(row, newStatus, comment)
  })
}

const changeStatus = async (row, newStatus, comment, file) => {
  try {
    const formData = new FormData()
    formData.append('status', newStatus)
    formData.append('comment', comment || '')
    if (file) formData.append('document', file)

    await api.post(`beneficiaries/${row.id}/status`, formData)

    // Actualiza estado local
    row.status = newStatus

    // Estado que desaparecen de la vista principal
    const shouldDisappear = ['graduado', 'inactivo', 'exenlac', 'fallecido'].includes(newStatus)
    if (shouldDisappear) {
      rows.value = rows.value.filter((r) => r.id !== row.id)
      $q.notify({ type: 'info', message: 'Movido a reportes' })
    } else {
      $q.notify({ type: 'positive', message: 'Estatus actualizado' })
    }
  } catch (e) {
    console.log(e)
    $q.notify({ type: 'negative', message: 'Error al actualizar estatus' })
  }
}

const rows = ref([])
const columns = ref([
  { name: 'name', label: 'Nombre del Beneficiario', field: 'name', align: 'left', sortable: true },
  { name: 'sheet', label: 'Folio', field: 'id', align: 'left', sortable: true },
  { name: 'status', label: 'Estatus', field: 'status', align: 'left', sortable: true },
  {
    name: 'scheduled_entry_date',
    label: 'Fecha de ingreso',
    field: (row) => (row.scheduled_entry_date ? formatDate(row.scheduled_entry_date) : '--'),
    align: 'left',
    sortable: true
  },
  { name: 'program_name', label: 'Programa', field: 'program_name', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
])

const entryStatuses = [
  { value: 'pendiente_ingresar', label: 'Pendiente de ingresar' },
  { value: 'ingreso_programado', label: 'Ingreso programado' },
  { value: 'listo_ingresar', label: 'Listo para ingresar' },
  { value: 'activo', label: 'Activo' },
  { value: 'permiso_temporal', label: 'Permiso temporal' },
  { value: 'prueba_vida', label: 'Prueba de vida' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'exenlac', label: 'Ex-ENLAC' },
  { value: 'graduado', label: 'Graduado' },
  { value: 'fallecido', label: 'Fallecido' }
]

const actions = ref([
  { disable: false, icon: 'visibility', route: 'perfil', label: 'Perfil' },
  { disable: false, icon: 'content_paste', route: 'evaluar', label: 'Evaluar' },
  { disable: !authStore.can('kardexes.update'), icon: 'folder', route: 'kardex', label: 'Kardex' },
  { disable: false, icon: 'calendar_month', route: 'citas', label: 'Citas' },
  { disable: false, icon: 'attach_money', route: 'cuotas', label: 'Control de Cuotas' },
  { disable: false, icon: 'list_alt_check', route: 'planes', label: 'Programacion Individual' }
])

const onProgramarIngreso = (row) => {
  $q.dialog({
    component: ProgramarIngresoDialog,
    componentProps: { row }
  }).onOk(async (payload) => {
    await api.post(`beneficiaries/${row.id}/status`, {
      status: 'programar_ingreso',
      comment: 'Programar ingreso',
      program_id: payload.programId,
      scheduled_entry_date: payload.entryDate,
      observations: payload.observations
    })

    row.status = 'ingreso_programado'
    row.scheduled_entry_date = formatDate(payload.entryDate)

    $q.notify({ type: 'positive', message: 'Ingreso programado correctamente' })
  })
}
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
    <template v-slot:body-cell-status="props">
      <q-td>
        <q-select
          dense
          outlined
          hide-bottom-space
          :options="entryStatuses"
          v-model="props.row.status"
          emit-value
          map-options
          :disable="props.row.status === 'fallecido'"
          @update:model-value="
            (val) => {
              if (val === 'programar_ingreso') {
                onProgramarIngreso(props.row)
              } else {
                openStatusDialog(props.row, val)
              }
            }
          "
        />
      </q-td>
    </template>
    <template v-slot:body-cell-scheduled_entry_date="props">
      <q-td :props="props"> {{ props.row.scheduled_entry_date }} </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right q-py-xs">
        <div q-table__actions>
          <!-- Botón programar ingreso -->
          <q-btn
            round
            unelevated
            dense
            icon="sym_o_event"
            @click="onProgramarIngreso(props.row)"
          >
            <q-tooltip>Programar ingreso</q-tooltip>
          </q-btn>

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
