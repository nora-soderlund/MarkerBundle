export default class MarkerBundle {
    colors = [ "#4385F5", "#DC4438", "#F5B401", "#109D59", "#F2F1F2" ];
    events = [ "mousedown", "mouseup", "click", "dblclick", "contextmenu" ];

    markers = [];
    images = [];

    hovered = -1;

    constructor(map, position, image) {
        this.map = map;
        this.position = position;
        this.image = image;

        this.marker = new google.maps.Marker({
            map: this.map,
            position: this.position
        });

        this.marker.addListener("mouseover", (event) => {
            this.mousemoveListener = this.map.addListener("mousemove", this.mousemove.bind(this));
        });

        this.marker.addListener("mouseout", (event) => {
            google.maps.event.removeListener(this.mousemoveListener);

            if(this.hovered !== -1) {
                this.hovered = -1;

                this.render();
            }
        });

        this.events.forEach((name) => {
            this.marker.addListener(name, (event) => {
                if(this.hovered !== -1) {
                    google.maps.event.trigger(this.markers[this.hovered], name, event);
                }
            });
        });

        this.render();
    };

    isMouseOverImage(imageData, width, offsetX, offsetY) {
        const alphaIndex = ((offsetY * width + offsetX) * 4) + 3;
        const alpha = imageData.data[alphaIndex];

        if(alpha < 254)
            return false;

        return true;
    };

    mousemove(event) {
        if(this.hovered !== -1) {
            if(this.isMouseOverImage(this.images[this.hovered].imageData, this.images[this.hovered].canvas.width, event.domEvent.offsetX, event.domEvent.offsetY)) {
                google.maps.event.trigger(this.markers[this.hovered], "mousemove", event);

                return;
            }

            google.maps.event.trigger(this.markers[this.hovered], "mouseout", event);

            this.hovered = -1;

            this.render();
        }

        for(let index = this.images.length - 1; index !== -1; index--) {
            if(!this.isMouseOverImage(this.images[index].imageData, this.images[index].canvas.width, event.domEvent.offsetX, event.domEvent.offsetY))
                continue;

            if(index !== this.hovered) {
                this.hovered = index;
                
                google.maps.event.trigger(this.markers[this.hovered], "mouseover", event);

                this.render();
            }

            google.maps.event.trigger(this.markers[this.hovered], "mousemove", event);

            return;
        }
    };

    static getMarkerImage() {
        return new Promise((resolve, reject) => {
            const image = new Image();
    
            image.onload = () => resolve(image);
            image.onerror = () => reject();
    
            image.crossOrigin = "anonymous";
            image.src = "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3.png";
        });
    };

    addMarker(marker) {
        marker.setMap(null);

        this.markers.push(marker);

        this.images = [];

        for(let index = 0; index < this.markers.length; index++) {
            const color = this.colors[index];
            const rotation = -45 + (index * (90 / (this.markers.length - 1)));

            this.images.push(this.renderMarker(this.image, color, rotation));
        }

        this.render();
    };

    renderMarker(image, color, rotation) {
        const canvas = document.createElement("canvas");
        canvas.width = image.height * 2;
        canvas.height = image.height;
    
        const context = canvas.getContext("2d");
    
        context.translate(canvas.width / 2, canvas.height);
        context.rotate(rotation * Math.PI / 180);

        const left = -image.width / 2;
        const top = -image.height;
    
        context.drawImage(image, left, top, image.width, image.height);
    
        context.globalCompositeOperation = "color";
        context.fillStyle = color;
        context.fillRect(left, top, canvas.width, canvas.height);
    
        context.globalCompositeOperation = "destination-in";
        context.drawImage(image, left, top, image.width, image.height);

        context.setTransform(1, 0, 0, 1, 0, 0);

        return {
            canvas,
            imageData: context.getImageData(0, 0, canvas.width, canvas.height)
        };
    };

    render() {
        const canvas = document.createElement("canvas");

        canvas.width = this.image.height * 2;
        canvas.height = this.image.height;
    
        const context = canvas.getContext("2d");

        context.globalCompositeOperation = "destination-over";

        if(this.hovered !== -1)
            context.drawImage(this.images[this.hovered].canvas, 0, 0);
    
        this.images.forEach((image, index) => {
            if(this.hovered === index)
                return;

            context.drawImage(image.canvas, 0, 0);
        });

        this.marker.setIcon({
            url: canvas.toDataURL(),
            anchor: new google.maps.Point(canvas.width / 2, canvas.height)
        });
    };
};
