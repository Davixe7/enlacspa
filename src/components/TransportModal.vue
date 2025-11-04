<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useCandidateStore } from 'src/stores/candidate-store'
import notify from 'src/utils/notify'

const props = defineProps({
  modelValue: Boolean,
  requiresTransport: Number,
  transportAddress: String,
  transportLocationLink: String,
  curp: String
})

const showMapHelpModal = ref(false)

const openGoogleMapsSearch = () => {
  window.open('https://www.google.com/maps', '_blank')
}

const emit = defineEmits(['update:modelValue', 'save'])

const dialogVisible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
  }
)

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const $q = useQuasar()
const candidateStore = useCandidateStore()

const localRequiresTransport = ref(props.requiresTransport)
const localTransportAddress = ref(props.transportAddress)
const localTransportLocationLink = ref(props.transportLocationLink)
const localCurp = ref(props.curp)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localRequiresTransport.value = props.requiresTransport
      localTransportAddress.value = props.transportAddress
      localTransportLocationLink.value = props.transportLocationLink
      localCurp.value = props.curp
    }
  }
)

const isValidGoogleMapsLink = (url) => {
  return /^https?:\/\/(www\.)?google\.[a-z]+\/maps/.test(url)
}

const saveTransport = async () => {
  if (localRequiresTransport.value === 1 && !localCurp.value) {
    $q.notify({
      type: 'negative',
      message: 'CURP es obligatorio si requiere transporte.'
    })
    return
  }

  const payload = {
    requires_transport: localRequiresTransport.value === 1,
    transport_address: localTransportAddress.value,
    transport_location_link: localTransportLocationLink.value,
    curp: localCurp.value
  }

  try {
    const response = await candidateStore.updateTransport(payload)
    notify.positive(response.data.message || 'Datos de transporte actualizados correctamente.')
    emit('save', payload)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error al guardar:', error)
    const message =
      error?.response?.data?.message || error?.message || 'Error al guardar los datos.'
    notify.negative(message)
  }
}
</script>

<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
  >
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Datos de transporte</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="localTransportAddress"
          label="Dirección"
          filled
          class="q-mb-md"
        />
        <q-input
          v-model="localTransportLocationLink"
          label="Ubicación (Google Maps)"
          filled
          type="url"
          class="q-mb-sm"
        />
        <q-btn
          label="Buscar ubicación en Google Maps"
          color="primary"
          flat
          size="sm"
          class="q-mt-sm"
          @click="showMapHelpModal = true"
        />

        <template v-if="isValidGoogleMapsLink(localTransportLocationLink)">
          <div class="form-label q-mt-md">Vista previa del mapa</div>
          <iframe
            :src="localTransportLocationLink"
            width="100%"
            height="300"
            style="border: 0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </template>

        <q-input
          v-model="localCurp"
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
          @click="emit('update:modelValue', false)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Modal de google maps -->
  <q-dialog v-model="showMapHelpModal">
    <q-card style="width: 400px; max-width: 90vw">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">¿Cómo obtener el enlace?</div>
        <q-btn
          icon="close"
          flat
          round
          dense
          @click="showMapHelpModal = false"
        />
      </q-card-section>

      <q-card-section>
        <p>Haz clic en el botón para abrir Google Maps en una nueva pestaña.</p>
        <p>
          Busca la dirección, haz clic derecho sobre el marcador y selecciona
          <strong>“Compartir”</strong>.
        </p>
        <p>Copia el enlace y pégalo en el campo de ubicación.</p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="Abrir Google Maps"
          color="primary"
          @click="openGoogleMapsSearch"
        />
        <q-btn
          label="Cerrar"
          flat
          @click="showMapHelpModal = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
