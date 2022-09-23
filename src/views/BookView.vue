<template>
  <div class="page_header">
    <button @click="goBack">Загрузить другой файл</button>
    <div class="page_header_wrapper">
      <h2 class="page_title">Book page</h2>
    </div>
  </div>
  <!-- <button @click="handleGetBookData()">TEST</button> -->
  <!-- <pre>{{book_data}}</pre> -->
  <div class="table_wrapper">
    <div class="table_header">
      <div
        class="cell header_cell cell_extrasmall"
        >
        <span>№</span>
      </div>
      <div
        class="cell header_cell"
        :class="{
          cell_small:
            index === 'lang' || index === 'issueYear' || index === 'pageCounts',
        }"
        v-for="(book, index) in book_data[0]"
        :key="index">
        <span>{{ index }}</span>
      </div>
    </div>
    <div class="table_body">
      <div class="data_raw" v-for="(book, index) in book_data" :key="index" :class="{color_raw: index %2 == 0}">
        <div class="cell data_cell cell_extrasmall">{{index+1}}</div>
        <div
          class="cell data_cell"
          :class="{
            cell_small:
              index === 'lang' ||
              index === 'issueYear' ||
              index === 'pageCounts',
          }"
          v-for="(fieldData, index) in book"
          :key="index">
          <div v-if="typeof fieldData !== 'string'" >
            <span
              v-for="(data, index) in fieldData"
              :key="index"
              class="data"
              >{{ data }}</span
            >
          </div>
          <div v-else>
            {{ fieldData }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
import { useRouter } from 'vue-router';
export default {
  name: "book-page",
  setup() {
    const router = useRouter()
    const book_data = ref([]);
    const book_URL = "http://localhost:2044/api/getBooks";
    getBookData(book_data, book_URL);

    function getBookData(output, url) {
      fetch(url)
        .then((response) => response.json())
        .then((result) => (output.value = result));
    }
    function handleGetBookData() {
      getBookData(book_data, book_URL);
    }
    function goBack() {
      router.back()
    }
    return {
      handleGetBookData,
      book_data,
      goBack,
    };
  },
};
</script>

<style>
  .page_header {
    display: flex;
    margin-bottom: 15px;
    width: 100%;
    justify-content: space-between;
  }
  .page_header_wrapper {
    width: 100%;
  }
  .page_title {
    margin: 0;
    font-size: 24px;
    display: flex;
    justify-content: center;
  }
.table_wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.table_header,
.data_raw {
  display: flex;
  justify-content: space-around;
}
.data {
  display: block;
  margin-bottom: 5px;
}
.data::first-letter {
  text-transform: capitalize;
}
.table_header {
  border-bottom: 1px solid;
}
.data_raw {
  padding-top: 5px;
  padding-bottom: 3px;
  /* margin-top: 5px; */
  /* border-top: 1px solid; */
  border-bottom: 1px solid;
}
.color_raw {
  background-color: rgb(242, 242, 242);
}
.table_body {
  flex-direction: column;
  font-size: 14px;
}
.cell {
  width: 160px;
}
.cell_small {
  width: 100px;
}
.cell_extrasmall {
  width: 50px;
}
</style>
