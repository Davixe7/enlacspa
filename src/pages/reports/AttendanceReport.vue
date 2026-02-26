<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref, watch } from 'vue';
import EnlacDate from 'src/components/EnlacDate.vue'
import BeneficiarySelect from 'src/components/BeneficiarySelect.vue'

const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const candidateId = ref(null)

const loading = ref(false)
const rows = ref([])
const daysCount = ref(0)
const average = ref(0)

async function fetchData() {
  try {
    loading.value = true
    let params = { start_date: startDate.value, end_date: endDate.value }
    if (candidateId.value) params.candidate_id = candidateId.value
    let response = (await api.get('reports/attendances', { params })).data.data
    rows.value = response.rows
    daysCount.value = response.days
    average.value = response.average
  } catch (error) {
    console.log(error);
  }
  finally {
    loading.value = false
  }
}
onMounted(() => fetchData())

watch(candidateId, () => fetchData())
watch(startDate, () => fetchData())
watch(endDate, () => fetchData())

async function exportXls() {
  try {
    loading.value = true
    let downloadurl = `reports/attendances/export`
    let response = await api({
      url: downloadurl,
      method: 'GET',
      responseType: 'blob',
      params: {
        start_date: startDate.value,
        end_date: endDate.value
      }
    })

    const contentDisposition = response.headers['content-disposition']
    let filename = 'reporte_de_asistencias_y_faltas_diarias_' + startDate.value + '_' + endDate.value + '.xlsx'

    if (contentDisposition) {
      // Ejemplo: attachment; filename="usuarios.xlsx"
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1]
      }
    }

    // 3. Crear el Blob a partir de los datos de la respuesta
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] // Usar el tipo MIME correcto
    })

    // 4. Iniciar la descarga usando el API del navegador
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', filename) // 👈 Aplicar el nombre del archivo
    document.body.appendChild(link)
    link.click() // 👈 Forzar el click para iniciar la descarga

    // 5. Limpieza
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url) // Liberar memoria del Blob

    console.log(`Descarga de ${filename} iniciada.`)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page>
    <h1 class="page-title">Reporte de Asistencias y Faltas Diarias</h1>
    <div class="row q-mb-md justify-between items-end">
      <div class="flex items-end">
        <BeneficiarySelect v-model="candidateId" class="q-mr-md" />
        <enlac-date v-model="startDate" class="q-mr-md" />
        <enlac-date v-model="endDate" />
      </div>

      <div>
        <q-btn outline color="primary" icon="file_download" label="Exportar Excel" @click="exportXls" />
      </div>
    </div>
    <q-markup-table>
      <thead>
        <tr>
          <th class="text-left">Nombre del beneficiario</th>
          <th class="text-left">Total de días laborados</th>
          <th class="text-left">Asistencias diarias</th>
          <th class="text-left">Faltas justificadas diarias</th>
          <th class="text-left">Faltas injustificadas diarias</th>
          <th class="text-left">% Asistencia</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.candidate_id">
          <td>{{ row.full_name }}</td>
          <td>{{ daysCount }}</td>
          <td>{{ row.present }}</td>
          <td>{{ row.justified }}</td>
          <td>{{ row.unjustified }}</td>
          <td>{{ row.percentage }} %</td>
        </tr>
        <tr>
          <td colspan="5"></td>
          <td>{{ average }} %</td>
        </tr>
      </tbody>
    </q-markup-table>
  </q-page>
</template>
