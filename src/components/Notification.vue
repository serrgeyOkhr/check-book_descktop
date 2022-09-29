<template>
  <div class="hidden" :class="{ abs_message: isShowMessage }">
    <slot> </slot>
  </div>
</template>

<script>
import { toRef } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
export default {
  name: "notification-component",
  props: {
    text: {
      type: String,
      default: "Notification",
    },
    duration: {
      type: Number,
      default: 1000,
    },
    showMessage: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, {emit}) {
    const isShowMessage = toRef(props, "showMessage");

    watch(isShowMessage, () => {
      // console.log(isShowMessage.value)
      setTimeout(() => {
        // console.log("from 2 notification");
        emit('close-message')
      }, 1000);
    })
    // watch(isShowMessage, () => {
    //   console.log("change state", isShowMessage.value);
    //   setTimeout(() => {
    //     console.log("from 2 notification");
    //     isShowMessage.value = false;
    //   }, messageDuration.value);
    // });
    return {
      isShowMessage,
    };
  },
};
</script>

<style>
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
</style>
