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
let map, mapEvent;

// * GEOLOCATION WITH LEAFLET
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const { longitude } = position.coords;
            const { latitude } = position.coords;
            const coords = [latitude, longitude];

            // leafllet api
            map = L.map("map").setView(coords, 13);
            L.tileLayer(
                "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }
            ).addTo(map);

            // On map "click" handler
            map.on("click", function (mapE) {
                mapEvent = mapE;
                //form
                form.classList.remove("hidden");
                inputDistance.focus();
            });
        },
        function () {
            console.log("NO position finded");
        }
    );
}

// * EVENT LISTENER FOR PIN, POPUP and FORM INPUTS
form.addEventListener("submit", function (e) {
    e.preventDefault();
    const { lat, lng } = mapEvent.latlng;
    // clear input fields
    inputDistance.value =
        inputCadence.value =
        inputDuration.value =
        inputElevation.value =
            "";
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

// * TOGGLE CADENCE & ELEVATION
inputType.addEventListener("change", function () {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
});
