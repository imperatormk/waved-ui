<template lang="pug">
  Layout
    b-row
      b-col
        SongList.w100.p10(
          feed="bestsellezrs"
          :perPage="10"
        )
      b-col
        SongList.w100.p10(
          feed="latest"
          :perPage="10"
        )
      b-col
        SongList.w100.p10(
          feed="archive"
          :perPage="10"
        )
</template>

<script>
import SongList from '@/components/SongList'

export default {
  components: {
    SongList
  }
}
</script>