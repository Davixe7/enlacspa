<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'

const searchQuery = ref('')
const loading = ref(false)
const commentDialog = ref(false)
const selectedRow = ref(null)
const commentText = ref('')

function openCommentDialog(row) {
  selectedRow.value = row
  commentText.value = row.comments || ''
  commentDialog.value = true
}

async function saveComment() {
  if (!selectedRow.value) return
  try {
    ;(
      await api.post(`rides/${selectedRow.value.id}`, {
        ...selectedRow.value,
        _method: 'PUT'
      })
    ).data.data

    notify.positive('Comentario guardado exitosamente')
    commentDialog.value = false
  } catch (error) {
    console.error(error)
    notify.negative('No se pudo guardar el comentario')
  }
}

onMounted(async () => {
  await fetchRides()
})

const rows = ref([])
const columns = ref([
  {
    name: 'candidate.name',
    label: 'Beneficiario',
    field: (row) => row.candidate.full_name,
    align: 'left'
  },
  { name: 'schedule', label: 'Horario', field: 'schedule', align: 'left' },
  { name: 'departure_time', label: 'Ida', field: 'departure_time', align: 'left' },
  { name: 'return_time', label: 'Regreso', field: 'return_time', align: 'left' },
  { name: 'comment' }
])

async function fetchRides() {
  try {
    loading.value = true
    rows.value = (await api.get('rides/?type=equine')).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function saveRide(row) {
  try {
    loading.value = true

    let route = row.id ? `rides/${row.id}` : `rides`
    let data = row.id ? { ...row, _method: 'PUT' } : { ...row }

    let response = (await api.post(route, data)).data.data
    Object.assign(row, response)

    notify.positive('Información guardada exitosamente')
  } catch (error) {
    console.error(error)
    notify.negative('No se pudo guardar la información')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex">
    <div class="column">
      <h1 class="page-title">Traslados a Equinoterapia</h1>
      <h2 class="subtitle">Captura Ida o Regreso según corresponda:</h2>
    </div>
    <div class="q-ml-auto flex">
      <q-input
        outlined
        v-model="searchQuery"
        debounce="500"
        clearable
      >
        <template v-slot:prepend> <q-icon name="search" /></template>
      </q-input>
    </div>
  </div>
  <q-table
    bordered
    flat
    hide-bottom
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    :loading="loading"
    :filter="searchQuery"
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

    <template v-slot:body-cell-departure_time="props">
      <q-td>
        <q-input
          filled
          v-model="props.row.departure_time"
          readonly
          :disable="!!props.row.departure_time"
        >
          <template v-slot:append>
            <q-icon
              name="access_time"
              class="cursor-pointer"
            >
              <q-popup-proxy
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time
                  v-model="props.row.departure_time"
                  @update:model-value="(val) => saveRide(props.row)"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-td>
    </template>

    <template v-slot:body-cell-return_time="props">
      <q-td>
        <q-input
          filled
          v-model="props.row.return_time"
          readonly
          :disable="!!props.row.return_time"
        >
          <template v-slot:append>
            <q-icon
              name="access_time"
              class="cursor-pointer"
            >
              <q-popup-proxy
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time
                  v-model="props.row.return_time"
                  @update:model-value="(val) => saveRide(props.row)"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-td>
    </template>

    <template v-slot:body-cell-comment="props">
      <q-td>
        <q-btn
          color="primary"
          @click="openCommentDialog(props.row)"
          label="Comentario"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="commentDialog">
    <q-card class="comment-card">
      <q-card-section>
        <div class="page-subtitle q-mb-md">Observaciones del traslado</div>
        <q-input
          outlined
          v-model="selectedRow.comments"
          label="Comentario"
          type="textarea"
          autogrow
          class="q-mb-md comment-textarea"
        />
        <div class="flex justify-end">
          <q-btn
            flat
            label="Cancelar"
            v-close-popup
          />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveComment"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style>
.comment-card {
  width: 600px;
  max-width: 90%;
}
.comment-textarea .q-field__native {
  min-height: 120px;
  line-height: 1.5rem;
}
.page-title {
  font-size: 2rem;
  margin-bottom: 0;
}
.subtitle {
  display: block;
  font-size: 1.2rem;
  font-weight: 500;
  color: #111827;
}
</style>
