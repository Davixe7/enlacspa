<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const props = defineProps(['candidateId'])

onMounted(async () => {
  loading.value = true
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  media.value = (await api.get(`candidates/${props.candidateId}/kardexes`)).data.data
  rows.value = (await api.get('kardexes')).data.data

  Object.keys(rows.value).forEach((category) => {
    rows.value[category].forEach((item) => (kardex.value[item.slug] = { file: null, detail: null }))
  })
  loading.value = false
})

const loading = ref(false)
const kardex = ref({})
const media = ref({})
const candidate = ref({})
const rows = ref([])
const columns = ref([
  { name: 'check', align: 'left' },
  { name: 'name', field: 'name', align: 'left' },
  { name: 'download', align: 'right' },
  { name: 'upload', align: 'right' }
])

const categoryLabels = {
  default: 'Documentos a Solicitar',
  tutor: 'Documentos a Descargar y Firmar por Responsable del Beneficiario y Tutor Legal',
  doctor: 'Documentos a Descargar y Firmar por Médico',
  external: 'Documentos a Descargar y Firmar por Externos'
}

async function uploadFile(collectionName) {
  try {
    loading.value = true
    let data = new FormData()
    data.append('collection_name', collectionName)
    data.append('upload', kardex.value[collectionName].file)
    data.append('detail', kardex.value[collectionName].detail)
    let response = (await api.post(`candidates/${props.candidateId}/kardexes`, data)).data.data
    media.value[response.collection_name] = response
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function deleteFile(collectionName) {
  if (!window.confirm('Seguro que desea eliminar el documento adjunto?')) return
  try {
    loading.value = true
    await api.post(`candidates/${props.candidateId}/kardexes`, {
      collection_name: collectionName,
      _method: 'DELETE'
    })
    delete media.value['kardex_' + collectionName]
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
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
      :pagination="{ rowsPerPage: 0 }"
    >
      <template v-slot:body-cell-check="props">
        <q-td style="width: 60px; max-width: 60px">
          <q-checkbox
            :model-value="!!media['kardex_' + props.row.slug]"
            :true-value="true"
            :false-value="false"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-name="props">
        <q-td :class="{ 'kardex--required': props.row.required }">
          <label for="">{{ props.row.name }}</label>
        </q-td>
      </template>

      <template v-slot:body-cell-download="props">
        <q-td class="text-right">
          <a
            v-if="props.row.template"
            :href="props.row.template"
            target="_blank"
          >
            descargar
          </a>
        </q-td>
      </template>

      <template v-slot:body-cell-upload="props">
        <q-td style="width: 320px">
          <div
            class="flex items-center justify-end q-ml-auto"
            v-if="!media['kardex_' + props.row.slug]"
          >
            <div v-if="kardex[props.row.slug]">
              <q-file
                style="width: 240px"
                clearable
                dense
                outlined
                placeholder="Adjuntar archivo"
                v-model="kardex[props.row.slug].file"
                class="q-mr-sm"
              >
                <template v-slot:prepend>
                  <q-icon name="sym_o_attach_file" />
                </template>
              </q-file>

              <q-input
                v-if="props.row.has_detail"
                dense
                outlined
                v-model="kardex[props.row.slug].detail"
                class="q-mr-sm"
              >
                <template v-slot:prepend>
                  <q-icon name="sym_o_edit" />
                </template>
              </q-input>
            </div>

            <q-btn
              style="flex: 0 0"
              :disable="!kardex[props.row.slug]"
              @click="uploadFile(props.row.slug)"
              color="primary"
              round
              dense
              icon="sym_o_upload"
              :loading="loading"
            />
          </div>
          <div v-else>
            <div style="display: flex; flex-flow: column">
              <div class="flex">
                <q-btn
                  style="width: 240px"
                  color="primary"
                  icon="sym_o_download"
                  target="_blank"
                  class="q-mr-sm"
                  :href="media['kardex_' + props.row.slug].original_url"
                  >{{ media['kardex_' + props.row.slug].file_name }}</q-btn
                >
                <q-btn
                  @click="deleteFile(props.row.slug)"
                  color="negative"
                  round
                  dense
                  icon="sym_o_delete"
                ></q-btn>
              </div>
              <q-input
                readonly
                outlined
                v-if="props.row.has_detail"
                :model-value="media['kardex_' + props.row.slug].detail"
              ></q-input>
            </div>
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
.kardex--required label::after {
  content: ' *';
  color: red;
}
</style>
