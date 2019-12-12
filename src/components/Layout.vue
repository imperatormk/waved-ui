<template lang="pug">
  b-container
    Navbar(:logo="logoConfig")
    br
    .text-white(v-if="title")
      h3 {{ title }}
      .p5-top(v-if="subtitle")
        h4 {{ subtitle }}
    br
    slot
    .p20
</template>

<script>
import Api from '@/services/api'
import Navbar from '@/components/Navbar'

export default {
  props: {
    title: String,
    subtitle: String
  },
  created() {
    Api.loadConfig()
      .then((config) => {
        this.config = config
      })
  },
  data: () => ({
    config: []
  }),
  computed: {
    logoConfig() {
      const logo = this.config.find(item => item.key === 'LOGO')
      return logo || null
    }
  },
  components: {
    Navbar
  }
}
</script>