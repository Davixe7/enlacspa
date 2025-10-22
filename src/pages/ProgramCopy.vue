<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import notify from 'src/utils/notify'

const props = defineProps(['groupId'])
const emits = defineEmits(['save'])
const plans = ref([])
const selectedPlan = ref(null)
const loading = ref(false)
const name = ref('')

async function fetchPrograms() {
  try {
    loading.value = true
    plans.value = (await api.get(`personal_programs`)).data.data
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar los programas')
  } finally {
    loading.value = false
  }
}

async function copy() {
  try {
    loading.value = true
    let data = { name: name.value, group_id: props.groupId }
    let result = (await api.post(`personal_programs/${selectedPlan.value.id}/copy`, data)).data.data
    notify.positive('Programa copiado exitosamente.')
    emits('save', result)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPrograms())
</script>

<template>
  <q-card style="width: 480px">
    <template v-if="!selectedPlan">
      <q-card-section>
        <div class="page-subtitle page-title--no-margin flex items-center">
          <q-icon
            name="sym_o_content_copy"
            class="q-mr-sm"
          />
          Copiar programa individual
          <q-btn
            dense
            flat
            round
            icon="close"
            @click="$emit('close')"
            class="q-ml-auto"
          />
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          bordered
          outlined
          stack-label
          label="Buscar por nombre del beneficiario"
          hide-bottom
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
      <q-list class="q-mb-md">
        <q-item
          v-for="plan in plans"
          :key="plan.id"
          @click="selectedPlan = plan"
          clickable
        >
          <q-item-section>
            <q-item-label>{{ plan.group.candidates[0].first_name }}</q-item-label>
            <q-item-label caption
              >{{ plan.name }} • {{ plan.activities.length }} actividades</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </template>

    <template v-else>
      <q-card-section class="text-center">
        <h2 class="page-title">Seguro que desea copiar el plan?</h2>
        <div class="page-subtitle">{{ selectedPlan.name }}</div>
        <div class="q-mb-md">
          de
          {{
            selectedPlan.group.candidates[0].first_name +
            ' ' +
            selectedPlan.group.candidates[0].last_name
          }}
        </div>

        <q-input
          outlined
          stack-label
          label="Ingresa nombre para la copia del plan"
          v-model="name"
        />

        <div class="flex justify-center q-mt-xl">
          <q-btn
            outline
            color="primary"
            label="Cancelar"
            class="q-mr-md"
            @click="selectedPlan = null"
          />
          <q-btn
            color="primary"
            label="Confirmar copia"
            @click="copy"
          />
        </div>
      </q-card-section>
    </template>
  </q-card>
</template>
