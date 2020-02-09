<template lang="pug">
  .song-item(@click="gotoSong" style="cursor:pointer;")
    .flex-row
      .flex-row.align-center.p10-right(v-if="thumbnailUrl")
        b-img.song-thumbnail(:src="thumbnailUrl")
      .flex-row.space-between.w100
        .flex-col.space-between
          .flex-col
            .song-title {{ song.title }}
            span {{ song.artist }}
        .flex-col.space-between.align-end
          span(style="color:#7f7f7f") {{ song.bpm }} BPM
          b-badge
            .fs14 €{{ song.price.toFixed(2) }}
</template>

<script>
import { getServerUrl } from '@/services/system'

const serverUrl = getServerUrl()

export default {
  props: {
    song: {
      type: Object,
      required: true
    }
  },
  computed: {
    thumbnailUrl() {
      if (!this.song.thumbnail) return null
      return `${serverUrl}/static/thumbnails/${this.song.thumbnail}`
    }
  },
  methods: {
    gotoSong() {
      this.$router.push({ name: 'song', params: { slug: this.song.slug } })
    }
  }
}
</script>

<style lang="scss">
  .song-item {
    .song-thumbnail {
      max-width: 50px;
    }
  }
</style>