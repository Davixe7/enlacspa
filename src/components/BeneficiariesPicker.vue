<script setup>
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { onMounted } from 'vue'

const props = defineProps(['modelValue', 'disable'])
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
  console.log('Carga inicial de opciones')
  options.value = (await api.get('/beneficiaries')).data.data
}

const buscarOpciones = async (val, update, abort) => {
  console.log('Buscando opciones')

  if (loading.value) return

  loading.value = true
  try {
    const { data } = (await api.get(`/beneficiaries/?name=${val}`)).data
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
    @change="emits('update:modelValue', selectedId)"
    use-input
    :key="selectedId"
    v-model="selectedId"
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
