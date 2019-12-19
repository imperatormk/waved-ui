<template lang="pug">
  Layout(title="Dashboard")
    b-card
      .flex-row.space-between.align-center(slot="header")
        span User settings
        b-button(@click="updateSettings" variant="primary") Update
      b-form(ref="userForm")
        b-alert(:show="!!userSettingsError" variant="danger") {{ userSettingsError }}
        b-input-group(prepend="Email")
          b-form-input(v-model="user.email" required autocomplete="new-password")
        br
        b-input-group(prepend="Password")
          b-form-input(v-model="user.password" placeholder="(unchanged)" type="password" autocomplete="new-password")
        br
        b-input-group(v-if="user.password" prepend="Confirm password")
          b-form-input(v-model="user.confirmPassword" type="password" autocomplete="new-password")
    br
    b-card
      .flex-row.space-between.align-center(slot="header")
        span Creations
      .flex-col
        b-table(
          id="processing-table"
          :items="processings"
          :busy="!loaded"
          :per-page="pagination.size"
          :current-page="1"
          :fields="fields"
          show-empty
          hover
          responsive
          small
        )
          template(v-slot:cell(song.title)="data")
            .flex-row
              span {{ data.item.song.title }}
              .p5-side(v-if="data.item.outputFilename")
                b-badge(pill variant="success") Ready
          template(v-slot:cell(createdAt)="data")
            span {{ formatDate(data.item.createdAt) }}
          template(v-slot:cell(actions)="data")
            b-button(@click="toggleDetails(data.item)" size="sm") {{ data.item._showDetails ? 'Hide' : 'Details' }}
          template(slot="row-details" slot-scope="row")
            b-card
              .flex-row
                ConfigView(:config="getProcessingConfig(row.item)")
                .flex-row.align-center.justify-center.w50
                  .flex-col.m5(v-if="row.item.outputFilename")
                    span Your creation is ready
                    .p5
                    b-button(@click="downloadProcessing(row.item)" :disabled="row.item.downloadInProgress") {{ !row.item.downloadInProgress ? 'Download' : 'Please wait...' }}
                  .flex-col.m5(v-if="row.item.status === 'PENDING'")
                    span Please submit payment to proceed
                    .p5
                    b-button(@click="orderItem(row.item)") Order now
                  .flex-col.m5(v-else-if="row.item.status === 'PREPARING'")
                    span Creation is still processing, please check again soon.
                  .flex-col.m5(v-else-if="row.item.status === 'BROKEN'")
                    span Something gone wrong, please contact admin or try again.
          template(slot="empty")
            span Nothing to see here...
          template(slot="table-busy")
            span Loading...
        b-pagination(
          v-if="totalElements > pagination.size"
          v-model="pagination.page"
          :total-rows="totalElements"
          :per-page="pagination.size"
          aria-controls="processing-table"
          @change="fetchDataDeferred"
        )
</template>

<script>
import Api from '@/services/api'
import ConfigView from '@/components/ConfigView'
// eslint-disable-next-line
import { gotoUrl, formatDate } from '@/helpers'

export default {
  created() {
    this.fetchData()
    this.user = { ...this.loggedUser }
  },
  data: () => ({
    pagination: {
      page: 1,
      size: 10
    },
    totalElements: 0,
    fields: [{
      key: 'song.title',
      label: 'Title'
    }, {
      key: 'song.artist',
      label: 'Artist'
    },
    {
      key: 'createdAt',
      label: 'Date'
    },
    {
      key: 'actions',
      label: 'Actions'
    }],
    processings: [],
    user: {},
    userSettingsError: '',
    loaded: false
  }),
  computed: {
    loggedUser() {
      return this.$store.state.authentication.user
    }
  },
  methods: {
    fetchDataDeferred() {
      this.$nextTick(this.fetchData)
    },
    fetchData() {
      this.loaded = false

      const params = { ...this.pagination }
      params.order = 'desc'

      Api.getProcessings(params)
        .then((resp) => {
          const { content, totalElements } = resp
          this.processings = content.map(processing => ({
            ...processing,
            _showDetails: false
          }))
          this.totalElements = totalElements
          this.loaded = true
        })
    },
    downloadProcessing(processing) {
      const { id, outputFilename } = processing
      const processingObj = this.processings.find(item => item.id === id)
      processingObj.downloadInProgress = true
      this.$forceUpdate() // suboptimal

      Api.downloadProcessing(id, outputFilename)
        .finally(() => {
          processingObj.downloadInProgress = false
          this.$forceUpdate() // suboptimal
        })
    },
    orderItem(processing) {
      const pcsId = processing.id
      Api.orderItem(pcsId)
        .then((result) => {
          const { paymentUrl } = result
          if (paymentUrl) {
            gotoUrl(paymentUrl, false)
          }
        })
    },
    toggleDetails(row) {
      // eslint-disable-next-line
      row._showDetails = !row._showDetails
    },
    updateSettings() {
      this.userSettingsError = null
      const { userForm } = this.$refs

      if (!userForm.checkValidity()) {
        userForm.reportValidity()
        return
      }

      const { email, password, confirmPassword } = this.user
      if (password) {
        const valid = password === confirmPassword
        if (!valid) {
          this.userSettingsError = 'Passwords do not match'
          return
        }
      }

      const reqObj = { email, password, confirmPassword }
      Api.updateUser(reqObj)
        .then((result) => {
          this.$store.dispatch('authentication/update', result)
        })
        .catch((err) => {
          this.userSettingsError = err.msg
        })
    },
    getProcessingConfig(processing) {
      const { config } = processing
      return JSON.parse(config)
    },
    formatDate(date) {
      const format = 'dd.MM.yyyy HH:mm'
      return formatDate(date, format)
    }
  },
  components: {
    ConfigView
  }
}
</script>