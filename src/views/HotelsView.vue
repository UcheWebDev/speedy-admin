<template>
  <div class="about pa-3">
    <div class="d-flex align-center justify-space-between">
      <div>
        <div class="mb-3 text-grey">Hotel</div>
        <h1 class="text-h4 text-red-darken-4">Hotel</h1>
      </div>
      <v-btn color="primary" @click="openDialog" class="font-weight-bold">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>

    <v-row class="mt-2" v-if="loading">
      <v-col cols="12" md="6" lg="4" sm="6" v-for="n in 4" :key="n">
        <v-skeleton-loader
          :loading="loading && !hotels.length"
          type="image, list-item-two-line"
        >
        </v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading && hotels.length" class="mt-2">
      <v-col
        cols="12"
        md="6"
        lg="4"
        sm="6"
        v-for="hotel in hotels"
        :key="hotel.id"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            :class="{ 'on-hover': isHovering }"
            :elevation="isHovering ? 16 : 0"
            :disabled="loading"
            :loading="loading"
            class="mx-auto"
            max-width="374"
            flat
            v-bind="props"
          >
            <v-img height="250" :src="hotel.hotel_imgurl" cover></v-img>

            <v-card-item>
              <v-card-title>{{ hotel.hotel_name }}</v-card-title>

              <v-card-subtitle>
                <span class="me-1">{{ hotel.hotel_location }}</span>
                <v-icon
                  color="error"
                  icon="mdi-fire-circle"
                  size="small"
                ></v-icon>
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <v-row align="center" class="mx-0">
                <v-rating
                  :model-value="hotel.rating"
                  color="amber"
                  density="compact"
                  size="small"
                  half-increments
                  readonly
                ></v-rating>

                <div class="text-grey ms-4">
                  {{ hotel.rating }} ({{ hotel.hotel_likes }}) Likes
                </div>
              </v-row>

              <v-divider class="mx-4 mb-1 mt-4"></v-divider>

              <div>Price Per Night : &#8358; {{ hotel.price }}</div>

              <div>
                Address: {{ hotel.hotel_location }} <br />
                Phone: {{ hotel.phone_number }}
              </div>
              <div class="mt-2">
                Extra Description : {{ hotel.hotel_description }}
              </div>

              <v-chip-group>
                <v-chip
                  v-for="facility in JSON.parse(hotel.hotel_facilities)"
                  :key="facility"
                  >{{ facility }}</v-chip
                >
              </v-chip-group>
            </v-card-text>

            <div class="pa-3">
              <v-btn
                color="blue-darken-4"
                prepend-icon="mdi-pen"
                text="Edit"
                slim
                @click="openDialog(hotel)"
                size=""
                class="mr-2"
              ></v-btn>
              <v-btn
                color="red-darken-4"
                prepend-icon="mdi-delete"
                text="Delete"
                slim
                class="mr-2"
                size=""
                @click="deleteHotel(hotel.id)"
              ></v-btn>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                text="View"
                slim
                class="mr-2"
                size=""
                @click="viewHoteData(hotel.id)"
              ></v-btn>
            </div>
          </v-card>
        </v-hover>
        <!-- <DataCard
          :dataType="'hotel'"
          :data="hotel"
          :selection="selection"
          @editItem="editRestuarantDetails"
          @deleteItem="deleteRestaurantData"
          @addFoodRestuarant="addFoodItemRestuarant"
          @viewItem="viewItemById"
        /> -->
      </v-col>
    </v-row>

    <div class="centered-content" v-if="loading == false && !hotels.length">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">No data</h1>
        <p>Hotel data cannot be found at the moment</p>
      </div>
    </div>

    <!-- Add Restaurant Modal -->
    <AddDataDialogue
      v-model="dialog"
      title="Add Restaurant"
      @close="handleClose"
    >
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="saveRestaurant"
      >
        <v-file-input
          v-model="formData.image"
          label="Upload Hotel Photo"
          accept="image/*"
          @change="onFilePicked"
        ></v-file-input>

        <v-text-field
          v-model="formData.hotel_name"
          label="Hotel Name"
          :rules="nameRules"
        ></v-text-field>

        <v-text-field
          label="Type a hotel name or address"
          ref="autocompleteInput"
          @input="onInput"
          v-model="formData.hotel_location"
          :rules="locationRules"
          clearable
          @click:clear="onClearLocationField"
        ></v-text-field>

        <v-list v-if="suggestions.length">
          <v-list-item
            v-for="suggestion in suggestions"
            :key="suggestion.place_id"
            @click="selectSuggestion(suggestion)"
          >
            <v-list-item-content>
              <v-list-item-title>{{
                suggestion.description
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-switch
          class="mb-2"
          color="primary"
          v-model="liveLocationSwitch"
          label="Use live location filter"
          hide-details
          inset
        ></v-switch>

        <v-text-field
          v-model="formData.phone_number"
          label="Phone Number"
          :rules="phoneRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="formData.hotel_description"
          label="Extra Description"
          :rules="phoneRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="formData.price"
          label="Price Per Night"
          :rules="phoneRules"
          required
        ></v-text-field>

        <v-select
          v-model="formData.hotel_facilities"
          :items="facilities"
          label="Hotel Facilities"
          :prepend-icon="extraField ? 'mdi-minus' : 'mdi-plus'"
          @click:prepend="addExtraInformation"
          multiple
          required
        ></v-select>

        <v-text-field
          v-if="extraField"
          label="Add extra table type"
          v-model="extraFacilities"
          append-icon="mdi-send-variant-outline"
          @click:append="addToSelections"
        ></v-text-field>

        <!--submit btn-->
        <v-btn
          class="mt-2"
          color="primary darken-1"
          @click="saveRestaurantData"
          :disabled="!valid || isLoadingRequest"
        >
          Save
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
          <v-btn color="green darken-1" text @click="confirmEvent">
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
/*eslint-disable*/
import { ref, onMounted, reactive } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import { ErrorHandler } from "@/utils/ErrorHandler";
import { useRouter } from "vue-router";

import {
  fetchHotels,
  saveRestaurant,
  deleteHotelHttpRequest,
  editHotelDataHttpRequest,
  saveNewHotelHttpRequest,
} from "@/utils/httpRequests";
import DataCard from "@/components/DataCard.vue";
import AddDataDialogue from "@/components/AddDataDialogue.vue";
import { createFormData } from "@/utils/formData";

const facilities = ref(["Wi-Fi", "Pool", "Gym", "Parking"]);
const query = ref("");
const suggestions = ref([]);
const autocompleteService = ref(null);
const placesService = ref(null);

const router = useRouter();

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const loader = new Loader({
  apiKey: "AIzaSyAZCwA6pT2PGwbn1iauPEV92kuxY8BuUd0",
  version: "weekly",
});

const errorHandler = new ErrorHandler(snackbar, router);

const loading = ref(true);
const isLoadingRequest = ref(false);
const selection = ref(1);
const hotels = ref([]);
const extraField = ref(false);
const extraFacilities = ref(null);

const dialog = ref(false);
const UpdateDialog = ref(false);
const RequestDialog = ref(false);

const valid = ref(false);
const form = ref(null);

// const valid = ref(false);
// const form = ref(null);

const liveLocationSwitch = ref(false);

const selectedDataId = ref(null);

const isEditMode = ref(false);
const dialogTitle = ref("Add Hotel");
const dialogButton = ref("Save");

const formData = ref({
  id: null,
  hotel_name: "",
  hotel_location: "",
  hotel_description: "",
  hotel_likes: "",
  hotel_location: "",
  price: "",
  phone_number: "",
  hotel_image_name: null,
  hotel_imageFile: null,
  place_id: "",
  hotel_ratings: null,
  latitude: null,
  longitude: null,
  hotel_facilities: [],
});

const openRequestDialogue = () => {
  RequestDialog.value = true;
};

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const deleteHotel = (id) => {
  selectedDataId.value = id;
  RequestDialog.value = true;
};

const addExtraInformation = () => {
  extraField.value = !extraField.value;
};

const addToSelections = () => {
  facilities.value.push(extraFacilities.value);
  extraFacilities.value = "";
  snackbar.message = "Extra Field added !";
  snackbar.show = true;
};


const openDialog = (hotel = null) => {
  if (hotel && hotel.hotel_name) {
    isEditMode.value = true;
    dialogTitle.value = "Edit Hotel";
    dialogButton.value = "Update";

    formData.value.id = hotel.id;
    formData.value.hotel_name = hotel.hotel_name;
    formData.value.hotel_imageFile = null;
    formData.value.hotel_image_name = null;
    formData.value.hotel_location = hotel.hotel_location;
    formData.value.hotel_description = hotel.hotel_description;
    formData.value.price = hotel.price;
    formData.value.phone_number = hotel.phone_number;
    formData.value.place_id = hotel.place_id;
    formData.value.hotel_imgurl = hotel.hotel_imgurl;
    formData.value.hotel_likes = hotel.hotel_likes;
    formData.value.hotel_ratings = hotel.hotel_ratings;
    formData.value.latitude = hotel.latitude;
    formData.value.longitude = hotel.longitude;
    formData.value.hotel_facilities = JSON.parse(hotel.hotel_facilities);
  } else {
    isEditMode.value = false;
    dialogTitle.value = "Add Hotel";
    dialogButton.value = "Save";
    resetForm();
  }
  dialog.value = true;
};

const handleClose = () => {
  dialog.value = false;
  UpdateDialog.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    id: null,
    hotel_name: "",
    hotel_location: "",
    hotel_description: "",
    hotel_likes: "",
    hotel_location: "",
    price: "",
    phone_number: "",
    hotel_image_name: null,
    hotel_imageFile: null,
    place_id: "",
    hotel_ratings: null,
    latitude: null,
    longitude: null,
    hotel_facilities: [],
  };
};

const onClearLocationField = () => {
  formData.value.hotel_location = "";
  suggestions.value = [];
};

const fetchHotelsData = async () => {
  loading.value = true;
  try {
    hotels.value = await fetchHotels();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    loading.value = false;
  }
};

const saveRestaurantData = async () => {
  isLoadingRequest.value = true;
  try {
    const payLoad = createFormData(formData.value);
    if (formData.value.id) {
      console.log(payLoad);
      await editHotelDataHttpRequest(formData.value.id, payLoad);
      snackbar.message = "Updated successfully!";
    } else {
      await saveNewHotelHttpRequest(payLoad);
      snackbar.message = "Added successfully!";
    }
    snackbar.show = true;
    fetchHotelsData();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const viewHoteData = (hotelId) => {
  router.push({ name: "HotelDetailsPage", params: { id: hotelId } });
};

const confirmEvent = async () => {
  try {
    await deleteHotelHttpRequest(selectedDataId.value);
    fetchHotelsData();
    closeRequestDialogue();
  } catch (error) {
    snackbar.message = "Error deleting hotel!";
    snackbar.show = true;
  }
};

/* map functions */
const initAutocompleteService = (placesModule) => {
  autocompleteService.value = new placesModule.AutocompleteService();
  placesService.value = new placesModule.PlacesService(
    document.createElement("div")
  );
};

const onInput = (e) => {
  const location = e.target.value;
  if (location.length > 2 && liveLocationSwitch.value) {
    autocompleteService.value.getPlacePredictions(
      {
        input: location,
        componentRestrictions: { country: "NG" },
      },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          suggestions.value = predictions;
        } else {
          suggestions.value = [];
        }
      }
    );
  } else {
    suggestions.value = [];
  }
};

const selectSuggestion = (suggestion) => {
  formData.value.hotel_location = suggestion.description;
  suggestions.value = [];
  placesService.value.getDetails(
    { placeId: suggestion.place_id },
    (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        console.log(place);
        formData.value.hotel_name = place ? place.name : "";
        formData.value.hotel_location = place ? place.formatted_address : "";
        formData.value.phone_number = place ? place.formatted_phone_number : "";
        formData.value.place_id = place ? place.place_id : "";
        formData.value.hotel_ratings =
          place && place.rating !== undefined ? place.rating : 0;
        const location = place.geometry?.location;
        if (location) {
          formData.value.latitude = location.lat();
          formData.value.longitude = location.lng();
        } else {
          console.error("Geometry data is not available.");
        }
      }
    }
  );
};

/* image validation */
const onFilePicked = (e) => {
  const files = e.target.files;
  if (files[0] !== undefined) {
    formData.value.hotel_image_name = files[0].name;
    if (formData.value.hotel_image_name.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      formData.value.hotel_imageFile = files[0];
    });
  } else {
    formData.value.hotel_image_name = "";
    formData.value.hotel_image_name = "";
  }
};

onMounted(() => {
  loader
    .importLibrary("places")
    .then(initAutocompleteService)
    .catch((e) => console.error("Error loading Google Maps libraries:", e));
  fetchHotelsData();
});
</script>
  
  <style scoped>
/* Add some basic styling */
.v-list {
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
}

.v-card.on-hover.v-theme--dark {
  background-color: rgba(#fff, 0.8);
}

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: #eee;
}

.centered-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh; /* Full viewport height */
  text-align: center;
}
</style>
  
  