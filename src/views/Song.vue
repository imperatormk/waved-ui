<template lang="pug">
  Layout(:title="song ? `${song.title} (${genres})` : ''" :subtitle="song ? `by ${song.artist}` : ''")
    .flex-col(v-if="loaded")
      .flex-col(v-if="song.status === 'READY'")
        .p10-bot.m5.flex-row.justify-end
          b-card(no-body)
            .p5-left.flex-row.m5
              .flex-row.align-center
                span Pitch
                .p5-side
                b-form-select(v-model="pitch" :options="pitches")
              .p20-side
              .flex-row.align-center
                span Tempo
                .p5-side
                b-form-input(type="range" @change="tempoChanged" min="1" max="500" :value="tempo * 100")
              .p20-side
              div(v-if="allReady")
              .flex-row.align-center
                div
                  b-button(@click.prevent="togglePlay") {{ !playing ? 'Play' : 'Pause' }}
                .p5-left
                  b-button(@click.prevent="collectData" :disabled="preparing") Prepare
        Wave.m5(@ready="onWaveReady"
          @export="exportAcc"
          @newseek="$emit('newseek', $event)"
          @soloed="soloed"
          v-for="(track, idx) in tracks"
          :key="track.id"
          :regions="regions"
          :track="track"
          :index="idx"
          :eventBus="getEventBus()")
      .flex-col(v-else-if="song.status === 'PREPARING'")
        b-alert(show variant="warning") Song not ready yet, please try again in a bit.
      .flex-col(v-else-if="song.status === 'FAILED'")
        b-alert(show variant="danger") Song is corrupted, please contact admin.
</template>

<script>
import Wave from '@/components/Wave'
import Api from '@/services/api'

const REGION_DURATION = 30

export default {
  props: {
    songId: {
      type: Number,
      required: true
    }
  },
  mounted() {
    this.fetchData()
    document.body.onkeyup = (e) => {
      if (e.keyCode === 32) {
        this.togglePlay()
      }
    }
  },
  beforeDestroy() {
    document.body.onkeyup = null
  },
  data: () => ({
    song: null,
    tracks: [],
    regions: [],
    pitch: 0,
    tempo: 1,
    prepared: [],
    readyCount: 0,
    pitches: [
      { value: 'm2', text: '-2' },
      { value: 'm1', text: '-1' },
      { value: 0, text: 'Normal' },
      { value: 1, text: '+1' },
      { value: 2, text: '+2' }
    ],
    playing: false,
    preparing: false,
    loaded: false
  }),
  watch: {
    pitch() {
      this.fetchData()
    }
  },
  computed: {
    allReady() {
      return this.readyCount === this.tracks.length
    },
    loggedUser() {
      return this.$store.state.authentication.user
    },
    genres() {
      const { genres } = this.song
      if (!genres) return ''

      const genresMapped = genres
        .map(item => item.name)
        .map(item => item.toLowerCase())
        .join(', ')
        .trim()
      return genresMapped
    }
  },
  methods: {
    getEventBus() {
      return this
    },
    fetchData() {
      this.readyCount = 0
      this.playing = false
      this.loaded = false

      this.getSong()
        .then(() => {
          this.loadRegions()
          this.loaded = true
        })
    },
    loadRegions() {
      const shouldDisplay = !this.loggedUser || !this.loggedUser.isAdmin
      if (shouldDisplay) {
        const { duration } = this.song
        const start = Math.floor(duration / 2)

        this.regions.push({
          start,
          end: start + REGION_DURATION,
          loop: true,
          dragSelection: false,
          resizeSelection: false
        })
      }
    },
    getSong() {
      const { songId } = this
      return Api.getSong(songId, this.pitch)
        .then((song) => {
          this.song = song
          this.tracks = song.tracks
        })
    },
    togglePlay() {
      this.$emit('toggleplay')
      this.playing = !this.playing
    },
    soloed(idx) {
      this.$emit('newsolo', idx)
    },
    tempoChanged(e) {
      const value = e / 100
      this.tempo = value
      this.$emit('tempochanged', value)
    },
    collectData() {
      this.prepared = []
      this.$emit('collectdata')
    },
    exportAcc(data) {
      this.prepared.push(data)
      if (this.prepared.length === this.tracks.length) this.onDataReady()
    },
    onDataReady() {
      const data = {
        tracks: this.prepared,
        opts: {
          tempo: this.tempo
        }
      }
      this.preparing = true
      Api.processTracks(this.songId, data)
        .then(() => {
          this.$router.push({ name: 'userDashboard' })
        })
        .finally(() => {
          this.preparing = false
        })
    },
    onWaveReady() {
      this.readyCount += 1
    }
  },
  components: {
    Wave
  }
}
</script>