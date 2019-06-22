<template lang="pug">
  #app
    b-container
      Navbar
      br
      router-view
</template>

<script>
import Navbar from '@/components/Navbar'
export default {
  components: {
    Navbar
  }
}
</script>
