<script setup>
import { ref, onMounted } from 'vue'
import { useCandidateStore } from 'src/stores/candidate-store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const props = defineProps(['candidateId'])
const candidateStore = useCandidateStore()

const requiresTransport = ref(false)
const transportAddress = ref('')
const transportLocationLink = ref('')
const curp = ref('')

// Valores originales para restaurar si se cancela
let originalValues = {
  requires_transport: false,
  transport_address: '',
  transport_location_link: '',
  curp: ''
}

const relationships = {
  abuelo: 'Abuelo(a)',
  hermano: 'Hermano(a)',
  hermanastro: 'Hermanastro(a)',
  madre_padre: 'Madre/Padre',
  padrastro_madrastra: 'Padrastro/Madrastra',
  primo: 'Primo(a)',
  tio: 'Tío(a)'
}

onMounted(async () => {
  candidateStore.id = props.candidateId
  await candidateStore.fetchCandidate()

  originalValues = {
    requires_transport: candidateStore.requires_transport || false,
    transport_address: candidateStore.transport_address || '',
    transport_location_link: candidateStore.transport_location_link || '',
    curp: candidateStore.curp || ''
  }

  requiresTransport.value = originalValues.requires_transport
  transportAddress.value = originalValues.transport_address
  transportLocationLink.value = originalValues.transport_location_link
  curp.value = originalValues.curp
})

const isValidGoogleMapsLink = (url) => {
  return /^https?:\/\/(www\.)?google\.[a-z]+\/maps/.test(url)
}

const openGoogleMaps = () => {
  if (isValidGoogleMapsLink(transportLocationLink.value)) {
    window.open(transportLocationLink.value, '_blank')
  } else {
    $q.notify({
      type: 'negative',
      message: 'El enlace de ubicación no es válido.'
    })
  }
}

const saveTransportData = async () => {
  if (requiresTransport.value && !curp.value) {
    $q.notify({
      type: 'negative',
      message: 'CURP es obligatorio si requiere transporte.'
    })
    return
  }

  const payload = {
    requires_transport: requiresTransport.value,
    transport_address: transportAddress.value,
    transport_location_link: transportLocationLink.value,
    curp: curp.value
  }

  try {
    await candidateStore.updateTransport(payload)
    originalValues = { ...payload }
    $q.notify({
      type: 'positive',
      message: 'Datos de transporte actualizados correctamente.'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar los datos.'
    })
    console.log(error)
  }
}

const cancelChanges = () => {
  requiresTransport.value = originalValues.requires_transport
  transportAddress.value = originalValues.transport_address
  transportLocationLink.value = originalValues.transport_location_link
  curp.value = originalValues.curp

  $q.notify({
    type: 'info',
    message: 'Cambios descartados.'
  })
}
</script>

<template>
  <div class="profile">
    <div class="profile__avatar">
      <q-img
        color="grey"
        width="100%"
        height="100%"
        style="background: lightgrey"
        :src="candidateStore.picture"
      />
    </div>

    <div class="profile__content">
      <!-- Datos generales -->
      <div class="form-row">
        <div class="form-group">
          <div class="form-label">Nombre del beneficiario</div>
          <div class="form-value">{{ candidateStore.full_name }}</div>
        </div>
        <div class="form-group">
          <div class="form-label">Fecha de ingreso</div>
          <div class="form-value">{{ candidateStore.onboard_at }}</div>
        </div>
        <div class="form-group">
          <div class="form-label">Folio</div>
          <div class="form-value">{{ candidateStore.id }}</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <div class="form-label">Responsable del beneficiario</div>
          <div
            class="form-value"
            v-if="candidateStore.contact"
          >
            {{ candidateStore.contact.first_name + ' ' + candidateStore.contact.last_name }}
          </div>
        </div>
        <div class="form-group">
          <div class="form-label">Parentesco</div>
          <div
            class="form-value"
            v-if="candidateStore.contact"
          >
            {{ relationships[candidateStore.contact.relationship.toLowerCase()] }}
          </div>
        </div>
        <div class="form-group">
          <div class="form-label">Programa</div>
          <div class="form-value">{{ candidateStore.program?.name }}</div>
        </div>
      </div>

      <!-- Transporte editable -->
      <div
        class="form-row"
        style="border-top: 1px solid #ccc; padding-top: 15px; margin-top: 15px"
      >
        <div class="form-group">
          <div class="form-label">¿Requiere transporte Cuauhtémoc - Rubio?</div>
          <q-option-group
            v-model="requiresTransport"
            :options="[
              { label: 'Sí', value: true },
              { label: 'No', value: false }
            ]"
            type="radio"
            inline
          />
        </div>
      </div>

      <template v-if="requiresTransport">
        <div class="form-row">
          <div class="form-group">
            <div class="form-label">Dirección</div>
            <q-input
              v-model="transportAddress"
              filled
              placeholder="Dirección de recolección"
            />
          </div>

          <div class="form-group">
            <div class="form-label">Ubicación (Google Maps)</div>
            <q-input
              v-model="transportLocationLink"
              filled
              placeholder="https://maps.google.com/..."
              type="url"
            />
            <q-btn
              label="Abrir en Google Maps"
              color="secondary"
              flat
              size="sm"
              class="q-mt-sm"
              @click="openGoogleMaps"
            />
          </div>

          <div class="form-group">
            <div class="form-label">CURP <span class="text-negative">*</span></div>
            <q-input
              v-model="curp"
              filled
              placeholder="CURP del beneficiario"
            />
          </div>
        </div>
      </template>

      <!-- Botones -->
      <div class="form-row">
        <q-btn
          label="Guardar Transporte"
          color="primary"
          @click="saveTransportData"
          class="q-mr-sm q-mt-sm"
        />
        <q-btn
          label="Cancelar"
          color="grey"
          class="q-mt-sm"
          flat
          @click="cancelChanges"
        />
      </div>
    </div>
  </div>
</template>
