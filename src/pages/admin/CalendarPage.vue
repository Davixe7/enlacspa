<script setup>
// import Notify from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import { QCalendarDay } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/index.css'
// import candidates from 'src/router/candidates';
var loading = ref(true)
const dialog = ref(false)
const selectedEvent = ref(null)
function openEventDialog(event) {
  selectedEvent.value = event
  // console.log("selectEvent: ", selectedEvent.value.candidate_id);

  dialog.value = true
}
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const nowDate = ref(new Date().toISOString().slice(0, 10))
const events = ref([
  {
    id: null,
    candidate_id: null,
    title: '',
    details: '',
    start: '',
    date: '',
    color: 'orange',
    status: '',
    appointment_type: null
  }
])

function getMonthYear(dateStr) {
  const date = new Date(dateStr)
  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ]
  return `${meses[date.getMonth()]} ${date.getFullYear()}`
}

function addDays(dateStr, days) {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function prevWeek() {
  selectedDate.value = addDays(selectedDate.value, -7)
}

async function fetchEvents() {
  try {
    loading.value = true
    // let params = { selectedDate: selectedDate.value }
    events.value = (await api.get('events')).data.data
    //console.log(events.value)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

function nextWeek() {
  selectedDate.value = addDays(selectedDate.value, 7)
}
const onChange = (event) => {
  console.log('Value changed!', event)
}
const onMoved = (event) => {
  console.log('View moved!', event)
}
const onClickDate = (event) => {
  console.log('Clicked date!', event)
}
const onClickTime = (event) => {
  console.log('Clicked time!', event)
}
const onClickInterval = (event) => {
  console.log('Clicked interval!', event)
}
const onClickHeadIntervals = (event) => {
  console.log('Clicked head intervals!', event)
}
const onClickHeadDay = (event) => {
  console.log('Clicked head day!', event)
}

function getEventStyle(event) {
  // Asume que el calendario muestra de 00:00 a 24:00 (24 horas)
  // console.log("Calculating style for event:", event.start);
  const start = event.start.split(' ')[1]
  // console.log("Event start time:", start);
  // if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(start)) return {};
  const [h, m] = start.split(':').map(Number)
  // console.log(`Event time: ${h}:${m}`);
  const hourStart = 0
  const hourEnd = 24
  const totalHours = hourEnd - hourStart
  const minutesFromStart = (h - hourStart) * 60 + m
  const top = Math.max(0, (minutesFromStart / (totalHours * 60)) * 100)
  const height = 6 // px, badge height
  return {
    top: `calc(${top}% - ${height / 2}px)`
  }
}
const getEvents = (date) => {
  // console.log("Getting events for date:", date);
  return events.value.filter((event) => {
    // console.log("Checking event:", event.start.split(' ')[0], "against date:", date);
    return event.start.split(' ')[0] === date
  })
}
onMounted(async () => {
  await fetchEvents()
})
</script>

<template>
  <div
    class="calendar-page row q-col-gutter-md"
    :loading="loading"
  >
    <div class="col-12">
      <div
        class="calendar-nav"
        style="display: flex; gap: 1rem; align-items: center"
      >
        <q-btn
          color="primary"
          label="<"
          @click="prevWeek"
        />
        <q-btn
          color="primary"
          label=">"
          @click="nextWeek"
        />
        <span style="font-size: 1.5rem">{{ getMonthYear(selectedDate) }}</span>
      </div>
    </div>
    <div class="col-9">
      <div class="subcontent">
        <div class="row justify-center">
          <div style="display: flex; width: 100%; height: 500px">
            <q-calendar-day
              ref="calendar"
              v-model="selectedDate"
              view="week"
              locale="es-ES"
              :now="nowDate"
              :loading="loading"
              animated
              bordered
              transition-next="slide-left"
              transition-prev="slide-right"
              @change="onChange"
              @moved="onMoved"
              @click-date="onClickDate"
              @click-time="onClickTime"
              @click-interval="onClickInterval"
              @click-head-intervals="onClickHeadIntervals"
              @click-head-day="onClickHeadDay"
            >
              <template #day-body="{ scope }">
                <div
                  v-for="event in getEvents(scope.timestamp.date)"
                  :key="event.id"
                  class="calendar-event-badge"
                  :style="getEventStyle(event)"
                >
                  <q-badge
                    :color="event.color"
                    class="q-mb-xs q-mr-xs"
                  >
                    {{ event.title }}
                    {{
                      event.type_id == 1
                        ? ' (Médica)'
                        : event.type_id == 2
                          ? ' (Psicología)'
                          : event.type_id == 3
                            ? ' (Nutrición)'
                            : ' (Otra)'
                    }}
                  </q-badge>
                </div>
              </template>
            </q-calendar-day>
          </div>
        </div>
      </div>
    </div>
    <div class="col-3">
      <div class="calendar-sidebar">
        <h4 class="sidebar-title">Próximas Citas</h4>
        <ul class="sidebar-list">
          <li
            v-for="event in events"
            :key="event.id"
            class="sidebar-list-item"
            @click="openEventDialog(event)"
            style="cursor: pointer"
          >
            <div
              v-if="event.status == 'pending'"
              class="sidebar-event-date"
            >
              {{ event.date }}
              <!-- {{ event.start.split(' ')[1] }} -->
            </div>
            <div
              v-if="event.status == 'pending'"
              class="sidebar-event-time"
            >
              {{ event.title }}<br /><span>{{ event.details }}</span
              >{{
                event.type_id == 1
                  ? ' (Área: Médica)'
                  : event.type_id == 2
                    ? ' (Área: Psicología)'
                    : event.type_id == 3
                      ? ' (Área: Nutrición)'
                      : ' (Otra)'
              }}
            </div>
          </li>
          <q-dialog v-model="dialog">
            <q-card
              v-if="selectedEvent"
              style="min-width: 350px; max-width: 420px; text-align: center"
            >
              <q-card-section style="border-bottom: 1px solid #d9d9d9">
                <div class="page-title q-mb-none flex items-center text-primary">
                  <q-icon
                    name="calendar_today"
                    class="q-mr-md"
                  ></q-icon>
                  Cita
                </div>
              </q-card-section>
              <q-card-section class="q-gutter-y-md">
                <!-- Nombre del beneficiario -->
                <div style="font-size: 1.2rem; font-weight: 400; margin-bottom: 30px">
                  {{ selectedEvent.title || 'Nombre Completo del Beneficiario' }}
                </div>
                <!-- Botones -->
                <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: 32px">
                  <q-btn
                    class="q-mr-sm"
                    unelevated
                    outline
                    color="primary"
                    v-if="
                      selectedEvent.appointment_type == 2 || selectedEvent.appointment_type == 0
                    "
                    :to="{
                      path: `/historia-clinica/${selectedEvent.candidate_id}`,
                      query: {
                        type_id: `${selectedEvent.type_id}`, //Work area id
                        id: `${selectedEvent.id}`,
                        appointment_type: 0, // 0 = Cita, 1 = Seguimiento
                        ro: 0
                      }
                    }"
                    >Historia Clínica General</q-btn
                  >
                  <q-btn
                    class="q-mr-sm"
                    unelevated
                    outline
                    color="primary"
                    v-if="
                      selectedEvent.appointment_type == 2 || selectedEvent.appointment_type == 1
                    "
                    :to="{
                      path: `/soap/${selectedEvent.candidate_id}`,
                      query: {
                        type_id: `${selectedEvent.type_id}`, //Work area id
                        id: `${selectedEvent.id}`,
                        appointment_type: 1, // 0 = Cita, 1 = Seguimiento
                        ro: 0
                      }
                    }"
                    >Seguimiento</q-btn
                  >
                </div>
              </q-card-section>
            </q-card>
          </q-dialog>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-sidebar {
  min-height: 500px;
  height: 500px;
  overflow: auto;
}

.sidebar-title {
  font-weight: semi-bold;
  font-size: 1.2rem;
  line-height: 0;
}

.sidebar-list {
  list-style: none;
  padding-left: 0;
}

.sidebar-list-item {
  margin-bottom: 1.1rem;
}

.sidebar-event-date {
  font-weight: semi-bold;
}

.sidebar-event-time {
  color: #555;
}

.calendar-event-badge {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  pointer-events: none;
  z-index: 2;
}
</style>
