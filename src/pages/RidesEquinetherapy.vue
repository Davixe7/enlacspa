<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { date } from 'quasar'

const searchQuery = ref('')
const loading = ref(false)
const commentDialog = ref(false)
const selectedRow = ref(null)
const commentText = ref('')

function formatAmPm(time) {
  if (!time) return '-'
  return date.formatDate(`2026-01-01 ${time}`, 'hh:mm A')
}

function formatRange(start, end) {
  if (!start || !end) return '-'
  const s = date.formatDate(`2026-01-01 ${start}`, 'hh:mm A')
  const e = date.formatDate(`2026-01-01 ${end}`, 'hh:mm A')
  return `${s} - ${e}`
}

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
  {
    name: 'schedule',
    label: 'Horario',
    field: (row) => formatRange(row.start_time, row.end_time),
    align: 'center',
    style: 'font-size: 1.6rem !important; font-weight: bold !important;'
  },
  {
    name: 'departure_time',
    label: 'Ida',
    field: 'departure_time',
    align: 'left',
    headerStyle: 'font-weight: bold; color: #2e7d32; font-size: 1.1rem;'
  },
  {
    name: 'return_time',
    label: 'Regreso',
    field: 'return_time',
    align: 'left',
    headerStyle: 'font-weight: bold; color: #c62828; font-size: 1.1rem;'
  },
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
      <div class="subtitle q-mb-lg">Captura Ida o Regreso según corresponda:</div>
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
          color="positive"
          filled
          :model-value="formatAmPm(props.row.departure_time)"
          readonly
          :disable="!!props.row.departure_time"
          class="time-input-large col-ida"
        >
          <template v-slot:append>
            <q-icon
              name="access_time"
              class="cursor-pointer text-green-8"
            />
            <q-popup-proxy>
              <q-time
                v-model="props.row.departure_time"
                with-seconds="false"
                format24h="false"
                @update:model-value="(val) => saveRide(props.row)"
              />
            </q-popup-proxy>
          </template>
        </q-input>
      </q-td>
    </template>

    <template v-slot:body-cell-return_time="props">
      <q-td>
        <q-input
          filled
          color="negative"
          :model-value="formatAmPm(props.row.return_time)"
          readonly
          :disable="!!props.row.return_time"
          class="time-input-large col-regreso"
        >
          <template v-slot:append>
            <q-icon
              name="access_time"
              class="cursor-pointer text-red-8"
            />
            <q-popup-proxy>
              <q-time
                v-model="props.row.return_time"
                with-seconds="false"
                format24h="false"
                @update:model-value="(val) => saveRide(props.row)"
              />
            </q-popup-proxy>
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
/* Tamaño de fuente de la hora y centrado */
.time-input-large .q-field__native {
  font-size: 1.6rem !important;
  font-weight: bold !important;
  text-align: center;
}

/* Color verde para Ida */
.col-ida .q-field__native {
  color: #2e7d32 !important;
}

/* Color rojo para Regreso */
.col-regreso .q-field__native {
  color: #c62828 !important;
}

.comment-card {
  width: 600px;
  max-width: 90%;
}

.comment-textarea .q-field__native {
  min-height: 120px;
  line-height: 1.5rem;
}

.subtitle {
  display: block;
  font-size: 1.2rem;
  font-weight: 500;
  color: #111827;
}

/* Aumentar tamaño de letra en toda la tabla */
.q-table th {
  font-size: 1.1rem !important;
  padding: 20px !important;
}

.q-table td {
  font-size: 1.2rem !important;
  padding: 20px !important;
}

/* Aumentar el tamaño del botón de comentario */
.q-btn {
  font-size: 1rem !important;
  padding: 10px 20px !important;
}
</style>
