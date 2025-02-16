<template lang="pug">
  b-card(no-body style="padding:2px;")
    .p5(v-if="loading")
      b-progress(:id="'pb' + track.id" :value="1" :max="1" animated height="0.7rem")
    .flex-row.align-center.font-black
      .w15.flex-row.align-center.space-between.p10-side
        span.narrow-line {{ instrumentTitle }}
        font-awesome-icon.fs20(:icon="instrumentIcon" fixed-width)
      .w55.flex-col(:style="{'background-color':color}")
        .w100(ref="wave" @ready="onReady" :id="'wave' + track.id")
      .p10-side
      .w30.flex-row.align-center.space-between
        .flex-row.align-center
          .flex-col.align-center
            .w100.flex-row.space-between.align-center
              span L
              span C
              span R
            .flex-row.align-center
              b-form-input(type="range" @input="panningChanged" min="-100" max="100" step="20" :value="panning * 100")
          .p10-left.p5-right
          .flex-row.align-center
            .w100.flex-row.align-center.p10-right
              VolumeSlider(:value="volume" @input="volumeChanged" :color="color" :mute="mute" show-label)
        .p5-right.flex-row.align-end.justify-center
          b-button(@click="toggleMute" :pressed="false" :style="{'background-color': !mute ? color : '#6c757d', 'border-color': 'transparent'}")
            font-awesome-icon(:icon="mute ? 'volume-mute' : 'volume-up'" :pressed="false" fixed-width)
          .p5-left
          b-button(@click="newSolo" :style="{'background-color': solo ? color : '#6c757d'}") S
</template>

<script>
import WaveSurfer from 'wavesurfer.js'
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min'

import VolumeSlider from '@/components/VolumeSlider'

import { instruments, colors } from '@/data'
import { getServerUrl } from '@/services/system'

const serverUrl = getServerUrl()

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

  const regionLeft = el.cloneNode(false)
  const leftWidth = startS / duration * 100
  regionLeft.style.width = `${leftWidth}%`
  regionLeft.style.cursor = 'default'
  regionLeft.title = ''

  const regionRight = el.cloneNode(false)
  const rightWidth = (duration - endS) / duration * 100
  const offset = endS / duration * 100
  regionRight.style.width = `${rightWidth}%`
  regionRight.style.left = `${offset}%`
  regionRight.style.cursor = 'default'
  regionRight.title = ''

  const parent = document.querySelector(`#${id} > wave`)
  parent.appendChild(regionLeft)
  parent.appendChild(regionRight)
  parent.style.overflow = 'hidden'
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
      seek: this.newSeek,
      play: this.onPlay,
      pause: this.onPause,
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
      collectdata: this.onCollectData
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
    soundtouch: {
      instance: null,
      source: null,
      node: null,
      pos: null,
      diff: 0,
      length: null
    },
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
      this.mute = this.volume === 0
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
    onPlay() {
      // eslint-disable-next-line
      this.soundtouch.pos = ~~(this.wavesurfer.backend.getPlayedPercents() * this.soundtouch.length)

      const tempo = this.wavesurfer.getPlaybackRate()
      this.soundtouch.instance.tempo = tempo

      if (tempo === 1) {
        this.wavesurfer.backend.disconnectFilters()
      } else {
        if (!this.soundtouch.node) {
          const filter = new window.soundtouch.SimpleFilter(this.soundtouch.source, this.soundtouch.instance)
          this.soundtouch.node = window.soundtouch.getWebAudioNode(this.wavesurfer.backend.ac, filter)
        }
        this.wavesurfer.backend.setFilter(this.soundtouch.node)
      }
    },
    onPause() {
      const { node } = this.soundtouch
      if (node) node.disconnect()
    },
    onCollectData() {
      const tempoPerc = this.wavesurfer.getPlaybackRate()
      const volume = this.wavesurfer.getVolume()
      const mute = this.wavesurfer.getMute()

      const { instrumentTitle, panning } = this
      const { url } = this.track

      const data = {
        tempo: {
          percentage: tempoPerc
        },
        volume,
        mute,
        panning,
        url,
        title: instrumentTitle
      }
      this.$emit('export', data)
    },
    newSeek(value) {
      // eslint-disable-next-line
      this.soundtouch.pos = ~~(this.wavesurfer.backend.getPlayedPercents() * this.soundtouch.length)
      this.$emit('newseek', value)
    },
    onReady() {
      const setupSoundtouch = () => {
        const instance = new window.soundtouch.SoundTouch(this.wavesurfer.backend.ac.sampleRate)
        const source = {
          extract: (target, numFrames, position) => {
            if (this.soundtouch.pos != null) {
              this.soundtouch.diff = this.soundtouch.pos - position
              this.soundtouch.pos = null
            }
            // eslint-disable-next-line
            position += this.soundtouch.diff

            const buffer = this.wavesurfer.backend.buffer || {}
            const channels = buffer.numberOfChannels
            const l = buffer.getChannelData(0)
            const r = channels > 1 ? buffer.getChannelData(1) : l

            for (let i = 0; i < numFrames; i += 1) {
              // eslint-disable-next-line
              target[i * 2] = l[i + position]
              // eslint-disable-next-line
              target[i * 2 + 1] = r[i + position]
            }

            return Math.min(numFrames, this.soundtouch.length - position)
          }
        }

        this.soundtouch.instance = instance
        this.soundtouch.source = source
        this.soundtouch.length = this.wavesurfer.backend.buffer.length
      }

      const setupWave = () => {
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
      }

      setupSoundtouch()
      setupWave()

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
  },
  components: {
    VolumeSlider
  }
}
</script>
