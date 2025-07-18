<script setup>
import { watch, onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import ContactForm from './ContactForm.vue'
import { useContactStore } from 'src/stores/contact-store'

const contactStore = useContactStore()
const firstContactErrors = ref({})
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  readonly: { type: Boolean, default: false },
  candidateId: {
    type: [Number, String, null],
    required: true,
    default: null,
    nullable: true
  },
  errors: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

onMounted(async () => {
  await fetchContacts()
  contact.value = contacts.value[0]
  emits('update:modelValue', [...contacts.value])
})

watch(
  () => props.errors,
  (newValue) => {
    let errors = {}
    if (newValue.contacts) {
      errors.contacts = 'Debe incluir al menos 1 contacto.'
    }
    Object.keys(props.errors)
      .filter((errorKey) => errorKey.includes(`contacts.0.`))
      .map((errorKey) => ({ old: errorKey, new: errorKey.replace(`contacts.0.`, '') }))
      .map((errorKey) => (errors[errorKey.new] = props.errors[errorKey.old]))
    firstContactErrors.value = { ...errors }
  }
)

async function fetchContacts() {
  loading.value = true
  try {
    contacts.value = (await api.get(`/contacts?candidate_id=${props.candidateId}`)).data.data
    if (contacts.value.length != 0) {
      return
    }
    contacts.value.push({ ...defaultContact.value })
  } catch (error) {
    console.log(error)
  }
  loading.value = false
}

async function addContact() {
  if (contacts.value.length != 1) {
    contact.value = { ...defaultContact.value }
    dialog.value = true
    return
  }

  firstContactErrors.value = {}
  if (!(await contactStore.validate(contacts.value[0]))) {
    firstContactErrors.value = { ...contactStore.errors }
    contactStore.errors = {}
    return
  }

  contact.value = { ...defaultContact.value }
  dialog.value = true
}

async function setContact(target) {
  contact.value = target
  dialog.value = true
}

async function saveContact(newValue) {
  if (contacts.value.includes(contact.value)) {
    contacts.value.splice(contacts.value.indexOf(contact.value), 1, newValue)
  } else {
    contacts.value.push(newValue)
  }
  contact.value = newValue
  emits('update:modelValue', [...contacts.value])
  dialog.value = false
}

async function removeContact(target) {
  if (!target.id) {
    contacts.value.splice(contacts.value.indexOf(target), 1)
    return
  }

  try {
    await api.post(`contacts/${target.id}`, { _method: 'DELETE' })
    contacts.value.splice(contacts.value.indexOf(target), 1)
  } catch (error) {
    console.log(error)
  }
}

const loading = ref(false)
const dialog = ref(false)
const contacts = ref([])
const contact = ref(null)
const defaultContact = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  relationship: '',
  legal_guardian: 0,
  enlac_responsible: 0,
  email: '',
  whatsapp: '',
  home_phone: '',
  street: '5',
  neighborhood: '',
  state: '',
  postal_code: '',
  exterior_number: '0',
  city: '',
  country: ''
})
const columns = ref([
  {
    name: 'full_name',
    required: true,
    label: 'Nombre Completo',
    align: 'left',
    field: (row) => `${row.first_name} ${row.middle_name} ${row.last_name}`,
    format: (val) => val,
    sortable: true
  },
  {
    name: 'state',
    label: 'Estado',
    align: 'left',
    field: 'state',
    format: (val) => val,
    sortable: true
  },
  {
    name: 'city',
    label: 'Ciudad',
    align: 'left',
    field: 'city',
    format: (val) => val,
    sortable: true
  },
  {
    name: 'legal_guardian',
    label: 'Tutor Legal',
    align: 'left',
    field: 'legal_guardian',
    format: (val) => (val === 1 ? 'Sí' : 'No'),
    sortable: true
  },
  {
    name: 'enlac_responsible',
    label: 'Responsable Enlac',
    align: 'left',
    field: 'enlac_responsible',
    format: (val) => (val === 1 ? 'Sí' : 'No'),
    sortable: true
  },
  {
    name: 'actions',
    align: 'right',
    sortable: false
  }
])
</script>

<template>
  <ContactForm
    v-if="contacts.length <= 1 && contact && !dialog"
    :candidate-id="props.candidateId"
    :model-value="contacts[0]"
    :errors="firstContactErrors"
    @update:modelValue="saveContact"
    hide-bottom-space
  >
  </ContactForm>

  <template v-else>
    <div class="page-title">Datos del Contacto</div>
    <q-table
      bordered
      flat
      :columns="columns"
      :rows="contacts"
    >
      <template v-slot:body-cell-actions="props">
        <q-td class="text-right">
          <q-btn
            flat
            round
            icon="edit"
            @click="setContact(contacts[props.rowIndex])"
          ></q-btn>
          <q-btn
            flat
            round
            icon="delete"
            @click="removeContact(contacts[props.rowIndex])"
          ></q-btn>
        </q-td>
      </template>
    </q-table>
  </template>

  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <ContactForm
          :candidate-id="props.candidateId"
          :model-value="contact"
          @update:modelValue="saveContact"
        >
        </ContactForm>
      </q-card-section>
    </q-card>
  </q-dialog>

  <div class="flex justify-end q-mt-lg q-mb-xl">
    <q-btn
      :disable="props.readonly"
      color="primary"
      icon="add"
      @click="addContact()"
      >Agregar nuevo contacto</q-btn
    >
  </div>
</template>
