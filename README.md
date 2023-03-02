# Get Started
```bat
npm install @nora-soderlund/MarkerBundle
```

# Example
```js
import MarkerBundle from "@nora-soderlund/MarkerBundle";

const center = {
    lat: 58.3797077874133,
    lng: 12.324640529544448
};

const map = new google.maps.Map(document.getElementById("map"), {
    center,

    zoom: 12
});

MarkerBundle.getMarkerImage().then((image) => {
    const bundle = new MarkerBundle(map, center, image);

    const infowindow = new google.maps.InfoWindow({});
    
    for(let index = 1; index < 5; index++) {
        const marker = new google.maps.Marker({
            map: this.map,
            position: this.center
        });
    
        marker.addListener("click", (event) => {
            infowindow.setContent("Marker " + index);
    
            infowindow.open({
                map: this.map,
                anchor: bundle.marker
            });
        });
    
        bundle.addMarker(marker);
    }
});
```
