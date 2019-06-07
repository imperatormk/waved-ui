<template lang="pug">
  .p15.flex-col(style="background-color:#d371e2")
    Wave(@ready="onWaveReady" @export="exportAcc" @newseek="$emit('newseek', $event)" @soloed="soloed" v-for="(track, idx) in tracks" :key="track" :regions="regions" :track="{url: track, id: idx}" :eventBus="getEventBus()")
    .w20.p20(v-if="allReady")
      b-button(@click.prevent="play") {{ !playing ? 'Play' : 'Pause' }}
      .p5
      b-button(@click.prevent="collectData") Prepare
      .p5
      b-form-input(type="range" @change="tempoChanged" min="0" max="500" :value="tempo * 100")
</template>

<script>
import Wave from '@/components/Wave'
import Api from '@/services/api'

export default {
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
  },
  data: () => ({
    tracks: [
      'guitartrack',
      'drumtrack',
    ],
    regions: [],
    tempo: 1,
    prepared: [],
    readyCount: 0,
    playing: false
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
