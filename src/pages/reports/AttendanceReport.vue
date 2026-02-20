<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref, watch } from 'vue';
import EnlacDate from 'src/components/EnlacDate.vue'
import BeneficiarySelect from 'src/components/BeneficiarySelect.vue'

const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const candidateId = ref(null)

const loading = ref(false)
const rows = ref([])
const daysCount = ref(0)
const average = ref(0)

async function fetchData() {
    try {
        loading.value = true
        let params = { start_date: startDate.value, end_date: endDate.value }
        if (candidateId.value) params.candidate_id = candidateId.value
        let response = (await api.get('reports/attendances', { params })).data.data
        rows.value = response.rows
        daysCount.value = response.days
        average.value = response.average
    } catch (error) {
        console.log(error);
    }
    finally {
        loading.value = false
    }
}
onMounted(() => fetchData())

watch(candidateId, () => fetchData())
watch(startDate, () => fetchData())
watch(endDate, () => fetchData())
</script>

<template>
    <q-page>
        <h1 class="page-title">Reporte de Asistencias y Faltas Diarias</h1>
        <div class="row q-mb-md">
            <div class="col-md-6 flex items-end">
                <BeneficiarySelect v-model="candidateId" class="q-mr-md" />
                <enlac-date v-model="startDate" class="q-mr-md" />
                <enlac-date v-model="endDate" />
            </div>
        </div>
        <q-markup-table>
            <thead>
                <tr>
                    <th class="text-left">Nombre del beneficiario</th>
                    <th class="text-left">Total de días laborados</th>
                    <th class="text-left">Asistencias diarias</th>
                    <th class="text-left">Faltas justificadas diarias</th>
                    <th class="text-left">Faltas injustificadas diarias</th>
                    <th class="text-left">% Asistencia</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in rows" :key="row.candidate_id">
                    <td>{{ row.full_name }}</td>
                    <td>{{ daysCount }}</td>
                    <td>{{ row.present }}</td>
                    <td>{{ row.justified }}</td>
                    <td>{{ row.unjustified }}</td>
                    <td>{{ row.percentage }} %</td>
                </tr>
                <tr>
                    <td colspan="5"></td>
                    <td>{{ average }} %</td>
                </tr>
            </tbody>
        </q-markup-table>
    </q-page>
</template>