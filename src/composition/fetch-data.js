async function getServerData(output, url) {
  await fetch(url)
    .then((response) => response.json())
    .then((result) => (output.value = result));
}

export { getServerData };
