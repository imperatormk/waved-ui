<template lang="pug">
  .flex-col.p5
    h5 Settings
    .p20-bot.p5-top
      .flex-row
        .p5-side
          b-badge(pill variant="warning")
            .fs14.p5 Tempo: {{ config.opts.tempo * 100 }}%
        .p5-side(v-if="config.opts.pitch")
          b-badge(pill variant="info")
            .fs14.p5 Pitch: {{ pitch }}
    h5 Tracks
    .flex-row.flex-wrap.align-center(v-for="track in config.tracks")
      .p5-side.w50 {{ track.title || 'Instrument' }}
      div(style="display:inline-flex;")
        .p5
          b-badge(pill variant="secondary")
            .fs14.p5 Panning: {{ track.panning * 100 }}%
        .p5(v-if="!track.mute")
          b-badge(pill variant="primary")
            .fs14.p5 Volume: {{ track.volume * 100 }}%
        .p5(v-if="track.mute")
          b-badge(pill variant="danger")
            .fs14.p5 Mute
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  computed: {
    pitch() {
      const { pitch } = this.config.opts
      const stringPitch = pitch.toString()
      const hasMinus = stringPitch.indexOf('m') >= 0
      const normalizedPitch = stringPitch.replace('m', '')
      return hasMinus ? `-${normalizedPitch}st` : `+${normalizedPitch}st`
    }
  }
}
</script>