<script setup>
import Notify from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const emits = defineEmits(['rankUpdated', 'close'])
const props = defineProps(['rank'])
const errors = ref({})
const loading = ref(false)
const brainFunction = ref({})
const localRank = ref({ ...props.rank })

onMounted(async () => {
  brainFunction.value = (await api.get(`brain_functions/${props.rank.brain_function_id}`)).data.data
})

async function storeRank() {
  loading.value = true
  errors.value = {}
  let route = props.rank.id ? `brain_function_ranks/${props.rank.id}` : 'brain_function_ranks'
  let data = props.rank.id ? { ...localRank.value, _method: 'PUT' } : { ...localRank.value }
  try {
    let response = (await api.post(route, data)).data.data
    Notify.positive('Guardado con exito')
    emits('rankUpdated', response)
  } catch (error) {
    errors.value = error.formatted ? error.formatted : {}
    Notify.negative('No se pudo guardar')
  }
  loading.value = false
}
</script>
<template>
  <q-card
    style="width: 500px"
    v-if="rank"
  >
    <q-card-section class="flex justify-between items-center q-pr-sm">
      <div class="page-title page-title--no-margin">
        {{ rank.brain_level_id }}
        {{ brainFunction.name }}
      </div>
      <q-btn
        style="flex: 0 0 auto"
        flat
        round
        dense
        icon="close"
        @click="emits('close')"
      ></q-btn>
    </q-card-section>
    <q-card-section>
      <div class="flex justify-between q-mb-lg">
        <div
          @click="localRank.caracteristic = '0'"
          class="impact-btn"
          :class="{ 'impact-btn--active': localRank.caracteristic == '0' }"
          style=""
        >
          0
        </div>
        <div
          @click="localRank.caracteristic = 'F'"
          class="impact-btn"
          :class="{ 'impact-btn--active': localRank.caracteristic == 'F' }"
          style="background-color: #ee8b00"
        >
          F
        </div>
        <div
          @click="localRank.caracteristic = 'P'"
          class="impact-btn"
          :class="{ 'impact-btn--active': localRank.caracteristic == 'P' }"
          style="background-color: #8daf12"
        >
          P
        </div>
      </div>

      <q-input
        outlined
        stack-label
        label="Comentarios"
        type="textarea"
        v-model="localRank.comments"
        :error="!!errors.comments"
        :error-message="errors.comments"
      ></q-input>

      <div class="q-pt-lg q-pl-none">
        <label
          for="#"
          style="margin-bottom: 14px; display: block"
          >¿Impacto en Lateridad? (<span class="text--negative">*</span>)
        </label>
        <div style="margin-left: -10px">
          <q-radio
            v-model="localRank.laterality_impact"
            val="l"
            label="Izquierda"
          />
          <q-radio
            v-model="localRank.laterality_impact"
            val="r"
            label="Derecha"
          />
          <q-radio
            v-model="localRank.laterality_impact"
            val="b"
            label="Ambos"
          />
        </div>
        <div
          v-show="!!errors.laterality_impact"
          class="q-field__bottom text-negative"
        >
          Seleccione lateralidad del impacto
        </div>
      </div>
    </q-card-section>
    <q-card-section class="flex justify-end">
      <q-btn
        :loading="loading"
        @click="emits('close')"
        class="q-mr-sm"
        unelevated
        outline
        color="primary"
        >Cerrar</q-btn
      >
      <q-btn
        :loading="loading"
        @click="storeRank"
        unelevated
        color="primary"
        >Guardar</q-btn
      >
    </q-card-section>
  </q-card>
</template>

<style>
.impact-btn {
  font-weight: 700;
  font-size: 25px;
  color: #001f6d;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 109px;
  height: 65px;
  border: 1px solid grey;
  border-radius: 8px;
  cursor: pointer;
}

.impact-btn--active {
  border: 3px dashed #001f6d;
}
</style>
