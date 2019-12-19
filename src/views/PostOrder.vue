<template lang="pug">
  Layout(:title="pageTitle")
    b-card.p15(v-if="processing")
      h4(v-if="pageMessage") {{ pageMessage }}
      template(v-if="isSuccess && config")
        .flex-row.flex-wrap
          .flex-1
            ConfigView(:config="config")
          .flex-2
        .p10
      h6 Don't forget you can always view all your creations in your&nbsp;
        router-link(:to="{name:'userDashboard'}") Dashboard
</template>

<script>
import differenceInHours from 'date-fns/differenceInHours'

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
        const createdAtDate = new Date(createdAt)
        const nowDate = new Date()

        const hours = Math.abs(differenceInHours(createdAtDate, nowDate))
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