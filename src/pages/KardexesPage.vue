<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';
import CandidateProfile from 'src/components/CandidateProfile.vue';

const props = defineProps(['candidateId'])
const kardexes = ref([])
const candidateKardexes = ref([])
const uploads = ref({})

function guardar() {
  let formData = new FormData()
  formData.append('candidate_id', props.candidateId);
  Object.keys(uploads.value).forEach((key) => {
    formData.append(`kardexes[${key}]`, uploads.value[key])
  })
  api.post('kardexes', formData)
}

onMounted(async () => {
  candidateKardexes.value = (await api.get(`candidates/${props.candidateId}/kardexes`)).data.data
  kardexes.value = (await api.get('kardexes')).data.data
})
</script>

<template>
  <h1 class="page-title">Kardex del Beneficiario</h1>
  <CandidateProfile
    :candidate-id="candidateId"
    :type="'interview'"
  ></CandidateProfile>
  <q-list>
    <q-item
      v-for="kardex in kardexes"
      :key="kardex.id"
    >
      <q-item-section side>
        <q-checkbox
          readonly
          :disable="true"
          v-model="candidateKardexes"
          :val="'kardex_' + kardex.slug"
        ></q-checkbox>
      </q-item-section>
      <q-item-section>
        {{ kardex.name }}
      </q-item-section>
      <q-item-section
        side
        right
      >
        <q-file
          style="width: 300px; height: 40px;"
          outlined
          v-model="uploads[kardex.slug]"
        >
          <template v-slot:prepend="">
            <q-icon name="sym_o_attach_file"></q-icon>
          </template></q-file>
      </q-item-section>
    </q-item>
  </q-list>

  <div class="flex q-py-lg justify-end">
    <q-btn
      color="primary"
      @click="guardar"
    >Guardar</q-btn>
  </div>
</template>

<style>
.q-field--auto-height .q-field__control {
  min-height: auto !important;
  height: 40px !important;
}

.q-field--auto-height .q-field__control,
.q-field--auto-height .q-field__native {
  min-height: initial !important;
}
</style>
