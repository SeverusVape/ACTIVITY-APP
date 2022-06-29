"use strict";

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

    _setDescription() {
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
        this.discription = `${this.type[0].toUpperCase()}${this.type.slice(
            1
        )} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

// ! RUNNING CLASS
class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
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
        this._setDescription();
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
    #mapZoomLevel = 13;
    constructor() {
        // * MAP LOADING
        this._getPosition();
        // * LISTENER FOR PIN - POPUP - INPUTS
        form.addEventListener("submit", this._newWorkout.bind(this));
        // * TOGGLE CADENCE & ELEVATION
        inputType.addEventListener("change", this._toggleElevationField);
        // * CENTER MAP ON CLICKED ACTIVITY
        containerWorkouts.addEventListener(
            "click",
            this._moveToPopUp.bind(this)
        );
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
        this.#map = L.map("map").setView(coords, this.#mapZoomLevel);
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

    _hideForm() {
        inputDistance.value =
            inputCadence.value =
            inputDuration.value =
            inputElevation.value =
                "";
        form.style.display = "none";
        form.classList.add("hidden");
        setTimeout(() => (form.style.display = "grid"), 1000);
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
        // rendering workout on list
        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
        // hide form + clear input fields
        this._hideForm();
    }

    _renderWorkoutMarker(workout) {
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
            .setPopupContent(
                `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${
                    workout.discription
                }`
            )
            .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${
            workout.id
        }">
                <h2 class="workout__title">${workout.discription}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${
                        workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
                    }</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;
        if (workout.type === "running") {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(
                        1
                    )}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `;
        }

        if (workout.type === "cycling") {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(
                        1
                    )}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li> 
            `;
        }
        form.insertAdjacentHTML("afterend", html);
    }

    _moveToPopUp(e) {
        const workoutEl = e.target.closest(".workout");
        if (!workoutEl) return;

        const workout = this.#workouts.find(
            (work) => work.id === workoutEl.dataset.id
        );

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }
}

const app = new App();
