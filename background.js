// to see background script logs, open about:debugging, click on Inspect for the extension

const MAX_INPUT_TOKENS = 10000 // $0.0010 / 1K tokens for gpt-3.5-turbo-1106 input
const MAX_OUTPUT_TOKENS = 4096 // $0.0020 / 1K tokens for gpt-3.5-turbo-1106 input

async function getOpenAiAddresses (htmlText) {
  const storageDataOpenai = await browser.storage.sync.get('openaikey')
  const OPENAI_API_KEY = storageDataOpenai.openaikey
  const URL = 'https://api.openai.com/v1/chat/completions'

  if (!OPENAI_API_KEY) {
    console.error('OpenAI API Key is not set in browser storage')
    return
  }

  const data = {
    model: 'gpt-3.5-turbo-1106',
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [
      {
        role: 'system',
        content: 'You are an assistant that generates JSON in the format of an Array of strings. You always return just the JSON Array and no additional description or context.'
      },
      {
        role: 'user',
        content: 'Give me an array of street addresses inside this html text: ' + htmlText
      }
    ]
  }

  return fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      const addresses = data.choices[0].message.content.trim()
      console.log('addresses:', addresses)
      return addresses
    })
}

function mapViaGoogleMapsQuery (addresses) {
  // Call Google Maps server to attempt to find address
  // Limitation: with multiple addresses it attempts to display the first few addr via partial matches
  const encodedAddresses = encodeURIComponent(addresses)
  const URL = 'https://www.google.com/maps/search/?api=1&query=' + encodedAddresses
  browser.tabs.create({ url: URL })
}

function mapLocalViaGoogleMapsApi (addresses) {
  // Local tab included with extension calls Google Maps API to geocode addresses
  const encodedAddresses = encodeURIComponent(addresses)
  browser.tabs.create({ url: browser.runtime.getURL(`map-display.html?addresses=${encodedAddresses}`) })
    .then(tab => {
      console.log(`Created tab ${tab.id}`)
    })
}

function onToolbarButtonClick (tab) {
  // send message to content script
  browser.tabs.sendMessage(tab.id, { action: 'getPageText' })
    .then(response => {
      const tokenCount = Math.ceil(response.pageText.length / 4)
      console.log(`Token count for text: ${tokenCount}`)
      if (tokenCount > MAX_INPUT_TOKENS) {
        throw new Error(`Text too long! ${tokenCount} exceeds maximum ${MAX_INPUT_TOKENS}.}`)
      }
      return response.pageText
    })
    .then(text => {
      return getOpenAiAddresses(text)
    })
    .then(addresses => {
      // mapViaGoogleMapsQuery(addresses)
      mapLocalViaGoogleMapsApi(addresses)
    })
    .catch(error => console.error(error))
}

// console.log('background.js loaded')
browser.browserAction.onClicked.addListener(onToolbarButtonClick)
