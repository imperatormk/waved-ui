<template lang="pug">
  div(@click="gotoSong" style="cursor:pointer;")
    .flex-row
      .flex-row.align-center.p10-right(v-if="thumbnailUrl")
        b-img.song-thumbnail(:src="thumbnailUrl")
      .flex-row.space-between.w100
        .flex-col
          h4 {{ song.title }}
          span {{ song.artist }}
        .flex-row.align-end
          span ${{ song.price }}
</template>

<script>
const fallbackServerUrl = 'https://studiodoblo.de:7000'
const serverUrl = process.env.VUE_APP_SERVER_URL || fallbackServerUrl

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
      this.$router.push({ name: 'song', params: { songId: this.song.id } })
    }
  }
}
</script>

<style lang="scss">
  .song-thumbnail {
    max-width: 150px;
  }
</style>