<template>
  <div class="about pa-3">
    <v-row>
      <v-col cols="12">
        <v-card-text>All Orders</v-card-text>

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

          <v-data-table
            :headers="headers"
            :items="orders"
            :search="search"
            class="pa-2"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td v-for="header in headers" :key="header.key">
                  <template
                    v-if="
                      header.key === 'delivery_status' ||
                      header.key === 'payment_status'
                    "
                  >
                    <v-chip
                      :color="
                        item[header.key] === 'completed' ||
                        item[header.key] === 'delivered'
                          ? 'success'
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
                        color="success"
                        size="small"
                        @click="openDialog(item)"
                        class="mr-1 mb-1"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>

                      <v-btn
                        color="warning"
                        class="mr-1 mb-1"
                        size="small"
                        @click="cancelOrder(item.id)"
                      >
                        <v-icon>mdi-cancel</v-icon>
                      </v-btn>
                      <v-btn
                        color="error"
                        class="mb-1"
                        size="small"
                        @click="deleteOrder(item.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
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
      </v-col>

      <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
        {{ snackbar.message }}
      </v-snackbar>

      <!--loading request overlay-->
      <v-overlay
        :model-value="loading"
        class="align-center justify-center full-screen-overlay"
      >
        <v-progress-circular
          color="primary"
          size="30"
          indeterminate
        ></v-progress-circular>
      </v-overlay>
      <!-- Edit Order Dialog -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <!-- <v-card-title>Edit Order</v-card-title> -->
          <v-card-text>
            <div class="stepper">
              <div class="stepper-header">
                <button
                  v-for="(step, index) in steps"
                  :key="index"
                  :class="{ active: currentStep === index }"
                  @click="currentStep = index"
                >
                  {{ step.title }}
                </button>
              </div>
              <div class="stepper-body">
                <!-- Render step content based on current step -->
                <div v-if="currentStep === 0">
                  <div>
                    <h2>Customer details</h2>
                    <div class="d-flex justify-space-between">
                      <p>Customer Name</p>
                      <p>{{ selectedOrder.customer_name }}</p>
                    </div>
                    <div class="d-flex justify-space-between">
                      <p>Phone</p>
                      <p>{{ selectedOrder.customer_phone }}</p>
                    </div>
                    <div class="d-flex justify-space-between">
                      <p>Address</p>
                      <p>57 ben paradise oyigbo</p>
                    </div>
                  </div>

                  <div class="mt-2">
                    <h2>Orders details</h2>
                    <v-form ref="editForm">
                      <v-list>
                        <v-list-item
                          v-for="(item, index) in parsedItems"
                          :key="index"
                          class="mb-2"
                        >
                          <div class="d-flex justify-space-between">
                            <v-list-item-content>
                              <v-list-item-title
                                >{{ item.food_name }} ({{
                                  item.quantity
                                }})</v-list-item-title
                              >

                              <v-list-item-subtitle
                                class="text-uppercase font-weight-bold text-dark"
                              >
                                {{ item.restaurant_name }}
                              </v-list-item-subtitle>
                            </v-list-item-content>

                            <!-- End Slot (e.g., delivery fee or total price) -->
                            <v-list-item-content>
                              <v-list-item-subtitle>
                                Price ₦{{ item.food_price }}
                              </v-list-item-subtitle>
                              <v-list-item-subtitle>
                                Qty : {{ item.quantity }}
                              </v-list-item-subtitle>
                              <v-list-item-title>
                                Total: ₦{{ item.food_price * item.quantity }}
                              </v-list-item-title>
                              <v-list-item-subtitle> </v-list-item-subtitle>
                            </v-list-item-content>
                          </div>

                          <!-- Only show divider if not the last item -->
                          <v-divider
                            v-if="index !== parsedItems.length - 1"
                          ></v-divider>
                        </v-list-item>
                      </v-list>
                    </v-form>
                  </div>
                </div>
                <div v-else-if="currentStep === 1">
                  <v-form>
                    <v-list>
                      <v-list-item
                        v-for="(item, index) in parsedItems"
                        :key="index"
                        class="mb-2"
                      >
                        <div class="d-flex justify-space-between">
                          <!-- Left side: food details and restaurant -->
                          <v-list-item-content>
                            <v-list-item-title
                              >{{ item.food_name }} ({{
                                item.quantity
                              }})</v-list-item-title
                            >

                            <v-list-item-subtitle
                              class="text-uppercase font-weight-bold text-dark"
                            >
                              {{ item.restaurant_name }}
                            </v-list-item-subtitle>
                            <!-- Remove Button -->
                            <v-btn
                              color="error"
                              variant="text"
                              class="mt-2"
                              @click="removeItem(index)"
                            >
                              Remove
                            </v-btn>
                          </v-list-item-content>

                          <!-- Right side: price, quantity, total -->
                          <v-list-item-content>
                            <!-- Editable Price -->
                            <v-text-field
                              v-model="item.food_price"
                              label="Price"
                              outlined
                              dense
                              type="number"
                              prefix="₦"
                            ></v-text-field>

                            <!-- Editable Quantity -->
                            <v-text-field
                              v-model="item.quantity"
                              label="Quantity"
                              outlined
                              dense
                              type="number"
                            ></v-text-field>

                            <!-- Auto-calculated total price -->
                            <v-list-item-title>
                              Total: ₦{{ item.food_price * item.quantity }}
                            </v-list-item-title>
                          </v-list-item-content>
                        </div>

                        <!-- Divider between items -->
                        <v-divider
                          v-if="index !== parsedItems.length - 1"
                        ></v-divider>
                      </v-list-item>
                    </v-list>
                  </v-form>
                </div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="red darken-4" variant="flat" @click="dialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              variant="flat"
              :loading="updateLoading"
              @click="updateOrder"
            >
              <template v-slot:default>
                <span v-if="!loading">Process</span>
              </template>
              <template v-slot:loader>
                <!-- Loading spinner -->
                <v-progress-circular
                  indeterminate
                  color="white"
                  size="20"
                ></v-progress-circular>
              </template>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--snackbar -->
      <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
        {{ snackbar.message }}
      </v-snackbar>
    </v-row>
  </div>
</template>

<script setup>
/* eslint-disable */
import axios from "@/utils/axiosConfig";
import { ref, onMounted, reactive } from "vue";
import {
  updateOrderDetails,
  cancelOrderHttpRequest,
  deleteOrderHttpRequest,
} from "@/utils/httpRequests";
import { useRouter } from "vue-router";

const router = useRouter();

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const updateLoading = ref(false);
const currentStep = ref(0);
const steps = [{ title: "Review Order" }, { title: "Customize Order" }];
const search = ref("");
const dialog = ref(false);
const selectedOrder = ref({});
const parsedItems = ref([]);

const loading = ref(true);

const orders = ref([]);
const headers = [
  { key: "id", title: "S/N" },
  { key: "payment_status", title: "Payment Status" },
  { key: "delivery_status", title: "Delivery Status" },
  { key: "reference", title: "Order Ref" },
  { key: "Actions", title: "Actions" },
];

const fetchOrders = async () => {
  try {
    const response = await axios.get("/admin/fetchOrders");
    orders.value = response.data.orders;
  } catch (error) {
    if (error && error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      router.push({ name: "Login" });
      return;
    } else if (error && error.response && error.response.status === 404) {
      snackbar.message = "Requested resource not found on server !";
      snackbar.show = true;
    } else if (error && error.response) {
      snackbar.message = "An Unexpected error Occured!!";
      snackbar.show = true;
    } else {
      snackbar.message = "An Unexpected error Occured!!";
      snackbar.show = true;
    }
  } finally {
    loading.value = false;
  }
};

const openDialog = (order) => {
  selectedOrder.value = { ...order };
  try {
    parsedItems.value = JSON.parse(order.items); // Parse JSON string to array
  } catch (error) {
    console.error("Error parsing items:", error);
    parsedItems.value = [];
  }
  dialog.value = true;
};

// Function to remove an item from the parsedItems array
const removeItem = (index) => {
  parsedItems.value.splice(index, 1); // Remove item by index
};

const updateOrder = async () => {
  updateLoading.value = true;
  try {
    const payLoad = {
      id: selectedOrder.value.id,
      items: parsedItems.value,
    };

    await updateOrderDetails(payLoad.id, payLoad);
    snackbar.message = "order processed !";
    snackbar.show = true;
    updateLoading.value = false;
    fetchOrders();
  } catch (error) {
    snackbar.message = "Error updating order:";
    snackbar.show = true;
    updateLoading.value = false;
    console.error("Error updating order:", error);
  }
};

const cancelOrder = async (orderId) => {
  loading.value = true;
  try {
    await cancelOrderHttpRequest(orderId);
    fetchOrders();
    loading.value = false;
    snackbar.message = "order cancelled !";
    snackbar.show = true;
  } catch (error) {
    loading.value = false;
    snackbar.message = "Error cancelling order:";
    snackbar.show = true;
  }
};

const deleteOrder = async (orderId) => {
  loading.value = true;
  try {
    await deleteOrderHttpRequest(orderId);
    fetchOrders();
    loading.value = false;
    snackbar.message = "order deleted !";
    snackbar.show = true;
  } catch (error) {
    loading.value = false;
    snackbar.message = "Error deleting order:";
    snackbar.show = true;
  }
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.headline {
  font-size: 0.75rem;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 400;
  line-height: 1.66;
  letter-spacing: 0.03333em;
}

.text-h6 {
  font-size: 1.25rem;
  color: #c33d1b;
}

h1 {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-style: normal;
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

.stepper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.stepper-header {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
}

.stepper-header button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  background: transparent;
  border: none;
}

.stepper-header button.active {
  font-weight: bold;
  border-bottom: 2px solid #000;
}

.stepper-body {
  padding: 1rem;
  /* border: 1px solid #ddd;
  border-radius: 4px; */
}

.stepper-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>