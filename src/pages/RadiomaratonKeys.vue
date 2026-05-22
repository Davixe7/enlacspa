<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import notify from 'src/utils/notify'

const loading = ref(false)
const errors = ref({})
const row = ref(null)
const rows = ref([])
const columns = ref([
  { align: 'left', name: 'code', label: 'Clave', field: 'code' },
  { align: 'left', name: 'classification', label: 'Categoría', field: 'classification' },
  { align: 'left', name: 'concept', label: 'Concepto', field: 'concept' },
  {
    align: 'right',
    name: 'status',
    label: 'Estatus',
    field: (row) => (row.is_active ? 'Activo' : 'Inactivo')
  },
  { align: 'right', name: 'actions', label: 'Acciones' }
])

const dialog = ref(false)

function editKey(newRow) {
  row.value = { ...newRow, is_active: newRow.is_active ? 1 : 0 }
  errors.value = {}
  dialog.value = true
}

function addKey() {
  row.value = {
    code: '',
    classification: '',
    concept: '',
    is_active: 1
  }
  errors.value = {}
  dialog.value = true
}

async function saveKey() {
  try {
    loading.value = true
    errors.value = {}

    let route = row.value.id ? `/radiomarathon-keys/${row.value.id}` : '/radiomarathon-keys'
    let data = row.value.id ? { ...row.value, _method: 'PUT' } : { ...row.value }

    const response = await api.post(route, data)
    const savedData = response.data.data || response.data

    if (row.value.id) {
      const index = rows.value.findIndex((item) => item.id === row.value.id)
      if (index !== -1) rows.value[index] = savedData
    } else {
      rows.value.unshift(savedData)
    }

    rows.value.sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
    )
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
      notify.negative('No se pudo actualizar')
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const response = await api.get('/radiomarathon-keys')
  rows.value = response.data.data || response.data
})
</script>

<template>
  <div class="flex items-center q-mb-lg">
    <h1 class="page-title q-mb-none">Catálogo de Claves Radiomaratón</h1>
    <q-btn
      class="q-ml-auto"
      icon="sym_o_add"
      @click="addKey"
      color="primary"
      label="Agregar clave"
    />
  </div>

  <q-table
    :columns="columns"
    :rows="rows"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body-cell-actions="props">
      <q-td class="flex justify-end">
        <q-btn
          icon="sym_o_edit"
          round
          flat
          @click="editKey(props.row)"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog">
    <q-card style="width: 480px">
      <q-card-section class="flex items-center q-pb-none">
        <div class="page-subtitle">{{ `${row.id ? 'Actualizar' : 'Nueva'}` }} clave</div>
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
        <q-form class="q-gutter-y-md">
          <q-markup-table
            flat
            class="key-form"
          >
            <tbody>
              <tr>
                <td>Código / Clave</td>
                <td>
                  <q-input
                    outlined
                    v-model="row.code"
                    placeholder="Ej: 1.1"
                    hide-bottom-space
                    :error="!!errors['code']"
                    :error-message="errors['code']"
                  />
                </td>
              </tr>
              <tr>
                <td>Clasificación / Categoría</td>
                <td>
                  <q-input
                    outlined
                    v-model="row.classification"
                    placeholder="Ej: Día Evento"
                    hide-bottom-space
                    :error="!!errors['classification']"
                    :error-message="errors['classification']"
                  />
                </td>
              </tr>
              <tr>
                <td>Concepto</td>
                <td>
                  <q-input
                    outlined
                    v-model="row.concept"
                    type="textarea"
                    rows="2"
                    placeholder="Descripción del concepto"
                    hide-bottom-space
                    :error="!!errors['concept']"
                    :error-message="errors['concept']"
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

          <div class="flex justify-end">
            <q-btn
              :loading="loading"
              @click="saveKey"
              :label="`${row.id ? 'Actualizar' : 'Agregar'} clave`"
              color="primary"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.key-form {
  td:first-child {
    padding-left: 0;
    width: 150px;
    font-weight: bold;
  }
}
</style>
