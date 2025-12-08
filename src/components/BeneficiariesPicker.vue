<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

const props = defineProps({
  modelValue: {
    required: true
  },
  disable: {
    type: Boolean
  },
  fetchRoute: {
    type: String,
    default: '/beneficiaries'
  },
  params: {
    type: Object,
    default: () => ({})
  }
})

const emits = defineEmits(['update:modelValue'])

const selectedId = ref(null)
const options = ref([])
const page = ref(1)
const loading = ref(false)

onMounted(async () => {
  if (!props.modelValue) {
    await fetchBeneficiaries()
    return
  }
  options.value.push((await api.get(`/beneficiaries/${props.modelValue}`)).data.data)
  selectedId.value = Number(props.modelValue)
})

async function fetchBeneficiaries() {
  loading.value = true
  options.value = (await api.get(props.fetchRoute, { params: props.params })).data.data
  loading.value = false
}

const buscarOpciones = async (val, update, abort) => {
  console.log('Buscando opciones')

  if (loading.value) return

  try {
    let params = { ...props.params, name: val }
    loading.value = true
    const data = (await api.get(`${props.fetchRoute}`, { params })).data.data
    update(() => (options.value = data))
  } catch (error) {
    console.error('Error al buscar:', error)
    abort()
  } finally {
    loading.value = false
  }
}

const cargarMasOpciones = async (evt) => {
  if (loading.value) return

  if (evt.target.scrollTop + evt.target.clientHeight >= evt.target.scrollHeight - 50) {
    loading.value = true
    try {
      const { data } = (await api.get(`/beneficiaries/?page=${page.value}`)).data
      options.value.push(...data)
      page.value++
    } catch (error) {
      console.error('Error al cargar más opciones:', error)
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <q-select
    :disable="props.disable"
    outlined
    dense
    :model-value="selectedId"
    @update:model-value="
      (val) => {
        emits('update:modelValue', val)
        selectedId = val
      }
    "
    use-input
    :key="selectedId"
    input-debounce="500"
    :options="options"
    :option-value="'id'"
    :option-label="'name'"
    emit-value
    map-options
    @filter="buscarOpciones"
    @scroll="cargarMasOpciones"
    hide-bottom-space
  />
</template>
