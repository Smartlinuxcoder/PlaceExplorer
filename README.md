

# PlaceExplorer
================

A SolidStart application for exploring places.

## Table of Contents
-----------------

* [Features](#features)
* [Getting Started](#host-it-yourself)
* [API](#api)
* [Styles](#styles)

## Features
--------

* Explore places using Google Street View
* Guess the location of a random city
* View minimap for navigation

* You have three lives
* Every time you make a wrong guess, a hint appears at the bottom of the screen!


## Host it yourself
---------------

To run the application, navigate to the project directory and execute the command:

```bash
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

## Styles
------

* `app.css`: Global styles for the application
* `geoguessr.css`: Styles for the place exploration interface
* `input.css`: Styles for the input component

Note: This README is a basic template and may need to be updated to reflect the actual features and components of the application.