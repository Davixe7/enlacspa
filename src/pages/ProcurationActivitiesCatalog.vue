<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import notify from 'src/utils/notify'

const loading = ref(false)
const configLoading = ref(false)
const errors = ref({})
const row = ref(null)
const rows = ref([])

const columns = ref([
  { align: 'left', name: 'name', label: 'Nombre de la Actividad', field: 'name', sortable: true },
  { align: 'left', name: 'type', label: 'Tipo de Actividad', field: 'type' },
  {
    align: 'right',
    name: 'status',
    label: 'Estatus',
    field: (row) => (row.is_active ? 'Activo' : 'Inactivo')
  },
  { align: 'right', name: 'actions', label: 'Acciones' }
])

const dialog = ref(false)
const configDialog = ref(false)
const selectedActivity = ref(null)

// Campos dinámicos avanzados mapeados al 100% con tu base de datos
const configForm = ref({
  created_date: '',
  event_date: '',
  place: '',
  goal_amount: 0,
  tickets_count: 0,
  ticket_price: 0,
  winning_ticket: '',
  winner_name: '',
  seller_winner_name: ''
})

const activityTypes = [
  'Alcancía',
  'Alianza',
  'Boteo',
  'Donativos Varios',
  'Fundaciones',
  'Natación',
  'Obsequio entre Amigos',
  'Organismos de Gobierno',
  'Programa de Verano',
  'Proyecto Interno',
  'Radiomaratón'
]

function editActivity(newRow) {
  row.value = { ...newRow, is_active: newRow.is_active ? 1 : 0 }
  errors.value = {}
  dialog.value = true
}

function addActivity() {
  row.value = {
    name: '',
    type: '',
    is_active: 1
  }
  errors.value = {}
  dialog.value = true
}

async function saveActivity() {
  try {
    loading.value = true
    errors.value = {}

    // Apuntando al endpoint correcto de tus actividades de procuración
    let route = row.value.id ? `/procuration-activities/${row.value.id}` : '/procuration-activities'
    let data = row.value.id ? { ...row.value, _method: 'PUT' } : { ...row.value }

    const response = await api.post(route, data)
    const savedData = response.data.data || response.data

    if (row.value.id) {
      const index = rows.value.findIndex((item) => item.id === row.value.id)
      if (index !== -1) rows.value[index] = savedData
    } else {
      rows.value.unshift(savedData)
    }

    rows.value.sort((a, b) => a.name.localeCompare(b.name))
    notify.positive('Guardado con éxito')
    dialog.value = false
  } catch (error) {
    console.log(error)
    if (error.response?.status === 422) {
      const serverErrors = error.response.data.errors
      Object.keys(serverErrors).forEach((key) => {
        errors.value[key] = serverErrors[key][0]
      })
    } else {
      notify.negative('No se pudo guardar la actividad')
    }
  } finally {
    loading.value = false
  }
}

// Abre el panel avanzado y setea los valores correspondientes
function openConfiguration(activity) {
  selectedActivity.value = activity
  errors.value = {}

  // Si es primera vez que se abre, cargamos el día de hoy por defecto para Fecha de Creación
  const today = new Date().toISOString().split('T')[0]

  configForm.value = {
    created_date: activity.created_date ? activity.created_date.split('T')[0] : today,
    event_date: activity.event_date ? activity.event_date.split('T')[0] : '',
    place: activity.place || '',
    goal_amount: activity.goal_amount || 0,
    tickets_count: activity.tickets_count || 0,
    ticket_price: activity.ticket_price || 0,
    winning_ticket: activity.winning_ticket || '',
    winner_name: activity.winner_name || '',
    seller_winner_name: activity.seller_winner_name || ''
  }

  configDialog.value = true
}

async function saveConfiguration() {
  try {
    configLoading.value = true
    errors.value = {}

    const route = `/procuration-activities/${selectedActivity.value.id}`
    const data = {
      ...selectedActivity.value,
      ...configForm.value,
      _method: 'PUT'
    }

    const response = await api.post(route, data)
    const savedData = response.data.data || response.data

    const index = rows.value.findIndex((item) => item.id === selectedActivity.value.id)
    if (index !== -1) {
      rows.value[index] = savedData
    }

    notify.positive('Configuración avanzada guardada correctamente')
    configDialog.value = false
  } catch (error) {
    console.log(error)
    if (error.response?.status === 422) {
      const serverErrors = error.response.data.errors
      Object.keys(serverErrors).forEach((key) => {
        errors.value[key] = serverErrors[key][0]
      })
    } else {
      notify.negative('Error al guardar la configuración')
    }
  } finally {
    configLoading.value = false
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/procuration-activities')
    let data = response.data.data || response.data
    rows.value = data.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.log('Error al cargar actividades:', error)
  }
})
</script>

<template>
  <div class="flex items-center q-mb-lg">
    <h1 class="page-title q-mb-none">Catálogo de Procuración de Fondos</h1>
    <q-btn
      class="q-ml-auto"
      icon="sym_o_add"
      @click="addActivity"
      color="primary"
      label="Nueva Actividad"
    />
  </div>

  <q-table
    :columns="columns"
    :rows="rows"
    :pagination="{ rowsPerPage: 0 }"
    flat
    bordered
  >
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right q-gutter-x-sm">
        <q-btn
          v-if="['Obsequio entre Amigos', 'Radiomaratón'].includes(props.row.type)"
          icon="sym_o_settings"
          label="Configurar"
          flat
          dense
          color="secondary"
          @click="openConfiguration(props.row)"
        />
        <q-btn
          icon="sym_o_edit"
          round
          flat
          color="primary"
          dense
          @click="editActivity(props.row)"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog">
    <q-card style="width: 480px">
      <q-card-section class="flex items-center q-pb-none">
        <div class="text-subtitle1 text-weight-bold">
          {{ `${row.id ? 'Actualizar' : 'Nueva'}` }} Actividad
        </div>
        <q-btn
          flat
          round
          icon="sym_o_close"
          @click="dialog = false"
          class="q-ml-auto"
          v-close-popup
        />
      </q-card-section>

      <q-card-section>
        <q-form
          class="q-gutter-y-md"
          @submit.prevent="saveActivity"
        >
          <q-markup-table
            flat
            class="activity-form"
          >
            <tbody>
              <tr>
                <td>Tipo de Actividad</td>
                <td>
                  <q-select
                    outlined
                    dense
                    v-model="row.type"
                    :options="activityTypes"
                    placeholder="Seleccione un tipo"
                    hide-bottom-space
                    :error="!!errors['type']"
                    :error-message="errors['type']"
                  />
                </td>
              </tr>
              <tr>
                <td>Nombre de la Actividad</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="row.name"
                    placeholder="Ej. Sorteo Anual 2026"
                    hide-bottom-space
                    :error="!!errors['name']"
                    :error-message="errors['name']"
                  />
                </td>
              </tr>
              <tr>
                <td>Activo</td>
                <td>
                  <q-checkbox
                    v-model="row.is_active"
                    :true-value="1"
                    :false-value="0"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
          <div class="flex justify-end q-mt-md">
            <q-btn
              :loading="loading"
              type="submit"
              :label="`${row.id ? 'Actualizar' : 'Agregar'}`"
              color="primary"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="configDialog">
    <q-card style="width: 550px; max-width: 90vw">
      <q-card-section class="flex items-center q-pb-none">
        <div>
          <div class="text-subtitle1 text-weight-bold">Configurar Detalles Adicionales</div>
          <div class="text-caption text-secondary text-weight-bold">
            {{ selectedActivity?.name }} — {{ selectedActivity?.type }}
          </div>
        </div>
        <q-btn
          flat
          round
          icon="sym_o_close"
          @click="configDialog = false"
          class="q-ml-auto"
          v-close-popup
        />
      </q-card-section>

      <q-card-section>
        <q-form
          class="q-gutter-y-sm"
          @submit.prevent="saveConfiguration"
        >
          <q-markup-table
            flat
            class="activity-form"
          >
            <tbody>
              <template v-if="selectedActivity?.type === 'Radiomaratón'">
                <tr>
                  <td>Meta</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      type="number"
                      step="0.01"
                      prefix="$"
                      v-model.number="configForm.goal_amount"
                      placeholder="0.00"
                      hide-bottom-space
                      :error="!!errors['goal_amount']"
                      :error-message="errors['goal_amount']"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Fecha de Creación</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      type="date"
                      v-model="configForm.created_date"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td>Fecha del Evento</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      type="date"
                      v-model="configForm.event_date"
                      hide-bottom-space
                    />
                  </td>
                </tr>
              </template>

              <template v-if="selectedActivity?.type === 'Obsequio entre Amigos'">
                <tr>
                  <td>Número de Boletos</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model.number="configForm.tickets_count"
                      placeholder="Numérico"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td>Precio del Boleto</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      type="number"
                      step="0.01"
                      prefix="$"
                      v-model.number="configForm.ticket_price"
                      placeholder="Monetario"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td>Fecha de Creación</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      type="date"
                      v-model="configForm.created_date"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td>Fecha del Evento</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      type="date"
                      v-model="configForm.event_date"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td>Lugar</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      v-model="configForm.place"
                      placeholder="Campo de texto"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td>Boleto Ganador</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      v-model="configForm.winning_ticket"
                      placeholder="Campo de texto"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td>Nombre del Ganador</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      v-model="configForm.winner_name"
                      placeholder="Campo de texto"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td>Nombre del Vendedor Ganador</td>
                  <td>
                    <q-input
                      outlined
                      dense
                      v-model="configForm.seller_winner_name"
                      placeholder="Campo de texto"
                      hide-bottom-space
                    />
                  </td>
                </tr>
              </template>
            </tbody>
          </q-markup-table>

          <div class="flex justify-end q-mt-md">
            <q-btn
              :loading="configLoading"
              type="submit"
              label="Guardar Configuración"
              color="primary"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.activity-form {
  td:first-child {
    padding-left: 0;
    width: 210px;
    font-weight: bold;
    color: #4b5563;
  }
  td {
    padding: 4px 8px;
  }
}
</style>
