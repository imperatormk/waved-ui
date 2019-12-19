<template lang="pug">
  Layout
    b-row
      b-col(v-show="latestCount > 0 && allLoaded")
        SongList.w100.p5-side(
          feed="latest"
          :perPage="10"
          @songsLoaded="latestCount = $event"
        )
      b-col(v-show="bestsellersCount > 0 && allLoaded")
        SongList.w100(
          feed="bestsellers"
          :perPage="10"
          @songsLoaded="bestsellersCount = $event"
        )
    br
    b-row(v-show="archivedCount > 0 && allLoaded")
      b-col
        SongList.w100.p5-side(
          feed="archive"
          :perPage="10"
          @songsLoaded="archivedCount = $event"
        )
</template>

<script>
import SongList from '@/components/SongList'

export default {
  components: {
    SongList
  },
  data: () => ({
    latestCount: -1,
    bestsellersCount: -1,
    archivedCount: -1,
  }),
  computed: {
    allLoaded() {
      const { latestCount, bestsellersCount, archivedCount } = this
      return latestCount >= 0 && bestsellersCount >= 0 && archivedCount >= 0
    }
  }
}
</script>