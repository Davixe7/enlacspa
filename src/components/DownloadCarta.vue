<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const loading = ref(false)
const errors = ref({})
const props = defineProps(['candidateId'])
const carta = ref({
  contact_id: null,
  periodo: ''
})
const showDownloadDialog = ref(false)
const contacts = ref([])

const downloadCarta = async () => {
  errors.value = {}
  if (!carta.value.contact_id) {
    errors.value['contact'] = 'Debe seleccionar un destinatario'
  }
  if (!carta.value.periodo) {
    errors.value['periodo'] = 'Especifique un periodo'
  }

  if (Object.values(errors.value).length) {
    return
  }

  loading.value = true
  let params = {
    ...carta.value
  }
  try {
    const response = await api.post(`/beneficiaries/${props.candidateId}/carta`, params, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Carta_Beca_ENLAC.pdf')
    document.body.appendChild(link)
    link.click()
    // Limpieza
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al descargar el PDF:', error)
  } finally {
    loading.value = false
  }
}
onMounted(async () => {
  contacts.value = (await api.get(`contacts/?candidate_id=${props.candidateId}`)).data.data
  contacts.value.unshift({ id: null, full_name: 'Seleccione un contacto / destinatario' })
})
</script>

<template>
  <q-btn
    outline
    label="Descargar Carta"
    icon="download"
    @click="showDownloadDialog = true"
  />

  <q-dialog v-model="showDownloadDialog">
    <q-card style="width: 420px">
      <q-card-section>
        <div class="flex items-center justify-between q-py-sm">
          <div class="page-subtitle q-mb-md">Descargar Carta</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="q-ml-auto"
            @click="showDownloadDialog = false"
          />
        </div>
        <q-form>
          <q-select
            v-model="carta.contact_id"
            hide-bottom-space
            :options="contacts"
            option-label="full_name"
            option-value="id"
            emit-value
            map-options
            outlined
            stack-label
            label="Contacto"
            class="q-mb-md"
            :error="!!errors['contact']"
            :error-message="errors['contact']"
          />
          <q-input
            stack-label
            outlined
            hide-bottom-space
            v-model="carta.periodo"
            label="Periodo"
            :error="!!errors['periodo']"
            :error-message="errors['periodo']"
          />
        </q-form>
      </q-card-section>
      <div class="flex justify-end q-pa-md">
        <q-btn
          @click="downloadCarta"
          color="primary"
          label="Descargar"
          :loading="loading"
        />
      </div>
    </q-card>
  </q-dialog>
</template>
