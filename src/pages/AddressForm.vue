<script setup>
import { watch } from 'vue';
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
})
const emits = defineEmits(['update:modelValue'])
const address = ref({ ...props.modelValue })

watch(() => address.value, (newValue) => {
  emits('update:modelValue', newValue)
})

watch(() => props.modelValue, (newValue) => {
  address.value = newValue
})
</script>

<template>
  <div class="row q-col-gutter-lg q-mb-xl">
    <div class="col-12 q-pb-none">
      <div
        class="page-title q-mb-md"
        style="border: 1px solid red"
      >
        Domicilio
      </div>
    </div>
    <div class="col-12 col-md-6 q-gutter-y-lg">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Calle"
        v-model="address.street"
        :error="!!errors['address.street']"
        :error-message="errors['address.street']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Colonia"
        v-model="address.neighborhood"
        :error="!!errors['address.neighborhood']"
        :error-message="errors['address.neighborhood']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Estado"
        v-model="address.state"
        :error="!!errors['address.state']"
        :error-message="errors['address.state']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Codigo Postal"
        v-model="address.postal_code"
        :error="!!errors['address.postal_code']"
        :error-message="errors['address.postal_code']"
        type="number"
      ></q-input>
    </div>
    <div class="col-12 col-md-6 q-gutter-y-lg">
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Numero exterior"
        v-model="address.exterior_number"
        :error="!!errors['address.exterior_number']"
        :error-message="errors['address.exterior_number']"
        type="number"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Colonia"
        v-model="address.neighborhood"
        :error="!!errors['address.neighborhood']"
        :error-message="errors['address.neighborhood']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Ciudad"
        v-model="address.city"
        :error="!!errors['address.city']"
        :error-message="errors['address.city']"
      ></q-input>
      <q-input
        outlined
        stack-label
        hide-bottom-space
        label="Pais"
        v-model="address.country"
        :error="!!errors['address.country']"
        :error-message="errors['address.country']"
      ></q-input>
      <div class="flex justify-end">
        <q-btn
          color="primary"
          icon="add"
        > Agregar Domicilio </q-btn>
      </div>
    </div>
  </div>
</template>
