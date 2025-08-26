<script setup>
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { ref } from 'vue'

const props = defineProps(['candidate'])
const emits = defineEmits(['close'])
const loading = ref(false)
const data = ref(props.candidate.review)

async function save() {
  try {
    loading.value = true
    await api.post(`candidates/${props.candidate.id}/review`, {
      review: data.value,
      _method: 'PUT'
    })
    notify.positive('Reseña actualizada')
    emits('saved', data.value)
  } catch (error) {
    notify.negative('No se pudo actualizar la reseña')
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-card style="width: 400px">
    <q-card-section class="q-pb-none">
      <div class="flex items-center justify-between">
        <div class="page-subtitle q-mb-xs">Reseña del Candidato</div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="$emit('close')"
        />
      </div>
      <div class="flex items-center">
        <q-icon
          name="person"
          class="q-mr-xs text-primary"
        />
        <div class="text-grey">{{ props.candidate.full_name }}</div>
      </div>
    </q-card-section>
    <q-card-section>
      <q-input
        outlined
        type="textarea"
        v-model="data"
        hide-bottom-space
        class="q-mb-md"
        rows="15"
      />
      <div class="flex justify-end">
        <q-btn
          :loading="loading"
          color="primary"
          label="Guardar"
          @click="save"
        />
      </div>
    </q-card-section>
  </q-card>
</template>
