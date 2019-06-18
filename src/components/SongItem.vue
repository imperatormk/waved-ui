<template lang="pug">
  div(@click="gotoSong" style="cursor:pointer;")
    h4 {{ song.title }}
    span {{ song.artist }}
    .flex-row.justify-end
      span ${{ song.price }}
</template>

<script>
export default {
  props: {
    song: {
      type: Object,
      required: true
    }
  },
  methods: {
    gotoSong() {
      this.$router.push({ name: 'song', params: { songId: this.song.id } })
    }
  }
}
</script>