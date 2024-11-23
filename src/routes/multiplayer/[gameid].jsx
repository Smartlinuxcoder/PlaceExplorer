import { createSignal, createEffect, onMount } from "solid-js";
import { Title } from "@solidjs/meta";
import Autocomplete from "~/components/Input";
import Papa from "papaparse";
import "../geoguessr.css";

function PlaceExplorer({ params }) {
    const handleChildMessage = (msg) => {
        console.log(msg);
        handlers?.handleGuess(msg);
    };

    const [currentLocation, setCurrentLocation] = createSignal({});
    const [lives, setLives] = createSignal(3);
    const [hearts, setHearts] = createSignal("❤️❤️❤️");
    const [hint, setHint] = createSignal("");
    createEffect(() => {
        setHearts(lives() > 0 ? "❤️".repeat(lives()) : "");
    });
    let panoRef;
    let countries = [];
    let mapRef;
    let map;
    let marker;

    const directionIcons = {
        north: "⬆️",
        south: "⬇️",
        east: "➡️",
        west: "⬅️",
        "north-east": "↗️",
        "north-west": "↖️",
        "south-east": "↘️",
        "south-west": "↙️",
    };


    const initialize = () => {
        const panorama = new google.maps.StreetViewPanorama(panoRef, {
            pov: {
                heading: 34,
                pitch: 10,
            },
        });

        // Initialize minimap (Google Map)
        map = new google.maps.Map(mapRef, {
            center: { lat: 0, lng: 0 },
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        // Add markers for guessed points
        const addGuessedMarker = (latLng) => {
            new google.maps.Marker({
                position: latLng,
                map: map,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            });
        };

        const loadCountryData = () => {
            Papa.parse("/countryList.csv", {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    countries = results.data;
                    console.log(countries);
                    loadRandomPanorama();
                },
            });
        };

        const loadRandomPanorama = () => {
            fetch("/api/getGame/" + params.gameid)
                .then((response) => response.json())
                .then((data) => {
                    const lat = data[0].latitude;
                    const lng = data[0].longitude;
                    console.log(data);

                    const latLng = { lat, lng };
                    const streetViewService = new google.maps.StreetViewService();
                    console.log(latLng);
                    streetViewService.getPanorama({ location: latLng, radius: 5000 }, (data, status) => {
                        if (status === google.maps.StreetViewStatus.OK) {
                            panorama.setPosition(data.location.latLng);
                            setCurrentLocation({
                                latLng: data.location.latLng,
                                country: getCountryName(data.location.latLng), // Ensure that randomCountry is defined or replace it
                            });
                            getCountryName(data.location.latLng);
                        } else {
                            console.log("No panorama found at random location. Retrying...");
                            loadRandomPanorama(); // Retry loading a random panorama if none is found
                        }
                    });
                })
                .catch((error) => {
                    console.error("Error fetching random city:", error);
                });
        };


        const getCountryName = (latLng) => {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: latLng }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const countryResult = results.find((result) =>
                        result.types.includes("country")
                    );
                    if (countryResult) {
                        setCurrentLocation((prev) => ({
                            ...prev,
                            country: countryResult.formatted_address,
                        }));
                        console.log("Country found:", countryResult.formatted_address);
                    }
                } else {
                    console.log("Geocoding failed:", status);
                }
            });
        };

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const calculateDirection = (lat1, lon1, lat2, lon2) => {
            const latDiff = lat2 - lat1;
            const lonDiff = lon2 - lon1;

            let direction = "";
            if (latDiff > 0) direction += "north";
            else if (latDiff < 0) direction += "south";

            if (lonDiff > 0) direction += direction ? "-east" : "east";
            else if (lonDiff < 0) direction += direction ? "-west" : "west";

            return direction || "same location";
        };

        loadCountryData();

        const handleGuess = (guess) => {
            const currentCountry = currentLocation().country || "";
            const actualLatLng = currentLocation().latLng;

            if (guess.toLowerCase() === currentCountry.toLowerCase()) {
                alert(`Correct! The country is ${currentCountry}!`);
                setHint("");
                revealActualLocation({ lat: actualLatLng.lat(), lng: actualLatLng.lng() });
                loadRandomPanorama();
            } else {
                setLives(lives() - 1);

                if (lives() === 0) {
                    alert(`Wrong! The correct country was ${currentCountry}.`);
                    revealActualLocation({ lat: actualLatLng.lat(), lng: actualLatLng.lng() });
                    setHint("");
                    loadRandomPanorama();
                    setLives(3); // Reset lives
                } else {
                    const guessedCountry = countries.find(
                        (country) => country.name.toLowerCase() === guess.toLowerCase()
                    );

                    if (guessedCountry) {
                        const distance = calculateDistance(
                            guessedCountry.latitude,
                            guessedCountry.longitude,
                            actualLatLng.lat(),
                            actualLatLng.lng()
                        );

                        const direction = calculateDirection(
                            guessedCountry.latitude,
                            guessedCountry.longitude,
                            actualLatLng.lat(),
                            actualLatLng.lng()
                        );

                        setHint(() => {
                            const directionIcon = directionIcons[direction] || "❓";
                            return (
                                <>
                                    <span class="hint-icon">{directionIcon}</span>
                                    <span class="hint-text"> {Math.round(distance)} km</span>
                                </>
                            );
                        });

                        // Add guessed point to minimap
                        addGuessedMarker({
                            lat: guessedCountry.latitude,
                            lng: guessedCountry.longitude,
                        });
                    } else {
                        setHint(() => (
                            <>
                                <span class="hint-icon">❌</span>
                                <span class="hint-text"> Invalid guess. Try again!</span>
                            </>
                        ));
                    }
                }
            }
        };

        return { handleGuess };
    };

    const revealActualLocation = (latLng) => {
        // Show the actual location on the minimap after game over or correct guess
        new google.maps.Marker({
            position: latLng,
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        });
        map.setCenter(latLng);
        map.setZoom(6);
    };

    let handlers;

    onMount(() => {
        const checkGoogleMapsLoaded = () => {
            if (window.google) {
                handlers = initialize(); // Call initialize when Google Maps is loaded
                console.log("Google Maps API loaded successfully!");
            } else {
                console.log("Waiting for Google Maps API to load...");
                setTimeout(checkGoogleMapsLoaded, 10); // Retry after 10ms
            }
        };

        checkGoogleMapsLoaded();
    });


    return (
        <main>
            <Title>PlaceExplorer</Title>
            <div class="geo-container">
                <div id="pano" ref={panoRef} class="geo-pano"></div>
                <div class="geo-controls">
                    <Autocomplete onMessage={handleChildMessage} />
                    <p class="lives">{hearts()}</p>
                    <div ref={mapRef} class="minimap" ></div>
                </div>
                <div class="hint">
                    {hint()}
                </div>
            </div>
        </main>
    );
}

export default PlaceExplorer;
