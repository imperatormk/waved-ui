<template lang="pug">
  b-container
    Navbar
    br
    .text-white(v-if="title")
      h3 {{ title }}
      br
    slot
</template>

<script>
import Navbar from '@/components/Navbar'

export default {
  props: {
    title: String
  },
  components: {
    Navbar
  }
}
</script>