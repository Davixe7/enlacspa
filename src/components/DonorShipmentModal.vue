<script setup>
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'

const emit = defineEmits(['saved'])
const isOpen = ref(false)
const loading = ref(false)
const methods = ['Correo electrónico', 'WhatsApp', 'Visita personal']
const form = ref({})

function open(id, rowData = null) {
  form.value = rowData
    ? { ...rowData }
    : {
        donor_id: id,
        date: new Date().toISOString().slice(0, 10),
        material_description: '',
        delivery_method: 'WhatsApp'
      }
  isOpen.value = true
}

async function save() {
  try {
    loading.value = true
    if (form.value.id) await api.put(`/donor-shipments/${form.value.id}`, form.value)
    else await api.post('/donor-shipments', form.value)
    notify.positive('Envío guardado correctamente')
    emit('saved')
    isOpen.value = false
  } catch (e) {
    notify.negative('Error al guardar ' + e)
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
        <div class="text-h6">Nuevo Envío</div>
        <q-space /><q-btn
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
                <td>Fecha de envío *</td>
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
                <td>Descripción del material *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.material_description"
                  />
                </td>
              </tr>
              <tr>
                <td>Método de envío *</td>
                <td>
                  <q-select
                    outlined
                    dense
                    v-model="form.delivery_method"
                    :options="methods"
                    emit-value
                    map-options
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
.system-form-table {
  td:first-child {
    width: 220px;
    font-weight: bold;
    color: #374151;
  }
}
</style>
