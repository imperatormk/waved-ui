<template lang="pug">
  Layout(title="Add song")
    b-alert(:show="!!submitErr" variant="danger") {{ submitErr }}
    b-form(@submit="songSubmitted")
      b-card.p15
        b-form-input(v-model="song.title" placeholder="Title")
        br
        b-form-input(v-model="song.artist" placeholder="Artist")
        br
        p.p5-left Genres
        b-form-select(v-model="song.genres" :options="genres" value-field="id" text-field="name" multiple required)
        br
        br
        b-form-input(v-model.number="song.price" type="number" min="0.01" step="0.01" placeholder="Price ($)")
        br
        TrackUpload(@filesChanged="filesChanged" :eventBus="getEventBus()")
        br
        b-button(type="submit" :disabled="submitting" variant="primary") Submit
</template>

<script>
import TrackUpload from '@/components/TrackUpload'
import Api from '@/services/api'

export default {
  created() {
    this.getGenres()
  },
  data: () => ({
    song: {
      genres: []
    },
    genres: [],
    tracks: [],
    submitErr: '',
    submitting: false
  }),
  methods: {
    getGenres() {
      return Api.getGenres()
        .then((genres) => {
          this.genres = genres
        })
    },
    filesChanged(tracks) {
      this.tracks = tracks
    },
    getEventBus() {
      return this
    },
    songSubmitted(e) {
      e.preventDefault()

      const hasTracks = !!this.tracks.length
      const allTracksHaveInstrument = !this.tracks.find(track => !track.metadata.instrument)
      const tracksValid = hasTracks && allTracksHaveInstrument

      if (!tracksValid) return

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
