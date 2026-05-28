<script setup>
import { useCandidateStore } from 'src/stores/candidate-store'
import { ref } from 'vue'
import notify from 'src/utils/notify'

const model = defineModel()
const loading = ref(false)
const emit = defineEmits(['update:modelValue', 'save'])

const candidateStore = useCandidateStore()

async function saveTransport() {
  try {
    loading.value = true
    const payload = { ...model.value, candidate_id: candidateStore.id }
    await candidateStore.saveLocation(payload)
    notify.positive('Datos de transporte actualizados correctamente.')
    emit('close')
  } catch (error) {
    console.error(error)
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
        class="q-mb-md"
        hint="Pega aquí el enlace de Google Maps"
      />

      <!-- Botón de acción rápida -->
      <div
        v-if="model.transport_location_link"
        class="q-mb-md"
      >
        <q-btn
          label="Abrir ubicación en Google Maps"
          color="secondary"
          icon="open_in_new"
          outline
          target="_blank"
          :href="model.transport_location_link"
          class="full-width"
        />
      </div>

      <q-input
        outlined
        v-model="model.curp"
        label="CURP"
        filled
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        label="Guardar"
        color="primary"
        :loading="loading"
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
