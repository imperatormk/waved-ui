import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import ImageUploader from 'vue-image-upload-resize'

import App from '@/App'
import router from '@/router'
import store from '@/store'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPen, faTrashAlt, faRocket, faTrashRestoreAlt, faCheck, faDrum, faGuitar, faBroom, faBox, faBoxOpen
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import '@/styles/common.scss'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import Layout from '@/components/Layout'

import '@/assets/soundtouch'

Vue.use(BootstrapVue)
Vue.use(ImageUploader)

Vue.component('Layout', Layout)
Vue.component('font-awesome-icon', FontAwesomeIcon)

library.add(faPen)
library.add(faTrashAlt)
library.add(faRocket)
library.add(faTrashRestoreAlt)
library.add(faCheck)
library.add(faDrum)
library.add(faGuitar)
library.add(faBroom)
library.add(faBox)
library.add(faBoxOpen)

Vue.config.productionTip = true

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')