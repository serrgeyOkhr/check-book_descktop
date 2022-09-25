<template>
  <div class="preloader" v-if="pagePreloader">
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  </div>
  <div class="content" v-else>
    <div class="page_header">
    <button @click="goBack">Загрузить другой файл</button>
    <div class="page_header_wrapper">
      <h2 class="page_title">Book page</h2>
    </div>
    <div class="healper" @click="showHealper">?</div>
  </div>
  <div class="bookStats">
    <BookStatistic
      :bookData="book_data"
      :key="book_data"
      @filterChange="setFilter" />
  </div>
  <!-- <button @click="handleGetBookData()">TEST</button> -->
  <!-- <pre>{{book_data}}</pre> -->
  <div class="table_wrapper">
    <div class="table_header">
      <div class="cell header_cell cell_extrasmall">
        <span>№</span>
      </div>
      <div
        class="cell header_cell"
        :class="{
          cell_small:
            index === 'lang' || index === 'issueYear' || index === 'pageCounts',
          cell_hide: index === 'isDone',
        }"
        v-for="(book, index) in book_data[0]"
        :key="index"
        @click="handleSortData"
        >
        <!-- @mouseover.once="showHealper" -->
        <span>{{ index }}</span>
      </div>
    </div>
    <div class="table_body">
      <div
        class="data_raw"
        v-for="(book, index) in visibleData"
        :key="index"
        :class="{
          color_raw: index % 2 == 0,
          isDone: book['isDone'],
          notDone: !book['isDone'],
        }">
        <div
          class="cell data_cell cell_extrasmall pointer"
          @click="toggleDoneBook(visibleData, index)">
          {{ index + 1 }}
        </div>
        <div
          class="cell data_cell"
          :class="{
            cell_small:
              index === 'lang' ||
              index === 'issueYear' ||
              index === 'pageCounts',
            cell_hide: index === 'isDone',
          }"
          v-for="(fieldData, index) in book"
          :key="index">
          <div class="pointer" v-if="index === 'id'">
            <p @click="copyToClipboard(fieldData.data)">{{ fieldData.data }}</p>
          </div>
          <div v-else-if="typeof fieldData.data !== 'string'">
            <span
              v-for="(data, index) in fieldData.data"
              :key="index"
              class="data"
              >{{ data }}</span
            >
          </div>
          <div v-else>
            {{ fieldData.data }}
          </div>
        </div>
      </div>
    </div>
    <div class="hidden" :class="{abs_message: copyMessage}">Скопировано!</div>
    <div class="healperPopupWrapper" v-if="healperPopup" @click.self="closePopup">
      <div class="healperPopupBody">
        <div class="healperPopupHeader">
          <h2 class="healperPopupTitle">Помощь</h2>
          <div class="healperPopupClose" @click="closePopup">X</div>
        </div>
        <hr>
        <div class="healperPopupMain">
          <h4>Соответствие полей и тегов</h4>
          <div class="healperPopupField" v-for="(field, index) in fieldInterface" :key="index">
            <span v-if="index !== 'isDone'">
              {{index}}: <span class="importantField"> {{field}}</span>
            </span>
          </div>
          <hr>
          <h4>Выделить строку</h4>
          <div>Что бы выделить строку, нажмите на номер строки</div>
          <hr>
          <h4>Скопировать id книги</h4>
          <div>Что бы скопировать ID нажмите на него</div>
          <hr>
          <h4>Что такое ID книги?</h4>
          <div>ID книги соответствует *ДОПИСАТЬ ЧЕМУ СООТВЕТСТВУЕТ*</div>
          <hr>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
import { getServerData } from "../composition/fetch-data";
import BookStatistic from "@/components/BookStatistic.vue";
export default {
  name: "book-page",
  components: {
    BookStatistic,
  },
  setup() {
    const book_URL = "http://localhost:2044/api/getBooks";
    const router = useRouter();
    const book_data = ref([]);
    const visibleData = ref([]);
    const fieldInterface = ref({});
    const filterParams = ref([]);
    const copyMessage = ref(false)
    const healperPopup = ref(false)
    const pagePreloader = ref(false);
    getData(book_data, book_URL);
    // console.log(visibleData);
    async function getData(book_data, book_URL) {
      pagePreloader.value = true
      await getServerData(book_data, book_URL);
      await prepareData(book_data);
      await getFilterdData(visibleData, book_data, filterParams);
      await setDefaultSort(visibleData);
      getFieldInterface(fieldInterface, book_data);
    }
    
    function getFieldInterface(output, data) {
      const book = data.value[0];

      for (const field in book) {
        if (Object.hasOwnProperty.call(book, field)) {
          output.value[field] = book[field].field;
        }
      }
    }
    function handleGetBookData() {
      getServerData(book_data, book_URL);
    }
    function goBack() {
      router.push("/");
    }

    function setFilter(data) {
      filterParams.value = data;
      getFilterdData(visibleData, book_data, filterParams);
    }
    async function prepareData(data) {
      data.value.forEach((book) => {
        book["isDone"] = false;
      });
      console.log(data.value);
    }
    async function getFilterdData(output, data, filterParams) {
      output.value = data.value;
      if (filterParams.value.length === 0) {
        return;
      }
      filterParams.value.forEach((param) => {
        output.value = output.value.filter((book) => book[param].data == 0);
      });
    }

    async function setDefaultSort(data) {
      data.value = data.value.sort((a, b) => a.id.data - b.id.data);
      pagePreloader.value = false
    }
    function setParamSort(data, param) {
      if (param === "title") {
        console.log("title");
        sortByLength(data, param);
        return;
      }
      if (param === "isStoryCollection") {
        reversSort(data, param);
        return;
      }
      defaultSort(data, param);
    }
    function sortByLength(data, param) {
      data.value = data.value.sort((a, b) => {
        if (a[param].data.length < b[param].data.length) {
          return -1;
        }
        if (a[param].data.length > b[param].data.length) {
          return 1;
        }
        return 0;
      });
    }
    function reversSort(data, param) {
      data.value = data.value.sort((a, b) => {
        if (a[param].data.length > b[param].data.length) {
          return -1;
        }
        if (a[param].data.length < b[param].data.length) {
          return 1;
        }
        return 0;
      });
    }
    function defaultSort(data, param) {
      data.value = data.value.sort((a, b) => {
        if (a[param].data < b[param].data) {
          return -1;
        }
        if (a[param].data > b[param].data) {
          return 1;
        }
        return 0;
      });
    }
    function handleSortData(e) {
      setParamSort(visibleData, e.target.textContent);
      // console.log(e.target.textContent);
    }
    function toggleDoneBook(data, index) {
      data[index].isDone = !data[index].isDone;
    }

    function copyToClipboard(data) {
      navigator.clipboard.writeText(data).then(
        function () {
          showMessage();
          console.log("Async: Copying to clipboard was successful!");
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    }
    function showMessage() {
      copyMessage.value = true;
      setTimeout(()=>{
        copyMessage.value = false
      }, 2000)
    }

    function showHealper() {
      healperPopup.value=true;
    }
    function closePopup() {
      healperPopup.value=false;
    }
    return {
      book_data,
      visibleData,
      pagePreloader,
      copyMessage,
      healperPopup,
      fieldInterface,
      handleGetBookData,
      setFilter,
      goBack,
      toggleDoneBook,
      handleSortData,
      copyToClipboard,
      showHealper,
      closePopup,
    };
  },
};
</script>

<style>
  .healperPopupWrapper {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
  }
  .healperPopupBody {
    width: 60%;
    position: relative;
    height: 80vh;
    background-color: #fff;
    margin: 0 auto;
    overflow: auto;
  }
  .healperPopupHeader {
    padding: 5px;
    display: flex;
    justify-content: center;
    /* flex-direction: row; */
  }
  .healperPopupField {
    display: flex;
    margin-left: 30px;
    margin-bottom: 5px;
  }
  .healperPopupClose {
    position: absolute;
    right: 0;
    top: 0;
    margin-right: 10px;
    margin-top: 10px;
    font-weight: bold;
    cursor: pointer;
  }
  .importantField {
    font-size: 18px;
  }
.pointer {
  cursor: pointer;
}
.page_header {
  display: flex;
  margin-bottom: 15px;
  padding: 0 10px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
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

.data_raw {
  display: flex;
  justify-content: space-between;
}
.data {
  display: block;
  margin-top: 5px;
  margin-bottom: 5px;
}
.data::first-letter {
  text-transform: capitalize;
}
.table_header {
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid;
  position: sticky;
  top: 0;
  padding: 15px 0px;
  background-color: lightsteelblue;
}
.table_header::before {
  content: '';
  width: 10px;
}
.data_raw {
  min-height: 30px;
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
  display: flex;
  width: 160px;
  align-items: center;
  justify-content: center;
}
.isDone {
  opacity: 0.7;
  background-color: lightgreen;
}
.header_cell {
  font-weight: bold;
  /* margin-bottom: 10px; */
  font-size: 18px;
  cursor: pointer;
  /* background-color: #ccc; */
}
.header_cell::first-letter {
  text-transform: uppercase;
}
.cell_small {
  width: 100px;
}
.cell_extrasmall {
  width: 50px;
}
.cell_hide {
  display: none;
}
.data_raw::before {
  width: 10px;
  content: "";
}
.notDone::before {
  background-color: #ccc;
}
.isDone::before {
  background-color: green;
}
.hidden {
  opacity: 0;
}
.abs_message {
  position: fixed;
  opacity: 1;
  bottom: 0;
  left: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  /* color: #fff; */
  background-color: lightgray;
  box-shadow: 1px 4px 16px 0px gray;
  border: 2px solid gray;
  border-radius: 15px;
  /* width: 50px; */
  /* height: 20px; */
  padding: 10px 15px;
  transition: 0.15s;
}
p{
  margin: 0;
  padding: 10px;
}
.healper {
  padding: 5px;
  border: 1px solid;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  cursor: pointer;
  margin-right: 15px;
}
/* PRELOADER STYLES */
.preloader {
  width: 100%;
  height: 100vh;
  background-color: rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}
.lds-roller {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-roller div {
  animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  transform-origin: 40px 40px;
}
.lds-roller div:after {
  content: " ";
  display: block;
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #000;
  margin: -4px 0 0 -4px;
}
.lds-roller div:nth-child(1) {
  animation-delay: -0.036s;
}
.lds-roller div:nth-child(1):after {
  top: 63px;
  left: 63px;
}
.lds-roller div:nth-child(2) {
  animation-delay: -0.072s;
}
.lds-roller div:nth-child(2):after {
  top: 68px;
  left: 56px;
}
.lds-roller div:nth-child(3) {
  animation-delay: -0.108s;
}
.lds-roller div:nth-child(3):after {
  top: 71px;
  left: 48px;
}
.lds-roller div:nth-child(4) {
  animation-delay: -0.144s;
}
.lds-roller div:nth-child(4):after {
  top: 72px;
  left: 40px;
}
.lds-roller div:nth-child(5) {
  animation-delay: -0.18s;
}
.lds-roller div:nth-child(5):after {
  top: 71px;
  left: 32px;
}
.lds-roller div:nth-child(6) {
  animation-delay: -0.216s;
}
.lds-roller div:nth-child(6):after {
  top: 68px;
  left: 24px;
}
.lds-roller div:nth-child(7) {
  animation-delay: -0.252s;
}
.lds-roller div:nth-child(7):after {
  top: 63px;
  left: 17px;
}
.lds-roller div:nth-child(8) {
  animation-delay: -0.288s;
}
.lds-roller div:nth-child(8):after {
  top: 56px;
  left: 12px;
}
@keyframes lds-roller {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
/* END PRELOADER STYLES */
</style>
