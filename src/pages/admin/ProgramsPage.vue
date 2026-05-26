<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import { money } from 'src/utils/filters'
import EnlacDate from 'src/components/EnlacDate.vue'
import notify from 'src/utils/notify'

const loading = ref(false)
const errors = ref({})
const row = ref(null)
const rows = ref([])
const columns = ref([
  { align: 'left', name: 'order', label: '#', field: 'order' },
  { align: 'left', name: 'name', label: 'Nombre del programa', field: 'name' },
  { align: 'left', name: 'price', label: 'Precio Vigente', field: (row) => money(row.price) },
  {
    align: 'right',
    name: 'status',
    label: 'Estatus',
    field: (row) => (row.is_active ? 'Activo' : 'Inactivo')
  },
  { align: 'right', name: 'actions', label: 'Acciones' }
])

const dialog = ref(false)

function editProgram(newRow) {
  row.value = newRow
  dialog.value = true
}

function addProgram() {
  row.value = {
    name: '',
    price: 0,
    is_active: 1
  }
  dialog.value = true
}

async function saveProgram() {
  try {
    loading.value = true
    let route = row.value.id ? `/programs/${row.value.id}` : 'programs'
    let data = row.value.id ? { ...row.value, _method: 'PUT' } : { ...row.value }
    await api.post(route, data)

    if (!row.value.id) {
      rows.value.unshift(row.value)
    }

    notify.positive('Guardado con éxito')
    dialog.value = false
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo actualizar')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  rows.value = (await api.get(`/admin/programs`)).data.data
})
</script>

<template>
  <div class="flex items-center q-mb-lg">
    <h1 class="page-title q-mb-none">Programas</h1>
    <q-btn
      class="q-ml-auto"
      icon="sym_o_add"
      @click="addProgram"
      color="primary"
      label="Agregar programa"
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
          @click="editProgram(props.row)"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog">
    <q-card style="width: 480px">
      <q-card-section class="flex items-center q-pb-none">
        <div class="page-subtitle">{{ `${row.id ? 'Actualizar' : 'Nuevo'}` }} programa</div>
        <q-btn
          flat
          round
          icon="sym_o_close"
          @click="dialog = false"
          class="q-ml-auto"
        />
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-y-md">
          <q-markup-table
            flat
            class="program-form"
          >
            <tbody>
              <tr>
                <td>Nombre del programa</td>
                <td>
                  <q-input
                    outlined
                    v-model="row.name"
                    hide-bottom-space
                    :error="!!errors['name']"
                    :error-message="errors['name']"
                  />
                </td>
              </tr>
              <tr>
                <td>Precio</td>
                <td>
                  <q-input
                    outlined
                    v-model="row.price"
                    hide-bottom-space
                    :error="!!errors['price']"
                    :error-message="errors['price']"
                    type="number"
                    prefix="$"
                  />
                </td>
              </tr>
              <tr>
                <td>A partir del</td>
                <td>
                  <EnlacDate
                    outlined
                    v-model="row.valid_since"
                    hide-bottom-space
                    :error="!!errors['valid_since']"
                    :error-message="errors['valid_since']"
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
              @click="saveProgram"
              :label="`${row.id ? 'Actualizar' : 'Agregar'} programa`"
              color="primary"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.q-field--labeled .q-field__prefix {
  padding-top: 8px;
}
.program-form {
  td:first-child {
    padding-left: 0;
  }
}
</style>
