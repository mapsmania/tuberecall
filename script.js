const map = new maplibregl.Map({
  container: "map",
  style: "https://mapsmania.github.io/tubememory/tubememorystyle.json",
  center: [-0.124819, 51.508328],
  zoom: 11,
});

// Track if labels layer has been added
let stationLabelsAdded = false;
const labeledStations = new Set();

function updateScoreDisplay() {
  const scoreElement = document.querySelector('.score');
  if (scoreElement) {
    scoreElement.textContent = `${labeledStations.size}/269`;
  }
}


// Function to save stations to localStorage
function saveStationsToStorage() {
  localStorage.setItem('foundStations', JSON.stringify(Array.from(labeledStations)));
}

const lineColors = {
  "Bakerloo": "#B26300",
  "Central": "#E32017",
  "Circle": "#FFD329",
  "District": "#007D32",
  "Hammersmith & City": "#F4A9BE",
  "Jubilee": "#A0A5A9",
  "Metropolitan": "#9B0056",
  "Northern": "#000000",
  "Piccadilly": "#0019A8",
  "Victoria": "#0098D8",
  "Waterloo & City": "#76D0BD",
  "London Overground": "#EF7B10",
  "DLR": "#00AFAD",
  "Tramlink": "#66CC00"
};

// Function to load stations from localStorage
function loadStationsFromStorage() {
  const savedStations = localStorage.getItem('foundStations');
  if (savedStations) {
    const stationNames = JSON.parse(savedStations);
    
    // Combine all stations from all lines
    const allStations = [
      ...waterlooLine.features,
      ...piccadillyLine.features,
      ...northernLine.features,
      ...metropolitanLine.features,
      ...hammersmithLine.features,
      ...districtLine.features,
      ...circleLine.features,
      ...bakerlooLine.features,
      ...centralLine.features,
      ...victoriaLine.features,
      ...jubileeLine.features
    ];
    
    stationNames.forEach(stationName => {
      const station = allStations.find(s => 
        s.properties.name.toLowerCase() === stationName.toLowerCase()
      );
      
      if (station) {
        addStationLabel(station.properties.name, station.geometry.coordinates);
      }
        updateScoreDisplay();

    });
  }
}

function addStationLabel(stationName, coordinates) {
  if (!stationLabelsAdded) {
    // Create the labels layer if it doesn't exist
    map.addLayer({
      id: 'station-labels',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      },
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 12,
        'text-font': ['Noto Sans Regular'],
        'text-anchor': 'top',
        'text-offset': [0, 0.6]
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });
    stationLabelsAdded = true;
  }

  if (!labeledStations.has(stationName)) {
    const source = map.getSource('station-labels');
    const newFeature = {
      type: 'Feature',
      properties: {
        name: stationName
      },
      geometry: {
        type: 'Point',
        coordinates: coordinates
      }
    };

    source._data.features.push(newFeature);
    map.getSource('station-labels').setData(source._data);
    labeledStations.add(stationName);
    updateScoreDisplay();
    saveStationsToStorage();

    // Change station marker color to line color
    const allLines = {
      'waterloo-stations': waterlooLine,
      'piccadilly-stations': piccadillyLine,
      'northern-stations': northernLine,
      'metropolitan-stations': metropolitanLine,
      'hammersmith-stations': hammersmithLine,
      'district-stations': districtLine,
      'circle-stations': circleLine,
      'bakerloo-stations': bakerlooLine,
      'central-stations': centralLine,
      'victoria-stations': victoriaLine,
      'jubilee-stations': jubileeLine
    };

    Object.entries(allLines).forEach(([layerId, geojson]) => {
      const found = geojson.features.find(f => f.properties.name === stationName);
      if (found && map.getLayer(layerId)) {
        // Derive line name from layer ID
        const lineName = layerId
          .replace('-stations', '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        const color = lineColors[lineName] || '#000000';

        const originalPaint = map.getPaintProperty(layerId, 'circle-color');

        map.setPaintProperty(layerId, 'circle-color', [
          'case',
          ['==', ['get', 'name'], stationName],
          color,
          originalPaint || '#ffffff'
        ]);
      }
    });
  }
}

map.on('load', () => {

map.addSource('tube-lines', {
    type: 'geojson',
    data: tfl  // Assuming tfl is your line data variable
  });

  map.addLayer({
    id: 'tube-lines',
    type: 'line',
    source: 'tube-lines',
    paint: {
      'line-color': [
        'match',
        ['get', 'name', ['at', 0, ['get', 'lines']]],
        'Bakerloo', lineColors.Bakerloo,
        'Central', lineColors.Central,
        'Circle', lineColors.Circle,
        'District', lineColors.District,
        'Hammersmith & City', lineColors["Hammersmith & City"],
        'Jubilee', lineColors.Jubilee,
        'Metropolitan', lineColors.Metropolitan,
        'Northern', lineColors.Northern,
        'Piccadilly', lineColors.Piccadilly,
        'Victoria', lineColors.Victoria,
        'Waterloo & City', lineColors["Waterloo & City"],
        'London Overground', lineColors["London Overground"],
        'DLR', lineColors.DLR,
        'Tramlink', lineColors.Tramlink,
        '#000000' // default color
      ],
      'line-width': 2.5,
      'line-opacity': 0.8
    }
  });


        
  // Waterloo & City Line
  map.addSource('waterloo-line', {
    type: 'geojson',
    data: waterlooLine
  });

  map.addLayer({
    id: 'waterloo-stations',
    type: 'circle',
    source: 'waterloo-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff', 
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Piccadilly Line
  map.addSource('piccadilly-line', {
    type: 'geojson',
    data: piccadillyLine
  });

  map.addLayer({
    id: 'piccadilly-stations',
    type: 'circle',
    source: 'piccadilly-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Northern Line
  map.addSource('northern-line', {
    type: 'geojson',
    data: northernLine
  });

  map.addLayer({
    id: 'northern-stations',
    type: 'circle',
    source: 'northern-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Metropolitan Line
  map.addSource('metropolitan-line', {
    type: 'geojson',
    data: metropolitanLine
  });

  map.addLayer({
    id: 'metropolitan-stations',
    type: 'circle',
    source: 'metropolitan-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Hammersmith & City Line
  map.addSource('hammersmith-line', {
    type: 'geojson',
    data: hammersmithLine
  });

  map.addLayer({
    id: 'hammersmith-stations',
    type: 'circle',
    source: 'hammersmith-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // District Line
  map.addSource('district-line', {
    type: 'geojson',
    data: districtLine
  });

  map.addLayer({
    id: 'district-stations',
    type: 'circle',
    source: 'district-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Circle Line
  map.addSource('circle-line', {
    type: 'geojson',
    data: circleLine
  });

  map.addLayer({
    id: 'circle-stations',
    type: 'circle',
    source: 'circle-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Bakerloo Line
  map.addSource('bakerloo-line', {
    type: 'geojson',
    data: bakerlooLine
  });

  map.addLayer({
    id: 'bakerloo-stations',
    type: 'circle',
    source: 'bakerloo-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Central Line
  map.addSource('central-line', {
    type: 'geojson',
    data: centralLine
  });

  map.addLayer({
    id: 'central-stations',
    type: 'circle',
    source: 'central-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Victoria Line
  map.addSource('victoria-line', {
    type: 'geojson',
    data: victoriaLine
  });

  map.addLayer({
    id: 'victoria-stations',
    type: 'circle',
    source: 'victoria-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

  // Jubilee Line
  map.addSource('jubilee-line', {
    type: 'geojson',
    data: jubileeLine
  });

  map.addLayer({
    id: 'jubilee-stations',
    type: 'circle',
    source: 'jubilee-line',
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }
  });

         // Make sure lines appear below stations
  map.moveLayer('tube-lines', 'waterloo-stations');
  
  // Load saved stations
  loadStationsFromStorage();
});

     // Get the input element
    const inputElement = document.getElementById('text_a');

    // Create a Set of all station names for faster lookup
    const stationNames = new Set();
    [
      waterlooLine, piccadillyLine, northernLine, metropolitanLine,
      hammersmithLine, districtLine, circleLine, bakerlooLine,
      centralLine, victoriaLine, jubileeLine
    ].forEach(line => {
      line.features.forEach(station => {
        stationNames.add(station.properties.name.toLowerCase());
      });
    });

    // Function to check if station exists (case-insensitive)
    function isStationValid(stationName) {
      return stationNames.has(stationName.toLowerCase());
    }

function validateStation() {
  const userInput = inputElement.value.trim();
  
  if (userInput) {
    if (isStationValid(userInput)) {
      console.log(`${userInput} is valid!`);
      inputElement.style.borderColor = '#007D32';
      inputElement.style.boxShadow = '0 0 0 2px #007D32';
      
      const allStations = [
        ...waterlooLine.features,
        ...piccadillyLine.features,
        ...northernLine.features,
        ...metropolitanLine.features,
        ...hammersmithLine.features,
        ...districtLine.features,
        ...circleLine.features,
        ...bakerlooLine.features,
        ...centralLine.features,
        ...victoriaLine.features,
        ...jubileeLine.features
      ];
      
      const station = allStations.find(s => 
        s.properties.name.toLowerCase() === userInput.toLowerCase()
      );
      
      if (station) {
        // Fly to the station
        map.flyTo({
          center: station.geometry.coordinates,
          zoom: 15
        });

        // Add the station label
        addStationLabel(station.properties.name, station.geometry.coordinates);

        // Highlight the station
        const lineLayers = [
          'waterloo-stations', 'piccadilly-stations', 'northern-stations',
          'metropolitan-stations', 'hammersmith-stations', 'district-stations',
          'circle-stations', 'bakerloo-stations', 'central-stations',
          'victoria-stations', 'jubilee-stations'
        ];
        
        lineLayers.forEach(layerId => {
          if (map.getLayer(layerId)) {
            const originalColor = map.getPaintProperty(layerId, 'circle-color');
            if (typeof originalColor === 'string') {
              map.setPaintProperty(layerId, 'circle-color', [
                'case',
                ['==', ['get', 'name'], station.properties.name],
                '#ff0000',
                originalColor
              ]);
            }
          }
        });

        // ✅ Clear the input box after successful operation
        inputElement.value = '';
        inputElement.style.borderColor = '';
        inputElement.style.boxShadow = '';
      }
    } else {
      console.log(`${userInput} is NOT valid`);
      inputElement.style.borderColor = '#E32017';
      inputElement.style.boxShadow = '0 0 0 2px #E32017';
    }
  } else {
    // Reset styling when empty
    inputElement.style.borderColor = '';
    inputElement.style.boxShadow = '';
  }
}


    // Handle input events (just for uppercase conversion)
    inputElement.addEventListener('input', function(e) {
      // Save cursor position before modification
      const cursorPos = this.selectionStart;
      
      // Convert to uppercase but preserve spaces and original input
      const newValue = this.value.toUpperCase();
      
      // Only update if the value actually changed (to prevent cursor jumping)
      if (this.value !== newValue) {
        this.value = newValue;
        // Restore cursor position (plus any changes from the input)
        this.setSelectionRange(cursorPos, cursorPos);
      }
    });

    // Handle Enter key press
    inputElement.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        validateStation();
      }
    });
