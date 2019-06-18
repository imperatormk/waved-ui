<template lang="pug">
  div
    b-card-group
      b-card(header="Songs" no-body)
        b-list-group
          b-list-group-item(v-for="song in songs" :key="songs.id")
            SongItem(:song="song")
    h4.text-white(v-if="!songs.length") Currently there are no songs...
</template>

<script>
import SongItem from '@/components/SongItem'
import Api from '@/services/api'

export default {
  created() {
    this.getSongs()
  },
  data: () => ({
    songs: []
  }),
  methods: {
    getSongs() {
      Api.getSongs()
        .then((songs) => {
          this.songs = songs
        })
    }
  },
  components: {
    SongItem
  }
}
</script>
