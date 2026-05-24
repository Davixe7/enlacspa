<script setup>
import { api } from 'src/boot/axios'
import { ref } from 'vue'
import notify from 'src/utils/notify'
import { date } from 'quasar'

// Evento para avisarle a la lista principal que refresque los datos
const emit = defineEmits(['saved'])

const dialog = ref(false)
const loading = ref(false)
const errors = ref({})

const isEditing = ref(false)
const itemId = ref(null)

const userOptions = ref([])
const contactOptions = ref([])

const form = ref({
  name: '',
  date: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  start_time: '',
  end_time: '',
  location: '',
  description: '',
  internal_guests: [],
  external_guests: [],
  send_emails: false
})

async function loadInitialData() {
  try {
    const [resUsers, resContacts] = await Promise.all([
      api.get('/users?type=select'),
      api.get('/contacts?type=select')
    ])
    userOptions.value = resUsers.data.data || resUsers.data || []
    contactOptions.value = resContacts.data.data || resContacts.data || []
  } catch (e) {
    console.error(e)
    notify.negative('No se pudieron cargar los listados de invitados')
  }
}

function open(item = null) {
  resetForm()
  loadInitialData()

  if (item) {
    isEditing.value = true
    itemId.value = item.id

    // Detectamos las relaciones tolerando tanto camelCase como snake_case desde el backend
    const rawInternal = item.internal_guests || item.internalGuests || []
    const rawExternal = item.external_guests || item.externalGuests || []

    // Mapeamos los datos del registro al formulario transformando objetos en IDs planos
    form.value = {
      name: item.name,
      date: item.date,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location,
      description: item.description || '',
      internal_guests: rawInternal.map((u) => (typeof u === 'object' ? u.id : u)),
      external_guests: rawExternal.map((c) => (typeof c === 'object' ? c.id : c)),
      send_emails: false
    }
  } else {
    isEditing.value = false
    itemId.value = null
  }

  dialog.value = true
}

async function save() {
  try {
    loading.value = true
    errors.value = {}

    const payload = {
      ...form.value,
      internal_guests: form.value.internal_guests,
      external_guests: form.value.external_guests
    }

    if (isEditing.value) {
      await api.put(`/capacitations/${itemId.value}`, payload)
      notify.positive('Capacitación actualizada con éxito')
    } else {
      await api.post('/capacitations', payload)
      notify.positive('Capacitación registrada con éxito')
    }

    emit('saved')
    dialog.value = false
  } catch (error) {
    console.error(error)
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors || {}
    } else {
      notify.negative('Ocurrió un error al procesar la solicitud')
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    name: '',
    date: date.formatDate(Date.now(), 'YYYY-MM-DD'),
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    internal_guests: [],
    external_guests: [],
    send_emails: false
  }
  errors.value = {}
}

defineExpose({ open })
</script>

<template>
  <q-dialog
    v-model="dialog"
    persistent
  >
    <q-card style="width: 800px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ isEditing ? 'Editar Capacitación' : 'Nueva Capacitación' }}
        </div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="save">
          <q-markup-table
            flat
            class="donation-form-table"
          >
            <tbody>
              <!-- Nombre de la capacitación -->
              <tr>
                <td class="text-bold">Capacitación *</td>
                <td>
                  <q-input
                    v-model="form.name"
                    outlined
                    dense
                    placeholder="Nombre del evento o taller"
                    :error="!!errors.name"
                    :error-message="errors.name?.[0]"
                    hide-bottom-space
                  />
                </td>
              </tr>

              <!-- Fecha de ejecución -->
              <tr>
                <td class="text-bold">Fecha *</td>
                <td>
                  <q-input
                    v-model="form.date"
                    outlined
                    dense
                    type="date"
                    :error="!!errors.date"
                    :error-message="errors.date?.[0]"
                    hide-bottom-space
                  />
                </td>
              </tr>

              <!-- Bloque Horas -->
              <tr>
                <td class="text-bold">Horario *</td>
                <td>
                  <div class="row q-col-gutter-xs">
                    <div class="col-6">
                      <q-input
                        v-model="form.start_time"
                        outlined
                        dense
                        placeholder="Hora de Entrada (ej. 08:00 AM)"
                        :error="!!errors.start_time"
                        :error-message="errors.start_time?.[0]"
                        hide-bottom-space
                      >
                        <template v-slot:append>
                          <q-icon
                            name="access_time"
                            class="cursor-pointer"
                          >
                            <q-menu
                              anchor="bottom end"
                              self="top end"
                            >
                              <q-time
                                v-model="form.start_time"
                                mask="hh:mm A"
                                label-color="primary"
                              />
                            </q-menu>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="form.end_time"
                        outlined
                        dense
                        placeholder="Hora de Salida (ej. 12:00 PM)"
                        :error="!!errors.end_time"
                        :error-message="errors.end_time?.[0]"
                        hide-bottom-space
                      >
                        <template v-slot:append>
                          <q-icon
                            name="access_time"
                            class="cursor-pointer"
                          >
                            <q-menu
                              anchor="bottom end"
                              self="top end"
                            >
                              <q-time
                                v-model="form.end_time"
                                mask="hh:mm A"
                                color="primary"
                              />
                            </q-menu>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Lugar -->
              <tr>
                <td class="text-bold">Lugar *</td>
                <td>
                  <q-input
                    v-model="form.location"
                    outlined
                    dense
                    placeholder="Ubicación física o enlace virtual"
                    :error="!!errors.location"
                    :error-message="errors.location?.[0]"
                    hide-bottom-space
                  />
                </td>
              </tr>

              <!-- Invitados Internos con Contador -->
              <tr>
                <td class="text-bold">
                  <div class="row items-center justify-between no-wrap">
                    <span>Invitados Internos</span>
                    <q-badge
                      v-if="form.internal_guests?.length > 0"
                      color="blue-2"
                      text-color="blue-9"
                      class="text-bold q-ml-xs"
                    >
                      {{ form.internal_guests.length }}
                    </q-badge>
                  </div>
                </td>
                <td>
                  <q-select
                    v-model="form.internal_guests"
                    multiple
                    use-chips
                    outlined
                    dense
                    options-dense
                    :options="userOptions"
                    option-label="label"
                    option-value="value"
                    emit-value
                    map-options
                    placeholder="Seleccione los usuarios internos..."
                    class="guests-dropdown"
                    :error="!!errors.internal_guests"
                    :error-message="errors.internal_guests?.[0]"
                    hide-bottom-space
                  >
                    <template v-slot:selected-item="scope">
                      <q-chip
                        removable
                        dense
                        @remove="scope.removeAtIndex(scope.index)"
                        :tabindex="scope.tabindex"
                        color="blue-2"
                        text-color="blue-9"
                        class="q-ma-none q-mr-xs text-weight-medium"
                      >
                        {{ scope.opt.label }}
                      </q-chip>
                    </template>
                  </q-select>
                </td>
              </tr>

              <!-- Invitados Externos con Contador -->
              <tr>
                <td class="text-bold">
                  <div class="row items-center justify-between no-wrap">
                    <span>Invitados Externos</span>
                    <q-badge
                      v-if="form.external_guests?.length > 0"
                      color="orange-2"
                      text-color="orange-9"
                      class="text-bold q-ml-xs"
                    >
                      {{ form.external_guests.length }}
                    </q-badge>
                  </div>
                </td>
                <td>
                  <q-select
                    v-model="form.external_guests"
                    multiple
                    use-chips
                    outlined
                    dense
                    options-dense
                    :options="contactOptions"
                    option-label="label"
                    option-value="value"
                    emit-value
                    map-options
                    :placeholder="
                      contactOptions.length === 0
                        ? 'No se encontraron contactos externos...'
                        : 'Seleccione los contactos externos...'
                    "
                    class="guests-dropdown"
                    :error="!!errors.external_guests"
                    :error-message="errors.external_guests?.[0]"
                    hide-bottom-space
                  >
                    <template v-slot:selected-item="scope">
                      <q-chip
                        removable
                        dense
                        @remove="scope.removeAtIndex(scope.index)"
                        :tabindex="scope.tabindex"
                        color="orange-2"
                        text-color="orange-9"
                        class="q-ma-none q-mr-xs text-weight-medium"
                      >
                        {{ scope.opt.label }}
                      </q-chip>
                    </template>
                  </q-select>
                </td>
              </tr>

              <!-- Descripción -->
              <tr>
                <td class="text-bold">Descripción</td>
                <td>
                  <q-input
                    v-model="form.description"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    placeholder="Notas o requerimientos de la capacitación..."
                    hide-bottom-space
                  />
                </td>
              </tr>

              <!-- Notificaciones -->
              <tr>
                <td class="text-bold">Notificaciones</td>
                <td class="flex items-center">
                  <q-checkbox
                    v-model="form.send_emails"
                    label="Enviar invitación automática por correo electrónico al guardar"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <div class="flex justify-end q-mt-md q-gutter-x-sm">
            <q-btn
              flat
              label="Cancelar"
              v-close-popup
            />
            <q-btn
              unelevated
              icon="save"
              label="Confirmar y Guardar"
              color="primary"
              type="submit"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.donation-form-table {
  tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
  tbody td:first-child {
    width: 180px;
    background-color: #f8f9fa;
    vertical-align: middle;
  }
}

.guests-dropdown {
  .q-field__control {
    max-height: 120px;
    overflow-y: auto !important;
  }
  .q-field__native {
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }
}
</style>
