<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const links = ref([
    { label: 'Tablero de Indicadores Operativos', path: 'reportes/operativo' },
    { label: 'Reporte de Asistencias y Faltas Diarias', path: 'reportes/asistencias' },
    { label: 'Reporte Ejecutivo', path: 'reportes/ejecutivo' },
    { label: 'Bitácora Individual del Beneficiario', path: 'reportes/individual' },
    { label: 'Reporte de Incidencias', path: 'reportes/incidencias' },
    { label: 'Bitácora de Servicios y Traslados', path: 'reportes/traslados/rubio' }
])

const router = useRouter()
</script>

<template>
    <q-page>
        <h1 class="page-title">
            Reportes de Programas
        </h1>
        <div class="row q-col-gutter-md">
            <div class="col-md-6" v-for="link in links" :key="link.path">
                <q-card style="cursor: pointer;" clickable @click="router.push(link.path)">
                    <q-card-section>
                        {{ link.label }}
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>