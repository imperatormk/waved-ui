<template lang="pug">
  div.text-white
    h1 Add song
    .p15
      b-form-input(v-model="song.title" placeholder="Title")
      br
      b-form-input(v-model="song.artist" placeholder="Artist")
      br
      b-form-input(v-model.number="song.price" type="number" placeholder="Price ($)")
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
    },
    songSubmitted() {
      const songTitle = this.song.title && this.song.title.trim()
      const songArtist = this.song.artist && this.song.artist.trim()
      const songPrice = this.song.price > 0

      const tracksValid = this.tracks.length &&
        !this.tracks.find(track => !track.metadata.instrument)

      if (!songTitle || !songArtist || !songPrice || !tracksValid) return

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
