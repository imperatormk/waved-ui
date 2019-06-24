<template lang="pug">
  .flex-row.align-center.text-white
    .w5
      span {{ track.instrument }}
    .w70.flex-col(:style="{'background-color':color}")
      .p10(v-if="loading")
        b-spinner(variant="light" type="grow")
      .w100(ref="wave" @ready="onReady" :id="'wave' + track.id")
    .p10
    .w25.flex-row.p5.align-center
      .p5.flex-row.align-center
        .flex-col
          .flex-row.space-between.text-white
            span L
            span C
            span R
          .flex-row
            .flex-1
              b-form-input(type="range" @change="panningChanged" min="-100" max="100" step="20" :value="panning * 100")
        .p10
        .flex-col
          .flex-row.space-between.text-white
            span 0
            span 50
            span 100
          .flex-row
            .flex-1
              b-form-input(type="range" @change="volumeChanged" min="0" max="100" value="100")
      .p10
      .p5.flex-row.justify-end.align-center
        b-button(@click="toggleMute" :variant="mute ? 'warning' : null") M
        .p5
        b-button(@click="newSolo" :variant="solo ? 'danger' : null") S
</template>

<script>
import WaveSurfer from 'wavesurfer.js'
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min'
import colors from '@/data/colors'

export default {
  props: {
    index: Number,
    track: {
      type: Object,
      required: true
    },
    regions: {
      type: Array,
      default: () => []
    },
    eventBus: {
      type: Object,
      required: true
    }
  },
  mounted() {
    const regionConfig = {
      regions: this.regions
    }

    this.waveEvents = {
      ready: this.onReady,
      seek: this.newSeek
    }

    this.$nextTick(() => {
      this.wavesurfer = WaveSurfer.create({
        container: `#wave${this.track.id}`,
        waveColor: '#dee2e8',
        progressColor: '#fff',
        plugins: [
          RegionPlugin.create(regionConfig)
        ],
        height: 100,
        responsive: true,
        minPxPerSec: 1
      })
      this.execSuppressed(() => {})
      this.wavesurfer.load(`http://localhost:7000/static/tracks/${this.track.url}`)
      if (this.regions.length) {
        this.wavesurfer.toggleInteraction()
      }

      const panner = this.wavesurfer.backend.ac.createPanner()
      this.wavesurfer.panner = panner
      this.wavesurfer.backend.setFilter(panner)
    })

    this.events = {
      toggleplay: this.togglePlay,
      newsolo: this.onNewSolo,
      newseek: this.onNewSeek,
      tempochanged: this.onTempoChanged,
      collectdata: this.onCollectData,
    }

    this.subEvents()
  },
  destroyed() {
    this.unsubEvents()
    this.wavesurfer.destroy()
  },
  data: () => ({
    wavesurfer: null,
    waveEvents: {},
    events: {},
    region: null,
    mute: false,
    solo: false,
    hasSolo: false,
    playing: false,
    panning: 0,
    loading: true
  }),
  computed: {
    color() {
      return colors[this.index]
    }
  },
  methods: {
    subEvents() {
      Object.keys(this.events).forEach((event) => {
        this.eventBus.$on(event, this.events[event])
      })
    },
    unsubEvents() {
      Object.keys(this.events).forEach((event) => {
        this.eventBus.$off(event)
      })
    },
    togglePlay() {
      if (this.playing) {
        this.wavesurfer.pause()
      } else {
        this.wavesurfer.play()
      }
      this.playing = !this.playing
    },
    toggleMute() {
      this.mute = !this.mute
      this.updateMute()
    },
    volumeChanged(e) {
      const newValue = e / 100
      this.wavesurfer.setVolume(newValue)
    },
    panningChanged(e) {
      const value = Math.sin(e * (Math.PI / 180))
      this.wavesurfer.panner.setPosition(value, 0, 0)
      this.panning = e / 100
    },
    newSolo() {
      this.$emit('soloed', !this.solo ? this.track.id : null)
    },
    onNewSolo(id) {
      this.hasSolo = id != null
      this.solo = this.hasSolo ? this.track.id === id : false
      this.updateMute()
    },
    onTempoChanged(value) {
      this.wavesurfer.setPlaybackRate(value)
    },
    onNewSeek(value) {
      this.execSuppressed(() => {
        this.wavesurfer.seekTo(value)
      })
    },
    onCollectData() {
      const tempo = this.wavesurfer.getPlaybackRate()
      const volume = this.wavesurfer.getVolume()
      const mute = this.wavesurfer.getMute()

      const { panning } = this
      const { url } = this.track

      const data = {
        tempo,
        volume,
        mute,
        panning,
        url
      }
      this.$emit('export', data)
    },
    newSeek(value) {
      this.$emit('newseek', value)
    },
    onReady() {
      if (this.regions.length) {
        const firstRegion = this.regions[0]
        const duration = this.wavesurfer.getDuration()
        const startTime = firstRegion.start
        const progress = startTime / duration
        this.wavesurfer.seekTo(progress)
      }
      this.loading = false
      this.$emit('ready')
    },
    updateMute() {
      const { mute, solo, hasSolo } = this

      const value = mute || (hasSolo && !solo)
      this.wavesurfer.setMute(value)
    },
    execSuppressed(fn) {
      this.wavesurfer.unAll()
      fn()
      Object.keys(this.waveEvents).forEach((event) => {
        this.wavesurfer.on(event, this.waveEvents[event])
      })
    }
  }
}
</script>