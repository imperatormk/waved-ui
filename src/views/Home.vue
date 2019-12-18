<template lang="pug">
  Layout
    .flex-row
      SongList.w100(
        feed="bestsellers"
        :perPage="10"
      )
      .p10
      SongList.w100(
        feed="latest"
        :perPage="10"
      )
      .p10
      SongList.w100(
        feed="archive"
        :perPage="10"
      )
</template>

<script>
import SongList from '@/components/SongList'

export default {
  components: {
    SongList
  }
}
</script>