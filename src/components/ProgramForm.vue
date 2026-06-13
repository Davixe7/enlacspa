<script setup>
import { api } from 'src/boot/axios'

import notify from 'src/utils/notify'
import { onMounted, ref } from 'vue'
import EnlacDate from './EnlacDate.vue'

const emits = defineEmits(['updated', 'created', 'close'])
const loading = ref(false)
const model = defineModel()
const errors = ref({})
const updatePrice = ref(false)
const priceUpdate = ref({
  program_id: model.value.id,
  price: 0,
  valid_since: null
})

onMounted(async () => {
  if (model.value.id == null) {
    return
  }

  await fetchPriceUpdate()
})

async function saveProgram() {
  try {
    loading.value = true
    errors.value = {}

    let route = model.value.id ? `/programs/${model.value.id}` : '/programs'
    let data = model.value.id ? { ...model.value, _method: 'PUT' } : { ...model.value }

    const response = await api.post(route, data)

    if (!model.value.id) {
      emits('created', response.data.data)
      return
    }

    if (updatePrice.value) {
      let route = priceUpdate.value.id ? `program_prices/${priceUpdate.value.id}` : 'program_prices'
      let data = priceUpdate.value.id
        ? { ...priceUpdate.value, _method: 'PUT' }
        : { ...priceUpdate.value }
      let isValid = priceUpdate.value.price && priceUpdate.value.valid_since
      let response = (await api.post(route, data)).data.data
    }

    emits('updated', response.data.data)

    notify.positive('Guardado con éxito')
  } catch (error) {
    console.error(error)
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
    }
    notify.negative('No se pudo actualizar')
  } finally {
    loading.value = false
  }
}

async function fetchPriceUpdate() {
  loading.value = true
  let response = (await api.get(`program_prices/?program_id=${model.value.id}&pending=1`)).data.data
  priceUpdate.value = response ? response : priceUpdate.value
  loading.value = false
}
</script>

<template>
  <q-card style="width: 480px">
    <q-card-section class="flex items-center q-pb-none">
      <div class="page-subtitle">{{ `${model.id ? 'Actualizar' : 'Nuevo'}` }} programa</div>
      <q-btn
        flat
        round
        icon="sym_o_close"
        @click="emits('close')"
        class="q-ml-auto"
      />
    </q-card-section>
    <q-card-section>
      <q-form class="q-gutter-y-md">
        <q-markup-table
          flat
          class="program-form"
        >
          <tbody>
            <tr>
              <td>Nombre del programa</td>
              <td>
                <q-input
                  outlined
                  v-model="model.name"
                  hide-bottom-space
                  :error="!!errors['name']"
                  :error-message="errors['name']"
                />
              </td>
            </tr>
            <tr>
              <td>Precio</td>
              <td>
                <div style="position: relative">
                  <q-input
                    outlined
                    v-model="model.price"
                    hide-bottom-space
                    :error="!!errors['price']"
                    :error-message="errors['price']"
                    type="number"
                    prefix="$"
                    :disable="!!model.id"
                  />
                  <q-btn
                    icon="sym_o_edit"
                    flat
                    round
                    dense
                    v-if="model.id"
                    @click="updatePrice = !updatePrice"
                    style="position: absolute; right: 2px; top: 2px"
                  />
                </div>
              </td>
            </tr>
            <template v-if="updatePrice">
              <tr>
                <td>Nuevo precio</td>
                <td>
                  <q-input
                    outlined
                    v-model="priceUpdate.price"
                    hide-bottom-space
                    :error="!!errors['new_price']"
                    :error-message="errors['new_price']"
                    type="number"
                    prefix="$"
                  />
                </td>
              </tr>
              <tr>
                <td>A partir del</td>
                <td>
                  <EnlacDate
                    outlined
                    v-model="priceUpdate.valid_since"
                    hide-bottom-space
                    :limit-to-past="false"
                    :error="!!errors['valid_since']"
                    :error-message="errors['valid_since']"
                  />
                </td>
              </tr>
            </template>
            <tr>
              <td>Activo</td>
              <td>
                <q-checkbox
                  v-model="model.is_active"
                  :true-value="1"
                  :false-value="0"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="flex justify-end">
          <q-btn
            :loading="loading"
            @click="saveProgram"
            :label="`${model.id ? 'Actualizar' : 'Agregar'} programa`"
            color="primary"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
