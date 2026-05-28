<script setup>
import { onMounted, ref, watch } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import notify from 'src/utils/notify'

const $q = useQuasar()
const props = defineProps(['candidateId', 'date'])
const loading = ref(false)
const rows = ref([])

// Estados para el Modal de adjuntos
const showAttachmentsModal = ref(false)
const selectedAttachments = ref([])

function isImage(file) {
  return file.mime_type && file.mime_type.startsWith('image/')
}

function openAttachments(attachments) {
  if (attachments && attachments.length > 0) {
    selectedAttachments.value = attachments
    showAttachmentsModal.value = true
  } else {
    notify.warning('Esta incidencia no tiene archivos adjuntos')
  }
}

async function fetchIssues() {
  loading.value = true
  try {
    let params = { candidate_id: props.candidateId, date: props.date }
    rows.value = (await api.get('issues', { params })).data.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function deleteIssue(row) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Seguro de eliminar la incidencia?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      loading.value = true
      await api.delete(`issues/${row.id}`)
      notify.positive('Incidencia eliminada correctamente')
      fetchIssues()
    } catch (error) {
      notify.negative('No se pudo eliminar ' + error)
    } finally {
      loading.value = false
    }
  })
}

watch(
  () => props.date,
  (newDate, oldDate) => {
    if (newDate !== oldDate) fetchIssues()
  }
)

const subjects = [
  { id: 1, label: 'Alimentación' },
  { id: 2, label: 'Retardo' },
  { id: 3, label: 'Higiene' },
  { id: 4, label: 'Falta a Cita Médica' },
  { id: 5, label: 'Falta a Cita Nutrición' },
  { id: 6, label: 'Falta a Cita Psicología' },
  { id: 7, label: 'Falta a Cita Comunicación' },
  { id: 8, label: 'Falta a Capacitación' },
  { id: 9, label: 'Falta a Reunión de Padres' },
  { id: 10, label: 'Falta Actividades de Recaudación de Fondos' },
  { id: 11, label: 'Indisciplina' },
  { id: 12, label: 'Otro' }
]

const columns = [
  { name: 'category', label: 'Área', field: (row) => row.plan_category?.label, align: 'left' },
  {
    name: 'type',
    label: 'Asunto',
    field: (row) => subjects[row.type - 1]?.label || 'Desconocido',
    align: 'left'
  },
  { name: 'date', label: 'Fecha', field: 'date', align: 'left' },
  { name: 'user', label: 'Reportó', field: (row) => row.user?.name, align: 'left' },
  { name: 'comments', label: 'Comentarios', field: 'comments', align: 'left' },
  { name: 'attachments', label: 'Adjuntos', field: 'attachments', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

onMounted(() => fetchIssues())

defineExpose({ fetchIssues })
</script>

<template>
  <div>
    <h1 class="page-title q-mb-md">Incidencias</h1>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      :loading="loading"
      row-key="id"
      class="q-mb-xl"
    >
      <template v-slot:body-cell-attachments="props">
        <q-td
          :props="props"
          class="text-center"
        >
          <q-btn
            v-if="props.row.attachments?.length > 0"
            flat
            round
            dense
            icon="attach_file"
            color="secondary"
            @click="openAttachments(props.row.attachments)"
          />
          <span
            v-else
            class="text-grey-5"
            >N/A</span
          >
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td
          :props="props"
          class="text-center"
        >
          <q-btn
            icon="delete"
            color="negative"
            flat
            round
            dense
            size="sm"
            @click="deleteIssue(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Modal de Adjuntos -->
    <q-dialog v-model="showAttachmentsModal">
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">Archivos Adjuntos</div>
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
          <div
            v-for="file in selectedAttachments"
            :key="file.id"
            class="q-mb-md"
          >
            <!-- Previsualización si es imagen -->
            <q-img
              v-if="isImage(file)"
              :src="file.original_url"
              class="rounded-borders q-mb-sm"
              style="max-width: 100%"
            />

            <!-- Botón de descarga/enlace -->
            <q-btn
              flat
              color="primary"
              :label="file.file_name"
              type="a"
              :href="file.original_url"
              target="_blank"
              :icon="isImage(file) ? 'image' : 'file_present'"
              class="full-width justify-start"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
