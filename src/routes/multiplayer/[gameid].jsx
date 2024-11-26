import { createSignal, createEffect, onMount, onCleanup, For } from "solid-js";
import { Title } from "@solidjs/meta";
import Papa from "papaparse";
import Autocomplete from "~/components/Input";

function PlaceExplorer(props) {
    const [username, setUsername] = createSignal("");
    const [isUsernameSet, setIsUsernameSet] = createSignal(false);
    const [currentLocation, setCurrentLocation] = createSignal({});
    const [lives, setLives] = createSignal(3);
    const [hearts, setHearts] = createSignal("❤️❤️❤️");
    const [hint, setHint] = createSignal("");
    const [players, setPlayers] = createSignal([]);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = createSignal(false);
    const [isSpectating, setIsSpectating] = createSignal(false);
    let hasInitialized = false;
    let countries = [];
    let panoRef;
    let mapRef;
    let map;
    let panorama;
    let gameStateFetchInterval;

    createEffect(() => {
        setHearts(lives() > 0 ? "❤️".repeat(lives()) : "");

        // When lives reach 0, switch to spectating mode
        if (lives() === 0 && !isSpectating()) {
            setIsSpectating(true);
        }
    });
    createEffect(() => {
        if (isUsernameSet() && !isGoogleMapsLoaded()) {
            const checkGoogleMapsLoaded = () => {
                if (window.google) {
                    initialize();
                } else {
                    setTimeout(checkGoogleMapsLoaded, 100);
                }
            };
            checkGoogleMapsLoaded();
        }
    });
    createEffect(() => {
        if (isUsernameSet() && isGoogleMapsLoaded() && !hasInitialized) {
            hasInitialized = true;
            loadRandomPanorama();

            // Set up periodic game state fetching
            gameStateFetchInterval = setInterval(fetchGameState, 10000); // Every 10 seconds
        }
    });

    const fetchGameState = async () => {
        try {
            const response = await fetch(`/api/getGame/${props.params.gameid}/${username()}`,
            {
                    method: "POST",
                    body: JSON.stringify({
                        lives: lives(),
                    }),
                });
            const data = await response.json();
            console.log(data.players)

            // Update players list
            setPlayers(data.players);

        } catch (error) {
            console.error("Error fetching game state:", error);
        }
    };
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
        if (!window.google) return null;

        panorama = new google.maps.StreetViewPanorama(panoRef, {
            pov: { heading: 34, pitch: 10 },
            addressControl: false,
            fullscreenControl: true,
        });

        map = new google.maps.Map(mapRef, {
            center: { lat: 0, lng: 0 },
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false,
            fullscreenControl: false,
        });

        loadCountryData();
        setIsGoogleMapsLoaded(true);
        return handleGuess;
    };

    const loadCountryData = () => {
        Papa.parse("/countryList.csv", {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                countries = results.data;
            },
        });
    };

    const loadRandomPanorama = async (latlng) => {
        if (!latlng) {
            try {
                const response = await fetch(`/api/getGame/${props.params.gameid}/${username()}`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            lives: lives(),
                        }),
                    });
                const data = await response.json();
                setPlayers(data.players);
                const newLatLng = {
                    lat: data.games[0].latitude,
                    lng: data.games[0].longitude
                };

                if (Object.keys(currentLocation()).length !== 0) {
                    const currentLat = currentLocation().latLng.lat();
                    const currentLng = currentLocation().latLng.lng();

                    if (Math.trunc(currentLat) === Math.trunc(newLatLng.lat) &&
                        Math.trunc(currentLng) === Math.trunc(newLatLng.lng)) {
                        updateGameAndRetry();
                        return;
                    }
                }
                loadPanorama(newLatLng);
            } catch (error) {
                console.error("Error fetching game data:", error);
            }
        } else {
            loadPanorama(latlng);
        }
    };

    const updateGameAndRetry = async () => {
        try {
            const response = await fetch(`/api/updateGame/${props.params.gameid}/${username()}`,
                {
                    method: "POST",
                });
            const data = await response.json();
            const newLatLng = {
                lat: data[0].latitude,
                lng: data[0].longitude
            };
            loadRandomPanorama(newLatLng);
        } catch (error) {
            console.error("Error updating game data:", error);
        }
    };

    const loadPanorama = (latLng) => {
        if (!window.google) return;

        const streetViewService = new google.maps.StreetViewService();

        streetViewService.getPanorama(
            { location: latLng, radius: 5000 },
            (data, status) => {
                if (status === google.maps.StreetViewStatus.OK) {
                    if (panorama) {
                        panorama.setPosition(data.location.latLng);
                        setCurrentLocation({
                            latLng: data.location.latLng,
                            country: getCountryName(data.location.latLng),
                        });
                    }
                } else {
                    console.log("No panorama found. Retrying...");
                    loadRandomPanorama();
                }
            }
        );
    };

    const getCountryName = (latLng) => {
        const geocoder = new google.maps.Geocoder();
        return new Promise((resolve) => {
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
                        resolve(countryResult.formatted_address);
                    }
                }
                resolve(null);
            });
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

    const addGuessedMarker = (latLng) => {
        if (!map) return;

        new google.maps.Marker({
            position: latLng,
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        });
    };

    const revealActualLocation = (latLng) => {
        if (!map) return;

        new google.maps.Marker({
            position: latLng,
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        });
        map.setCenter(latLng);
        map.setZoom(6);
    };

    const handleGuess = (guess) => {
        if (isSpectating()) {
            alert("You are currently spectating. Wait for the next round.");
            return;
        }
        const currentCountry = currentLocation().country || "";
        const actualLatLng = currentLocation().latLng;
        console.log(currentCountry);
        console.log(guess);

        if (guess.trim().toLowerCase() === currentCountry.toLowerCase()) {
            alert(`Correct! The country is ${currentCountry}!`);
            setHint("");
            revealActualLocation({ lat: actualLatLng.lat(), lng: actualLatLng.lng() });
            console.log("line 242");
            loadRandomPanorama();
        } else {
            setLives(lives() - 1);

            if (lives() === 0) {
                alert(`Wrong! The correct country was ${currentCountry}.`);
                revealActualLocation({ lat: actualLatLng.lat(), lng: actualLatLng.lng() });
                setHint("");
                loadRandomPanorama();
            } else {
                console.log("wrong guess + has lives")
                const guessedCountry = countries.find(
                    (country) => country.name.toLowerCase() === guess.trim().toLowerCase()
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

                    const directionIcon = directionIcons[direction] || "❓";
                    setHint([
                        <span class="hint-icon">{directionIcon}</span>,
                        <span class="hint-text">{Math.round(distance)} km</span>
                    ]);

                    addGuessedMarker({
                        lat: guessedCountry.latitude,
                        lng: guessedCountry.longitude,
                    });
                } else {
                    setHint([
                        <span class="hint-icon">❌</span>,
                        <span class="hint-text">Invalid guess. Try again!</span>
                    ]);
                }
            }
        }
    };

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        if (username().trim()) {
            setIsUsernameSet(true);
        }
    };

    onMount(() => {
        if (username().trim()) {
            setIsUsernameSet(true);
        }
    });

    /* onCleanup(() => {
        if (panorama) {
            panorama.setVisible(false);
        }
        if (map) {
            map.setDiv(null);
        }
    }); */
    onCleanup(() => {
        if (gameStateFetchInterval) {
            clearInterval(gameStateFetchInterval);
        }
    });
    return (
        <main class="relative bg-gray-900 text-white min-h-screen overflow-hidden">
            <Title>PlaceExplorer</Title>

            <div class="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full opacity-30 blur-2xl animate-pulse"></div>
            <div class="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
            <div class="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-green-400 to-teal-500 rounded-full opacity-40 blur-lg animate-spin-slow"></div>
            <div class="absolute top-10 right-1/3 w-60 h-60 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-25 blur-xl"></div>
            <div class="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full opacity-30 blur-2xl"></div>

            {!isUsernameSet() ? (
                <div class="relative flex items-center justify-center min-h-screen p-6">
                    <div class="bg-gray-800/50 backdrop-blur-lg p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
                        <h2 class="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-red-400 to-purple-600 bg-clip-text text-transparent">
                            PlaceExplorer
                        </h2>
                        <form onSubmit={handleUsernameSubmit} class="space-y-4">
                            <div>
                                <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
                                    Enter your username to start
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username()}
                                    onInput={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    required
                                    class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                                />
                            </div>
                            <button
                                type="submit"
                                class="w-full px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg transform hover:scale-105 transition-transform"
                            >
                                Start Game
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div class="relative container mx-auto p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2">
                            <div ref={panoRef} class="w-full h-[500px] rounded-lg overflow-hidden shadow-2xl border border-gray-700"></div>
                        </div>
                        <div class="space-y-6 relative z-60">
                            <div class="bg-gray-800/50 backdrop-blur-lg p-6 rounded-lg shadow-2xl border border-gray-700 relative z-50">
                                <Autocomplete class="z-50 relative pointer-events-auto" onMessage={handleGuess} />
                                <p class="text-3xl text-center mt-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                                    {hearts()}
                                </p>
                            </div>
                            <div ref={mapRef} class="z-10 w-full h-60 rounded-lg overflow-hidden shadow-2xl border border-gray-700"></div>
                            <div class="bg-gray-800/50 backdrop-blur-lg p-4 rounded-lg shadow-2xl border border-gray-700">
                                <div class="flex items-center justify-center space-x-2 text-lg">
                                    {hint()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer class="relative mt-10 text-center text-sm text-gray-500">
                        Playing as{" "}
                        <span class="text-indigo-400">
                            {username()}
                        </span>
                        {isSpectating() && (
                            <span class="ml-2 text-yellow-500">
                                (Spectating)
                            </span>
                        )}
                    </footer>
                    <div class="bg-gray-800/50 backdrop-blur-lg p-6 rounded-lg shadow-2xl border border-gray-700 mt-6">
                        <h3 class="text-2xl font-bold text-center text-white mb-4">Player Scores</h3>
                        <table class="w-full text-left table-auto text-white">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2 border-b">Username</th>
                                    <th class="px-4 py-2 border-b">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <For each={players()}>
                                    {(player) => {
                                        const hearts = "❤️".repeat(player.score);
                                        return (
                                            <tr>
                                                <td class="px-4 py-2 border-b">{player.username}</td>
                                                <td class="px-4 py-2 border-b">{hearts}</td>
                                            </tr>
                                        );
                                    }}
                                </For>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}

export default PlaceExplorer;