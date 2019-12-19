<template lang="pug">
  Layout
    b-row
      b-col
        SongList.w100.p5-side(
          feed="bestsellers"
          :perPage="10"
        )
      b-col
        SongList.w100.p5-side(
          feed="latest"
          :perPage="10"
        )
    br
    b-row
      b-col
        SongList.w100.p5-side(
          feed="archive"
          :perPage="10"
          nonempty
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