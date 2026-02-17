<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';
import EnlacDate from 'src/components/EnlacDate.vue';
import notify from 'src/utils/notify';

const props = defineProps(['candidateId'])
const loading = ref(false)
const rows = ref([])
const attendance = ref(null)
const date = ref(new Date().toISOString().split('T')[0])
const attendanceDialog = ref(false)

const columns = [
    { align: 'left', name: 'area_name', label: 'Area', field: 'area_name' },
    { align: 'left', name: 'status', label: 'STATUS' },
    { align: 'left', name: 'date', label: 'Fecha', field: 'attendance_date' },
    { align: 'left', name: 'justified', label: 'Justificada', field: row => row.absence_justification_type ? 'Si' : 'No' },
    { align: 'left', name: 'absence_justification_type', label: 'Tipo', field: row => row.absence_justification_type ?? 'N/A' },
    { align: 'right', name: 'actions' },
]


async function fetchAttendances() {
    console.log('Consultando asistencias del dia para ' + props.candidateId);

    try {
        let params = {
            candidate_id: props.candidateId,
            date: date.value
        }
        loading.value = true
        rows.value = (await api.get('reports/attendances/daily', { params })).data.data
    } catch (error) {
        console.log(error);
    }
    finally {
        loading.value = false
    }
}

async function updateAttendance() {
    try {
        loading.value = true
        let data = { absence_justification_type: attendance.value.absence_justification_type, _method: 'PUT' }
        await api.post(`attendances/${attendance.value.attendance_id}`, data)
        attendanceDialog.value = false
        fetchAttendances()
        notify.positive('Justicada con exito')
    } catch (error) {
        console.log(error)
        notify.positive('No se pudo actualizar')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    console.log('Fetching attendances');

    fetchAttendances()
})
</script>

<template>
    <div>
        <h1 class="page-title">Asistencias por Área</h1>
        <q-table hide-bottom :columns="columns" :rows="rows" class="q-mb-xl">
            <template v-slot:body-cell-status="props">
                <q-td>
                    <q-badge :color="props.row.attendance_status == 'present' ? 'positive' : 'negative'"
                        :label="props.row.attendance_status == 'present' ? 'Asistente' : 'Ausente'" />
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td class="flex justify-end">
                    <q-btn :disable="props.row.attendance_status == 'present'" dense flat round icon="sym_o_edit"
                        @click="() => { attendance = props.row; attendanceDialog = true }" />
                </q-td>
            </template>
        </q-table>

        <q-dialog v-model="attendanceDialog">
            <q-card style="width: 480px">
                <q-card-section>
                    <div class="flex items-center">
                        <div class="page-title q-mb-none">Justificar inasistencia</div>
                        <q-btn dense flat round icon="sym_o_close" @click="attendanceDialog = false"
                            class="q-ml-auto" />
                    </div>
                </q-card-section>
                <q-form @submit.prevent="updateAttendance">
                    <q-markup-table flat bordered separator="cell">
                        <tbody>
                            <tr>
                                <th>Fecha:</th>
                                <td>
                                    <enlac-date v-model="attendance.date" />
                                </td>
                            </tr>
                            <tr>
                                <th>Justificada:</th>
                                <td>
                                    {{ attendance.absence_justification_type == null ? 'No' : 'Si' }}
                                </td>
                            </tr>
                            <tr>
                                <th>Tipo:</th>
                                <td>
                                    <q-select outlined dense v-model="attendance.absence_justification_type"
                                        :options="['Enfermedad', 'Citas Medicas', 'Vacaciones', 'Tramite Legal', 'Otra']" />
                                </td>
                            </tr>
                            <tr>
                                <th>Comentarios:</th>
                                <td>
                                    <q-input outlined type="textarea"></q-input>
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div class="flex justify-end q-pa-md">
                        <q-btn type="submit" color="primary" :loading="loading" label="Guardar" />
                    </div>
                </q-form>
            </q-card>
        </q-dialog>
    </div>
</template>