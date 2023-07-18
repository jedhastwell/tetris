# Tetris

My own implementation of the classic Tetris, made just for fun.

Currently desktop only and still a work in progress...

Available to play at: https://super-tetris.netlify.app/

### Keyboard Controls

Move Left: Left Arrow, A

Move Right: Right Arrow, D

Soft Drop: Down Arrow, S

Hard Drop: Space

Rotate Left: Z

Rotate Right: Up Arrow, X, W

Hold: C

## Setup

### Environment

Requires node.js and npm to be installed: https://nodejs.org/en/

### Install Dependencies

From the project directory run:

`npm install`

## Usage

### Development Server

Starts a development server that will automatically refresh the page as you make changes. Once started, navigate to http://localhost:8080 in your browser.

To start the server run:

`npm run start`

### Distribution

Bundles and minimises scripts and outputs them along with a copy of the assets/ folder to output directory dist/.

To build for distribution run:

`npm run build`
