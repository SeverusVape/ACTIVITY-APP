"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// * GEOLOCATION WITH LEAFLET
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const { longitude } = position.coords;
            const { latitude } = position.coords;
            const coords = [latitude, longitude];

            // leafllet
            const map = L.map("map").setView(coords, 13);
            L.tileLayer(
                "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }
            ).addTo(map);

            map.on("click", function (mapEvent) {
                const { lat, lng } = mapEvent.latlng;
                // custom pin
                const myIcon = L.icon({
                    iconUrl: "pic/dog.gif",
                    iconSize: [90, 90],
                    iconAnchor: [45, 34],
                });

                L.marker([lat, lng], { icon: myIcon })
                    .addTo(map)
                    .bindPopup(
                        L.popup({
                            maxWidth: 250,
                            minWidth: 100,
                            autoClose: false,
                            closeOnClick: false,
                            className: "running-popup",
                        })
                    )
                    .setPopupContent("Some content")
                    .openPopup();
            });
        },
        function () {
            console.log("NO position finded");
        }
    );
}
