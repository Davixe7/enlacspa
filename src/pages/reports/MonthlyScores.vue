<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const props = defineProps(['candidateId'])
const startDate = ref('2026-01-01')
const endDate = ref('2026-02-28')
const plans = ref({})
const loading = ref(false)

async function fetchScores() {
    try {
        loading.value = true
        let params = {
            start_date: startDate.value,
            end_date: endDate.value
        }
        plans.value = (await api.get(`beneficiaries/${props.candidateId}/reports/monthly`, { params })).data.data
    } catch (error) {
        console.log(error);
    }
    finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchScores()
})
</script>

<template>
    <h1 class="page-title">Reporte Mensual</h1>

    <template v-for="plan in plans" :key="plan.id">
        <h2 class="page-title">{{ plan.category.label }} / {{ plan.name }}</h2>
        <q-markup-table class="q-mb-lg monthly-scores-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th v-for="activity in plan.activities" :key="activity.id">
                        {{ activity.name }}\{{ activity.goal_type }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="n in plan.activities[0].scores.length" :key="n">
                    <td>{{ plan.activities[0].scores[n - 1].date }}</td>
                    <td v-for="activity in plan.activities" :key="activity.id"
                        :class="`text-${activity.scores[n - 1].color}`">
                        {{ activity.scores[n - 1].score }} /
                        {{ activity.pivot.daily_goal }}
                    </td>
                </tr>
                <tr>
                    <td>Numero de días</td>
                    <td v-for="n in plan.activities.length" :key="n">
                        Total
                    </td>
                </tr>
                <tr>
                    <td>{{ plan.activities[0].scores.length }}</td>
                    <td v-for="activity in plan.activities" :key="activity.id">
                        {{ activity.total }}
                    </td>
                </tr>
            </tbody>
        </q-markup-table>
    </template>

</template>

<style>
.monthly-scores-table td {
    text-align: center;
}
</style>