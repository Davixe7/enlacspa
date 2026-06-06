<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'

const emit = defineEmits(['saved'])
const isOpen = ref(false)
const loading = ref(false)
const users = ref([]) // Lista para el select
const donorId = ref(null)
const errors = ref({})

const form = ref(getCleanForm())

function getCleanForm() {
  return {
    visit_date: new Date().toISOString().slice(0, 10),
    enlac_user_id: null,
    recommended_by: '',
    reason: '',
    schedule_contact_name: '',
    schedule_contact_phone: '',
    received_by: '',
    visitors_names: '',
    material_presented: '',
    result: '',
    comments: '',
    interests_hobbies: ''
  }
}

// Cargar usuarios para el select al montar
onMounted(async () => {
  const { data } = await api.get('/users?type=select')
  users.value = data.data
})

function open(id, rowData = null) {
  errors.value = {} // Limpiar errores al abrir
  donorId.value = id
  if (rowData) {
    const data = { ...rowData }
    if (data.visit_date) {
      data.visit_date = data.visit_date.split('T')[0]
    }
    if (data.responsible && data.responsible.id) {
      data.enlac_user_id = data.responsible.id
    }
    form.value = data
  } else {
    form.value = getCleanForm()
    form.value.donor_id = id
  }
  isOpen.value = true
}

async function save() {
  try {
    loading.value = true
    errors.value = {} // Limpiar errores previos

    const payload = { ...form.value }
    delete payload.responsible
    delete payload.created_at
    delete payload.updated_at

    if (payload.id) {
      await api.put(`/donor-visits/${payload.id}`, payload)
    } else {
      await api.post('/donor-visits', payload)
    }

    notify.positive('Visita guardada correctamente')
    emit('saved')
    isOpen.value = false
  } catch (err) {
    // Usamos 'err' para evitar conflictos
    console.error(err)

    // Verificamos si la respuesta existe y si tiene errores de validación
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors || {}
      notify.negative('Por favor, corrige los campos marcados en rojo')
    } else {
      notify.negative('Error al guardar la visita')
    }
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card style="width: 1000px; max-width: 95vw">
      <q-card-section class="bg-primary text-white row items-center">
        <div class="text-h6">Nueva Visita</div>
        <q-space />
        <q-btn
          flat
          round
          icon="sym_o_close"
          v-close-popup
        />
      </q-card-section>

      <q-form @submit.prevent="save">
        <q-card-section
          class="scroll"
          style="max-height: 65vh"
        >
          <q-markup-table
            flat
            class="system-form-table"
          >
            <tbody>
              <tr>
                <td>Fecha de Visita</td>
                <td>
                  <q-input
                    outlined
                    dense
                    type="date"
                    v-model="form.visit_date"
                  />
                </td>
              </tr>
              <tr>
                <td>Contacto ENLAC responsable de la Visita *</td>
                <td>
                  <q-select
                    outlined
                    dense
                    v-model="form.enlac_user_id"
                    :options="users"
                    emit-value
                    map-options
                    :error="!!errors.enlac_user_id"
                    :error-message="
                      Array.isArray(errors.enlac_user_id)
                        ? errors.enlac_user_id[0]
                        : errors.enlac_user_id
                    "
                  />
                </td>
              </tr>
              <tr>
                <td>Quién recomienda la Visita</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.recommended_by"
                  />
                </td>
              </tr>
              <tr>
                <td>Motivo de la Visita*</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.reason"
                    :error="!!errors.reason"
                    :error-message="Array.isArray(errors.reason) ? errors.reason[0] : errors.reason"
                  />
                </td>
              </tr>
              <tr>
                <td>Nombre del contacto para agendar la Visita</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.schedule_contact_name"
                  />
                </td>
              </tr>
              <tr>
                <td>Celular del Contacto</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.schedule_contact_phone"
                  />
                </td>
              </tr>
              <tr>
                <td>Nombre de la Persona que recibe</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.received_by"
                  />
                </td>
              </tr>
              <tr>
                <td>Personas que realizan la visita</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.visitors_names"
                  />
                </td>
              </tr>
              <tr>
                <td>Material que se les presento</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.material_presented"
                  />
                </td>
              </tr>
              <tr>
                <td>Resultado</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.result"
                  />
                </td>
              </tr>
              <tr>
                <td>Comentarios, Notas y Puntos a dar Seguimiento</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.comments"
                  />
                </td>
              </tr>
              <tr>
                <td>Intereses personales / Hobbies / Circunstancias a considerar</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.interests_hobbies"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-card-actions align="right"
          ><q-btn
            label="Guardar"
            type="submit"
            color="primary"
            :loading="loading"
        /></q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
/* Reutiliza la misma clase que ya tienes definida en tu componente principal */
.system-form-table {
  td:first-child {
    padding-left: 12px;
    width: 220px; /* Ajustado para que el label no se comprima tanto */
    font-weight: bold;
    color: #374151;
  }
}
</style>
