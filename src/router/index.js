import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue';
import { authGuard } from '../utils/authGuard';
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    beforeEnter: authGuard,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import(/* webpackChunkName: "about" */ '../views/DashboardView.vue')
      },
      {
        path: '/hotels',
        name: 'Hotels',
        component: () => import(/* webpackChunkName: "about" */ '../views/HotelsView.vue')
      },
      {
        path: '/restuarants',
        name: 'Restuarants',
        component: () => import(/* webpackChunkName: "about" */ '../views/RestuarantView.vue')
      },
      {
        path: '/pharmacy',
        name: 'Pharmacy',
        component: () => import(/* webpackChunkName: "about" */ '../views/PharmacyView.vue')
      },
      {
        path: '/markets',
        name: 'Markets',
        component: () => import(/* webpackChunkName: "about" */ '../views/MarketView.vue')
      },
      {
        path: '/events',
        name: 'Events',
        component: () => import(/* webpackChunkName: "about" */ '../views/EventsView.vue')
      },
      {
        path: '/cars',
        name: 'Cars',
        component: () => import(/* webpackChunkName: "about" */ '../views/CarsView.vue')
      },
      {
        path: '/riders',
        name: 'Riders',
        component: () => import(/* webpackChunkName: "about" */ '../views/RidersView.vue')
      },
      {
        path: '/orders',
        name: 'Orders',
        component: () => import(/* webpackChunkName: "about" */ '../views/OrdersView.vue')
      },
      {
        path: '/items',
        name: 'Items',
        component: () => import(/* webpackChunkName: "about" */ '../views/ItemsView.vue')
      },
      {
        path: '/pharmacy/:id',
        name: 'ItemPage',
        component: () => import(/* webpackChunkName: "about" */ '../views/ItemsPageIdView.vue')
      },
      {
        path: '/supermarket/:id',
        name: 'marketItemPage',
        component: () => import(/* webpackChunkName: "about" */ '../views/MarketPageIdView.vue')
      },
      {
        path: '/restaurants/:id',
        name: 'RestuarantFoodItemPage',
        component: () => import(/* webpackChunkName: "about" */ '../views/RestuarantItemView.vue')
      },
      {
        path: '/hotels/:id',
        name: 'HotelDetailsPage',
        component: () => import(/* webpackChunkName: "about" */ '../views/HotelDetailsPage.vue')
      }
    ],
  },
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  // {
  //   path: '/dashboard',
  //   name: 'Dashboard',
  //   beforeEnter: authGuard,

  //   component: () => import(/* webpackChunkName: "about" */ '../views/DashboardView.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
