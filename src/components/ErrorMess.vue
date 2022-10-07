<template>
  <div class="error-block">
    <h2>Ошибка данных XML файла!</h2>
    <div v-for="(mess, index) in errMess" :key="index">
      <pre class="error_mess">{{ mess }}</pre>
    </div>
  </div>
</template>

<script>
import { toRef } from "@vue/reactivity";
export default {
  name: "error-handler",
  props: {
    error: {
      type: Object,
    },
  },
  setup(props) {
    const errMess = toRef(props, "error");
    // const err = errMess.value.error.split('\n')
    // console.log("err.value: ");
    // console.log();
    // console.log(JSON.parse(err.value));
    return { errMess };
  },
};
</script>

<style>
.error-block {
  margin: 15px;
  border: 5px solid rgb(255, 206, 206);
}
.error_mess {
  background-color: #fff;
  font-family: sans-serif;
}
</style>
