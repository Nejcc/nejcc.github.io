const canvas = document.getElementById('solarSystem');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sun = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 50,
    color: '#FFD700'
};

const planets = [
    {
        name: 'Mercury',
        radius: 5,
        semiMajorAxis: 80, // Semi-major axis
        semiMinorAxis: 60, // Semi-minor axis
        color: '#aaa',
        baseSpeed: 0.05,
        angle: 0,
        data: {
            temperature: '430°C (day), -180°C (night)',
            terrain: 'Rocky',
            pressure: 'Extremely low',
            orbit: '57.9 million km from Sun',
            mass: '3.30 × 10^23 kg',
            apogeeTemperature: '-170°C',
            perigeeTemperature: '430°C'
        }
    },
    {
        name: 'Venus',
        radius: 10,
        semiMajorAxis: 120,
        semiMinorAxis: 110,
        color: '#FF4500',
        baseSpeed: 0.03,
        angle: 0,
        data: {
            temperature: '465°C',
            terrain: 'Volcanic plains',
            pressure: '92 times that of Earth',
            orbit: '108.2 million km from Sun',
            mass: '4.87 × 10^24 kg',
            apogeeTemperature: '462°C',
            perigeeTemperature: '465°C'
        }
    },
    {
        name: 'Earth',
        radius: 10,
        semiMajorAxis: 170,
        semiMinorAxis: 160,
        color: '#1E90FF',
        baseSpeed: 0.02,
        angle: 0,
        data: {
            temperature: 'Average 15°C',
            terrain: 'Varied (oceans, mountains, plains)',
            pressure: '1 atm',
            orbit: '149.6 million km from Sun',
            mass: '5.97 × 10^24 kg',
            apogeeTemperature: '-70°C',
            perigeeTemperature: '35°C'
        }
    },
    {
        name: 'Mars',
        radius: 8,
        semiMajorAxis: 220,
        semiMinorAxis: 200,
        color: '#B22222',
        baseSpeed: 0.015,
        angle: 0,
        data: {
            temperature: 'Average -60°C',
            terrain: 'Deserts, valleys, polar ice caps',
            pressure: '0.6% of Earth\'s',
            orbit: '227.9 million km from Sun',
            mass: '6.42 × 10^23 kg',
            apogeeTemperature: '-125°C',
            perigeeTemperature: '20°C'
        }
    },
    {
        name: 'Jupiter',
        radius: 20,
        semiMajorAxis: 280,
        semiMinorAxis: 250,
        color: '#FFD700',
        baseSpeed: 0.01,
        angle: 0,
        data: {
            temperature: 'Average -145°C',
            terrain: 'Gas giant',
            pressure: 'Very high',
            orbit: '778.5 million km from Sun',
            mass: '1.90 × 10^27 kg',
            apogeeTemperature: '-163°C',
            perigeeTemperature: '-145°C'
        }
    },
    {
        name: 'Saturn',
        radius: 18,
        semiMajorAxis: 350,
        semiMinorAxis: 320,
        color: '#DAA520',
        baseSpeed: 0.008,
        angle: 0,
        data: {
            temperature: 'Average -178°C',
            terrain: 'Gas giant',
            pressure: 'Very high',
            orbit: '1.43 billion km from Sun',
            mass: '5.68 × 10^26 kg',
            apogeeTemperature: '-189°C',
            perigeeTemperature: '-178°C'
        }
    },
    {
        name: 'Uranus',
        radius: 15,
        semiMajorAxis: 420,
        semiMinorAxis: 390,
        color: '#00FFFF',
        baseSpeed: 0.007,
        angle: 0,
        data: {
            temperature: 'Average -224°C',
            terrain: 'Ice giant',
            pressure: 'Very high',
            orbit: '2.87 billion km from Sun',
            mass: '8.68 × 10^25 kg',
            apogeeTemperature: '-230°C',
            perigeeTemperature: '-224°C'
        }
    },
    {
        name: 'Neptune',
        radius: 15,
        semiMajorAxis: 490,
        semiMinorAxis: 450,
        color: '#0000FF',
        baseSpeed: 0.005,
        angle: 0,
        data: {
            temperature: 'Average -218°C',
            terrain: 'Ice giant',
            pressure: 'Very high',
            orbit: '4.50 billion km from Sun',
            mass: '1.02 × 10^26 kg',
            apogeeTemperature: '-220°C',
            perigeeTemperature: '-218°C'
        }
    }
];

let globalSpeed = 1;
let isPaused = false;
let animationFrameId;

function drawSun() {
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius, 0, 2 * Math.PI);
    ctx.fillStyle = sun.color;
    ctx.fill();
}

function drawPlanetPath(planet) {
    ctx.beginPath();
    ctx.ellipse(sun.x, sun.y, planet.semiMajorAxis, planet.semiMinorAxis, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; // Faint white color for the orbit
    ctx.stroke();
}

function drawSaturnRings(planet) {
    if (planet.name === 'Saturn') {
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, planet.radius + 10, planet.radius + 5, Math.PI / 3, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.5)'; // Golden color for the rings
        ctx.stroke();
    }
}

function drawPlanet(planet) {
    // Draw the planet path (elliptical orbit)
    drawPlanetPath(planet);

    // Draw the planet
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, 2 * Math.PI);
    ctx.fillStyle = planet.color;
    ctx.fill();

    // Draw Saturn's rings
    drawSaturnRings(planet);
    
    // Draw the planet name at the center of the planet
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(planet.name, planet.x, planet.y);
}

function updatePlanetPositions() {
    planets.forEach(planet => {
        planet.angle += planet.baseSpeed * globalSpeed;
        planet.x = sun.x + planet.semiMajorAxis * Math.cos(planet.angle);
        planet.y = sun.y + planet.semiMinorAxis * Math.sin(planet.angle);
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSun();
    updatePlanetPositions();
    planets.forEach(drawPlanet);
    animationFrameId = requestAnimationFrame(animate);
}

function toggleAnimation() {
    if (isPaused) {
        isPaused = false;
        document.getElementById('playPauseButton').textContent = 'Pause';
        animate();
    } else {
        isPaused = true;
        document.getElementById('playPauseButton').textContent = 'Play';
        cancelAnimationFrame(animationFrameId);
    }
}

// Event listener for global speed control
document.getElementById('globalSpeed').addEventListener('input', (e) => {
    globalSpeed = parseFloat(e.target.value);
});

// Event listener for play/pause button
document.getElementById('playPauseButton').addEventListener('click', toggleAnimation);

// Event listener for showing planet data on hover
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let foundPlanet = false;

    planets.forEach(planet => {
        const distance = Math.sqrt((mouseX - planet.x) ** 2 + (mouseY - planet.y) ** 2);

        if (distance < planet.radius) {
            tooltip.innerHTML = `
                <strong>${planet.name}</strong><br>
                Temperature: ${planet.data.temperature}<br>
                Terrain: ${planet.data.terrain}<br>
                Pressure: ${planet.data.pressure}<br>
                Orbit: ${planet.data.orbit}<br>
                Mass: ${planet.data.mass}<br>
                Apogee Temperature: ${planet.data.apogeeTemperature}<br>
                Perigee Temperature: ${planet.data.perigeeTemperature}
            `;
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 10}px`;
            tooltip.style.visibility = 'visible';
            foundPlanet = true;
        }
    });

    if (!foundPlanet) {
        tooltip.style.visibility = 'hidden';
    }
});

// Start the animation
animate();
