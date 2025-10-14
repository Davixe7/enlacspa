<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import notify from 'src/utils/notify'
import { useRouter } from 'vue-router'

const props = defineProps(['groupId'])

const router = useRouter()
const programs = ref([])
const data = ref([])
const loading = ref(false)
const search = ref('')
const picked = ref([])
const group = ref({})
const items = computed(() => {
  if (!search.value) return [...data.value]
  return data.value.filter((item) => item.name.toLowerCase().includes(search.value.toLowerCase()))
})

async function fetchData() {
  try {
    loading.value = true
    data.value = (await api.get('beneficiaries')).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchPrograms() {
  try {
    loading.value = true
    programs.value = (await api.get('programs')).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    loading.value = true
    group.value.candidates = [...picked.value]
    let route = props.groupId ? `/groups/${props.groupId}` : '/groups'
    let data = props.groupId ? { ...group.value, _method: 'PUT' } : { ...group.value }
    let action = props.groupId ? 'actualizado' : 'creado'
    await api.post(route, data)
    notify.positive(`Grupo ${action} exitosamente`)
    router.push('/grupos')
  } catch (error) {
    console.log(error)
    notify.negative('Error al crear el grupo')
  } finally {
    loading.value = false
  }
}

async function fetchGroup() {
  if (!props.groupId) return
  try {
    loading.value = true
    group.value = (await api.get(`/groups/${props.groupId}`)).data.data
    picked.value = group.value.candidates.map((candidate) => candidate.id)
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar el grupo')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchGroup()
  fetchData()
  fetchPrograms()
})
</script>

<template>
  <q-page>
    <q-card
      flat
      bordered
      style="margin-top: -16px"
    >
      <div class="row">
        <div class="col-12 col-md-4">
          <q-card-section>
            <h1 class="page-title page-title--no-margin q-pb-md">
              {{ props.groupId ? 'Actualizar' : 'Crear' }} grupo
            </h1>
            <div style="font-size: 18px; padding-bottom: 16px">Informacion Basica</div>
            <div class="q-gutter-y-md">
              <q-input
                outlined
                stack-label
                label="Nombre del grupo"
                v-model="group.name"
              />
              <q-select
                outlined
                stack-label
                label="Programa"
                v-model="group.program_id"
                :options="programs"
                option-label="name"
                option-value="id"
                emit-value
                map-options
              />
            </div>
          </q-card-section>
        </div>
        <div class="col-12 col-md-8">
          <q-card-section>
            <q-input
              type="search"
              clearable
              stack-label
              label="Buscar por nombre"
              v-model="search"
              outlined
              class="q-mb-md"
            >
              <template v-slot:append="">
                <q-icon name="sym_o_search" />
              </template>
            </q-input>

            <q-virtual-scroll
              style="
                max-height: 195px;
                border-top: 1px solid rgba(0, 0, 0, 0.07);
                border-bottom: 1px solid rgba(0, 0, 0, 0.07);
              "
              :items="items"
              separator
              v-slot="{ item, index }"
              dense
            >
              <q-item
                :key="index"
                dense
                class="q-px-none"
              >
                <q-item-section side>
                  <q-checkbox
                    v-model="picked"
                    :val="item.id"
                    :label="item.name"
                    dense
                  />
                </q-item-section>
              </q-item>
            </q-virtual-scroll>
          </q-card-section>

          <div class="flex justify-end q-pa-md">
            <q-btn
              color="primary"
              label="Continuar"
              :loading="loading"
              @click="save"
            />
          </div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>
