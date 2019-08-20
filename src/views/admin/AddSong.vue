<template lang="pug">
  Layout(title="Add song")
    b-alert(:show="!!submitErr" variant="danger") {{ submitErr }}
    b-card.p15
      b-form-input(v-model="song.title" placeholder="Title")
      br
      b-form-input(v-model="song.artist" placeholder="Artist")
      br
      b-form-select(v-model="song.genre" :options="genres" required)
      br
      br
      b-form-input(v-model.number="song.price" type="number" min="0" placeholder="Price ($)")
      br
      TrackUpload(@filesChanged="filesChanged" :eventBus="getEventBus()")
      br
      b-button(@click="songSubmitted" :disabled="submitting" variant="primary") Submit
</template>

<script>
import TrackUpload from '@/components/TrackUpload'
import Api from '@/services/api'

export default {
  data: () => ({
    song: {},
    tracks: [],
    genres: [
      { value: 'rock', text: 'Rock' },
      { value: 'pop', text: 'Pop' }
    ],
    submitErr: '',
    submitting: false
  }),
  methods: {
    filesChanged(tracks) {
      this.tracks = tracks
    },
    getEventBus() {
      return this
    },
    songSubmitted() {
      const songTitle = this.song.title && this.song.title.trim()
      const songArtist = this.song.artist && this.song.artist.trim()
      const songGenre = this.song.genre
      const songPrice = this.song.price > 0

      const hasTracks = !!this.tracks.length
      const allTracksHaveInstrument = !this.tracks.find(track => !track.metadata.instrument)
      const tracksValid = hasTracks && allTracksHaveInstrument

      if (!songTitle || !songArtist || !songPrice || !songGenre || !tracksValid) return

      this.submitErr = ''
      const { song, tracks } = this
      const reqObj = { song, tracks }

      this.submitting = true
      const onProgress = ({ track, progress }) => {
        this.$emit('progress', { progress, track })
      }
      Api.postSong(reqObj, onProgress)
        .then(() => {
          this.$router.push({ name: 'adminDashboard' })
        })
        .catch((err) => {
          this.submitErr = err.msg
        })
        .finally(() => {
          this.submitting = false
        })
    }
  },
  components: {
    TrackUpload
  }
}
</script>
