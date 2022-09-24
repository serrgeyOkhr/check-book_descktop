<template>
<div class="book_stats">
  <h4>Статистика по данным</h4>
  <!-- <div>{{ fieldInterface }}</div> -->
  <!-- <div>{{ bookStatistic }}</div> -->
  <div class="stats_wrapper">
    <div class="stat_el-body" v-for="(el, index) in bookStatistic" :key="index">
      <div class="stat_el" v-if="el.count > 0">
        <!-- {{index}}: {{el}} -->

        <span
        class="stat_description" @click="handleParamSelect(index)"
          >Книг без указания <span>{{ index }}</span
          >:
        </span>
        <span class="stat_counter"> {{ el.count }} </span>
      </div>
    </div>
  </div>
  <div class="resetParams" v-if="showBooksParams.length > 0">
    <span>Показаны записи в которых отсутствуют поля: </span>
    <ul class="tagList">
      <li v-for="(param, index) in showBooksParams" :key="index" class="tag tag-close" @click="removeParam(param)">
        {{ param }}
      </li>
      <button class="tag" @click="resetShowParam">Убрать все</button>
    </ul>
  </div>
</div>
</template>

<!-- eslint-disable no-unused-vars -->
<script>
import { ref, toRef } from "@vue/reactivity";
export default {
  name: "book-statistic",
  props: {
    bookData: {
      type: Object,
    },
  },
  emits: ["filterChange"],
  setup(props, context) {
    const book_data = toRef(props, "bookData");
    const fieldInterface = ref({});
    const bookStatistic = ref({});
    const showBooksParams = ref([]);
    getFieldInterface(fieldInterface, book_data);
    getBookStatistic(bookStatistic, book_data);

    function getFieldInterface(output, data) {
      const book = data.value[0];

      for (const field in book) {
        if (Object.hasOwnProperty.call(book, field)) {
          output.value[field] = book[field].field;
        }
      }
    }

    function getBookStatistic(output, data) {
      // console.log("second_", data);
      const missData = {};
      for (const field in data.value[0]) {
        missData[field] = {};
        Object.defineProperties(missData[field], {
          count: {
            value: 0,
            writable: true,
            enumerable: true,
            configurable: true,
          },
          book_id: {
            value: [],
            writable: true,
            enumerable: true,
            configurable: true,
          },
        });
      }

      data.value.forEach((book) => {
        for (const field in book) {
          if (Object.hasOwnProperty.call(book, field)) {
            const el = book[field].data;

            if (el.length === 0) {
              missData[field].count += 1;
              missData[field].book_id.push(book.id.data);
            }
          }
        }
      });
      output.value = missData;
    }
    function handleParamSelect(param) {
      // console.log(e);
      toggleShowParam(param);
    }
    function removeParam(param) {
      // console.log(e);
      toggleShowParam(param);
    }

    function toggleShowParam(param) {
      if (showBooksParams.value.indexOf(param) === -1) {
        showBooksParams.value.push(param);
      } else {
        showBooksParams.value = showBooksParams.value.filter(
          (p) => p !== param
        );
      }
      emitFilter();
    }
    function resetShowParam() {
      showBooksParams.value = [];
      emitFilter();
    }
    function emitFilter() {
      context.emit("filterChange", showBooksParams.value);
    }

    return {
      book_data,
      fieldInterface,
      bookStatistic,
      handleParamSelect,
      showBooksParams,
      resetShowParam,
      removeParam,
    };
  },
};
</script>

<style>
  .book_stats {
    margin-bottom: 15px;
  }
.stats_wrapper {
  display: flex;
  flex-wrap: wrap;
}

.stat_el {
  width: 200px;
  height: 80px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightblue;
  margin: 10px;
  border: 1px solid;
  overflow: hidden;
  padding-right: 50px;
  border-radius: 10px;
  cursor: pointer;
}
.stat_description {
  display: block;
  padding: 20px;
}
.stat_counter {
  display: flex;
  background-color: #fff;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 50px;
  justify-content: center;
  align-items: center;
}
.tagList {
  display: flex;
  text-decoration: none;
  padding: 0;
  margin: 10px 0;
  list-style-type: none
}
.tag {
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 4px 10px 4px 10px;
  margin: 0 5px;
  border-radius: 5px;
  border: 1px solid;
  cursor: pointer;
  background-color: lightcyan;
}
.tag-close {
  padding: 4px 4px 4px 10px;
}
.tag-close::after {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;
  padding: 5px;
  border-radius: 50%;
  line-height: 5px;
  /* position: absolute; */
  /* right: 0; */
  width: 10px;
  height: 10px;
  background-color: #000;
  color: #fff;
  content: 'х';
  cursor: pointer;
}
</style>
