<template lang="pug">
  Layout(title="Dashboard")
    b-card
      .flex-row.space-between.align-center(slot="header")
        span Processings
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
          small
        )
          template(v-slot:cell(actions)="data")
            b-button(@click="toggleDetails(data.item)" size="sm") {{ data.item._showDetails ? 'Hide' : 'Show' }} details
          template(slot="row-details" slot-scope="row")
            b-card
              .flex-row
                .flex-col.m5(v-if="row.item.outputFilename")
                  span Your track is ready
                  .p5
                  b-button(@click="downloadProcessing(row.item)") Download
                .flex-col.m5(v-if="row.item.status === 'PENDING'")
                  span Please submit payment to proceed
                  .p5
                  b-button(@click="orderItem(row.item)") Order now
                .flex-col.m5(v-else-if="row.item.status === 'PREPARING'")
                  span Track is still processing...
                .flex-1
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
          @change="fetchData"
        )
</template>

<script>
import Api from '@/services/api'

const openInNewTab = (url) => {
  const win = window.open(url, '_blank')
  win.focus()
}

export default {
  created() {
    this.fetchData()
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
    loaded: false
  }),
  methods: {
    fetchData() {
      this.loaded = false
      Api.getProcessings(this.pagination)
        .then((resp) => {
          this.processings = resp.content.map(processing => ({
            ...processing,
            _showDetails: false
          }))
          this.totalElements = resp.totalElements
          this.loaded = true
        })
    },
    downloadProcessing(processing) {
      const { id, outputFilename } = processing
      Api.downloadProcessing(id, outputFilename)
    },
    orderItem(processing) {
      const pcsId = processing.id
      Api.orderItem(pcsId)
        .then((result) => {
          const { paymentUrl } = result
          if (paymentUrl) {
            openInNewTab(paymentUrl)
          }
        })
    },
    toggleDetails(row) {
      // eslint-disable-next-line
      row._showDetails = !row._showDetails
    }
  }
}
</script>