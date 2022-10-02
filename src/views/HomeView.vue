<template>
  <div class="home">
    <h1>Система проверки данных</h1>
    <div class="container">
      <div class="rightExportOptions">
        <div class="toggleHealperBox">
          <h3 class="pointer" @click="toggleHealper = !toggleHealper">
            Как подготовить данные для загрузки в приложение?
          </h3>
          <div class="arrow_box">
            <img
              class="arrow"
              :class="{ arrow_up: toggleHealper }"
              src="../../public/downward-arrow.png"
              alt="" />
          </div>
        </div>
        <div v-if="toggleHealper">
          <div>
            <h5>Пункт 1</h5>
            <p>Делаем то-то. Потом то-то.</p>
          </div>
          <div>
            <h5>Пункт 2</h5>
            <p>Выбираем такие вот параметры. Ставим вот эти галочки</p>
          </div>
          <div>
            <h5>Пункт 3</h5>
            <p>Жмем сюда. Потом сюда</p>
          </div>
        </div>
      </div>
      <div class="importData">
        <form
          action="#"
          method="post"
          encType="multipart/form-data"
          class="form">
          <div class="formBody">
            <div class="fileSelector">
              <label for="inputFile" class="selectFile_button pointer"
                >Выбрать файл</label
              >
              <div class="filePreloader" v-if="file">
                <div>
                  <span class="filePreloader_title">Выбранный файл:</span>
                  <div class="preloader_info">
                    <span
                      ><em>Название:</em>
                      <span class="filePreloader_data">{{ file.name }}</span>
                    </span>
                    <span
                      ><em>Размер:</em>
                      <span class="filePreloader_data"
                        >{{ (file.size / 1024 / 1024).toFixed(2) }} MB</span
                      ></span
                    >
                  </div>
                </div>
              </div>
              <input
                class="selectFile_input"
                type="file"
                name="book_data"
                id="inputFile"
                accept=".xml"
                @change="handleUploadFile" />
            </div>
            <div class="errorBlock" v-if="serverErr">
              <span>Ошибка! {{ serverErr?.err }}</span>
            </div>
            <div class="actionButton_wrapper">
              <button
                class="actionButton"
                type="submit"
                @click.prevent="handleUploadFileOnServer"
                :disabled="!file">
                <div class="btn-loader" v-if="buttonLoader">
                  <div class="lds-ring">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
                <span v-else>Продолжить</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
export default {
  setup() {
    const serverURL = "http://localhost:2044/api/upload";
    const file = ref(undefined);
    const serverErr = ref(undefined);
    const router = useRouter();
    const toggleHealper = ref(false);
    const buttonLoader = ref(false);

    function handleUploadFile(event) {
      serverErr.value = undefined;
      file.value = event.target.files[0];
    }
    function handleUploadFileOnServer() {
      if (!file.value) {
        serverErr.value = undefined;
        console.log("No file");
        return;
      }
      sendFileOnServer(file);
    }
    function sendFileOnServer(file) {
      buttonLoader.value = true;
      let formData = new FormData();
      formData.append("book_data", file.value);
      fetch(serverURL, { method: "POST", mode: "cors", body: formData })
        .then((response) => response.json())
        .then((result) => {
          if (result.err !== undefined) serverErr.value = result;
          openBookPage();
        })
        .catch((err) => (serverErr.value = err))
        .finally(() => (buttonLoader.value = false));
    }
    function openBookPage() {
      router.push("/books");
    }
    return {
      file,
      serverErr,
      toggleHealper,
      buttonLoader,
      handleUploadFile,
      handleUploadFileOnServer,
    };
  },
};
</script>
<style>
.toggleHealperBox {
  display: flex;
  align-items: center;
  justify-content: center;
}
.arrow_box {
  width: 30px;
}
.arrow_up {
  transform: rotate(180deg);
}
.rightExportOptions {
  border: 1px solid;
  border-radius: 20px;
  margin-bottom: 15px;
  /* transition: height 2s; */
}
.container {
  margin: 0 50px;
}
.form {
  width: 100%;
}
.formBody {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}
.importData {
  display: flex;
  border: 1px solid;
  border-radius: 20px;
  padding: 10px;
  min-height: 15vh;
}
.selectFile_input {
  display: none;
}
.fileSelector {
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  min-height: 200px;
  width: 100%;
  border: 1px solid;
  border-radius: 10px;
}
.filePreloader {
  margin-left: 20px;
}
.filePreloader_title {
  display: block;
  font-size: 18px;
  padding-bottom: 10px;
}
.filePreloader_data {
  font-size: 18px;
}
.preloader_info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.selectFile_button {
  display: block;
  padding: 5px 10px;
  background-color: #fff;
  border: 1px solid;
  margin-left: 20px;
}
.selectFile_button:hover {
  background-color: rgb(243, 243, 243);
}
.actionButton {
  width: 100%;
  padding: 10px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: lightgray;
}
.actionButton:hover {
  background-color: lightgreen;
}
.actionButton:disabled {
  cursor: not-allowed;
  background-color: lightgray;
}
.actionButton_wrapper {
  width: 100%;
  display: flex;
}
.errorBlock {
  color: red;
  margin-top: 5px;
  margin-bottom: 10px;
}
</style>
