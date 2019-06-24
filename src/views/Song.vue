<template lang="pug">
  Layout(:title="song ? song.title : ''")
    .flex-col(v-if="loaded")
      .flex-col(v-if="song.status === 'READY'")
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
        .w20.p20
          .p5.flex-row.align-center
            span Pitch
            .p10
            b-form-select(v-model="pitch" :options="pitches")
          .p5.flex-row.align-center
            span Tempo
            .p10
            b-form-input(type="range" @change="tempoChanged" min="0" max="500" :value="tempo * 100")
        .w20.p20(v-if="allReady")
          .p10
            b-button(@click.prevent="play") {{ !playing ? 'Play' : 'Pause' }}
            .p5
            b-button(@click.prevent="collectData") Prepare
      .flex-col(v-else-if="song.status === 'PREPARING'")
        b-alert(show variant="warning") Song not ready yet, please try again in a bit.
      .flex-col(v-else-if="song.status === 'FAILED'")
        b-alert(show variant="error") Song is corrupted, please contact admin.
</template>

<script>
import Wave from '@/components/Wave'
import Api from '@/services/api'

export default {
  props: {
    songId: {
      type: Number,
      required: true
    }
  },
  mounted() {
    const r = false
    if (r) {
      this.regions.push({
        start: 10,
        end: 20,
        loop: true,
        dragSelection: false,
        resizeSelection: false
      })
    }

    this.fetchData()
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
          this.loaded = true
        })
    },
    getSong() {
      const { songId } = this
      return Api.getSong(songId, this.pitch)
        .then((song) => {
          this.song = song
          this.tracks = song.tracks
        })
    },
    play() {
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
      Api.processTracks(1, data)
        .then((resp) => {
          console.log(resp)
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
