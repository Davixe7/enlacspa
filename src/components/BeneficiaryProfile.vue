<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCandidateStore } from 'src/stores/candidate-store'
import TransportModal from 'src/components/TransportModal.vue'
import { nextTick } from 'vue'

const props = defineProps(['candidateId'])
const candidateStore = useCandidateStore()

const showTransportModal = ref(false)
const requiresTransport = ref(0)
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

// variable bandera para prevenir el lanzamiento automatico de la modal del transporte sin accion directa del usuario al cargar la pagina
const hasInteracted = ref(false)

const isValidGoogleMapsLink = (url) => {
  return (
    /^https?:\/\/(www\.)?google\.[a-z]+\/maps/.test(url) ||
    /^https?:\/\/maps\.app\.goo\.gl/.test(url)
  )
}

const openGoogleMaps = () => {
  if (isValidGoogleMapsLink(transportLocationLink.value)) {
    window.open(transportLocationLink.value, '_blank')
  }
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

watch(requiresTransport, async (newVal, oldVal) => {
  if (!hasInteracted.value) {
    hasInteracted.value = true
    return
  }

  if (newVal === 1 && oldVal !== 1) {
    await nextTick()
    showTransportModal.value = true
  } else if (newVal === 0) {
    candidateStore.cancelTransport()
  }
})

onMounted(async () => {
  candidateStore.id = props.candidateId
  await candidateStore.fetchCandidate()

  const isTransportRequired = parseInt(candidateStore.requires_transport) || 0

  originalValues = {
    requires_transport: isTransportRequired,
    transport_address: candidateStore.transport_address ?? '',
    transport_location_link: candidateStore.transport_location_link ?? '',
    curp: candidateStore.curp ?? ''
  }

  requiresTransport.value = originalValues.requires_transport
  transportAddress.value = originalValues.transport_address
  transportLocationLink.value = originalValues.transport_location_link
  curp.value = originalValues.curp
})
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

      <q-expansion-item
        label="Información adicional del beneficiario"
        icon="expand_more"
        expand-separator
        dense
        header-class="text-primary"
      >
        <!-- Transporte -->
        <div class="form-row q-mt-md">
          <div class="form-group">
            <div class="form-label">¿Requiere transporte Cuauhtémoc - Rubio?</div>
            <q-radio
              label="Sí"
              :val="1"
              v-model.number="requiresTransport"
            />
            <q-radio
              label="No"
              :val="0"
              v-model.number="requiresTransport"
            />
          </div>

          <div v-if="requiresTransport === 1">
            <q-btn
              label="Ver / Editar transporte"
              color="primary"
              class="q-mt-sm"
              @click="showTransportModal = true"
            />
            <div
              v-if="isValidGoogleMapsLink(transportLocationLink)"
              class="form-group q-mt-sm"
            >
              <div class="form-label">Ubicación en Google Maps</div>
              <q-btn
                label="Ver ubicación"
                color="secondary"
                flat
                size="sm"
                @click="openGoogleMaps"
              />
            </div>
          </div>
        </div>

        <!-- Equinoterapia -->
        <div class="form-row q-mt-md">
          <div class="form-group">
            <div class="form-label">Permiso para Equinoterapia por Médico</div>
            <q-radio
              label="Sí"
              :val="1"
              v-model.number="candidateStore.equinetherapy_permission_medical"
              @update:model-value="
                candidateStore.updateEquineTherapyPermission({
                  equinetherapy_permission_medical: candidateStore.equinetherapy_permission_medical
                })
              "
            />
            <q-radio
              label="No"
              :val="0"
              v-model.number="candidateStore.equinetherapy_permission_medical"
              @update:model-value="
                candidateStore.updateEquineTherapyPermission({
                  equinetherapy_permission_medical: candidateStore.equinetherapy_permission_medical
                })
              "
            />
          </div>

          <div class="form-group">
            <div class="form-label">Permiso para Equinoterapia por Tutor Legal</div>
            <q-radio
              label="Sí"
              :val="1"
              v-model.number="candidateStore.equinetherapy_permission_legal_guardian"
              @update:model-value="
                candidateStore.updateEquineTherapyPermission({
                  equinetherapy_permission_legal_guardian:
                    candidateStore.equinetherapy_permission_legal_guardian
                })
              "
            />
            <q-radio
              label="No"
              :val="0"
              v-model.number="candidateStore.equinetherapy_permission_legal_guardian"
              @update:model-value="
                candidateStore.updateEquineTherapyPermission({
                  equinetherapy_permission_legal_guardian:
                    candidateStore.equinetherapy_permission_legal_guardian
                })
              "
            />
          </div>
        </div>
      </q-expansion-item>
    </div>

    <TransportModal
      v-model="showTransportModal"
      :requires-transport="requiresTransport"
      :transport-address="transportAddress"
      :transport-location-link="transportLocationLink"
      :curp="curp"
      @save="
        (payload) => {
          requiresTransport = payload.requires_transport ? 1 : 0
          transportAddress = payload.transport_address
          transportLocationLink = payload.transport_location_link
          curp = payload.curp
        }
      "
    />
  </div>
</template>
