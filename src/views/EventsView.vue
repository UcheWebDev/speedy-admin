<template>
  <div class="about pa-3">
    <!-- Existing content -->
    <div class="d-flex align-center justify-space-between">
      <div>
        <div class="mb-3 text-grey">Events & Tickets</div>
        <h1 class="text-h4 text-red-darken-4">Events & Tickets</h1>
      </div>
      <v-btn color="primary" @click="openDialog">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>

    <v-row class="mt-2" v-if="loading">
      <v-col cols="12" md="6" lg="4" sm="6" v-for="n in 4" :key="n">
        <v-skeleton-loader
          :loading="loading && !events.length"
          type="image, list-item-two-line"
        >
        </v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row class="mt-2" v-if="!loading && events.length">
      <v-col
        cols="12"
        md="6"
        lg="4"
        sm="6"
        v-for="event in events"
        :key="event.id"
      >
        <v-card class="mx-auto" max-width="400" flat>
          <v-img :src="event.ticket_img_url" height="200px" cover></v-img>
          <v-card-title>{{ event.event_name }}</v-card-title>
          <v-card-subtitle>{{
            formatEventDate(event.event_start_date, event.event_end_date)
          }}</v-card-subtitle>
          <v-card-text>
            <p>Available Tickets: {{ event.available_tickets }}</p>
            <p>Price: ${{ event.price }}</p>
            <p>Phone Number: {{ event.phone_number }}</p>
            <p>Address: {{ event.event_address }}</p>
            <v-chip-group>
              <v-chip
                v-for="type in JSON.parse(event.ticket_types)"
                :key="type"
                >{{ type }}</v-chip
              >
            </v-chip-group>
            <v-card-actions>
              <v-btn
                color="primary darken-1"
                prepend-icon="mdi-pen"
                text="Edit"
                @click="openDialog(event)"
              ></v-btn>

              <v-btn
                color="primary darken-1"
                prepend-icon="mdi-delete"
                text="Delete"
                @click="deleteEventData(event.id)"
              ></v-btn>
            </v-card-actions>
          </v-card-text>

          <v-divider></v-divider>
        </v-card>
      </v-col>
    </v-row>

    <div class="centered-content" v-if="loading == false && !events.length">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">No data</h1>
        <p>events data cannot be found at the moment</p>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <AddDataDialogue v-model="dialog" :title="dialogTitle" @close="handleClose">
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="saveEvent"
      >
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.event_name"
                label="Event Name"
                :rules="nameRules"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.event_start_date"
                label="Event Start Date"
                :rules="dateRules"
                type="date"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.event_end_date"
                label="Event End Date"
                :rules="endDateRules"
                type="date"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.location"
                label="Location"
                :rules="locationRules"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.available_tickets"
                label="Available Tickets"
                :rules="ticketRules"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.price"
                label="Price"
                :rules="priceRules"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.phone_number"
                label="Phone Number"
                :rules="phoneRules"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.event_address"
                label="Event Address"
                :rules="addressRules"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.ticket_types"
                :items="ticketTypeOptions"
                label="Ticket Types"
                multiple
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="6" v-if="!formData.id">
              <v-file-input
                v-model="formData.event_image"
                label="Upload Event Photo"
                accept="image/jpeg, image/jpg, image/png"
                prepend-icon="mdi-camera"
                outlined
                @change="onFilePicked"
                required
              ></v-file-input>
            </v-col>
          </v-row>
        </v-container>
        <v-btn
          class="mt-2"
          color="primary darken-1"
          @click="saveEvent"
          :disabled="!valid || isLoadingRequest"
        >
          {{ dialogButton }}
        </v-btn>
      </v-form>
    </AddDataDialogue>

    <!--snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
      {{ snackbar.message }}
    </v-snackbar>

    <!--loading request overlay-->
    <v-overlay
      :model-value="isLoadingRequest"
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        size="64"
        indeterminate
      ></v-progress-circular>
    </v-overlay>

    <!--prompt-->
    <v-dialog v-model="RequestDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-button">
          {{ prompt }}
        </v-card-title>
        <v-card-text class="text-button">Confirm to delete</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="closeRequestDialogue">
            Disagree
          </v-btn>
          <v-btn color="green darken-1" text @click="confirmDeleteEvent">
            Confirm
            <template v-slot:loader>
              <span class="custom-loader">
                <v-icon light>mdi-cached</v-icon>
              </span>
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, reactive, onMounted } from "vue";
import { ErrorHandler } from "@/utils/ErrorHandler";
import { useRouter } from "vue-router";
import { createFormData } from "@/utils/formData";
import {
  fetchEvents,
  saveNewEvent,
  editEventDataHttpRequest,
  deleteEventDataHttpRequest,
} from "@/utils/httpRequests";
import AddDataDialogue from "@/components/AddDataDialogue.vue";
import { formatEventDate } from "@/utils/dateFormatter";

const dialog = ref(false);
const RequestDialog = ref(false);

const valid = ref(false);
const loading = ref(true);
const isLoadingRequest = ref(false);
const selectedDataId = ref(null);

const isEditMode = ref(false);
const dialogTitle = ref("Add Event");
const dialogButton = ref("Save");

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const formData = ref({
  id: null,
  event_name: "",
  event_start_date: "",
  event_end_date: "",
  location: "",
  available_tickets: "",
  price: "",
  phone_number: "",
  event_address: "",
  event_imageFile: null,
  eventFilename: "",
  ticket_types: [],
  eventImgUrl: null,
});

const resetForm = () => {
  formData.value = {
    id: null,
    event_name: "",
    event_start_date: "",
    event_end_date: "",
    location: "",
    available_tickets: "",
    price: "",
    phone_number: "",
    event_address: "",
    event_imageFile: null,
    eventFilename: "",
    ticket_types: [],
    eventImgUrl: null,
  };
};

const nameRules = [(v) => !!v || "Event name is required"];
const dateRules = [(v) => !!v || "Date is required"];
const endDateRules = [(v) => !!v || "End date is required"];
const locationRules = [(v) => !!v || "Location is required"];
const ticketRules = [
  (v) => !!v || "Available tickets is required",
  (v) => v >= 0 || "Must be 0 or more",
];
const priceRules = [
  (v) => !!v || "Price is required",
  (v) => v >= 0 || "Must be 0 or more",
];
const phoneRules = [
  (v) => !!v || "Phone number is required",
  (v) => v.length <= 20 || "Phone number is too long",
];
const addressRules = [(v) => !!v || "Event address is required"];
const ticketTypeOptions = ["General Admission", "VIP", "Early Bird"]; // Example options, adjust as needed

const handleClose = () => {
  dialog.value = false;
  resetForm();
};

const openDialog = (event = null) => {
  if (event && event.event_name) {
    isEditMode.value = true;
    dialogTitle.value = "Edit Event";
    dialogButton.value = "Update";
    formData.value.id = event.id;
    formData.value.event_name = event.event_name;
    formData.value.event_start_date = event.event_start_date;
    formData.value.event_start_date = event.event_start_date;
    formData.value.event_end_date = event.event_end_date;
    formData.value.location = event.location;
    formData.value.available_tickets = event.available_tickets;
    formData.value.price = event.price;
    formData.value.phone_number = event.phone_number;
    formData.value.event_address = event.event_address;
    formData.value.eventImgUrl = event.ticket_img_url;
    formData.value.ticket_types = JSON.parse(event.ticket_types);
  } else {
    isEditMode.value = false;
    dialogTitle.value = "Add Event";
    dialogButton.value = "Save";
    resetForm();
  }
  dialog.value = true;
};

const deleteEventData = (id) => {
  selectedDataId.value = id;
  RequestDialog.value = true;
};

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const router = useRouter();
const errorHandler = new ErrorHandler(snackbar, router);

const events = ref([]);

const fetchEventsData = async () => {
  loading.value = true;
  try {
    events.value = await fetchEvents();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    loading.value = false;
  }
};

const saveEvent = async () => {
  isLoadingRequest.value = true;
  try {
    const payLoad = createFormData(formData.value);
    if (formData.value.id) {
      await editEventDataHttpRequest(formData.value.id, formData.value);
      snackbar.message = "Updated successfully!";
    } else {
      await saveNewEvent(payLoad);
      snackbar.message = "Added successfully!";
    }
    fetchEventsData();
    snackbar.show = true;
    handleClose();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const confirmDeleteEvent = async () => {
  isLoadingRequest.value = true;
  try {
    await deleteEventDataHttpRequest(selectedDataId.value);
    fetchEventsData();
    isLoadingRequest.value = false;
    closeRequestDialogue();
  } catch (error) {
    isLoadingRequest.value = false;
    snackbar.message = "Error deleting data!";
    snackbar.show = true;
  }
};

/* image validation */
const onFilePicked = (e) => {
  const files = e.target.files;
  if (files[0] !== undefined) {
    formData.value.eventFilename = files[0].name;
    if (formData.value.eventFilename.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      formData.value.event_imageFile = files[0];
    });
  } else {
    formData.value.event_imageFile = "";
    formData.value.eventFilename = "";
  }
};

onMounted(() => {
  fetchEventsData();
});
</script>

<style scoped>
.centered-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh; /* Full viewport height */
  text-align: center;
}
</style>
