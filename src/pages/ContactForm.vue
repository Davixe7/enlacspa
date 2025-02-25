<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  contact: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    required: true,
    default: () => ({ contact: {} })
  },
})
const localContact = ref({ ...props.contact })
watch(() => props.contact, (newValue) => {
  localContact.value = newValue
})
</script>

<template>
  <div class="row q-col-gutter-lg q-mb-xl">
    <div class="col-12 q-pb-none">
      <div
        class="page-title"
        style="border: 1px solid red"
      >
        Datos del Contacto
      </div>
    </div>
    <div class="col-12 col-md-6 q-gutter-y-lg">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Nombre (s)"
        v-model="localContact.first_name"
        :error="!!errors['contact.first_name']"
        :error-message="errors['contact.first_name']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Apellido Materno"
        v-model="localContact.middle_name"
        :error="!!errors['contact.middle_name']"
        :error-message="errors['contact.middle_name']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Apellido Paterno"
        v-model="localContact.last_name"
        :error="!!errors['contact.last_name']"
        :error-message="errors['contact.last_name']"
      ></q-input>
      <q-select
        outlined
        stack-label
        hide-bottom-space
        label="Parentesco"
        v-model="localContact.relationship"
        :error="!!errors['contact.relationship']"
        :error-message="errors['contact.relationship']"
        :options="[{ label: 'Padre', value: 1 }]"
      ></q-select>
    </div>
    <div class="col-12 col-md-6 q-gutter-y-lg">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Correo"
        v-model="localContact.email"
        :error="!!errors['contact.email']"
        :error-message="errors['contact.email']"
        type="email"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Whatsapp"
        v-model="localContact.whatsapp"
        :error="!!errors['contact.whatsapp']"
        :error-message="errors['contact.whatsapp']"
        type="tel"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Telefono casa"
        v-model="localContact.home_phone"
        :error="!!errors['contact.home_phone']"
        :error-message="errors['contact.home_phone']"
        type="tel"
      ></q-input>
      <div class="flex">
        <q-checkbox
          label="Tutor legal"
          v-model="localContact.legal_guardian"
        ></q-checkbox>
        <q-checkbox
          label="Responsable ENLAC"
          v-model="localContact.enlac_responsible"
        ></q-checkbox>
      </div>
    </div>
  </div>
</template>
