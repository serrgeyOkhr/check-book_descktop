async function getServerData(output, url) {
  const urlTable = {
    "getBooks": "http://localhost:2044/api/getBooks",
    "upload": "http://localhost:2044/api/upload",
  }
  await fetch(urlTable[url])
    .then((response) => response.json())
    .then((result) => (output.value = result))
    .catch(err => console.log(err))
}

export { getServerData };
