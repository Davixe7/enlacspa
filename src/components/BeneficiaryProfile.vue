<script setup>
  import { useCandidateStore } from 'src/stores/candidate-store'
  import { onMounted } from 'vue'

  const props = defineProps(['candidateId'])
  const candidateStore = useCandidateStore()

  onMounted(async () => {
    candidateStore.id = props.candidateId
    candidateStore.fetchCandidate()
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
          <div class="form-value">{{ candidateStore.sheet }}</div>
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
            style="text-transform: capitalize"
            v-if="candidateStore.contact"
          >
            {{ candidateStore.contact.relationship }}
          </div>
        </div>

        <div class="form-group">
          <div class="form-label">Programa</div>
          <div class="form-value">{{ candidateStore.program?.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
