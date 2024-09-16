<template>
  <div class="about pa-3">
    <!-- Existing content -->
    <div class="d-flex align-center justify-space-between">
      <div>
        <div class="mb-3 text-grey">Create & Manage Riders</div>
        <h1 class="text-h4 text-red-darken-4">Riders</h1>
      </div>
      <v-btn color="primary" @click="openDialog" class="font-weight-bold">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>

    <v-card class="mt-3" elevation="1">
      <template v-slot:text>
        <v-text-field
          v-model="search"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
        ></v-text-field>
      </template>

      <v-data-table :headers="headers" :items="riders" :search="search">
        <template v-slot:item="{ item }">
          <tr>
            <td v-for="header in headers" :key="header.key">
              <template v-if="header.key === 'riders_ratings'">
                <v-rating
                  :model-value="item.riders_ratings"
                  color="orange-darken-2"
                  density="compact"
                  size="small"
                  readonly
                ></v-rating>
              </template>
              <template
                v-else-if="
                  header.key === 'account_status' ||
                  header.key === 'riders_status'
                "
              >
                <v-chip
                  :color="
                    item[header.key] === 'free' || item[header.key] === 'active'
                      ? 'green'
                      : 'red'
                  "
                  dark
                >
                  {{ item[header.key] }}
                </v-chip>
              </template>
              <template v-else-if="header.key === 'Actions'">
                <div class="mt-1">
                  <v-btn
                    color="primary"
                    size="small"
                    @click="openDialog(item)"
                    class="mr-1 mb-1"
                    ><v-icon>mdi-pen</v-icon></v-btn
                  >
                  <v-btn
                    color="success"
                    size="small"
                    class="mr-1 mb-1"
                    @click="openOrderAssignmentDialog(item)"
                    ><v-icon>mdi-account-arrow-down</v-icon></v-btn
                  >
                  <v-btn
                    color="error"
                    size="small"
                    @click="handleRiderSuspension(item.id)"
                    ><v-icon>mdi-cancel</v-icon></v-btn
                  >
                </div>
              </template>
              <template v-else>
                {{ item[header.key] }}
              </template>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Event Modal -->
    <AddDataDialogue v-model="dialog" :title="dialogTitle" @close="handleClose">
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="submitForm"
      >
        <v-text-field
          v-model="formData.riders_name"
          :rules="[rules.required]"
          label="Rider's Name"
          required
        ></v-text-field>
        <v-text-field
          v-model="formData.riders_phone"
          :rules="[rules.required]"
          label="Rider's Phone"
          required
        ></v-text-field>
        <v-text-field
          v-model="formData.password"
          :rules="[rules.required]"
          label="Password"
          type="password"
          required
        ></v-text-field>

        <v-btn
          type="submit"
          color="primary"
          class="mt-3"
          :disabled="!valid || isLoadingRequest"
          >Submit</v-btn
        >
      </v-form>
    </AddDataDialogue>

    <!--snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
      {{ snackbar.message }}
    </v-snackbar>

    <!--loading request overlay-->
    <v-overlay
      :model-value="isLoadingRequest"
      class="align-center justify-center full-screen-overlay"
    >
      <v-progress-circular
        color="primary"
        size="30"
        indeterminate
      ></v-progress-circular>
    </v-overlay>

    <!--prompt-->
    <v-dialog v-model="RequestDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-button">
          {{ prompt }}
        </v-card-title>
        <v-card-text class="text-button"
          >Confirm to suspend/unsuspend rider?</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="closeRequestDialogue">
            Disagree
          </v-btn>
          <v-btn color="green darken-1" text @click="confirmSuspensionAction">
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

    <v-dialog v-model="assignRiderDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6 pa-6">Assign Rider to Order</v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-select
              v-model="selectedOrder"
              :items="orders"
              label="Select Order"
              item-title="reference"
              @update:modelValue="updateSelectedOrder"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="assignRider">
            Assign
          </v-btn>
          <v-btn color="red darken-1" text @click="assignRiderDialog = false"
            >Cancel</v-btn
          >
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
import {
  fetchRidersHttpRequest,
  saveRiderHttoRequest,
  editRiderDataHttpRequest,
  deleteRiderDataHttpRequest,
  suspendRider,
  fetchActiveOrdersHttpRequest,
  assignRiderHttpRequest,
} from "@/utils/httpRequests";
import AddDataDialogue from "@/components/AddDataDialogue.vue";

const headers = [
  {
    align: "start",
    key: "riders_name",
    sortable: false,
    title: "Name",
  },
  { key: "riders_phone", title: "Phone" },
  { key: "total_delivery", title: "Total Delivery" },
  { key: "total_delivery_report_issue", title: "Delivery Reports" },
  { key: "riders_status", title: "Riders Status" },
  { key: "riders_ratings", title: "Ratings" },
  { key: "account_status", title: "Account Status" },
  { key: "Actions", title: "Actions" },
];

const search = ref("");

const dialog = ref(false);
const RequestDialog = ref(false);
const assignRiderDialog = ref(false);

const valid = ref(false);
const loading = ref(true);
const isLoadingRequest = ref(true);
const selectedDataId = ref(null);
const selectedOrder = ref(null);
const selectdeRiderId = ref(null);

const isEditMode = ref(false);
const dialogTitle = ref("Add Event");
const dialogButton = ref("Save");

const orders = ref([]);

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const formData = ref({
  id: null,
  riders_name: null,
  riders_phone: null,
  password: null,
  total_delivery: 0,
  total_delivery_report_issue: 0,
});

const resetForm = () => {
  formData.value = {
    id: null,
    riders_name: "",
    riders_phone: "",
    password: "",
  };
};

const rules = {
  required: (value) => !!value || "Required.",
};

const handleClose = () => {
  dialog.value = false;
  resetForm();
};

const fetchActiveOrders = async () => {
  try {
    isLoadingRequest.value = true;
    const response = await fetchActiveOrdersHttpRequest();
    orders.value = response;
  } catch (err) {
    isLoadingRequest.value = false;
    snackbar.message = "error fetching orders!";
  } finally {
    isLoadingRequest.value = false;
  }
};

const openDialog = (rider = null) => {
  if (rider && rider.riders_name) {
    isEditMode.value = true;
    dialogTitle.value = "Edit Rider";
    dialogButton.value = "Update";
    formData.value.id = rider.id;
    formData.value.riders_name = rider.riders_name;
    formData.value.riders_phone = rider.riders_phone;
    formData.value.password = rider.password; // Assuming you might not want to pre-fill the password field
    formData.value.total_delivery = rider.total_delivery;
    formData.value.total_delivery_report_issue =
      rider.total_delivery_report_issue;
  } else {
    isEditMode.value = false;
    dialogTitle.value = "Add Rider";
    dialogButton.value = "Save";
    resetForm();
    console.log("saving mode");
  }
  dialog.value = true;
};

const openOrderAssignmentDialog = (item) => {
  assignRiderDialog.value = true;
  selectdeRiderId.value = item.id;
};

const deleteCarData = (id) => {
  selectedDataId.value = id;
  RequestDialog.value = true;
};

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const router = useRouter();
const errorHandler = new ErrorHandler(snackbar, router);

const riders = ref([]);

const fetchRiders = async () => {
  try {
    riders.value = await fetchRidersHttpRequest();
    isLoadingRequest.value = false;
  } catch (error) {
    isLoadingRequest.value = false;
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const submitForm = async () => {
  isLoadingRequest.value = true;
  try {
    if (isEditMode.value) {
      await editRiderDataHttpRequest(formData.value.id, formData.value);
      snackbar.message = "Updated successfully!";
    } else {
      await saveRiderHttoRequest(formData.value);
      snackbar.message = "Added successfully!";
    }
    fetchRiders(); // Fetch the updated list of riders
    snackbar.show = true;
    handleClose();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const handleRiderSuspension = async (id) => {
  selectedDataId.value = id;
  RequestDialog.value = true;
};

const confirmSuspensionAction = async () => {
  isLoadingRequest.value = true;
  try {
    await suspendRider(selectedDataId.value);
    fetchRiders();
    isLoadingRequest.value = false;
    RequestDialog.value = false;
  } catch (error) {
    RequestDialog.value = false;
    isLoadingRequest.value = false;
    snackbar.message = "Error suspending rider!";
    snackbar.show = true;
  }
};

const updateSelectedOrder = async (orderId) => {
  selectedOrder.value = orderId;
};

const assignRider = async () => {
  try {
    isLoadingRequest.value = true;
    await assignRiderHttpRequest(selectedOrder.value, selectdeRiderId.value);
    assignRiderDialog.value = false;
    fetchRiders();
    snackbar.message = `rider assigned`;
    snackbar.show = true;
  } catch (err) {
    isLoadingRequest.value = false;
    snackbar.message = `${err.message}`;
    snackbar.show = true;
  } finally {
    loading.value = false;
  }
};

const confirmDeleteEvent = async () => {
  isLoadingRequest.value = true;
  try {
    await deleteRiderDataHttpRequest(selectedDataId.value);
    fetchRiders();
    isLoadingRequest.value = false;
    closeRequestDialogue();
  } catch (error) {
    isLoadingRequest.value = false;
    snackbar.message = "Error deleting data!";
    snackbar.show = true;
  }
};

onMounted(() => {
  fetchRiders();
  fetchActiveOrders();
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

.avatar-center-heigth {
  position: absolute;
}

.profile-text-name {
  margin-top: 70px;
  text-align: center;
}

.sutitles {
  margin: 5px;
  padding: 16px;
}

.upload-btn {
  position: absolute !important;
  z-index: 999;
  top: 121px;
  color: cadetblue;
  background: blueviolet;
  background: rgb(125, 198, 163);
  background: linear-gradient(
    50deg,
    rgba(125, 198, 163, 1) 0%,
    rgba(35, 216, 227, 1) 72%
  );
}

.bg {
  background: rgb(255, 197, 185);
  background: linear-gradient(
      0deg,
      rgba(255, 197, 185, 0.711922268907563) 0%,
      rgba(220, 246, 223, 0.6671043417366946) 35%,
      rgba(255, 255, 255, 0.7539390756302521) 74%
    ),
    url(http://unblast.com/wp-content/uploads/2021/09/Real-Estate-Agent-Illustration.jpg);
}

.avatar-shadow {
  box-shadow: 0px 0px 10px 0px rgba(50, 12, 112, 0.75);
  -webkit-box-shadow: 0px 0px 10px 0px rgba(50, 12, 112, 0.75);
  -moz-box-shadow: 0px 0px 10px 0px rgba(50, 12, 112, 0.75);
}

.full-screen-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(
    255,
    255,
    255,
    0.8
  ); /* Optional: semi-transparent background */
  z-index: 9999; /* Ensure it's on top of other elements */
}
</style>
    