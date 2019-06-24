<template lang="pug">
  div.text-white
    h3 Add song
    b-alert(:show="!!submitErr" variant="danger") {{ submitErr }}
    b-card.p15
      b-form-input(v-model="song.title" placeholder="Title")
      br
      b-form-input(v-model="song.artist" placeholder="Artist")
      br
      b-form-input(v-model.number="song.price" type="number" placeholder="Price ($)")
      br
      TrackUpload(@filesChanged="filesChanged")
      br
      b-button(@click="songSubmitted" variant="primary") Submit
</template>

<script>
import TrackUpload from '@/components/TrackUpload'
import Api from '@/services/api'

export default {
  data: () => ({
    song: {},
    tracks: [],
    submitErr: ''
  }),
  methods: {
    filesChanged(tracks) {
      this.tracks = tracks
    },
    songSubmitted() {
      const songTitle = this.song.title && this.song.title.trim()
      const songArtist = this.song.artist && this.song.artist.trim()
      const songPrice = this.song.price > 0

      const hasTracks = !!this.tracks.length
      const allTracksHaveInstrument = !this.tracks.find(track => !track.metadata.instrument)
      const tracksValid = hasTracks && allTracksHaveInstrument

      if (!songTitle || !songArtist || !songPrice || !tracksValid) return

      this.submitErr = ''
      const { song, tracks } = this
      const reqObj = { song, tracks }

      Api.postSong(reqObj)
        .then(() => {
          this.$router.push({ name: 'dashboard' })
        })
        .catch((err) => {
          this.submitErr = err.msg
        })
    }
  },
  components: {
    TrackUpload
  }
}
</script>
