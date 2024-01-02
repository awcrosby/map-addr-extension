# map-addr-extension
**Find and Map Addresses** browser extension to send current tab's page text to ChatGPT to find addresses, and pin them on one map via Google Maps API.


## Installation

Currently this extension is temporarily loadable via Firefox, go to [about:debugging](about:debugging#/runtime/this-firefox), click "Load Temporary Add-On" and select any file like `manifest.json`.

## Usage:

1. Save your `OPENAI_API_KEY` and `GOOGLE_MAPS_API_KEY` in extension preferences: [about:addons](about:addons).
2. Be on a website with one or more addresses.
3. Click the extension toolbar icon ![icon](/images/maps-pin-16.png) ALL text on current tab is sent to ChatGPT to find addresses. A new tab is opened locally which sends those addresses to the Google Maps API and displays map pins for those able to be geocoded.

> ⚠️ Don't send sensitive info to ChatGPT

> ℹ️ if you select text before clicking the toolbar icon, only that text is sent to ChatGPT

## Example

Here is a page with many addresses but no map to show locations

![page-with-addresses](/images/readme-pre-toolbar-click.png "Web page with addresses but no map")

Click on the toolbar button to display addresses in a new tab

![map-with-pins](/images/readme-post-toolbar-click.png "Extention displays map with addresses pinned")
