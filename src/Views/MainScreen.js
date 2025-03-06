/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View, Image, FlatList, useWindowDimensions } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import ScreenRow from '../Components/ScreenRow';
import SelectPositionBar from '../Components/selectposition';
import {LoadingView, CalculateLocation, LoadingFromStorageView} from './MainScreenStates';
import {storage} from '../store/storage';
import { weatherImages } from '../const/imagesTags';

export const STATE_LOADING_FROM_STORAGE = 0;
export const STATE_CALCULATE_LOCATION = 1;
export const STATE_LOADING_DATA = 2;
export const STATE_DATA_LOADED = 3;
export const STATE_DATA_ERROR = 4;
export const STATE_DATA_EMPTY = 5;

const weatherDataList = [
  {
    key: 1,
    icon: weatherImages.lat,
    title: 'Широта:',
  },
  {
    key: 2,
    icon: weatherImages.lon,
    title: 'Долгота:',
  },
  {
    key: 3,
    icon: weatherImages.position,
    title: 'Местоположение:',
  },
  {
    key: 4,
    icon: weatherImages.temperature,
    title: 'Температура:',
  },
  {
    key: 5,
    icon: weatherImages.sens,
    title: 'По ощущению:',
  },
  {
    key: 6,
    icon: weatherImages.humidity,
    title: 'Влажность:',
  },
  {
    key: 7,
    icon: weatherImages.sky,
    title: 'Небо:',
  },
  {
    key: 8,
    icon: weatherImages.clouds,
    title: 'Облачность:',
  },
  {
    key: 9,
    icon: weatherImages.pressure,
    title: 'Давление:',
  },
  {
    key: 10,
    icon: weatherImages.visibility,
    title: 'Видимость:',
  },
  {
    key: 11,
    icon: weatherImages.wind,
    title: 'Ветер:',
  },
];


function MainScreen({navigation, route}) {

  const errors = useRef(
    {
      locationError: {
        active: false,
        message: '',
      },
      networkError: {
        active: false,
        message: '',
        responseCode: 0,
      },
    }
  );

  const [useCurrentPosition, setUseCurrentPosition] = useState(true);

  const [dataState, setUpdatingState] = useState({
    state: STATE_LOADING_FROM_STORAGE,
    currWeather: null,
    position: {
      lat: 50,
      lon: 50,
    },
  });

  const screen = useWindowDimensions();

  function windAngleToDirection(angle){
    if (angle < 22.5) return 'Cев';
    if (angle < 67.5) return 'C-В';
    if (angle < 112.5) return 'Вост';
    if (angle < 157.5) return 'Ю-В';
    if (angle < 202.5) return 'Юж';
    if (angle < 247.5) return 'Ю-З';
    if (angle < 292.5) return 'Зап';
    if (angle < 337.5) return 'С-З';
    return 'Сев';
  }

  async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Получение прав на определение местоположения',
          message: 'Вы разрешаете данному приложению определять ваше местоположение?',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Запретить',
          buttonPositive: 'Разрешить',
        },
      );
      console.log('Права - ', granted);
      if (granted === 'granted') {
        console.log('Права получены');
        return true;
      } else {
        console.log('Доступ запрещен');
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  async function getLocation() {
    if (useCurrentPosition) {
      const result = await requestLocationPermission();
      if (result){
        Geolocation.getCurrentPosition(
          position => {
            console.log(position);
            errors.current.locationError.active = false;
            setUpdatingState({...dataState, state: STATE_LOADING_DATA, position: {lat: position.coords.latitude, lon: position.coords.longitude}});
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
            errors.current.locationError.active = true;
            errors.current.locationError.message = error.message;
            setUpdatingState({...dataState, state: STATE_DATA_ERROR});
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    } else {
      setUpdatingState({...dataState, state: STATE_LOADING_DATA});
    }
  }

  async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 10000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  }

  async function loadingFromStorage(){
    if (!useCurrentPosition){
      try {
        let ret = await storage.load({key: 'mapPosition', id: '1'});
        console.log(ret);
        setUpdatingState({state: STATE_LOADING_DATA, currWeather: null, position: ret});
      } catch (err) {
        console.warn(err.message);
        setUpdatingState({...dataState, state: STATE_DATA_EMPTY});
      }
    } else {
      setUpdatingState({...dataState, state: STATE_CALCULATE_LOCATION});
    }
  }

  async function loadingData(pos){
    errors.current.networkError.active = false;
    try {
      let response = await fetchWithTimeout(`http://api.openweathermap.org/data/2.5/weather?lat=${pos.lat}&lon=${pos.lon}&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35`, { timeout: 10000 });
      errors.current.networkError.responseCode = response.status;
      if (response.ok) {
        let data = await response.json();
        console.log(data);
        setUpdatingState({...dataState, state: STATE_DATA_LOADED, currWeather: data});
      } else {
        errors.current.networkError.active = true;
        errors.current.networkError.message = 'Invalid server response';
        setUpdatingState({...dataState, state: STATE_DATA_ERROR, currWeather: null});
      }
    } catch (error){
      errors.current.networkError.active = true;
      errors.current.networkError.message = error.message;
      setUpdatingState({...dataState, state: STATE_DATA_ERROR, currWeather: null});
    }
  }

  useEffect(()=>{
    if (route.params?.position !== undefined)
    {
      // записать новые координаты в хранилище
      storage.save({
        key: 'mapPosition',
        id: '1',
        data: route.params?.position,
      });
      setUpdatingState({...dataState, state: STATE_LOADING_FROM_STORAGE});
      route.params.position = undefined;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[route.params?.position]);

  useEffect(()=> {
    if (dataState.state === STATE_LOADING_FROM_STORAGE){
      loadingFromStorage();
    } else if (dataState.state === STATE_CALCULATE_LOCATION){
      getLocation();
    } else if (dataState.state === STATE_LOADING_DATA){
      loadingData(dataState.position);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[dataState]);


    function errorView() {
      return (
        <View
        style={styles.infoScreen}>
        <Image style={styles.errorImageStyle} source={require('../assets/icons/error.png')}/>
        <Text>Ошибка...</Text>
        { errors.current.locationError.active &&
          <Text>
            Не определено ваше местоположение. Возможно выключена геолокация. 
            Исправьте это и повторите попытку.
            {errors.current.locationError.message}
          </Text>}
        { errors.current.networkError.active &&
          <Text>
            Ошибка сети: {errors.current.networkError.message}
            {errors.current.networkError.responseCode > 299 ? errors.current.networkError.responseCode : ''}
          </Text>}
      </View>
      );
    }

    function getWeatherParams(data, weather) {
      data[0].value = weather.coord.lat;
      data[1].value = weather.coord.lon;
      data[2].value = weather.name;
      data[3].value = weather.main.temp + ' °C';
      data[4].value = weather.main.feels_like + ' °C';
      data[5].value = weather.main.humidity + ' %';
      data[6].value = weather.weather[0].description;
      data[7].value = weather.clouds.all + ' %';
      data[8].value = weather.main.pressure * 0.75 + ' мм. рт. ст.';
      data[9].value = weather.visibility + ' м.';
      data[10].value = weather.wind.speed + ' м/сек - ' + windAngleToDirection(weather.wind.deg);
      return data;
    }

  function loadedView(){
    let currWeather = dataState.currWeather;
    return (
      <View style = {styles.container}>
      <View style = {{flex : screen.width > screen.height ? 2 : 1}}>
        <SelectPositionBar
          navigation = {navigation}
          position = {dataState.position}
          useCurrentPos = {useCurrentPosition}
          setCurrentPosHandler = {setUseCurrentPosition}
        />
      </View>
        {
          dataState.state === STATE_DATA_EMPTY ?
            <View
              style={styles.infoScreen}>
              <Text style ={styles.textValueStyle}>Не определена позиция. Используйте свое местоположение или выберите точку на карте</Text>
          </View>
          :
            (dataState.state === STATE_DATA_ERROR) ?
              errorView()
            :
              <View style={styles.infoScreen}>
                <FlatList
                  data = {getWeatherParams(weatherDataList, currWeather)}
                  renderItem = {({item}) =>
                    <ScreenRow
                      param = {item.title}
                      value = {item.value}
                      icon = {item.icon}
                    />
                  }
                />
              </View>
        }
        <View style ={[styles.buttonView, {flex : screen.width > screen.height ? 2 : 1}]}>
          <TouchableOpacity
            style ={styles.buttonStyle}
            onPress={()=>{
              setUpdatingState({...dataState, state: STATE_LOADING_FROM_STORAGE});
              }}
          >
            <Text>Обновить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  switch (dataState.state) {
    case STATE_LOADING_FROM_STORAGE:
      return <LoadingFromStorageView/>;
    case STATE_CALCULATE_LOCATION:
      return <CalculateLocation/>;
    case STATE_LOADING_DATA:
      return <LoadingView/>;
    case STATE_DATA_LOADED:
    case STATE_DATA_EMPTY:
    case STATE_DATA_ERROR:
      return loadedView();
  }

}
export default MainScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'column',
  },

  selectPositionView: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 1,
  },

  infoScreen: {
    flex: 10,
  },

  buttonView: {
    //flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonStyle: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    height: '70%',
  },

  textStyle: {
    fontSize: 24,
  },

  errorImageStyle: {
    resizeMode: 'center',
    width: '50%',
    height: '50%',
  },
});
