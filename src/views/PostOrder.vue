<template lang="pug">
  Layout(:title="pageTitle")
    b-card.p15(v-if="processing")
      h4(v-if="pageMessage") {{ pageMessage }}
      template(v-if="isSuccess && config")
        ConfigView(:config="config")
        .p10
      h6 Don't forget you can always view all your creations in your&nbsp;
        router-link(:to="{name:'userDashboard'}" target="_blank") Dashboard
</template>

<script>
import moment from 'moment'

import Api from '@/services/api'
import ConfigView from '@/components/ConfigView'

const statuses = [{
  type: 'success',
  status: ['paid'],
  title: 'Your order has been received',
  message: 'Here is what you have brewed'
}, {
  type: 'failure',
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

        const statusObj = this.getOrderStatus(this.order)
        if (!statusObj) throw new Error('nonexistentStatus')
        this.status = statusObj

        const { createdAt } = this.order
        const createdAtDate = moment(createdAt)
        const nowDate = moment()

        const duration = moment.duration(createdAtDate.diff(nowDate))
        const hours = Math.abs(duration.asHours())
        if (hours > 2) throw new Error('expiredPostOrder')
      })
      .catch(() => {
        this.$router.push({ name: 'home' })
      })
  },
  data: () => ({
    processing: null,
    status: null
  }),
  methods: {
    getOrderStatus(order) {
      const { status } = order
      const statusObj = statuses.find(item => item.status.includes(status))
      if (!statusObj) return null
      return { ...statusObj, status }
    }
  },
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
      const { status } = this
      if (!status) return null

      return status.title
    },
    pageMessage() {
      const { status } = this
      if (!status) return null

      return status.message
    },
    isSuccess() {
      const { status } = this
      if (!status) return false

      return status.type === 'success'
    }
  },
  components: {
    ConfigView
  }
}
</script>