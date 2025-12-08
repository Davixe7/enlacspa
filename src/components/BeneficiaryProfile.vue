<script setup>
import { ref, onMounted } from 'vue'
import { useCandidateStore } from 'src/stores/candidate-store'
import TransportModal from 'src/components/TransportModal.vue'

//const props = defineProps(['candidateId'])

const props = defineProps({
  candidateId: Number,
  locationId: Number
})
const candidateStore = useCandidateStore()
const transportDialog = ref(false)

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
  candidateStore.location_id = props.locationId
  await candidateStore.fetchCandidate()
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
          <div class="form-value">{{ candidateStore.entry_date ?? '--' }}</div>
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
        <!-- Equinoterapia -->
        <div class="form-row q-mt-md">
          <div class="form-group form-group--half">
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

          <div class="form-group form-group--half">
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

        <!-- Transporte (100%) -->
        <div class="form-row q-mt-md">
          <div class="form-group form-group--full">
            <div class="form-label">¿Requiere transporte Cuauhtémoc - Rubio?</div>

            <!-- Fila con radios a la izquierda y botón a la derecha -->
            <div class="row items-center justify-between q-gutter-sm">
              <div>
                <q-radio
                  label="Sí"
                  :val="1"
                  v-model.number="candidateStore.requires_transport"
                />
                <q-radio
                  label="No"
                  :val="0"
                  v-model.number="candidateStore.requires_transport"
                  @click="candidateStore.deleteLocation()"
                />
              </div>

              <div v-if="candidateStore.requires_transport === 1">
                <q-btn
                  label="Ver / Editar transporte"
                  color="primary"
                  @click="transportDialog = true"
                />
              </div>
            </div>
          </div>
        </div>
      </q-expansion-item>
    </div>

    <q-dialog v-model="transportDialog">
      <TransportModal
        v-model="candidateStore.location_detail"
        @close="transportDialog = false"
      />
    </q-dialog>
  </div>
</template>
<style>
.form-row {
  display: flex;
  flex-wrap: wrap;
}

.form-group {
  flex: 0 0 auto;
  width: 33.333%;
  min-width: 200px;
}

/* 6/6 */
.form-group--half {
  width: 50%;
  min-width: 280px; /* protege en pantallas pequeñas */
}

/* 100% */
.form-group--full {
  width: 100%;
}

/* En móviles, apilar sin romper líneas */
@media (max-width: 768px) {
  .form-group--half {
    width: 100%;
  }
}
</style>
