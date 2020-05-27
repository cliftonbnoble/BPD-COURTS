import axios from 'axios';
import { $ } from './bling';
const moment = require('moment');

const mapOptions = {
    center: { lat: 37.8, lng: -122.2 },
    zoom: 10
}

function loadPlaces(map, lat = 37.8, lng = -122.2) {
    axios.get(`/api/courts/near?lat=${lat}&lng=${lng}`).then(res => {
        const places = res.data
        if(!places.length) {
            alert('No places found!');
            return;
        }
        console.log(places)
        //Create a bounds for GIS data
        const bounds = new google.maps.LatLngBounds();

        const infoWindow = new google.maps.InfoWindow();


        const markers = places.map(place => {
            const [placeLng, placeLat] = place.location.coordinates;
            const position = { lat: placeLat, lng: placeLng };
            bounds.extend(position)
            const marker = new google.maps.Marker({ map, position });
            marker.place = place;
            return marker;
        })

        //when someone clicks on a marker show the details
        markers.forEach(marker => marker.addListener('click', function() {
            const date = this.place.date
            const html = `<div class="popup">
            <a href="/court/${this.place.slug}">
            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.court}" />
            <p>${this.place.court} - ${this.place.location.address}</p>
            <p><strong>Date:</strong> ${moment(date).format("MMM Do YYYY")}</p>
            </a>
            </div>`
            infoWindow.setContent(html);
            infoWindow.open(map, this)
        }))
        // then zoom map to fit markers
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds)
    })


}

function makeMap(mapDiv) {
if (!mapDiv) return;
//make our map
const map = new google.maps.Map(mapDiv, mapOptions);
loadPlaces(map);

const input = $('[name="geolocate"]');
const autocomplete = new google.maps.places.Autocomplete(input);
autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
})

}

export default makeMap;