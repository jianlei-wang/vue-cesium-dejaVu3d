import Vue from 'vue'
import App from './App'
import router from './router'
import deja_vu3d from './deja_vu3d/deja_vu3d'

Vue.prototype.$deja_vu3d = deja_vu3d
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})