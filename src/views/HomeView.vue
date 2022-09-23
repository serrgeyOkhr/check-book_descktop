<template>
  <div class="home">
    <h1>Библиотечное приложение!!</h1>
    <div class="container">
      <div class="rightExportOptions"></div>
      <div class="importData">
        <form
          action="#"
          method="post"
          encType="multipart/form-data"
          class="form">
          <div class="formBody">
            <div class="fileSelector">
              <label for="inputFile" class="selectFile_button"
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
                upload
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
import { useRouter } from 'vue-router';
export default {
  setup() {
    const serverURL = "http://localhost:2044/api/upload";
    const file = ref(undefined);
    const serverErr = ref(undefined);
    const router = useRouter()
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
      let formData = new FormData();
      formData.append("book_data", file.value);
      fetch(serverURL, { method: "POST", mode: "cors", body: formData })
        .then((response) => response.json())
        .then((result) => {
          if (result.err !== undefined) serverErr.value = result;
          openBookPage()
        })
        .catch((err) => (serverErr.value = err));
    }
    function openBookPage () {
      router.push("/books")
    }
    return {
      file,
      serverErr,
      handleUploadFile,
      handleUploadFileOnServer,
    };
  },
};
</script>
<style>
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
  border-radius: 10px;
  padding: 10px;
  min-height: 15vh;
}
.selectFile_input {
  display: none;
}
.fileSelector {
  align-items: center;
  display: flex;
  margin-bottom: 15px;
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
  background-color: #ccc;
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
