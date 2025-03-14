<script setup>
import { ref, watch } from 'vue';

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  hideBottomSpace: { type: Boolean, default: false },
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: false, default: () => ({}) },
})

const contact = ref({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => Object.assign(contact.value, newValue))
watch(() => contact.value, () => {
  props.hideBottomSpace ? emits('update:modelValue', { ...contact.value }) : ''
}, { deep: true })

function save() {
  emits('update:modelValue', { ...contact.value })
}

function seed() {
  Object.assign(contact.value, { "first_name": "John", "middle_name": "Garcia", "last_name": "Salazar", "relationship": "Padre", "legal_guardian": 0, "enlac_responsible": 1, "email": "mariajoseguilarte@gmail.com", "whatsapp": '321123456', "home_phone": '321123456', "street": "5", "neighborhood": "Villa Rosa", "state": "Nueva Esparta", "postal_code": "6301", "exterior_number": "0", "city": "Porlamar", "country": "Venezuela" })
}
</script>

<template>
  <div class="col-12 q-pb-none page-title">
    Datos del Contacto
  </div>
  <div class="row q-col-gutter-lg q-mb-xl">
    <div class="col-12 col-md-6 q-gutter-y-lg">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Nombre (s)"
        v-model="contact.first_name"
        :error="!!errors['contact.first_name']"
        :error-message="errors['contact.first_name']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Apellido Materno"
        v-model="contact.middle_name"
        :error="!!errors['contact.middle_name']"
        :error-message="errors['contact.middle_name']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Apellido Paterno"
        v-model="contact.last_name"
        :error="!!errors['contact.last_name']"
        :error-message="errors['contact.last_name']"
      ></q-input>
      <q-select
        outlined
        stack-label
        hide-bottom-space
        label="Parentesco"
        v-model="contact.relationship"
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
        v-model="contact.email"
        :error="!!errors['contact.email']"
        :error-message="errors['contact.email']"
        type="email"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Whatsapp"
        v-model="contact.whatsapp"
        :error="!!errors['contact.whatsapp']"
        :error-message="errors['contact.whatsapp']"
        type="tel"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Telefono casa"
        v-model="contact.home_phone"
        :error="!!errors['contact.home_phone']"
        :error-message="errors['contact.home_phone']"
        type="tel"
      ></q-input>
      <div class="flex">
        <q-checkbox
          label="Tutor legal"
          v-model="contact.legal_guardian"
          :true-value="1"
          :false-value="0"
        ></q-checkbox>
        <q-checkbox
          label="Responsable ENLAC"
          v-model="contact.enlac_responsible"
          :true-value="1"
          :false-value="0"
        ></q-checkbox>
      </div>
    </div>
  </div>
  <div class="page-title">
    Domicilio
    <q-btn
      @click="seed"
      flat
    >llenar</q-btn>
  </div>
  <div class="row q-col-gutter-lg">
    <div class="col-12 col-md-6 q-gutter-y-md">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Calle"
        v-model="contact.street"
        :error="!!errors['contact.street']"
        :error-message="errors['contact.street']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Colonia"
        v-model="contact.neighborhood"
        :error="!!errors['contact.neighborhood']"
        :error-message="errors['contact.neighborhood']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Estado"
        v-model="contact.state"
        :error="!!errors['contact.state']"
        :error-message="errors['contact.state']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Codigo Postal"
        v-model="contact.postal_code"
        :error="!!errors['contact.postal_code']"
        :error-message="errors['contact.postal_code']"
        type="number"
      ></q-input>
    </div>

    <div class="col-12 col-md-6 q-gutter-y-md">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Numero exterior"
        v-model="contact.exterior_number"
        :error="!!errors['contact.exterior_number']"
        :error-message="errors['contact.exterior_number']"
        type="number"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Ciudad"
        v-model="contact.city"
        :error="!!errors['contact.city']"
        :error-message="errors['contact.city']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Pais"
        v-model="contact.country"
        :error="!!errors['contact.country']"
        :error-message="errors['contact.country']"
      ></q-input>
    </div>

    <div
      class="col-12 flex justify-end"
      v-show="!hideBottomSpace"
    >
      <q-btn
        color="primary"
        @click="save"
      >Guardar Informacion</q-btn>
    </div>
  </div>
</template>