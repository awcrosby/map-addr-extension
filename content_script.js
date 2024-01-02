// content_script.js gets added to all pages

// listener to get page text from source tab, either selected text or entire page text
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageText") {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            sendResponse({ pageText: selectedText });
        }
        else {
            const htmlText = document.documentElement.innerText;
            sendResponse({ pageText: htmlText });
        }
    }
});

// listener to save addresses url param when map-display tab loads
document.addEventListener('DOMContentLoaded', function() {
    // exit early if not map-display page
    const path = window.location.pathname;
    const page = path.split("/").pop();
    if (page != "map-display.html") {
        return
    }

    // Save addresses to local storage to use in initMap()
    const urlParams = new URLSearchParams(window.location.search);
    const addresses = urlParams.get('addresses');
    if (addresses) {
        localStorage.setItem('addresses', addresses);
        console.log("addresses in DOMContentLoad:", addresses);
    }

    // add script tag to map-display.html that includes google maps api key
    browser.storage.sync.get("gmapsaikey")
    .then(result => {
        if (!result.gmapsaikey) {
            console.error("Google Maps API Key is not set in browser storage");
            return;
        }
        let script = document.createElement('script');
        script.src = "https://maps.googleapis.com/maps/api/js?key=" + result.gmapsaikey + "&callback=initMap";
        script.async = true;
        script.defer = true;
        document.getElementsByTagName('head')[0].appendChild(script);
    });   
});

// function used by new map-display tab
function initMap() {
    const bounds = new google.maps.LatLngBounds();
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: {lat: 0, lng: 0} // This will be overridden by fitBounds
    });

    let addresses = localStorage.getItem('addresses');
    addresses = JSON.parse(addresses);
    
    const geocoder = new google.maps.Geocoder();

    addresses.forEach(function(address) {
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                const position = results[0].geometry.location;
                bounds.extend(position);

                const marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: address
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }

            // Adjust the viewport of the map to include all pins
            map.fitBounds(bounds);

            // Adjust zoom only once, after fitBounds, if zoomed in too far
            google.maps.event.addListenerOnce(map, 'idle', function() {
                if (map.getZoom() > 15) {
                    map.setZoom(15);
                }
            });         
        });
    });
}
