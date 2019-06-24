import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from '@/App'
import router from '@/router'
import store from '@/store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import '@/styles/common.scss'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

Vue.component('font-awesome-icon', FontAwesomeIcon)
library.add(fas)

Vue.config.productionTip = true

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
