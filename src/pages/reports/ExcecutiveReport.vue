<script setup>
import { api } from 'src/boot/axios';
import { computed, onMounted, ref } from 'vue';
import EnlacDate from 'src/components/EnlacDate.vue'

const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const loading = ref(false)
const rows = ref([])

async function fetchData() {
    try {
        loading.value = true
        let params = { start_date: startDate.value, end_date: endDate.value }
        rows.value = (await api.get('reports/excecutive', { params })).data.data
    } catch (error) {
        console.log(error);
    }
    finally {
        loading.value = false
    }
}


const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const columns = computed(() => {
    let cols = [
        { align: 'left', name: 'full_name', label: 'Beneficiario', field: 'full_name' },
        { align: 'left', name: 'present', label: 'Asistencias', field: 'present' },
        { align: 'left', name: 'justified', label: 'Faltas Justificadas', field: 'justified' },
        { align: 'left', name: 'unjustified', label: 'Faltas Injustificadas', field: 'unjustified' },
        { align: 'left', name: 'issues', label: 'Incidencias', field: 'issues' },
        { align: 'left', name: 'rubio', label: 'Traslados Cuauhtémoc-Rubio', field: 'rubio' },
        { align: 'left', name: 'equine', label: 'Traslados Equinoterapia', field: 'equine' },
    ]
    for (let i = 1; i < 13; i++) {
        let monthKey = i.toString().padStart(2, '0');
        cols.push({
            align: 'left',
            name: mesesNombres[i - 1],
            label: mesesNombres[i - 1],
            field: row => row.months[monthKey] ?? { positive: 0, warning: 0, negative: 0 }
        })
    }
    return cols;
})

onMounted(() => fetchData())
</script>

<template>
    <q-page>
        <h1 class="page-title">Reporte Ejecutivo</h1>
        <div class="row q-mb-md">
            <div class="col-md-4 flex">
                <EnlacDate v-model="startDate" class="q-mr-md" />
                <EnlacDate v-model="endDate" class="q-mr-md" />
                <q-btn color="primary" unelevated icon="sym_o_search" @click="fetchData" :loading="loading"
                    label="Buscar" />
            </div>
        </div>

        <q-table :columns="columns" :rows="rows">
            <template v-for="mes in mesesNombres" :key="mes" v-slot:[`body-cell-${mes}`]="props">
                <q-td :props="props">
                    <div v-if="props.value.positive > 0 || props.value.warning > 0 || props.value.negative > 0"
                        class="row no-wrap q-gutter-x-xs">

                        <q-badge color="positive" outline :label="props.value.positive" />
                        <q-badge color="warning" outline text-color="orange-10" :label="props.value.warning" />
                        <q-badge color="negative" outline :label="props.value.negative" />

                    </div>
                    <div v-else class="text-grey-4">-</div>
                </q-td>
            </template>
        </q-table>
    </q-page>
</template>

<style scoped>
.q-badge {
    min-width: 28px;
    justify-content: center;
}
</style>