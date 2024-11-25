

# PlaceExplorer
================

A geoguessr-like website, but free and without any ads!

## Features
--------

* Explore places using Google Street View
* Guess the location of a random city
* View minimap for navigation

* You have three lives
* Every time you make a wrong guess, a hint appears at the bottom of the screen!

# [Demo here!](https://placeexplorer.smart.is-a.dev/) 

## Table of Contents
-----------------

* [Features](#features)
* [Getting Started](#host-it-yourself)
* [API](#api)
* [Styles](#styles)
* [Credits](#credits)



## Host it yourself
---------------
Add a Google Maps api key to .env:

* `VITE_GOOGLE_MAPS_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`


To run the application, navigate to the project directory and execute the command:

```bash
bun install
bun run dev
```

This will start the development server, and you can access the application at `http://localhost:3000`.


## Components
------------

* `App`: The main application component
* `PlaceExplorer`: The component responsible for rendering the place exploration interface
* `Autocomplete`: The component for autocomplete suggestions
* `Input`: The component for user input

## API
----

* `GET /api/getPlace`: Returns a random city as JSON
* `GET /api/startGame`: Starts a game and returns a random code
* `GET /api/getGame/:gameId/:username`: Returns a game's information as JSON
* `GET /api/updateGame/:gameId/:username`: Changes the random position of a game

## Styles
------

* `app.css`: Global styles for the application
* `geoguessr.css`: Styles for the place exploration interface
* `input.css`: Styles for the input component


## Credits
-------

Thanks to [Simplemaps](https://simplemaps.com/data/world-cities) for their csv dataset.