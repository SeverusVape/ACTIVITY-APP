"use strict";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// ! WORKOUT CLASS
class Workout {
    date = new Date();
    id = (Date.now() + "").slice(-10);
    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, long]
        this.distance = distance; // in km
        this.duration = duration; // in min
    }
}

// ! RUNNING CLASS
class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

// ! CYCLING CLASS
class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// ! APP CLASS
class App {
    #map;
    #mapEvent;
    #workouts = [];
    constructor() {
        // * MAP LOADING
        this._getPosition();
        // * LISTENER FOR PIN - POPUP - INPUTS
        form.addEventListener("submit", this._newWorkout.bind(this));
        // * TOGGLE CADENCE & ELEVATION
        inputType.addEventListener("change", this._toggleElevationField);
    }

    // for geolocation with leaflet
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

    // for map loading
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

    // for pin, popup and inputs
    _newWorkout(e) {
        e.preventDefault();
        const { lat, lng } = this.#mapEvent.latlng;

        //  inputs validation
        const validInputs = (...inputs) =>
            inputs.every((inp) => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every((inp) => inp > 0);
        const type = inputType.value;
        const distance = +inputDistance.value; // to number
        const duration = +inputDuration.value; // to number
        let workout;
        // if workout running, create running obj.
        if (type === "running") {
            const cadence = +inputCadence.value;
            if (
                !validInputs(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence)
            )
                return alert("Only positive numbers!");

            workout = new Running([lat, lng], distance, duration, cadence);
        }

        // if cycling running create cyclinng obj
        if (type === "cycling") {
            const elevation = +inputElevation.value;
            if (
                !validInputs(distance, duration, elevation) ||
                !allPositive(distance, duration)
            )
                return alert("Only positive numbers!");

            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // add new obj. to workouts array
        this.#workouts.push(workout);
        // console.log(workout);
        this.renderWorkoutMarker(workout);
        // hide form + clear input fields
        inputDistance.value =
            inputCadence.value =
            inputDuration.value =
            inputElevation.value =
                "";
    }

    renderWorkoutMarker(workout) {
        // custom pin
        const myIcon = L.icon({
            iconUrl: "pic/dog.gif",
            iconSize: [90, 90],
            iconAnchor: [45, 34],
        });

        L.marker(workout.coords, { icon: myIcon })
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(`${workout.id}`)
            .openPopup();
    }
}

const app = new App();
