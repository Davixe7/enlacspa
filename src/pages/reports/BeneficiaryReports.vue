<script setup>
import { ref, defineAsyncComponent, computed } from 'vue';
import DailyReport from './DailyReport.vue';

const MonthlyReport = defineAsyncComponent(() => import('./MonthlyReport.vue'))
defineProps(['candidateId'])
const mode = ref('daily')

const modeLabel = computed(() => mode.value == 'daily' ? 'Diario' : 'Mensual')
const currentComponent = computed(() => mode.value === 'daily' ? DailyReport : MonthlyReport)

</script>

<template>
    <div class="flex items-center q-mb-lg">
        <h1 class="page-title" style="margin-bottom: 0;">Reporte {{ modeLabel }} del beneficiario</h1>
        <q-btn flat class="q-ml-auto">
            Criterios de Semáforo
            <q-icon name="info" color="warning" class="q-ml-md" />
        </q-btn>
    </div>

    <div class="row q-mb-lg">
        <div class="col-md-6">
            <q-radio v-model="mode" label="Diario" :val="'daily'" />
            <q-radio v-model="mode" label="Mensual" :val="'monthly'" />
        </div>
    </div>

    <component :is="currentComponent" :candidateId="candidateId" />

</template>