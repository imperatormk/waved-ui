<template lang="pug">
  div
    .p15.flex-col.text-white(style="background-color:#d371e2" v-if="loaded")
      h3 {{ song.title }}
      br
      Wave(@ready="onWaveReady"
        @export="exportAcc"
        @newseek="$emit('newseek', $event)"
        @soloed="soloed"
        v-for="(track, idx) in tracks"
        :key="track.id"
        :regions="regions"
        :track="track"
        :index="idx"
        :eventBus="getEventBus()")
      .w20.p20(v-if="allReady")
        .p5.flex-row.align-center
          span Tempo
          .p10
          b-form-input(type="range" @change="tempoChanged" min="0" max="500" :value="tempo * 100")
        .p10
          b-button(@click.prevent="play") {{ !playing ? 'Play' : 'Pause' }}
          .p5
          b-button(@click.prevent="collectData") Prepare
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

    this.getSong()
      .then(() => {
        this.loaded = true
      })
  },
  data: () => ({
    song: null,
    tracks: [],
    regions: [],
    tempo: 1,
    prepared: [],
    readyCount: 0,
    playing: false,
    loaded: false
  }),
  computed: {
    allReady() {
      return this.readyCount === this.tracks.length
    }
  },
  methods: {
    getEventBus() {
      return this
    },
    getSong() {
      const songId = this.songId
      return Api.getSong(songId)
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
