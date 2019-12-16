<template lang="pug">
  Layout(:title="pageTitle")
    b-card.p15(v-if="processing")
      h4(v-if="pageMessage") {{ pageMessage }}
      .flex-col.p5(v-if="config")
        .p5
        h5 Settings
        .p20-bot.p5-top
          b-badge(pill variant="danger")
            .fs14.p5 Tempo: {{ config.opts.tempo * 100 }}%
        h5 Tracks
        .flex-row.p5(v-for="track in config.tracks")
          span {{ track.title || 'Instrument' }}
          .p5-side
          div
            b-badge(pill variant="dark")
              .fs14.p5 Tempo: {{ track.tempo * 100 }}%
          .p5-side
          div(v-if="!track.mute")
            b-badge(pill variant="primary")
              .fs14.p5 Volume: {{ track.volume * 100 }}%
          .p5-side
          div(v-if="track.mute")
            b-badge(pill variant="danger")
              .fs14.p5 Mute
          div
            b-badge(pill variant="secondary")
              .fs14.p5 Panning: {{ track.panning * 100 }}%
          .p5-side
</template>

<script>
import Api from '@/services/api'

const statuses = [{
  status: ['paid'],
  title: 'Your order has been received',
  message: 'Here is what you have brewed'
}, {
  status: ['failed', 'canceled'],
  title: 'Something has gone wrong',
  message: 'We got a failure message — please retry the order and let us know if the issue persists'
}]

export default {
  created() {
    const processingId = this.$route.query.id
    Api.getProcessing(processingId, true)
      .then((processing) => {
        this.processing = processing
      })
      .catch(() => {
        this.$router.push({ name: 'home' })
      })
  },
  data: () => ({
    processing: null
  }),
  computed: {
    order() {
      const { processing } = this
      if (!processing) return null
      return processing.order
    },
    config() {
      const { processing } = this
      if (!processing) return null
      const { config } = processing
      return JSON.parse(config)
    },
    pageTitle() {
      const { order } = this
      if (!order) return null

      const { status } = order
      const statusObj = statuses.find(item => item.status.includes(status))

      if (!statusObj) return null
      return statusObj.title
    },
    pageMessage() {
      const { order } = this
      if (!order) return null

      const { status } = order
      const statusObj = statuses.find(item => item.status.includes(status))

      if (!statusObj) return null
      return statusObj.message
    }
  }
}
</script>