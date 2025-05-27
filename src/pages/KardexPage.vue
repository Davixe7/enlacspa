<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

const props = defineProps(['candidateId'])

onMounted(async () => {
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  media.value = (await api.get(`candidates/${props.candidateId}/kardexes`)).data.data
  rows.value = (await api.get('kardexes')).data.data
})

const loading = ref(false)
const kardex = ref({})
const media = ref({})
const candidate = ref({})
const rows = ref([])
const columns = ref([
  { name: 'check', label: '', align: 'left' },
  { name: 'name', label: '', field: 'name', align: 'left' },
  { name: 'download', label: '', align: 'right' },
  { name: 'upload', label: '', align: 'right' },
])

const categoryLabels = {
  'default': 'Documentos a Solicitar',
  'tutor': 'Documentos a Descargar y Firmar por Responsable del Beneficiario y Tutor Legal',
  'doctor': 'Documentos a Descargar y Firmar por Médico',
  'externo': 'Documentos a Descargar y Firmar por Externos',
}

async function uploadFile(collectionName) {
  try {
    loading.value = true
    let data = new FormData()
    data.append('collection_name', collectionName)
    data.append('upload', kardex.value[collectionName])
    let response = (await api.post(`candidates/${props.candidateId}/kardexes`, data)).data.data
    media.value[response.collection_name] = response
  } catch (error) {
    console.log(error);
  }
  loading.value = false
}

async function deleteFile(collectionName) {
  if (!window.confirm('Seguro que desea eliminar el documento adjunto?')) return
  try {
    loading.value = true
    await api.post(`candidates/${props.candidateId}/kardexes`, { collection_name: collectionName, _method: 'DELETE' })
    delete media.value['kardex_' + collectionName]
  } catch (error) {
    console.log(error);
  }
  loading.value = false
}
</script>

<template>
  <h1 class="page-title">Kardex del Beneficiario</h1>
  <template
    v-for="category in Object.keys(rows)"
    :key="category"
  >
    <h2 class="page-subtitle">{{ categoryLabels[category] }}</h2>

    <q-table
      flat
      hide-header
      hide-bottom
      :rows="rows[category]"
      :columns="columns"
    >
      <template v-slot:body-cell-check="props">
        <q-td style="width: 60px; max-width: 60px;">
          <q-checkbox
            :model-value="!!media['kardex_' + props.row.slug]"
            :true-value="true"
            :false-value="false"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-download="props">
        <q-td class="text-right">
          <a
            :href="props.row.template"
            target="_blank"
          >
            descargar
          </a>
        </q-td>
      </template>

      <template v-slot:body-cell-upload="props">
        <q-td style="width: 320px;">
          <div
            class="flex items-center justify-end q-ml-auto"
            v-if="!media['kardex_' + props.row.slug]"
          >
            <q-file
              style="width: 240px"
              clearable
              dense
              outlined
              placeholder="Adjuntar archivo"
              v-model="kardex[props.row.slug]"
              class="q-mr-sm"
            >
              <template v-slot:prepend>
                <q-icon name="sym_o_attach_file"></q-icon>
              </template>
            </q-file>
            <q-btn
              :disable="!kardex[props.row.slug]"
              @click="uploadFile(props.row.slug)"
              color="primary"
              round
              dense
              icon="sym_o_upload"
              :loading="loading"
            ></q-btn>
          </div>
          <div v-else>
            <q-btn
              style="width: 240px"
              color="primary"
              icon="sym_o_download"
              target="_blank"
              class="q-mr-sm"
              :href="media['kardex_' + props.row.slug].original_url"
            >{{ media['kardex_' + props.row.slug].file_name }}</q-btn>
            <q-btn
              @click="deleteFile(props.row.slug)"
              color="negative"
              round
              dense
              icon="sym_o_delete"
            ></q-btn>
          </div>
        </q-td>
      </template>
    </q-table>
  </template>
</template>

<style>
td:first-child {
  max-width: 150px;
}

.page-subtitle {
  color: #202020;
  font-size: 24px;
  font-weight: 500;
  margin: 2rem 0 1rem 0;
}
</style>
