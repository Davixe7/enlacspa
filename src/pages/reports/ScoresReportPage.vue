<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';
onMounted(()=>{
    fetchScores()
})
  async function fetchScores(){
    try {
        planesData.value = (await api.get('scoresreport')).data.data
    } catch (error) {
        console.log(error);
    }
  }

  const columns = [
    { name: 'activity', label: 'Actividad', field: 'activity_name', align: 'left' },
    { name: 'score', label: 'Puntaje', field: 'score', align: 'center', sortable: true },
    { name: 'date', label: 'Fecha', field: 'date', align: 'right' }
  ]
  
   const planesData = ref([])
  </script>
  
  <template>
    <div class="q-pa-md">
      <div v-for="plan in planesData" :key="plan.plan_id" class="q-mb-xl">
        <div class="text-h6 q-mb-sm">{{ plan.plan_name }}</div>
        
        <q-table
          :rows="plan.scores"
          :columns="columns"
          row-key="activity_id"
          flat
          bordered
          :pagination="{rowsPerPage: 0}"
        />
      </div>
    </div>
  </template>
  
