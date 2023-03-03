import MarkerBundle from "../src/MarkerBundle.js";

const loader = new google.maps.plugins.loader.Loader({
    apiKey: new URLSearchParams(window.location.search).get("key"),
    version: "weekly"
});

await loader.load();

new class UsingMarkersAsAnchorsMap {
    element = document.getElementById("map");
    center = { lat: 52.36994132457453, lng: 4.8998902330155545 };

    constructor() {
        this.map = new google.maps.Map(this.element, {
            center: this.center,
            zoom: 12
        });

        MarkerBundle.getMarkerImage().then((image) => {
            this.createMarkerBundle(image);
            this.createInfoWindow();
            this.createMarkers();
        });
    };

    createMarkerBundle(image) {
        this.bundle = new MarkerBundle(this.map, this.center, image);
    };

    createInfoWindow() {
        this.infoWindow = new google.maps.InfoWindow({});
    };

    createMarkers() {        
        for(let index = 1; index < 5; index++) {
            const marker = new google.maps.Marker({
                map: this.map,
                position: this.center
            });
        
            marker.addListener("click", (event) => {
                this.infoWindow.setContent("Marker " + index);
        
                this.infoWindow.open({
                    map: this.map,
                    anchor: this.bundle.marker
                });
            });
        
            this.bundle.addMarker(marker);
        }
    };
};
