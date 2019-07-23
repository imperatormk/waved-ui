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
          template(slot="show_details" slot-scope="row")
            b-button(@click="row.toggleDetails" size="sm") {{ row.detailsShowing ? 'Hide' : 'Show'}} details
          template(slot="row-details" slot-scope="row")
            b-card
              .flex-row
                .flex-col
                  b-button.m5(v-if="row.item.outputFilename" @click="downloadProcessing(row.item)") Download
                  b-button.m5(v-if="!row.item.orderId" @click="orderItem(row.item)") Pay now
                .flex-1
          template(slot="empty")
            h5 Nothing to see here...
          template(slot="table-busy")
            h5 Loading...
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
      key: 'show_details',
      label: ''
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
      Api.doit(pcsId)
    }
  }
}
</script>