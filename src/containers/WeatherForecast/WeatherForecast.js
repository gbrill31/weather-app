import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import Unsplash from 'unsplash-js';
import {
  Container, Paper, Button
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';

import SearchCitiesInput from '../../components/SearchCitiesInput/SearchCitiesInput';
import CurrentConditions from '../../components/CurrentConditions/CurrentConditions';
import Forecast from '../../components/Forecast/Forecast';

import './WeatherForecast.scss';

import {
  setSlectedCity
} from './actions';

import {
  saveFavorite
} from '../WeatherFavorites/actions';

const unsplash = new Unsplash({
  accessKey: '07b05aadc071c805fe2fe28c70c0666509b1690d3b7d23cb080af1b2fa530899',
  headers: {
    'SameSite': 'none',
    'Set-Cookie': 'promo_shown=1; Max- Age=2600000; Secure'
  }
});

const mapStateToProps = state => ({
  selectedCity: state.weatherForecast.city,
  favorites: state.weatherFavorites.items,
  tempratureUnits: state.tempratureUnits.units
});

const mapDispathToProps = dispatch => ({
  saveToFavorites: city => dispatch(saveFavorite(city)),
  setForecastCity: city => dispatch(setSlectedCity(city))
});

const DEFAULT_CITY = 'Tel Aviv';

function WeatherForecast({
  selectedCity, saveToFavorites, favorites, setForecastCity, tempratureUnits
}) {

  const [bgPhoto, setBgPhoto] = useState('');

  const loadBgImage = ({ results }) => {
    let path = require('../../images/default_bg.jpg');
    if (results.length) {
      path = results[0].urls.full;
    }
    const img = new Image();
    img.onload = () => {
      setBgPhoto(path);
    }
    img.src = path;
  }

  const setSelectedCity = useCallback((city) => {
    setForecastCity(city);
  }, [setForecastCity]);

  useEffect(() => {
    if (!selectedCity) {
      setSelectedCity(DEFAULT_CITY);
    }
  }, [selectedCity, setSelectedCity]);

  useEffect(() => {
    if (selectedCity) {
      unsplash.search.photos(selectedCity.LocalizedName, 1, 3, { orientation: "landscape" })
        .then(res => res.json())
        .then(data => {
          loadBgImage(data);
        });
    }
    return () => { };
  }, [bgPhoto, selectedCity]);

  const isInFavorites = () => {
    const isSaved = typeof favorites.find(city => city.Key === selectedCity.Key) === 'object';
    return isSaved;
  }


  return (
    <Fragment>
      <Container
        maxWidth="xl"
        className="forecastContainer"
        style={{
          backgroundImage: `url(${bgPhoto})`
        }}
      >
        <SearchCitiesInput
          setSelectedCity={setSelectedCity}
        />
        {
          selectedCity && (
            <Paper elevation={0} variant="outlined" className="forecastPaperWrapper">
              <div className="forecastHeader">
                <CurrentConditions
                  className="justifyLeft"
                  city={selectedCity}
                  tempratureUnits={tempratureUnits}
                  isInFavorites={isInFavorites()}
                />
                <Button
                  onClick={() => {
                    saveToFavorites(selectedCity);
                  }}
                  variant="contained"
                  className="addToFavoritesBtn"
                  disabled={isInFavorites()}
                  startIcon={<FavoriteIcon />}
                >
                  Add To Favorites
                </Button>
              </div>
              <Forecast city={selectedCity} />
            </Paper>
          )
        }
      </Container>
    </Fragment>
  )
}

export default connect(mapStateToProps, mapDispathToProps)(WeatherForecast);