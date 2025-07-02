<script setup>
import { api } from 'src/boot/axios'
import { ref, watch } from 'vue'

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  candidateId: { default: null },
  hideBottomSpace: { type: Boolean, default: false },
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: false, default: () => ({}) }
})
const relationships = [
  { label: 'Abuelo(a)', value: 'abuelo' },
  { label: 'Hermano(a)', value: 'hermano' },
  { label: 'Hermanastro(a)', value: 'hermanastro' },
  { label: 'Madre/Padre', value: 'madre_padre' },
  { label: 'Padrastro/Madrastra', value: 'padrastro_madrastra' },
  { label: 'Primo(a)', value: 'primo' },
  { label: 'Tío(a)', value: 'tio' }
]
const contact = ref({ ...props.modelValue })
const localErrors = ref({ ...props.errors })

watch(
  () => props.errors,
  (newValue) => (localErrors.value = { ...newValue })
)
watch(
  () => props.modelValue,
  (newValue) => Object.assign(contact.value, newValue)
)
watch(
  () => contact.value,
  () => {
    props.hideBottomSpace ? emits('update:modelValue', { ...contact.value }) : ''
  },
  { deep: true }
)

async function save() {
  try {
    await api.post('contacts/validate', { ...contact.value })
    emits('update:modelValue', { ...contact.value })
  } catch (error) {
    if (error.status == 422) {
      localErrors.value = error.response.data.errors
    }
  }
}
</script>

<template>
  <div class="col-12 q-pb-none page-title flex justify-between">
    Datos del Contacto
    <q-banner
      inline-actions
      class="text-red bg-white q-field--error"
      style="border: 1px solid red"
      v-if="localErrors['contacts']"
    >
      Debe incluir por lo menos un contacto
      <template v-slot:action>
        <q-icon
          flat
          color="red"
          name="sym_o_info"
        />
      </template>
    </q-banner>
  </div>
  <div class="row q-col-gutter-lg q-mb-xl">
    <div class="col-12 col-md-6 q-gutter-y-lg">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Nombre (s)"
        v-model="contact.first_name"
        class="q-field--required"
        :error="!!localErrors[`first_name`]"
        :error-message="localErrors[`first_name`]"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Apellido Paterno"
        v-model="contact.last_name"
        :error="!!localErrors[`last_name`]"
        :error-message="localErrors[`last_name`]"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Apellido Materno"
        v-model="contact.middle_name"
        :error="!!localErrors[`middle_name`]"
        :error-message="localErrors[`middle_name`]"
      ></q-input>
      <q-select
        outlined
        stack-label
        hide-bottom-space
        label="Parentesco"
        v-model="contact.relationship"
        class="q-field--required"
        :error="!!localErrors[`relationship`]"
        :error-message="localErrors[`relationship`]"
        :options="relationships"
        emit-value
        map-options
      ></q-select>
    </div>
    <div class="col-12 col-md-6 q-gutter-y-lg">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Correo"
        v-model="contact.email"
        :error="!!localErrors[`email`]"
        :error-message="localErrors[`email`]"
        type="email"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="WhatsApp"
        v-model="contact.whatsapp"
        :error="!!localErrors[`whatsapp`]"
        :error-message="localErrors[`whatsapp`]"
        mask="##########"
        type="tel"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Teléfono casa"
        v-model="contact.home_phone"
        :error="!!localErrors[`home_phone`]"
        :error-message="localErrors[`home_phone`]"
        mask="##########"
        type="tel"
      ></q-input>

      <div style="position: relative">
        <label
          for="#"
          class="q-field__label block q-mb-xs"
          style="margin-bottom: 4px"
          >Relacion</label
        >
        <div
          class="flex q-pt-xs"
          style="border: 1px solid #fff; margin-left: -8px"
        >
          <q-checkbox
            label="Tutor legal"
            v-model="contact.legal_guardian"
            :true-value="1"
            :false-value="0"
            class="q-mr-sm"
          ></q-checkbox>
          <q-checkbox
            label="Responsable del Beneficiario"
            v-model="contact.enlac_responsible"
            :true-value="1"
            :false-value="0"
          ></q-checkbox>
        </div>
      </div>
    </div>
  </div>
  <div class="page-title">Domicilio</div>
  <div class="row q-col-gutter-lg">
    <div class="col-12 col-md-6 q-gutter-y-md">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Calle"
        v-model="contact.street"
        :error="!!localErrors[`street`]"
        :error-message="localErrors[`street`]"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Colonia"
        v-model="contact.neighborhood"
        :error="!!localErrors[`neighborhood`]"
        :error-message="localErrors[`neighborhood`]"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Estado"
        v-model="contact.state"
        :error="!!localErrors[`state`]"
        :error-message="localErrors[`state`]"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Código Postal"
        v-model="contact.postal_code"
        :error="!!localErrors[`postal_code`]"
        :error-message="localErrors[`postal_code`]"
        type="number"
      ></q-input>
    </div>

    <div class="col-12 col-md-6 q-gutter-y-md">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Número exterior"
        v-model="contact.exterior_number"
        :error="!!localErrors[`exterior_number`]"
        :error-message="localErrors[`exterior_number`]"
        type="number"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Ciudad"
        v-model="contact.city"
        :error="!!localErrors[`city`]"
        :error-message="localErrors[`city`]"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="País"
        v-model="contact.country"
        :error="!!localErrors[`country`]"
        :error-message="localErrors[`country`]"
      ></q-input>
    </div>

    <div
      class="col-12 flex justify-end"
      v-show="!hideBottomSpace"
    >
      <q-btn
        color="primary"
        @click="save"
        >Guardar Información</q-btn
      >
    </div>
  </div>
</template>
