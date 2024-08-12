<template>
  <div class="about pa-3">
    <div class="d-flex align-center justify-space-between">
      <div>
        <div class="mb-3 text-grey">Dashboard</div>
        <h1 class="text-h4 text-red-darken-4">Dashboard</h1>
      </div>
      <v-btn color="primary" @click="refreshData"> Refresh </v-btn>
    </div>
    <v-row class="mt-3">
      <v-col
        cols="6"
        md="6"
        lg="4"
        sm="6"
        v-for="(stat, index) in stats"
        :key="index"
      >
        <v-sheet class="pa-4" rounded elevation="1">
          <div class="d-flex flex-column align-center justify-center">
            <div>
              <div class="title text-h5 text-center">{{ stat.value }}</div>
              <p class="headline text-caption">{{ stat.label }}</p>
            </div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6"> Recent Orders </v-card-title>
          <v-data-table
            :headers="headers"
            :items="orders"
            class="elevation-1"
            :items-per-page="5"
          >
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
    </v-row>
  </div>
</template>

<script setup>
/* eslint-disable */
import axios from "@/utils/axiosConfig";
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const loading = ref(true);
const stats = ref([
  { value: 0, label: "Total customers" },
  { value: 0, label: "Total Restaurants" },
  { value: 0, label: "Total Pharmacy" },
  { value: 0, label: "Total Supermarkets" },
  { value: 0, label: "Total riders" },
  { value: 0, label: "Total orders" },
  { value: 0, label: "Total Hotels" },

]);
const orders = ref([]);
const headers = [
  { text: "Order ID", value: "id" },
  { text: "Customer", value: "customer" },
  { text: "Status", value: "status" },
];

const getAnalytics = async () => {
  try {
    const response = await axios.get("/admin/admin");
    const data = response.data.data.analytics;
    stats.value = [
      { value: data.totalCustomers, label: "Total customers" },
      { value: data.totalRestaurants, label: "Total Restaurants" },
      { value: data.totalPharmacy, label: "Total Pharmacy" },
      { value: data.totalSupermarkets, label: "Total Supermarkets" },
      { value: data.totalRiders, label: "Total riders" },
      { value: data.totalOrders, label: "Total orders" },
      { value: data.totalCars, label: "Total cars" },
      { value: data.totalHotels, label: "Total Hotels" },

    ];
    orders.value = data.orders;
    console.log(data);
  } catch (error) {
    if (error && error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      router.push({ name: "Login" });
      return;
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

const refreshData = () => {
  loading.value = true;
  getAnalytics();
};

onMounted(() => {
  getAnalytics();
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
</style>
