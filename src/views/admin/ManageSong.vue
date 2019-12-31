<template lang="pug">
  Layout.manage-song(:title="pageTitle")
    b-alert(:show="!!submitErr" variant="danger") {{ submitErr }}
    b-form(@submit="songSubmitted")
      b-card.p15
        b-input-group(prepend="Title")
          b-form-input(v-model="song.title")
        br
        b-input-group(prepend="Artist")
          b-form-input(v-model="song.artist")
        br
        p.p5-left Genres
        b-form-select(v-model="song.genres" :options="genres" value-field="id" text-field="name" multiple required)
        br
        br
        p.p5-left Thumbnail
        image-uploader(
          @input="setThumbnail"
          preview
          accept="image/*"
          outputFormat="file"
          :className="['fileinput', { 'fileinput--loaded' : !!thumbnail }]"
        )
          label.upload-label(for="fileInput" slot="upload-label" style="display:block;")
            .flex-col.align-center.p15-left
              template(v-if="!songId && !thumbnail")
                figure
                  svg(xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32")
                    path.path1(d="M9.5 19c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5-6.5 2.91-6.5 6.5zM30 8h-7c-0.5-2-1-4-3-4h-8c-2 0-2.5 2-3 4h-7c-1.1 0-2 0.9-2 2v18c0 1.1 0.9 2 2 2h28c1.1 0 2-0.9 2-2v-18c0-1.1-0.9-2-2-2zM16 27.875c-4.902 0-8.875-3.973-8.875-8.875s3.973-8.875 8.875-8.875c4.902 0 8.875 3.973 8.875 8.875s-3.973 8.875-8.875 8.875zM30 14h-4v-2h4v2z")
                span.upload-caption Upload
              b-img.song-thumbnail(v-if="!thumbnail" :src="thumbnailUrl")
        br
        b-input-group(prepend="Price (€)")
          b-form-input(v-model.number="song.price" type="number" min="0.01" step="0.01" required)
        br
        b-input-group(prepend="Tempo (BPM)")
          b-form-input(v-model.number="song.bpm" type="number" min="40" max="300" required)
        br
        TrackUpload(
          @filesChanged="filesChanged"
          :inProgress="submitting"
          :eventBus="getEventBus()"
        )
        br
        template(v-if="existingTracks.length")
          b-table.no-margin(
            id="processing-table"
            :items="existingTracks"
            current-page="1"
            :fields="[{ key: 'instrument', label: 'Instrument' }, { key: 'actions', label: 'Actions' }]"
            hover
            responsive
            small
          )
            template(v-slot:cell(instrument)="data")
              span {{ getTrackFullTitle(data.item) }}
            template(v-slot:cell(actions)="data")
              .flex-row
                b-button(
                  @click="removeTrack(data.item.id)"
                  :disabled="submitting"
                  :variant="data.item.markedForDeletion ? 'success' : 'danger'"
                  size="sm"
                )
                  font-awesome-icon(:icon="!data.item.markedForDeletion ? 'trash-alt' : 'trash-restore-alt'" fixed-width)
          br
        .p5-left(v-if="hasDurationTrack && loaded")
          p Demo area
          .flex-row.align-center(style="background-color:#C14242")
            .w100(ref="wave" id="wavedemo")
          div Start: {{ formattedDemoArea.start }}
          .narrow-line Duration: {{ formattedDemoArea.duration }}
          br
        b-button(type="submit" :disabled="submitting || !loaded || (songId && !waveLoaded)" variant="primary") Submit
</template>

<script>
import WaveSurfer from 'wavesurfer.js'
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min'

import TrackUpload from '@/components/TrackUpload'
import Api from '@/services/api'

// eslint-disable-next-line
import { capitalizeLetter, getFileMeta, pad2 } from '@/helpers'
import { getServerUrl } from '@/services/system'

const serverUrl = getServerUrl()

const REGION_DURATION = 30

const moveInputLabel = () => {
  const source = document.getElementsByClassName('img-preview')[0]
  const destination = document.getElementsByClassName('upload-label')[0]

  destination.appendChild(source)
}

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
    existingTracks: [],
    thumbnail: null,
    duration: null,
    durationTrack: { url: null, blob: null },
    demoArea: {
      start: 0,
      duration: 30
    },
    wavesurfer: null,
    submitErr: '',
    submitting: false,
    loaded: false,
    waveLoaded: false
  }),
  computed: {
    pageTitle() {
      return !this.songId ? 'Add song' : 'Edit song'
    },
    thumbnailUrl() {
      if (!this.song.thumbnail) return null
      return `${serverUrl}/static/thumbnails/${this.song.thumbnail}`
    },
    formattedDemoArea() {
      const getFormattedString = (minutes, seconds) => `${pad2(minutes)}:${pad2(seconds)}`

      if (!this.demoArea) return { start: getFormattedString(0, 0), duration: 0 }
      const { start, duration } = this.demoArea

      const startMinutes = Math.floor(start / 60)
      const startSeconds = start - (startMinutes * 60)
      const formattedStart = getFormattedString(startMinutes, startSeconds)

      const durationMinutes = Math.floor(duration / 60)
      const durationSeconds = duration - (durationMinutes * 60)
      const formattedDuration = getFormattedString(durationMinutes, durationSeconds)

      return { start: formattedStart, duration: formattedDuration }
    },
    hasDurationTrack() {
      const { durationTrack } = this
      return durationTrack.url || durationTrack.blob
    }
  },
  watch: {
    durationTrack(val) {
      if (val == null) return
      this.$nextTick(() => [
        this.prepareWave(val)
      ])
    }
  },
  methods: {
    getGenres() {
      return Api.getGenres()
        .then((genres) => {
          this.genres = genres
        })
    },
    getSong() {
      const { songId } = this
      if (!songId) {
        this.song.bpm = 120
        this.loaded = true
        return
      }

      this.loaded = false
      this.waveLoaded = false

      Api.getSong(songId, 0)
        .then((song) => {
          this.loaded = true
          const {
            id, title, artist, thumbnail, price, demoArea, bpm, tracks, duration
          } = song
          const songObj = {
            id, title, artist, thumbnail, price, demoArea, bpm
          }
          songObj.genres = song.genres.map(item => item.id)
          this.song = songObj
          this.existingTracks = tracks
          this.duration = duration

          if (tracks.length) {
            this.durationTrack = { url: tracks[0].url } // no guarantee there is no shorter track than this
          }
        })
    },
    filesChanged(tracks) {
      this.tracks = tracks || []

      const lastTrack = tracks[this.tracks.length - 1]
      if (!lastTrack) return

      const { file } = lastTrack
      this.retrieveTrackDuration(file)
    },
    retrieveTrackDuration(file) {
      getFileMeta(file)
        .then(({ duration, buffer }) => {
          if (!this.duration || duration < this.duration) {
            this.duration = Math.floor(duration)
            this.durationTrack = { blob: buffer }
          }
        })
    },
    setThumbnail(thumbnail) {
      this.thumbnail = thumbnail
      moveInputLabel()
    },
    songSubmitted(e) {
      e.preventDefault()
      this.upsertSong()
    },
    upsertSong() {
      const hasTracks = !!this.tracks.length
      const allTracksHaveInstrument = !this.tracks.find((track) => {
        const { instrument } = track.metadata
        if (!instrument) return true
        if (instrument.type === 'custom' && !instrument.name) return true
        return false
      })
      const tracksValid = hasTracks && allTracksHaveInstrument

      const { songId } = this
      if (!songId && (!this.thumbnail || !tracksValid)) return

      this.submitErr = ''
      const {
        song, thumbnail, tracks, duration, demoArea
      } = this

      if (!duration && !this.song.duration) return

      if (duration) song.duration = duration
      if (demoArea) song.demoArea = demoArea

      const tracksToDelete = this.existingTracks.filter(item => item.markedForDeletion)

      const reqObj = { song, thumbnail, tracks }
      this.submitting = true

      const onProgress = ({ track, progress }) => {
        this.$emit('progress', { progress, track })
      }

      const action = songId ? 'updateSong' : 'postSong'
      const promises = [Api[action](reqObj, onProgress)]
      if (tracksToDelete.length) {
        promises.push(Api.deleteTracks(tracksToDelete, songId))
      }

      Promise.all(promises)
        .then(() => {
          if (this.songId) {
            this.getSong()
          } else {
            this.$router.push({ name: 'adminDashboard' })
          }
        })
        .catch((err) => {
          this.submitErr = err.msg
        })
        .finally(() => {
          this.submitting = false
        })
    },
    prepareWave({ url, blob }) {
      const { demoArea } = this.song
      const hasDemoArea = this.songId && demoArea

      const region = {
        loop: true,
        drag: true,
        resize: true,
        color: 'rgba(0,0,0,0.35)'
      }

      if (!hasDemoArea) {
        const regionStart = Math.floor(this.duration / 2)
        region.start = regionStart
        region.end = regionStart + REGION_DURATION
      } else {
        region.start = demoArea.start
        region.end = demoArea.start + demoArea.duration
      }

      document.getElementById('wavedemo').innerHTML = ''
      this.wavesurfer = WaveSurfer.create({
        container: '#wavedemo',
        waveColor: '#dee2e8',
        progressColor: '#fff',
        plugins: [
          RegionPlugin.create({ regions: [region] })
        ],
        height: 60,
        responsive: true,
        minPxPerSec: 1
      })
      if (url) {
        this.wavesurfer.load(`${serverUrl}/static/tracks/${url}`)
      } else if (blob) {
        this.wavesurfer.loadBlob(blob)
      } else {
        return
      }

      this.wavesurfer.on('ready', () => {
        const regionKeys = Object.keys(this.wavesurfer.regions.list)
        this.wavesurfer.regions.list[regionKeys[0]].update({ resize: 'true', drag: 'true' })
        this.waveLoaded = true
      })

      this.wavesurfer.on('region-updated', (e) => {
        const { start, end } = e
        this.demoArea.start = Math.floor(start)
        this.demoArea.duration = Math.floor(end - start)
      })
    },
    removeTrack(trackId) {
      const track = this.existingTracks.find(item => item.id === trackId)
      if (!track) return

      const totalTrackCount = this.existingTracks.length + this.song.tracks
      if (totalTrackCount <= 1) return

      this.existingTracks = this.existingTracks.map(item => ({ ...item, markedForDeletion: track.markedForDeletion ? false : item.id === trackId }))
    },
    getTrackFullTitle(track) {
      const { type, name } = track.instrument
      const namePart = name ? `(${name})` : ''
      const fullTitle = `${capitalizeLetter(type)} ${namePart}`
      return fullTitle.trim()
    },
    getEventBus() {
      return this
    }
  },
  components: {
    TrackUpload
  }
}
</script>

<style lang="scss">
  .manage-song {
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
    .song-thumbnail {
      max-width: 150px;
    }
  }
</style>