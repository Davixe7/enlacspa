<script setup>
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'

const emit = defineEmits(['saved'])
const isOpen = ref(false)
const loading = ref(false)
const donorId = ref(null)

const deliveryOptions = ['Correo electrónico', 'WhatsApp', 'Visita personal']

const form = ref(getCleanForm())

function getCleanForm() {
  return {
    donor_id: null,
    date: new Date().toISOString().slice(0, 10),
    campaign_program: '',
    type: '',
    delivery_method: 'WhatsApp',
    recipient_name: ''
  }
}

function open(id, rowData = null) {
  donorId.value = id

  if (rowData) {
    form.value = {
      ...getCleanForm(),
      ...rowData,
      donor_id: id
    }
  } else {
    form.value = getCleanForm()
    form.value.donor_id = id
  }

  isOpen.value = true
}

async function save() {
  try {
    loading.value = true
    const payload = { ...form.value }
    delete payload.created_at
    delete payload.updated_at

    // LOG DE SEGURIDAD
    console.log('Enviando payload al servidor:', payload)

    let response
    if (payload.id) {
      response = await api.put(`/donor-gratitudes/${payload.id}`, payload)
    } else {
      response = await api.post('/donor-gratitudes', payload)
    }

    console.log('Respuesta del servidor:', response) // VER SI ESTO APARECE
    notify.positive('Agradecimiento guardado correctamente')
    emit('saved')
    isOpen.value = false
  } catch (error) {
    console.error('Error completo capturado:', error.response || error)
    notify.negative('Error al guardar: revisa la consola para el error técnico')
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
    <q-card style="width: 700px; max-width: 95vw">
      <q-card-section class="bg-primary text-white row items-center">
        <div class="text-h6">Bitácora de Agradecimientos</div>
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
                <td>Fecha</td>
                <td>
                  <q-input
                    outlined
                    dense
                    type="date"
                    v-model="form.date"
                  />
                </td>
              </tr>
              <tr>
                <td>Campaña / Programa *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.campaign_program"
                  />
                </td>
              </tr>
              <tr>
                <td>Tipo de Agradecimiento *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.type"
                  />
                </td>
              </tr>
              <tr>
                <td>Método de Envío *</td>
                <td>
                  <q-select
                    outlined
                    dense
                    v-model="form.delivery_method"
                    :options="deliveryOptions"
                    emit-value
                    map-options
                  />
                </td>
              </tr>
              <tr>
                <td>Persona a quien se entrega</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.recipient_name"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Guardar"
            type="submit"
            color="primary"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.system-form-table {
  td:first-child {
    padding-left: 12px;
    width: 220px;
    font-weight: bold;
    color: #374151;
  }
}
</style>
