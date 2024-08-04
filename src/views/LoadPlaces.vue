<template>
    <v-container>
      <v-text-field
        v-model="query"
        @input="onInput"
        placeholder="Enter an address"
        ref="autocompleteInput"
        outlined
        clearable
      />
      <v-list v-if="suggestions.length">
        <v-list-item
          v-for="suggestion in suggestions"
          :key="suggestion.place_id"
          @click="selectSuggestion(suggestion)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ suggestion.description }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-container>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { Loader } from '@googlemaps/js-api-loader';
  
  export default {
    setup() {
      const query = ref('');
      const suggestions = ref([]);
      const autocompleteService = ref(null);
      const placesService = ref(null);
  
      const loader = new Loader({
        apiKey: 'AIzaSyAZCwA6pT2PGwbn1iauPEV92kuxY8BuUd0',
        version: 'weekly', // Use the latest version of the API
      });
  
      const initAutocompleteService = (placesModule) => {
        autocompleteService.value = new placesModule.AutocompleteService();
        placesService.value = new placesModule.PlacesService(document.createElement('div'));
      };
  
      const onInput = () => {
        if (query.value.length > 2) {
          autocompleteService.value.getPlacePredictions(
            { input: query.value },
            (predictions, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
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
        query.value = suggestion.description;
        suggestions.value = [];
        placesService.value.getDetails({ placeId: suggestion.place_id }, (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            console.log('Selected place details:', place);
          }
        });
      };
  
      onMounted(() => {
        loader.importLibrary('places')
          .then(initAutocompleteService)
          .catch(e => console.error('Error loading Google Maps libraries:', e));
      });
  
      return {
        query,
        suggestions,
        onInput,
        selectSuggestion,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Add some basic styling */
  .v-list {
    border: 1px solid #ccc;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .v-list-item {
    cursor: pointer;
  }
  
  .v-list-item:hover {
    background-color: #eee;
  }
  </style>
  