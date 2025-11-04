<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCandidateStore } from 'src/stores/candidate-store'
import TransportModal from 'src/components/TransportModal.vue'

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

const relationships = {
  abuelo: 'Abuelo(a)',
  hermano: 'Hermano(a)',
  hermanastro: 'Hermanastro(a)',
  madre_padre: 'Madre/Padre',
  padrastro_madrastra: 'Padrastro/Madrastra',
  primo: 'Primo(a)',
  tio: 'Tío(a)'
}

watch(requiresTransport, (newVal) => {
  if (newVal == false) {
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
      <!-- Transporte -->
      <div
        class="form-row"
        style="border-top: 1px solid #ccc; padding-top: 15px; margin-top: 15px"
      >
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
        </div>
      </div>

      <div class="form-row">
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
