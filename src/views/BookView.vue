<template>
  <div class="preloader" v-if="pagePreloader">
    <div class="lds-roller">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
  <div v-else-if="errMessages !== ''">
    <div class="page_header-block page_header-leftBlock">
      <button class="pointer" @click="goBack">Загрузить другой файл</button>
    </div>
    <ErrorMess :error="errMessages" />
    <!-- <pre>{{ errMessages.error }}</pre> -->
  </div>
  <div class="content" v-else>
    <div class="page_header">
      <div class="page_header-block page_header-leftBlock">
        <button class="pointer" @click="goBack">Загрузить другой файл</button>
      </div>
      <div class="page_header-block page_header-centerBlock">
        <div class="page_header_wrapper">
          <h2 class="page_title">Book page</h2>
        </div>
      </div>
      <div class="page_header-block page_header-rightBlock">
        <div class="healper" @click="showHealper">?</div>
      </div>
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
              index === 'lang' ||
              index === 'issueYear' ||
              index === 'pageCounts',
            cell_hide: index === 'isDone',
          }"
          v-for="(book, index) in book_data[0]"
          :key="index"
          @click="handleSortData(index)">
          <!-- @mouseover.once="showHealper" -->
          <!-- <span>{{ index }}</span> -->
          <span>{{ book.rusName }}</span>
        </div>
      </div>
      <div class="table_body" v-if="visibleData.length > 0">
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
              <p @click="copyToClipboard(fieldData.data)">
                {{ fieldData.data }}
              </p>
            </div>
            <div v-else-if="(typeof fieldData.data) !== 'string'">
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
      <div v-else>
        <h4>Нет записей, которые соответствуют выбранным параметрам</h4>
      </div>
      <div class="hidden" :class="{ abs_message: copyMessage }">
        Скопировано!
      </div>
      <div
        class="healperPopupWrapper"
        v-if="healperPopup"
        @click.self="closePopup">
        <div class="healperPopupBody">
          <div class="healperPopupHeader">
            <h2 class="healperPopupTitle">Помощь</h2>
            <div class="healperPopupClose" @click="closePopup">X</div>
          </div>
          <hr />
          <div class="healperPopupMain">
            <h4>Соответствие полей и тегов</h4>
            <div
              class="healperPopupField"
              v-for="(field, index) in fieldInterface"
              :key="index">
              <span v-if="index !== 'undefined'">
                {{ index }}: <span class="text-fz-18"> {{ field }}</span>
              </span>
            </div>
            <hr />
            <h4>Выделить строку</h4>
            <div>Что бы выделить строку, нажмите на номер строки</div>
            <hr />
            <h4>Скопировать id книги</h4>
            <div>Что бы скопировать ID нажмите на него</div>
            <hr />
            <h4>Что такое ID книги?</h4>
            <div>ID книги соответствует *ДОПИСАТЬ ЧЕМУ СООТВЕТСТВУЕТ*</div>
            <hr />
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
import ErrorMess from "@/components/ErrorMess.vue";
export default {
  name: "book-page",
  components: {
    BookStatistic,
    ErrorMess
},
  setup() {
    const book_URL = "getBooks";
    const router = useRouter();
    const book_data = ref([]);
    const visibleData = ref([]);
    const fieldInterface = ref({});
    const filterParams = ref([]);
    const errMessages = ref("");
    const copyMessage = ref(false);
    const healperPopup = ref(false);
    const pagePreloader = ref(false);
    getData(book_data, book_URL);

    async function getData(book_data, book_URL) {
      pagePreloader.value = true;

      await getServerData(book_data, book_URL);

      if (book_data.value.error) {
        errMessages.value = book_data.value;
        pagePreloader.value = false;
        return false
      }

      await prepareData(book_data);
      await getFilterdData(visibleData, book_data, filterParams);
      defaultSort(visibleData);
      getFieldInterface(fieldInterface, book_data);
      pagePreloader.value = false;
    }

    function getFieldInterface(output, data) {
      const book = data.value[0];

      for (const field in book) {
        if (Object.hasOwnProperty.call(book, field)) {
          output.value[book[field].rusName] = book[field].field;
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
      // console.log(data.value);
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


    function setParamSort(data, param) {
      if (param === "title") {
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
    function defaultSort(data, param = "id") {
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

    function handleSortData(sortParam) {
      setParamSort(visibleData, sortParam);
    }
    function toggleDoneBook(data, index) {
      data[index].isDone = !data[index].isDone;
    }

    function copyToClipboard(data) {
      navigator.clipboard.writeText(data).then(
        function () {
          showMessage();
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    }
    function showMessage() {
      copyMessage.value = true;
      setTimeout(() => {
        copyMessage.value = false;
      }, 2000);
    }

    function showHealper() {
      healperPopup.value = true;
    }
    function closePopup() {
      healperPopup.value = false;
    }
    return {
      book_data,
      visibleData,
      pagePreloader,
      copyMessage,
      healperPopup,
      fieldInterface,
      errMessages,
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
/* POPUP STYLES */
.healper {
  padding: 5px;
  border: 1px solid;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  cursor: pointer;
  margin-right: 15px;
}
.healperPopupWrapper {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
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
/* END POPUP STYLES */

/* HEADER STYLES */
.page_header {
  display: flex;
  margin-bottom: 15px;
  padding: 0 10px;
  justify-content: space-between;
  align-items: center;
}
.page_header_wrapper {
  width: 100%;
}
.page_header-block {
  width: calc(100% / 3);
  display: flex;
}
.page_header-leftBlock {
  justify-content: flex-start;
}
.page_header-centerBlock {
  justify-content: center;
}
.page_header-rightBlock {
  justify-content: flex-end;
}

.page_title {
  margin: 0;
  font-size: 24px;
  display: flex;
  justify-content: center;
}
/* END PAGE HEADER STYLES */

/* TABLE STYLES */
.table_wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  content: "";
  width: 10px;
}
.cell {
  display: flex;
  width: 160px;
  align-items: center;
  justify-content: center;
}
.header_cell {
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
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
.table_body {
  flex-direction: column;
  font-size: 14px;
}
.data_raw {
  display: flex;
  justify-content: space-between;
  min-height: 30px;
  padding-right: 5px;
  border-bottom: 1px solid;
}
.data_raw::before {
  width: 10px;
  content: "";
}
.color_raw {
  background-color: rgb(242, 242, 242);
}
.isDone {
  opacity: 0.7;
  background-color: lightgreen;
}
.isDone::before {
  background-color: green;
}
.notDone::before {
  background-color: #ccc;
}

.data {
  display: block;
  margin-top: 5px;
  margin-bottom: 5px;
}
.data::first-letter {
  text-transform: capitalize;
}
/* END TABLE STYLES */

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
  background-color: lightgray;
  box-shadow: 1px 4px 16px 0px gray;
  border: 2px solid gray;
  border-radius: 15px;
  padding: 10px 15px;
  transition: 0.15s;
}
</style>
