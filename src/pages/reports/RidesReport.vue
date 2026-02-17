<script setup>
import { api } from 'src/boot/axios';
import { computed, ref } from 'vue';
import EnlacDate from 'src/components/EnlacDate.vue';

const loading = ref(false)
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const rawRows = ref([])
const rows = computed(() => {
    const newRows = []

    rawRows.value.forEach(row => {
        if (row.departure_time) {
            newRows.push({
                ...row,
                destino: 'ENLAC',
                rowId: `${row.id}-ida`
            })
        }
        if (row.return_time) {
            newRows.push({
                ...row,
                destino: 'DOMICILIO',
                rowId: `${row.id}-regreso`
            })
        }
    })

    return newRows
})

const columns = [
    {
        name: 'date',
        label: 'Fecha',
        field: 'date',
        align: 'left',
        sortable: true
    },
    {
        name: 'candidate_name',
        label: 'Beneficiario',
        field: row => row.candidate?.full_name || 'N/A',
        align: 'left'
    },
    {
        name: 'curp',
        label: 'CURP del Beneficiario',
        field: row => row.candidate?.location_detail?.curp || 'N/A',
        align: 'left'
    },
    {
        name: 'address',
        label: 'Localidad o Domicilio',
        field: row => row.candidate?.location_detail?.transport_address || 'Sin dirección',
        align: 'left'
    },
    {
        name: 'destino',
        label: 'Destino',
        field: 'destino',
        align: 'center',
        format: val => val.toUpperCase()
    }
]

async function fetchRides() {
    try {
        loading.value = true
        let params = {
            type: 'rubio',
            start_date: startDate.value,
            end_date: endDate.value
        }
        rawRows.value = (await api.get('rides', { params })).data.data
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <q-page>
        <h1 class="page-title q-mb-md">
            Bitácora de Servicios de Traslados
        </h1>

        <div class="q-ml-auto flex q-mb-md">
            <EnlacDate v-model="startDate" class="q-mr-md" />
            <EnlacDate v-model="endDate" class="q-mr-md" />
            <q-btn icon="sym_o_search" color="primary" unelevated @click="fetchRides" :loading="loading" />
        </div>

        <q-table :rows="rows" :columns="columns"></q-table>
    </q-page>
</template>