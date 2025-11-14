<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const props = defineProps(['sponsorId'])
const sponsor = ref({})

onMounted(async () => {
  sponsor.value = (await api.get(`/sponsors/${props.sponsorId}`)).data.data
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
        :src="sponsor.profile_picture"
      />
    </div>
    <div class="profile__content">
      <div class="form-row">
        <div class="form-group">
          <div class="form-label">Nombre del Padrino</div>
          <div class="form-value">{{ sponsor.full_name }}</div>
        </div>

        <div class="form-group">
          <div class="form-label">Razón o Denominación Social</div>
          <div class="form-value">{{ sponsor.company_name }}</div>
        </div>

        <div class="form-group">
          <div class="form-label">Fecha de Nacimiento</div>
          <div class="form-value">{{ sponsor.birthdate }}</div>
        </div>

        <div class="form-group">
          <div class="form-label">Estado Civil</div>
          <div class="form-value">{{ sponsor.marital_status }}</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <div class="form-label">¿Quién lo consiguió?</div>
          <div class="form-value">
            {{ sponsor.contact_by == 'enlac' ? 'ENLAC' : 'Padre de Familia' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
