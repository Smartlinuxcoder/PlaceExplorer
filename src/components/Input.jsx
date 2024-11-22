// Autocomplete.jsx
import { createSignal } from "solid-js";
import "./input.css"; // Import the CSS file

function Autocomplete({ onMessage }) {
    const [inputValue, setInputValue] = createSignal("");
    const [suggestions, setSuggestions] = createSignal([]);
    const [filteredSuggestions, setFilteredSuggestions] = createSignal([]);


    const fetchSuggestions = async () => {
        try {
            const response = await fetch("countries.csv");
            if (response.ok) {
                const data = await response.text();

                const countries = data.split("\n")
                    .filter(line => line)  // Remove empty lines
                    .splice(1)  // Remove header line
                    .map((line) => {
                        const [code, name] = line.split(",");
                        return { code, name }; // Store both code and name
                    });

                console.log(countries);
                setSuggestions(countries); // Set the fetched suggestions to state
            } else {
                console.error("Failed to fetch suggestions.");
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    // Run fetchSuggestions when the component is first mounted
    fetchSuggestions();

    // Handle input change and filter suggestions based on input
    const handleInput = (event) => {
        const value = event.target.value;
        setInputValue(value);

        if (value.trim()) {
            setFilteredSuggestions(
                suggestions().filter(({ name, code }) =>
                    name.toLowerCase().startsWith(value.toLowerCase()) ||
                    code.toLowerCase().startsWith(value.toLowerCase())
                )
            );
        } else {
            setFilteredSuggestions([]);
        }
    };

    // Handle guess action when user presses the button or Enter key
    const handleGuess = () => {
        onMessage(inputValue());
        setInputValue("");
    };

    // Handle selection of a suggestion
    const selectSuggestion = (suggestion) => {
        setInputValue(suggestion.name); // Only show country name
        setFilteredSuggestions([]); // Clear suggestions after selection
    };

    // Handle Enter key press to submit
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleGuess(); // Submit when Enter is pressed
        } else if (event.key === "Tab") {
            // If suggestions exist, select the first one when Tab is pressed
            if (filteredSuggestions().length > 0) {
                selectSuggestion(filteredSuggestions()[0]); // Select first suggestion
                event.preventDefault(); // Prevent default tab behavior (moving focus)
            }
        }
    };

    return (
        <div class="autocomplete-container">
            <input
                type="text"
                value={inputValue()}
                onInput={handleInput}
                onKeyDown={handleKeyDown}  // Listen for the Tab key press
                class="autocomplete-input"
            />
            <button class="geo-submit" onClick={handleGuess}>Guess</button>
            {filteredSuggestions().length > 0 && (
                <ul class="suggestions-list">
                    {filteredSuggestions().map((suggestion) => (
                        <li
                            key={suggestion.code}
                            onClick={() => selectSuggestion(suggestion)}
                            class="suggestion-item"
                        >
                            {suggestion.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Autocomplete;
