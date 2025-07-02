<script setup>
import { DateTime } from 'luxon'
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import Notify from 'src/utils/notify'

const props = defineProps(['candidates'])
const emits = defineEmits(['close', 'save'])
const loading = ref(false)
const errors = ref({})
const areas = ref([])
const personal = ref([])
const appointment = ref({})

onMounted(async () => {
  areas.value = (await api.get('work_areas')).data.data
  appointment.value.candidate_id = props.candidates.length ? props.candidates[0].id : null
})

async function fetchPersonal() {
  let params = { area: appointment.value.type_id }
  personal.value = (await api.get('personal', { params })).data.data
}

const fulldatetime = computed(() => {
  let newDate = DateTime.fromFormat(date.value + ' ' + time.value, 'dd/MM/yyyy hh:mm')
  return newDate.toISO()
})
const date = ref(DateTime.now().toFormat('dd/MM/yyyy'))
const time = ref(DateTime.now().toFormat('hh:mm'))

async function storeAppointment() {
  try {
    loading.value = true
    errors.value = {}
    let newAppointment = (
      await api.post('appointments', {
        ...appointment.value,
        date: fulldatetime.value
      })
    ).data.data
    Notify.positive('Guardado con exito')
    emits('save', newAppointment)
  } catch (error) {
    console.log(error)
    errors.value = error.formatted ? error.formatted : {}
    Notify.negative('Por favor, valide la informacion')
  }
  loading.value = false
}
</script>

<template>
  <q-card style="width: 500px">
    <q-card-section style="border-bottom: 1px solid #d9d9d9">
      <div class="page-title q-mb-none flex items-center text-primary">
        <q-icon
          name="calendar_today"
          class="q-mr-md"
        ></q-icon>
        Programar Cita
      </div>
    </q-card-section>
    <q-card-section class="q-gutter-y-md">
      <q-select
        outlined
        stack-label
        class="q-field--required"
        label="Candidatos"
        :disable="candidates.length == 1"
        :options="candidates"
        v-model="appointment.candidate_id"
        emit-value
        option-label="full_name"
        option-value="id"
        map-options
      ></q-select>

      <q-select
        outlined
        stack-label
        label="Tipo de cita"
        class="q-field--required"
        :options="areas"
        v-model="appointment.type_id"
        emit-value
        option-label="name"
        option-value="id"
        map-options
        @update:modelValue="fetchPersonal"
      ></q-select>

      <q-select
        outlined
        stack-label
        label="Atendera"
        class="q-field--required"
        :options="personal"
        v-model="appointment.evaluator_id"
        emit-value
        option-label="name"
        option-value="id"
        map-options
      ></q-select>

      <div class="row q-col-gutter-x-md">
        <div class="col-6">
          <q-input
            outlined
            stack-label
            v-model="date"
            class="q-field--required"
            label="Seleccione fecha"
          >
            <template v-slot:append>
              <q-icon
                name="event"
                class="cursor-pointer"
              >
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="date"
                    mask="DD/MM/YYYY"
                  >
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-6">
          <q-input
            outlined
            stack-label
            v-model="time"
            class="q-field--required"
            label="Horario"
          >
            <template v-slot:append>
              <q-icon
                name="access_time"
                class="cursor-pointer"
              >
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time v-model="time">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <q-input
        outlined
        stack-label
        label="Observaciones"
        v-model="appointment.comments"
        type="textarea"
      ></q-input>
    </q-card-section>
    <q-card-section class="flex justify-end">
      <q-btn
        @click="emits('close')"
        class="q-mr-sm"
        unelevated
        outline
        color="primary"
        >Cerrar</q-btn
      >
      <q-btn
        @click="storeAppointment"
        unelevated
        color="primary"
        :loading="loading"
        >Guardar</q-btn
      >
    </q-card-section>
  </q-card>
</template>
