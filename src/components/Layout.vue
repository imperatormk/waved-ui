<template lang="pug">
  b-container
    Navbar
    br
    .text-white(v-if="title")
      h3 {{ title }}
      .p5-top(v-if="subtitle")
        h4 {{ subtitle }}
    br
    slot
</template>

<script>
import Navbar from '@/components/Navbar'

export default {
  props: {
    title: String,
    subtitle: String
  },
  components: {
    Navbar
  }
}
</script>