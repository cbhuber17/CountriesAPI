'use strict';

const countriesContainer = document.querySelector('.countries');
const cityContainer = document.getElementById('city');

// ----------------------------------------------------------------------

const renderCountry = function (data, className = '') {
  const html = `
    <article class="country ${className}">
      <img class="country__img" src="${data.flag}" />
      <div class="country__data">
        <h3 class="country__name">${data.name}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👫</span>${(
          +data.population / 1000000
        ).toFixed(1)} M people</p>
        <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
        <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
      </div>
    </article>
    `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
};

// ----------------------------------------------------------------------

const renderError = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
  countriesContainer.style.opacity = 1;
};

// ----------------------------------------------------------------------

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// ----------------------------------------------------------------------

const whereAmI = async function () {
  try {
    // Geolocation
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    // Reverse geocoding
    const resGeo = await fetch(
      `https://geocode.xyz/${lat},${lng}?geoit=json&auth=670566902046970533759x85278`
    );
    if (!resGeo.ok)
      throw new Error(
        'Problem getting location data. Refresh the page and try again.'
      );
    const dataGeo = await resGeo.json();

    // Country data
    const res = await fetch(
      `https://restcountries.com/v2/name/${dataGeo.country}`
    );
    if (!res.ok) throw new Error('Problem getting country');
    const data = await res.json();
    renderCountry(data[0]);

    // Neighbouring country data
    let neighbour = data[0]?.borders;

    if (!neighbour) return `You are in ${dataGeo.city}, ${dataGeo.country}`;

    neighbour = data[0]?.borders[0];

    const neighborCountry = await fetch(
      `https://restcountries.com/v2/alpha/${neighbour}`
    );

    if (!neighborCountry.ok) throw new Error('Neighbor country not found');
    const neighborData = await neighborCountry.json();

    renderCountry(neighborData, 'neighbour');

    return `You are in ${dataGeo.city}, ${dataGeo.country}`;
  } catch (err) {
    console.error(`${err} 💥`);
    renderError(`💥 ${err.message}`);

    // Reject promise returned from async function
    throw err;
  }
};

// ----------------------------------------------------------------------

whereAmI()
  .then(city => (cityContainer.innerHTML = city))
  .catch(err => console.log(err.message))
  .finally(console.log('Got city.'));
