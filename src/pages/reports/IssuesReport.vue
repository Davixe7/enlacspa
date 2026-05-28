<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted, computed, watch } from 'vue'
import EnlacDate from 'src/components/EnlacDate.vue'
import BeneficiarySelect from 'src/components/BeneficiarySelect.vue'
import notify from 'src/utils/notify'
import { exportXlsFile } from 'src/utils/exportXls'

const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const candidateId = ref(null)

const loading = ref(false)
const rows = ref([])

// Estados para el Modal
const showAttachmentsModal = ref(false)
const selectedAttachments = ref([])

const subjectsMap = computed(() => new Map(subjects.value.map((s) => [s.id, s.label])))

const columns = ref([
  {
    name: 'candidate.full_name',
    label: 'Beneficiario',
    field: (row) => row.candidate.full_name,
    align: 'left',
    sortable: true
  },
  {
    name: 'category',
    label: 'Área',
    field: (row) => row.plan_category.label,
    align: 'left',
    sortable: true
  },
  { name: 'date', label: 'Fecha', field: 'date', align: 'left', sortable: true },
  { name: 'user', label: 'Reportó', field: (row) => row.user.name, align: 'left', sortable: true },
  {
    name: 'type',
    label: 'Tipo',
    field: (row) => subjectsMap.value.get(row.type) || 'Desconocido',
    align: 'left',
    sortable: true
  },
  { name: 'comments', label: 'Comentarios', field: 'comments', align: 'left', sortable: true },
  {
    name: 'attachments',
    label: 'Adjuntos',
    field: (row) => row.attachments || [],
    align: 'center',
    sortable: true
  }
])

const subjects = ref([
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
])

// Lógica para detectar si es imagen basándonos en el campo mime_type
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
  if (startDate.value > endDate.value) {
    notify.warning('La fecha inicial no puede ser mayor a la final')
    return
  }
  try {
    loading.value = true
    const params = { start_date: startDate.value, end_date: endDate.value }
    if (candidateId.value) params.candidate_id = candidateId.value
    const response = await api.get('issues/', { params })
    rows.value = response.data.data
  } catch (error) {
    console.error('Error:', error)
    notify.negative('No se pudieron cargar las incidencias')
  } finally {
    loading.value = false
  }
}

watch([startDate, endDate, candidateId], () => fetchIssues())
onMounted(() => fetchIssues())

async function exportXls() {
  loading.value = true
  try {
    const params = { start_date: startDate.value, end_date: endDate.value }
    if (candidateId.value) params.candidate_id = candidateId.value
    await exportXlsFile('issues/export', params, `reporte_incidencias_${startDate.value}.xlsx`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page class="q-pa-md">
    <h1 class="page-title">Incidencias</h1>

    <div class="row q-mb-md justify-between items-end">
      <div class="col-4 col-md-8 flex items-end">
        <BeneficiarySelect
          v-model="candidateId"
          class="q-mr-md"
        />
        <enlac-date
          v-model="startDate"
          class="q-mr-md"
        />
        <enlac-date v-model="endDate" />
      </div>
      <q-btn
        outline
        color="primary"
        icon="file_download"
        label="Exportar"
        @click="exportXls"
      />
    </div>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 10 }"
      row-key="id"
    >
      <template v-slot:body-cell-attachments="props">
        <q-td
          :props="props"
          class="cursor-pointer"
          @click="openAttachments(props.value)"
        >
          <q-badge
            v-if="props.value.length > 0"
            color="secondary"
          >
            <q-icon
              name="attach_file"
              size="xs"
              class="q-mr-xs"
            />
            {{ props.value.length }}
          </q-badge>
          <span
            v-else
            class="text-grey-5"
            >N/A</span
          >
        </q-td>
      </template>
    </q-table>

    <!-- Modal de Adjuntos -->
    <q-dialog v-model="showAttachmentsModal">
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
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
          <div class="row q-col-gutter-sm">
            <div
              v-for="file in selectedAttachments"
              :key="file.id"
              class="col-12"
            >
              <!-- Previsualización de Imagen -->
              <q-card
                v-if="isImage(file)"
                bordered
                flat
              >
                <q-img
                  :src="file.original_url"
                  :ratio="16 / 9"
                  spinner-color="primary"
                />
                <q-card-actions align="center">
                  <q-btn
                    flat
                    label="Ver original"
                    color="primary"
                    type="a"
                    :href="file.original_url"
                    target="_blank"
                  />
                </q-card-actions>
              </q-card>

              <!-- Enlace para archivos no imagen -->
              <q-item
                v-else
                clickable
                tag="a"
                :href="file.original_url"
                target="_blank"
                bordered
                class="rounded-borders"
              >
                <q-item-section avatar>
                  <q-icon
                    name="description"
                    color="grey-8"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ file.file_name }}</q-item-label>
                  <q-item-label caption>{{ (file.size / 1024).toFixed(2) }} KB</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
