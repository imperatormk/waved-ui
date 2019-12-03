<template lang="pug">
  b-card(no-body style="padding:2px;")
    .p5(v-if="loading")
      b-progress(:id="'pb' + track.id" :value="1" :max="1" animated)
    .flex-row.align-center.font-black
      .w18.flex-row.align-center.space-between.p10-side
        span.narrow-line {{ instrumentTitle }}
        font-awesome-icon.fs20(:icon="instrumentIcon" fixed-width)
      .w57.flex-col(:style="{'background-color':color}")
        .w100(ref="wave" @ready="onReady" :id="'wave' + track.id")
      .p10-side
      .w25.flex-row.align-center.space-between
        .flex-col.justify-center
          .flex-row.align-center
            .w70.flex-row.align-center
              b-form-input(type="range" @input="panningChanged" min="-100" max="100" step="20" :value="panning * 100")
            .w30.flex-row.justify-end.align-center
              span {{ panningDirection }} {{ Math.abs(panning).toFixed(1) }}
          .flex-row.align-center
            .w70.flex-row.align-center
              b-form-input(type="range" @input="volumeChanged" min="0" max="100" value="100")
            .w30.flex-row.justify-end.align-center
              span {{ volume }}%
        .p20-left.p5-right.flex-row.align-end.justify-center
          b-button(@click="toggleMute" :variant="mute ? 'warning' : null") M
          .p5-left
          b-button(@click="newSolo" :variant="solo ? 'danger' : null") S
</template>

<script>
import WaveSurfer from 'wavesurfer.js'
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min'
import { instruments, colors } from '@/data'

const fallbackServerUrl = 'https://studiodoblo.de:7000'
const serverUrl = process.env.VUE_APP_SERVER_URL || fallbackServerUrl

const changePbColor = (id, color) => {
  const el = document.querySelector(`#${id} > .progress-bar`)
  el.style.backgroundColor = color
}

const getSeconds = (val) => {
  const [minutes, seconds] = val.split(':')
  const numericM = Number(minutes)
  const numericS = Number(seconds)
  return numericM * 60 + numericS
}

const hydrateRegions = (id, duration) => {
  const el = document.querySelector(`#${id} > wave > region`)
  if (!el) return

  const title = el.getAttribute('title')
  if (!title) return

  const [start, end] = title.split('-')
  const startS = getSeconds(start)
  const endS = getSeconds(end)

  const regionLeft = el.cloneNode(true)
  const leftWidth = Math.round(startS / duration * 100)
  // eslint-disable-next-line
  regionLeft.style.width = `${leftWidth}%`

  const regionRight = el.cloneNode(true)
  const rightWidth = Math.round((duration - endS) / duration * 100) - 0.25
  const offset = Math.round(endS / duration * 100)
  // eslint-disable-next-line
  regionRight.style.width = `${rightWidth}%`
  regionRight.style.left = `${offset}%`

  const parent = document.querySelector(`#${id} > wave`)
  parent.appendChild(regionLeft)
  parent.appendChild(regionRight)
  el.remove()
}

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
    songDuration: Number,
    eventBus: {
      type: Object,
      required: true
    }
  },
  mounted() {
    const pbId = `pb${this.track.id}`
    changePbColor(pbId, this.color)

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
        height: 40,
        responsive: true,
        minPxPerSec: 1
      })
      this.execSuppressed(() => {})
      this.wavesurfer.load(`${serverUrl}/static/tracks/${this.track.url}`)
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
    volume: 100,
    panning: 0,
    loading: true
  }),
  computed: {
    color() {
      const index = this.index % colors.length
      return colors[index]
    },
    instrumentIcon() {
      const { instrument } = this.track
      const { type } = instrument
      const { icon } = instruments[type]
      return icon
    },
    instrumentTitle() {
      const { instrument } = this.track
      const { type, name } = instrument
      const { title } = instruments[type]

      if (type === 'custom') return name
      if (name) return `${title} (${name})`
      return title
    },
    panningDirection() {
      if (this.panning < 0) return 'L'
      if (this.panning > 0) return 'R'
      return 'C'
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
      this.volume = e
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

        const waveId = `wave${this.track.id}`
        this.$nextTick(() => {
          hydrateRegions(waveId, this.songDuration)
        })
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
