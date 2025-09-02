<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'

defineProps(['groupId'])
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

onMounted(() => {
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
            <h1 class="page-title page-title--no-margin q-pb-md">Crear grupo</h1>
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
              />
            </div>
          </q-card-section>
        </div>
        <div class="col-12 col-md-8">
          <q-card-section>
            <!-- <div
            style="font-size: 18px"
            class="q-mb-md"
          >
            Agregar beneficiarios al grupo
          </div> -->
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

            <div class="flex justify-end q-pt-md">
              <q-btn
                color="primary"
                label="Continuar"
              />
            </div>
          </q-card-section>
        </div>
      </div>
    </q-card>
  </q-page>
</template>
