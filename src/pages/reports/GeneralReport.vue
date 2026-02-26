<script setup>
import { api } from 'src/boot/axios';
import EnlacDate from 'src/components/EnlacDate.vue'
import { onMounted, ref, watch } from 'vue';
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const loading = ref(false)
const data = ref(null)

async function fetchData() {
  try {
    loading.value = true
    let params = { start_date: startDate.value, end_date: endDate.value }
    data.value = (await api.get('reports/general', { params })).data.data
  } catch (error) {
    console.log(error);
  }
  finally {
    loading.value = false
  }
}

onMounted(() => fetchData())
watch(startDate, () => fetchData())
watch(endDate, () => fetchData())

async function exportXls() {
  try {
    loading.value = true
    let downloadurl = `reports/general/export`
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
    let filename = 'reporte_operativo_' + startDate.value + '_' + endDate.value + '.xlsx'

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
    <h1 class="page-title">Tablero de indicadores operativos</h1>
    <div class="row q-mb-md">
      <div class="col-md-4 flex">
        <enlac-date v-model="startDate" class="q-mr-md" />
        <enlac-date v-model="endDate" class="q-mr-md" />
      </div>
      <div class="q-gutter-x-md q-ml-auto flex">
        <q-btn outline color="primary" icon="file_download" label="Exportar Excel" @click="exportXls" />
      </div>
    </div>

    <q-markup-table v-if="data">
      <thead>
        <th>Tipo</th>
        <th>Indicador</th>
        <th>Descripción</th>
        <th>Dato</th>
        <th>Cálculo</th>
      </thead>
      <tbody>
        <tr>
          <td>Candidatos</td>
          <td>Candidatos Evaluados</td>
          <td>Total de candidatos que tuvieron evaluacion Fisica</td>
          <td>{{ data['candidates']['evaluations'] }}</td>
          <td>(sumar numero de evaluaciones realizadas)</td>
        </tr>
        <tr>
          <td></td>
          <td>Candidatos Aceptados</td>
          <td>Total de candidatos que fueron aceptados por ENLAC</td>
          <td>{{ data['candidates']['accepted'] }}</td>
          <td>(sumar numero de candidatos aceptados despues de la evaluacion)</td>
        </tr>
        <tr>
          <td></td>
          <td>Candidatos No Aceptados</td>
          <td>Total de candidatos no fueron aceptados por ENLAC</td>
          <td>{{ data['candidates']['rejected'] }}</td>
          <td>(sumar numero de candidatos rechazados despues de la evaluacion)</td>
        </tr>

        <tr>
          <td>Beneficiarios</td>
          <td>Beneficiarios activos</td>
          <td>Total de beneficiarios que tienen status Activo en el periodo de consulta</td>
          <td>{{ data['beneficiaries']['active'] }}</td>
          <td>(sumar numero de evaluaciones realizadas)</td>
        </tr>
        <tr>
          <td></td>
          <td>Candidatos Atendidos</td>
          <td>Total de beneficiarios han sido atendidos por ENLAC</td>
          <td>{{ data['beneficiaries']['programed'] }}</td>
          <td>(sumar numero de candidatos aceptados despues de la evaluacion)</td>
        </tr>
        <tr>
          <td></td>
          <td>% Asistencia diaria</td>
          <td>Promedio del % de asistencia diara que tienen los beneficiarios</td>
          <td>{{ data['beneficiaries']['attendance'] }}</td>
          <td>(sumar numero de candidatos rechazados despues de la evaluacion)</td>
        </tr>

        <tr>
          <td>Procuración de fondos</td>
          <td>Padrinos ENLAC</td>
          <td>Total de padrinos que tiene ENLAC</td>
          <td>{{ data['sponsors']['total'] }}</td>
          <td>(sumar numero de evaluaciones realizadas)</td>
        </tr>
        <tr>
          <td></td>
          <td>Beneficiarios con padrino</td>
          <td>Total de beneficiarios que tienen padrino</td>
          <td>{{ data['sponsors']['beneficiaries'] }}</td>
          <td>(sumar numero de candidatos aceptados despues de la evaluacion)</td>
        </tr>

        <tr>
          <td>Tesorería</td>
          <td>Aportaciones de padres de familia</td>
          <td>Monto total de aportaciones realizadas por padres de familia</td>
          <td>{{ data['payments']['parent'] }}</td>
          <td>(sumar numero de candidatos rechazados despues de la evaluacion)</td>
        </tr>
        <tr>
          <td></td>
          <td>Aportaciones de padrinos</td>
          <td>Monto total de aportaciones realizadas por padrinos</td>
          <td>{{ data['payments']['sponsor'] }}</td>
          <td>(sumar numero de candidatos rechazados despues de la evaluacion)</td>
        </tr>

        <tr>
          <td>Traslados</td>
          <td>Traslados de Cuauthemoc-Rubio</td>
          <td>Numero de viajes que se han realizado Cuauthemoc-Rubio (ida y regreso)</td>
          <td>{{ data['rides']['rubio'] }}</td>
          <td>(sumar numero de candidatos rechazados despues de la evaluacion)</td>
        </tr>
        <tr>
          <td></td>
          <td>Traslados Equinoterapia</td>
          <td>Numero de viajes que se han realizado a equinoterapia (ida y regreso)</td>
          <td>{{ data['rides']['rubio'] }}</td>
          <td>(sumar numero de candidatos rechazados despues de la evaluacion)</td>
        </tr>
      </tbody>
    </q-markup-table>
  </q-page>
</template>
