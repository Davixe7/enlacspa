<script setup>
import { api } from 'src/boot/axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const selectedCandidate = ref(55)
const candidateData = ref({})
const month = ref(1)

const issuesCount = ref(null)
const attendances = ref({})
const periodLabel = ref(null)
const daysCount = ref(null)
const rides = ref({})
const areaAttendances = ref([])
const appointments = ref([])
const totalsRow = ref({})
const scores = ref([])

const loading = ref(false)
const months = [
    { "label": "Enero", "value": 1 },
    { "label": "Febrero", "value": 2 },
    { "label": "Marzo", "value": 3 },
    { "label": "Abril", "value": 4 },
    { "label": "Mayo", "value": 5 },
    { "label": "Junio", "value": 6 },
    { "label": "Julio", "value": 7 },
    { "label": "Agosto", "value": 8 },
    { "label": "Septiembre", "value": 9 },
    { "label": "Octubre", "value": 10 },
    { "label": "Noviembre", "value": 11 },
    { "label": "Diciembre", "value": 12 }
]

const monthOptions = [...months].splice(0, 7)

const mapMonthLabels = computed(() => {
    let monthLabels = {}
    let start = month.value - 1
    let end = month.value + 5

    for (let i = start; i < end; i++) {
        monthLabels[`m${i}`] = months[i].label
    }
    return monthLabels
})

async function fetchCandidateData() {
    try {
        loading.value = true
        let params = {
            month: month.value,
        }
        let response = (await api.get(`beneficiaries/${selectedCandidate.value}/individual`, { params })).data.data
        candidateData.value = response.candidate
        issuesCount.value = response.issues
        attendances.value = response.attendances
        areaAttendances.value = response.areaAttendances
        periodLabel.value = response.periodLabel
        daysCount.value = response.daysCount
        rides.value = response.rides
        appointments.value = response.appointments
        totalsRow.value = response.totalsRow

    } catch (error) {
        console.log(error);
    }
    finally {
        loading.value = false
    }
}

async function fetchScores() {
    try {
        loading.value = true
        let params = {
            month: month.value,
        }
        scores.value = (await api.get(`beneficiaries/${selectedCandidate.value}/scores`, { params })).data.data
    } catch (error) {
        console.log(error);
    }
    finally {
        loading.value = false
    }
}

const ridesTypeLabels = {
    'equine': 'Traslados a equinoterapia',
    'rubio': 'Traslados de Cuauhtemoc - Rubio'
}

const appointmentTypes = [
    { id: 1, label: 'Consultas Médicas' },
    { id: 2, label: 'Consultas Psicología' },
    { id: 3, label: 'Consultas Nutrición' }
];

const planCategories = ref([])

onMounted(async () => {
    if (route.params.candidate_id) {
        selectedCandidate.value = route.params.candidate_id
        fetchCandidateData()
    }
    planCategories.value = (await api.get('plan_categories/?base_only=1')).data.data
    planCategories.value.push({ label: 'Totals', id: 'totals' })
})
</script>

<template>
    <q-page>
        <h1 class="page-title q-mb-lg">Bitácora Individual del Beneficiario</h1>
        <div class="flex items-end q-mb-md">
            <q-select outlined :options="monthOptions" v-model="month" label="Primer mes a mostrar" emit-value
                map-options class="q-mr-md" style="min-width: 230px;" />
            <q-btn color="primary" unelevated icon="sym_o_search" :loading="loading"
                @click="() => { fetchCandidateData(); fetchScores() }" />
        </div>
        <q-markup-table class="q-mb-lg" separator="vertical" flat bordered>
            <thead>
                <tr>
                    <th colspan="8" class="text-center">Datos Base</th>
                </tr>
            </thead>
            <tr>
                <th>Nombre:</th>
                <td>{{ candidateData.full_name }}</td>
                <th>Fecha de Ingreso:</th>
                <td>{{ candidateData.entry_date }}</td>
                <th>Folio:</th>
                <td>{{ candidateData.id }}</td>
            </tr>
            <tr>
                <th>Responsable ENLAC:</th>
                <td>{{ candidateData.enlac_responsible?.full_name }}</td>
                <th>Programa:</th>
                <td>{{ candidateData.program?.name }}</td>
                <th>Grupo:</th>
                <td>?</td>
            </tr>
            <tr>
                <th>Periodo que Reporta:</th>
                <td>{{ periodLabel }}</td>
                <th>Total de Días Laborados:</th>
                <td>{{ daysCount }}</td>
                <th>Total de Asistencias Diarias</th>
                <td>{{ attendances.present }}</td>
            </tr>
            <tr>
                <th>Total de Faltas Justificadas Diarias</th>
                <td>{{ attendances.justified }}</td>
                <th>Total de Faltas Injustificadas Diarias:</th>
                <td>{{ attendances.unjustified }}</td>
                <th>Total de incidencias:</th>
                <td>{{ issuesCount }}</td>
            </tr>
        </q-markup-table>

        <q-markup-table class="q-mb-lg">
            <thead>
                <tr>
                    <th colspan="8" class="text-center">Resumen de Traslados</th>
                </tr>
            </thead>
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th v-for="m in Object.values(mapMonthLabels)" :key="m">{{ m }}</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="type in Object.keys(ridesTypeLabels)" :key="type">
                    <td>
                        {{ ridesTypeLabels[type] }}
                    </td>
                    <template v-if="rides[type]">
                        <td v-for="n in 6" :key="n">
                            {{ rides[type][`m${n}`] }}
                        </td>
                        <td>
                            {{ rides[type]['total'] }}
                        </td>
                    </template>
                    <template v-else>
                        <td v-for="n in 6" :key="n">
                            N/A
                        </td>
                    </template>
                </tr>
            </tbody>
        </q-markup-table>

        <q-markup-table class="q-mb-lg">
            <thead>
                <tr>
                    <th colspan="8" class="text-center">Sesiones, Claes o Consultas Recibidas</th>
                </tr>
            </thead>
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th v-for="m in Object.values(mapMonthLabels)" :key="m">{{ m }}</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="category in planCategories" :key="category.id">
                    <td>
                        {{ category.label }}
                    </td>
                    <template v-if="areaAttendances[category.id]">
                        <td v-for="n in 6" :key="n">
                            {{ areaAttendances[category.id][`m${n}`] }}
                        </td>
                        <td>
                            {{ areaAttendances[category.id]['total'] }}
                        </td>
                    </template>
                    <template v-else>
                        <td v-for="n in 7" :key="n">
                            N/A
                        </td>
                    </template>
                </tr>

                <tr v-for="appointmentType in appointmentTypes" :key="appointmentType.id">
                    <td>
                        {{ appointmentType.label }}
                    </td>
                    <template v-if="appointments[appointmentType.id]">
                        <td v-for="n in 6" :key="n">
                            {{ appointments[appointmentType.id][`m${n}`] }}
                        </td>
                        <td>
                            {{ appointments[appointmentType.id]['total'] }}
                        </td>
                    </template>
                    <template v-else>
                        <td v-for="n in 7" :key="n">
                            N/A
                        </td>
                    </template>
                </tr>

                <tr>
                    <th class="text-right">Total</th>
                    <td v-for="value in Object.values(totalsRow)" :key="value">
                        {{ value }}
                    </td>
                    <td></td>
                </tr>
            </tbody>
        </q-markup-table>

        <q-markup-table v-if="scores">
            <thead>
                <tr>
                    <th colspan="8" class="text-center">Resultados</th>
                </tr>
                <tr>
                    <th>Area</th>
                    <th v-for="m in Object.values(mapMonthLabels)" :key="m">{{ m }}</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="category in planCategories" :key="category.id">
                    <td>{{ category.label }}</td>
                    <template v-if="scores.hasOwnProperty(category.id)">
                        <td v-for="n in 6" :key="n">
                            <q-badge color="positive">{{ scores[category.id][n].positive }}</q-badge>
                            <q-badge color="warning">{{ scores[category.id][n].warning }}</q-badge>
                            <q-badge color="negative">{{ scores[category.id][n].negative }}</q-badge>
                        </td>
                        <td v-if="category.id != 'totals'">
                            <q-badge color="positive">{{ scores[category.id]['total'].positive }}</q-badge>
                            <q-badge color="warning">{{ scores[category.id]['total'].warning }}</q-badge>
                            <q-badge color="negative">{{ scores[category.id]['total'].negative }}</q-badge>
                        </td>
                    </template>
                    <template v-else>
                        <td v-for="n in 7" :key="n">
                            <!-- <q-badge color="positive">0</q-badge>
                            <q-badge color="warning">0</q-badge>
                            <q-badge color="negative">0</q-badge> -->
                        </td>
                    </template>
                </tr>
            </tbody>
        </q-markup-table>
    </q-page>
</template>

<style scoped>
th {
    text-align: left;
}

th.text-center {
    text-align: center;
}
</style>