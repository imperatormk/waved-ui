<template lang="pug">
  Layout
    SongList(
      :instrument="instrument"
      :genresCriteria="genresCriteria"
      :perPage="20"
      multipage
    )
</template>

<script>
import SongList from '@/components/SongList'

export default {
  props: {
    instrument: String,
    genresCriteria: String
  },
  components: {
    SongList
  }
}
</script>