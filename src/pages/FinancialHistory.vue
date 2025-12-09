<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
const props = defineProps(['candidateId'])
const loading = ref(true)
const rows = ref([])
const columns = ref([
  { align: 'left', name: 'date', label: 'Fecha', field: 'date' },
  {
    align: 'left',
    name: 'user',
    label: 'Registrado por',
    field: (row) => `${row.user.name} ${row.user.last_name}`
  },
  { align: 'left', name: 'payment_type', label: 'Concepto', field: 'payment_type' },
  { align: 'left', name: 'amount', label: 'Monto', field: 'amount' },
  { align: 'left', name: 'scope', label: 'Cobertura', field: 'scope' },
  { align: 'left', name: 'ref', label: 'Referencia', field: 'ref' },
  { align: 'left', name: 'comments', label: 'Comentarios', field: 'comments' },
  { align: 'right', name: 'payment_method', label: 'Metodo de pago', field: 'payment_method' }
])
onMounted(async () => {
  rows.value = (await api.get(`/payments/?candidate_id=${props.candidateId}`)).data.data
})

async function exportXls() {
  try {
    loading.value = true
    let downloadurl = `payments/${props.candidateId}/export`
    let response = await api({
      url: downloadurl,
      method: 'GET',
      responseType: 'blob'
    })

    const contentDisposition = response.headers['content-disposition']
    let filename = 'reporte_descargado.xlsx' // Nombre por defecto

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
  <div class="flex q-py-md items-center">
    <h1 class="page-title q-mb-none page-title--no-margin">Tesorería / Historial de Pagos</h1>
    <q-btn
      class="q-mr-md q-ml-auto"
      @click="exportXls"
      label="Exportar a Excel"
      color="green"
      icon="sym_o_file_export"
      unelevated
      outline
    />
    <q-btn
      class=""
      :to="`/tesoreria`"
      label="Regresar"
      flat
    />
  </div>
  <q-table
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    hide-bottom
  />
</template>
