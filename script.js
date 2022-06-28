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

// * APP
class App {
    #map;
    #mapEvent;
    constructor() {
        // * MAP LOADING
        this._getPosition();

        // * LISTENER FOR PIN - POPUP - INPUTS
        form.addEventListener("submit", this._newWorkout.bind(this));
        // * TOGGLE CADENCE & ELEVATION
        inputType.addEventListener(
            "change",
            this._toggleElevationField.bind(this)
        );
    }

    // * for geolocation with leaflet
    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert("NO POSITION FOUND!");
                }
            );
        }
    }

    // * for map loading
    _loadMap(position) {
        const { longitude } = position.coords;
        const { latitude } = position.coords;
        const coords = [latitude, longitude];

        // leafllet api
        this.#map = L.map("map").setView(coords, 13);
        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        // On map "click" handler
        this.#map.on("click", this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        //form
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation
            .closest(".form__row")
            .classList.toggle("form__row--hidden");
        inputCadence
            .closest(".form__row")
            .classList.toggle("form__row--hidden");
    }

    // *  for pin, popup and inputs
    _newWorkout(e) {
        e.preventDefault();
        const { lat, lng } = this.#mapEvent.latlng;
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
            .addTo(this.#map)
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
    }
}

const app = new App();
