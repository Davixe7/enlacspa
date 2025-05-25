<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

const props = defineProps(['candidateId'])

onMounted(async () => {
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  rows.value = (await api.get('kardexes')).data.data
})

const kardex = ref({})
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
            v-model="props.row.required"
            :true-value="1"
            :false-value="0"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-download>
        <q-td class="text-right">
          <a href="#">descargar</a>
        </q-td>
      </template>

      <template v-slot:body-cell-upload="props">
        <q-td style="width: 240px; max-width: 240px;">
          <q-file
            clearable
            dense
            outlined
            v-model="kardex[props.row.slug]"
          ></q-file>
        </q-td>
      </template>
    </q-table>
  </template>
</template>.value

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
