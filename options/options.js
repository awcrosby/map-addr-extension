function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    openaikey: document.querySelector("#openaikey").value,
    gmapsaikey: document.querySelector("#gmapsaikey").value,
  });
}
  
function restoreOptions() {
  function setOpenAiChoice(result) {
    document.querySelector("#openaikey").value = result.openaikey || "";
  }

  function setGmapsChoice(result) {
    document.querySelector("#gmapsaikey").value = result.gmapsaikey || "";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let gettingOpenAI = browser.storage.sync.get("openaikey");
  gettingOpenAI.then(setOpenAiChoice, onError);

  let gettingGmaps = browser.storage.sync.get("gmapsaikey");
  gettingGmaps.then(setGmapsChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
