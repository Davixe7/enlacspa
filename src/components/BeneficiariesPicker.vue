<script setup>
import { computed, ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps(['modelValue', 'disable'])
const emits = defineEmits(['update:modelValue'])
const fetchRoute = computed(() => {
  return route.path == '/horarios-equinoterapia' ? `/beneficiaries/equinetherapy` : '/beneficiaries'
})

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
  options.value = (await api.get(fetchRoute.value)).data.data
  loading.value = false
}

const buscarOpciones = async (val, update, abort) => {
  console.log('Buscando opciones')

  if (loading.value) return

  try {
    loading.value = true
    const data = (await api.get(`${fetchRoute.value}/?name=${val}`)).data.data
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
