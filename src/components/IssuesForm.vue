<script setup>
import { DateTime } from 'luxon'
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import notify from 'src/utils/notify'
import { useCategoryStore } from 'src/stores/category-store'
import { useRoute } from 'vue-router'

const route = useRoute()
const category = ref(null)

const subjects = ref([
  {
    id: 1,
    label: 'Alimentación'
  },
  {
    id: 2,
    label: 'Retardo'
  },
  {
    id: 3,
    label: 'Higiene'
  },
  {
    id: 4,
    label: 'Falta a Cita Médica'
  },
  {
    id: 5,
    label: 'Falta a Cita Nutrición'
  },
  {
    id: 6,
    label: 'Falta a Cita Psicología'
  },
  {
    id: 7,
    label: 'Falta a Cita Comunicación'
  },
  {
    id: 8,
    label: 'Falta a Capacitación'
  },
  {
    id: 9,
    label: 'Falta a Reunión de Padres'
  },
  {
    id: 10,
    label: 'Falta Actividades de Recaudación de Fondos'
  },
  {
    id: 11,
    label: 'Indisciplina'
  },
  {
    id: 12,
    label: 'Otro'
  }
])
const date = ref(DateTime.now().toFormat('dd/MM/yyyy'))
const comments = ref('')
const type = ref(null)
const userId = ref(null)
const users = ref([])
const loading = ref(false)

const emit = defineEmits(['close'])

async function fetchUsers() {
  try {
    loading.value = true
    users.value = (await api.get('users')).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const errors = ref([])

async function storeIssue() {
  try {
    loading.value = false
    let data = new FormData()

    data.append('work_area_id', category.value.id)
    data.append('user_id', userId.value)
    data.append('type', type.value)
    data.append('date', DateTime.fromFormat(date.value, 'dd/MM/yyyy').toISODate())
    data.append('comments', comments.value)

    files.value.forEach((file) => {
      data.append('media[]', file)
    })

    await api.post('issues', data)
    notify.positive('Incidencia registrada con exito')
    emit('close')
  } catch (error) {
    if (error.formatted) {
      errors.value = error.formatted
    }
    notify.negative('No se pudo registrar la incidencia')
  } finally {
    loading.value = false
  }
}

const files = ref([])

onMounted(async () => {
  category.value = (await useCategoryStore().getCategoryByName(route.params.categoryName))
  fetchUsers()
})
</script>

<template>
  <q-form>
    <q-markup-table
      flat
      bordered
      square
      separator="cell"
      dense
    >
      <table class="full-width custom-table">
        <tbody>
          <tr>
            <td>Área</td>
            <td class="q-pa-sm">
              <q-input
                v-if="category"
                stack-label
                hide-bottom-space
                outlined
                readonly
                v-model="category.label"
              />
            </td>
          </tr>

          <tr>
            <td>Fecha</td>
            <td class="q-pa-sm">
              <q-input
                outlined
                stack-label
                v-model="date"
                class="q-field--required"
              >
                <template v-slot:append>
                  <q-icon
                    name="event"
                    class="cursor-pointer"
                  >
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="date"
                        mask="DD/MM/YYYY"
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Cerrar"
                            color="primary"
                            flat
                            @click="dialog = false"
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </td>
          </tr>

          <tr>
            <td>Reportó</td>
            <td class="q-pa-sm">
              <q-select
                dense
                stack-label
                outlined
                hide-bottom-space
                v-model="userId"
                :options="users"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                :error="!!errors['user_id']"
                :error-message="errors['user_id']"
              />
            </td>
          </tr>

          <tr>
            <td>Tipo</td>
            <td class="q-pa-sm">
              <q-select
                dense
                stack-label
                outlined
                hide-bottom-space
                v-model="type"
                :options="subjects"
                option-label="label"
                option-value="id"
                emit-value
                map-options
                :error="!!errors['type']"
                :error-message="errors['type']"
              />
            </td>
          </tr>

          <tr>
            <td>Comentarios</td>
            <td class="q-pa-sm">
              <q-input
                type="textarea"
                stack-label
                outlined
                hide-bottom-space
                v-model="comments"
                :error="!!errors['comments']"
                :error-message="errors['comments']"
              />
            </td>
          </tr>
          <tr>
            <td>Adjuntos</td>
            <td>
              <div class="row">
                <q-file
                  ref="filePicker"
                  v-model="files"
                  append
                  multiple
                  use-chips
                  outlined
                  class="full-width"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </q-markup-table>

    <div class="q-pa-md flex justify-end">
      <q-btn
        color="primary"
        label="Guardar"
        :loading="loading"
        @click="storeIssue"
      />
    </div>
  </q-form>
</template>

<style>
th {
  text-align: left;
  font-weight: 400;
}
/* .q-field--outlined .q-field__control:before {
  
} */
</style>
