<script setup>
import { useCandidateStore } from 'src/stores/candidate-store'
import { ref } from 'vue'
import notify from 'src/utils/notify'

const model = defineModel()
const loading = ref(false)
const emit = defineEmits(['update:modelValue', 'save'])

const candidateStore = useCandidateStore()

function isValidGoogleMapsLink(url) {
  return (
    /^https?:\/\/(www\.)?google\.[a-z]+\/maps/.test(url) ||
    /^https?:\/\/maps\.app\.goo\.gl/.test(url)
  )
}

/* function openGoogleMaps() {
  if (isValidGoogleMapsLink(model.value.transport_location_link)) {
    window.open(model.value.transport_location_link, '_blank')
  }
}
 */
async function saveTransport() {
  try {
    loading.value = true
    await candidateStore.saveLocation(model.value)
    notify.positive('Datos de transporte actualizados correctamente.')
    emit('close')
  } catch (error) {
    console.log(error)
    notify.negative('Error al guardar los datos.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-card style="min-width: 500px">
    <q-card-section>
      <div class="text-h6">Datos de transporte</div>
    </q-card-section>

    <q-card-section>
      <q-input
        outlined
        v-model="model.transport_address"
        label="Dirección"
        filled
        class="q-mb-md"
      />
      <q-input
        outlined
        v-model="model.transport_location_link"
        label="Ubicación (Google Maps)"
        filled
        type="url"
        class="q-mb-sm"
      />

      <template v-if="isValidGoogleMapsLink(model.transport_location_link)">
        <div class="form-label q-mt-md">Vista previa del mapa</div>
        <iframe
          :src="model.transport_location_link"
          width="100%"
          height="300"
          style="border: 0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </template>

      <q-input
        outlined
        v-model="model.curp"
        label="CURP"
        filled
        class="q-mt-md"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        label="Guardar"
        color="primary"
        @click="saveTransport"
      />
      <q-btn
        label="Cancelar"
        flat
        @click="emit('close')"
      />
    </q-card-actions>
  </q-card>
</template>
