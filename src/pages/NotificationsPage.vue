<script setup>
import { useNotificationStore } from 'src/stores/notification-store';
import { onMounted } from 'vue';
const store = useNotificationStore()
onMounted(() => setTimeout(() => store.markAllAsRead(), 5000))
</script>

<template>
  <h1 class="page-title">Notificaciones</h1>
  <q-list
    bordered
    separator
  >
    <q-item
      v-for="notification in store.notifications"
      :key="notification.id"
    >
      <q-item-section side>
        <q-avatar
          size="42px"
          color="green-1"
          class="q-mr-sm"
        >
          <q-icon
            name="sym_o_calendar_add_on"
            size="28px"
          ></q-icon>
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ notification.data.title }} - {{ notification.data.created_at }}</q-item-label>
        <q-item-label caption>{{ notification.data.description }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          round
          flat
          icon="sym_o_delete"
        ></q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>
