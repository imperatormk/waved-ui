<template lang="pug">
  .p20
    h1 Add song
    .p20
      b-form-input(v-model="song.title" placeholder="Title")
      br
      TrackUpload(@filesChanged="filesChanged")
      b-button(@click="songSubmitted") Submit
</template>

<script>
import TrackUpload from '@/components/TrackUpload'
import Api from '@/services/api'

export default {
  data: () => ({
    song: {},
    tracks: []
  }),
  methods: {
    filesChanged(tracks) {
      this.tracks = tracks
      console.log(this.tracks.find)
    },
    songSubmitted() {
      const songTitle = this.song.title && this.song.title.trim()
      const tracksValid = this.tracks.length &&
        !this.tracks.find(track => !track.metadata.instrument)
      console.log(songTitle, tracksValid)

      if (!songTitle || !tracksValid) return
      const { song, tracks } = this
      const reqObj = { song, tracks }
      Api.postSong(reqObj)
    }
  },
  components: {
    TrackUpload
  }
}
</script>
