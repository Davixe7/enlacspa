<script setup>
import { useCandidateStore } from 'src/stores/candidate-store';
import { onMounted } from 'vue';

const props = defineProps(['candidateId'])
const candidateStore = useCandidateStore()

onMounted(async () => {
  candidateStore.id = props.candidateId
  candidateStore.fetchCandidate()
})
</script>

<template>
  <div style="border: 1px solid #d9d9d9; border-radius: 8px;">
    <div
      class="row q-gutter-x-xl"
      v-if="false"
    >
      <div class="form-group">
        <div class="form-label">Nombre del beneficiario</div>
        <div class="form-value">{{ candidateStore.full_name }}</div>
      </div>

      <div class="form-group">
        <div class="form-label">Fecha de ingreso</div>
        <div class="form-value">{{ candidateStore.entry_date }}</div>
      </div>

      <div class="form-group">
        <div class="form-label">Folio</div>
        <div class="form-value">{{ candidateStore.sheet }}</div>
      </div>
    </div>

    <div
      class="row q-gutter-x-xl"
      v-if="false"
    >
      <div class="form-group">
        <div class="form-label">Responsable del beneficiario</div>
        <div
          class="form-value"
          v-if="candidateStore.contacts.length"
        >{{ candidateStore.contacts[0].first_name + ' ' + candidateStore.contacts[0].last_name }}</div>
      </div>

      <div class="form-group">
        <div class="form-label">Parentesco</div>
        <div
          class="form-value"
          v-if="candidateStore.contacts.length"
        >{{ candidateStore.contacts[0].relationship }}</div>
      </div>

      <div class="form-group">
        <div class="form-label">Programa</div>

      </div>
    </div>

    <div class="flex">
      <div>
        <q-img
          width="120px"
          height="140px"
          color="grey"
          class="bg-grey-4"
          style="object-fit: contain;"
          position="top center"
          :src="candidateStore.picture"
        ></q-img>
      </div>
      <div>
        <table>
          <tbody>
            <tr>
              <th>Nombre del beneficiario</th>
              <td>{{ candidateStore.full_name }}</td>
              <th>Fecha de ingreso</th>
              <td>{{ candidateStore.onboard_at }}</td>
              <th>Folio</th>
              <td>{{ candidateStore.sheet }}</td>
            </tr>

            <tr>
              <th>Responsable del beneficiario</th>
              <td>{{ candidateStore.contacts[0]?.first_name + ' ' + candidateStore.contacts[0]?.last_name }}</td>
              <th>Parentesco</th>
              <td>{{ candidateStore.contacts[0]?.relationship }}</td>
              <th>Programa</th>
              <td>
                <div style="max-width: 180px;">{{ candidateStore.program?.name }}</div>
              </td>
            </tr>

            <tr>
              <th>Celular</th>
              <td>{{ candidateStore.contacts[0]?.whatsapp }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 0 16px;
}

td {
  padding: 6px 16px;
}

td,
th {
  border: 1px solid #d9d9d9;
  height: 40px;
}

tr:first-child td,
tr:first-child th {
  border-top: none;
}

tr:last-child td,
tr:last-child th {
  border-bottom: none;
}
</style>
