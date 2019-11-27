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
        div(v-if="!songId")
          p.p5-left Thumbnail
          image-uploader(
            @input="setThumbnail"
            preview
            accept="image/*"
            outputFormat="file"
            :className="['fileinput', { 'fileinput--loaded' : !!thumbnail }]"
          )
            label(for="fileInput" slot="upload-label" style="display:block;")
              .flex-col.align-center.upload-label.p15-left
                figure
                  svg(xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32")
                    path.path1(d="M9.5 19c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5-6.5 2.91-6.5 6.5zM30 8h-7c-0.5-2-1-4-3-4h-8c-2 0-2.5 2-3 4h-7c-1.1 0-2 0.9-2 2v18c0 1.1 0.9 2 2 2h28c1.1 0 2-0.9 2-2v-18c0-1.1-0.9-2-2-2zM16 27.875c-4.902 0-8.875-3.973-8.875-8.875s3.973-8.875 8.875-8.875c4.902 0 8.875 3.973 8.875 8.875s-3.973 8.875-8.875 8.875zM30 14h-4v-2h4v2z")
                span.upload-caption {{ thumbnail ? 'Replace' : 'Upload' }}
          br
          br
        b-form-input(v-model.number="song.price" type="number" min="0.01" step="0.01" placeholder="Price ($)" required)
        br
        div(v-if="!songId")
          TrackUpload(
            @filesChanged="filesChanged"
            :eventBus="getEventBus()")
          br
        b-button(type="submit" :disabled="submitting" variant="primary") Submit
</template>

<script>
import TrackUpload from '@/components/TrackUpload'
import Api from '@/services/api'

export default {
  props: {
    songId: {
      type: Number,
      default: null
    }
  },
  created() {
    this.getGenres()
      .then(() => this.getSong())
  },
  data: () => ({
    song: {
      genres: []
    },
    genres: [],
    tracks: [],
    thumbnail: null,
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
    getSong() {
      const { songId } = this
      if (!songId) return

      Api.getSong(songId, 0)
        .then((song) => {
          const {
            id, title, artist, price
          } = song
          const songObj = {
            id, title, artist, price
          }
          songObj.genres = song.genres.map(item => item.id)
          this.song = songObj
        })
    },
    filesChanged(tracks) {
      this.tracks = tracks
    },
    setThumbnail(thumbnail) {
      this.thumbnail = thumbnail
    },
    songSubmitted(e) {
      e.preventDefault()

      if (!this.songId) {
        this.addSong()
      } else {
        this.updateSong()
      }
    },
    addSong() {
      const hasTracks = !!this.tracks.length
      const allTracksHaveInstrument = !this.tracks.find((track) => {
        const { instrument } = track.metadata
        if (!instrument) return true
        if (instrument.type === 'custom' && !instrument.name) return true
        return false
      })
      const tracksValid = hasTracks && allTracksHaveInstrument

      if (!this.thumbnail || !tracksValid) return

      this.submitErr = ''
      const { song, thumbnail, tracks } = this
      const reqObj = { song, thumbnail, tracks }

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
    },
    updateSong() {
      Api.updateSong(this.song)
        .then(() => {
          this.$router.push({ name: 'adminDashboard' })
        })
        .catch((err) => {
          this.submitErr = err.msg
        })
        .finally(() => {
          this.submitting = false
        })
    },
    getEventBus() {
      return this
    },
  },
  components: {
    TrackUpload
  }
}
</script>

<style>
  #fileInput {
    display: none;
  }
  .upload-label {
    width: min-content;
    cursor: pointer;
  }
  .img-preview {
    max-width: 200px;
  }
</style>