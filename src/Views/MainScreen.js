import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, Button, View, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import ScreenRow from '../Components/ScreenRow';
import { calculateLocation, errorView, LoadingView } from './MainScreenStates';

// Состояния
const STATE_CALCULATE_LOCATION = 0; // Вычисление местоположения
const STATE_LOADING_DATA       = 1; // Загрузка данных
const STATE_DATA_LOADED        = 2; // Данные загружены
const STATE_DATA_ERROR         = 3; // Ошибка данных

function MainScreen() {

  const [updatingDone, setUpdatingState] = useState(STATE_CALCULATE_LOCATION);
  const [currWeather, setCurrWeather] = useState(null);
  const location = useRef(undefined);

  function windAngleToDirection(angle){
    if (angle < 22.5)  return 'Сев.';
    if (angle < 67.5)  return 'С-В';
    if (angle < 112.5) return 'Вост.';
    if (angle < 157.5) return 'Ю-В';
    if (angle < 202.5) return 'ЮГ';
    if (angle < 247.5) return 'Ю-З';
    if (angle < 292.5) return 'Зап.';
    if (angle < 337.5) return 'С-З';
    return 'Сев'
  }

  async function requestLocationPermission() 
  {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Получение прав на определение местоположения',
          message: 'Вы разрешаете данному приложения определять ваше местоположение?',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Запретить',
          buttonPositive: 'Разрешить'
        },
      );
        if (granted === PermissionsAndroid.RESULTS.GRANTED)
        {
          console.log('Права получены');
          return true;
        }
        else {
          console.log('Доступ запрещён')
          return false;
        }
      } catch (error) {return false}
  }

  function getLocation(){
    requestLocationPermission().then((res) => 
      {
      console.log('Результат', res);
      if (res)
      {
        Geolocation.getCurrentPosition((position) => {
            location.current = position;          
            console.log('долгота', location.current.coords.longitude)
            console.log('широта', location.current.coords.latitude)
            setUpdatingState(STATE_LOADING_DATA);
          },
          error => {
            console.log("Код: ошибки и сообщение:", error.code, error.message)
            location.current = undefined;
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setUpdatingState(STATE_DATA_ERROR);
      }
    });
  }

  async function fetchWithTimeout(resource, options = {}) {
    const {timeout = 10000} = options; /* время в миллисекундах 10 000мс = 10 секундам */
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options, signal: controller.signal
    });
    clearTimeout(id);
    return response;
  }

  function loadingData(){
    if (!location.current || !location.current.coords){
      setUpdatingState(STATE_DATA_ERROR);
      return;
    }
    fetchWithTimeout(`https://api.openweathermap.org/data/2.5/weather?lat=${location.current?.coords.latitude}&lon=${location.current?.coords.longitude}&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35`)
    .then((response) => {
      if (response.ok){
        response.json()
        .then((data)=>{
          //console.log('Данные получены:', data)
          setCurrWeather(data);
          setUpdatingState(STATE_DATA_LOADED);
        });
      }
    })
    .catch((error) => setUpdatingState(STATE_DATA_ERROR)
    );       
  }


  useEffect(() => {
    if (updatingDone === STATE_CALCULATE_LOCATION){
      getLocation();
    } else if (updatingDone === STATE_LOADING_DATA){
      loadingData();
    }
  }, [updatingDone]);

  function LoadedView(){
      return (
      <View style = {styles.container}>
        <View style = {styles.infoScreen}>
        <ScreenRow param = {'Местоположение:'} value = {currWeather.name}/>
        <ScreenRow param = {'Температура'} value = {currWeather.main.temp + '°C'}/>
        <ScreenRow param = {'По ощущению'} value = {currWeather.main.feels_like + '°C'}/>
        <ScreenRow param = {'Влажность:'} value = {currWeather.main.humidity + '%'}/>
        <ScreenRow param = {'Небо:'} value = {currWeather.weather[0].description}/>
        <ScreenRow param = {'Облачность:'} value = {currWeather.clouds.all + '%'}/>
        <ScreenRow param = {'Давление:'} value = {currWeather.main.pressure * 0.75 + 'мм. рт.с'}/>
        <ScreenRow param = {'Видимость:'} value = {currWeather.visibility + 'м.'}/>
        <ScreenRow param = {'Ветер:'} value = {currWeather.wind.speed + 'м/сек - ' + windAngleToDirection(currWeather.wind.deg)}/>      
        </View>
        <View style = {styles.buttonStyle}>
          <Button onPress={() => {
            setUpdatingState(STATE_CALCULATE_LOCATION);
            currWeather.current = undefined;
          }}
          title='Обновить'></Button>
        </View>
      </View>
    )
  };

  switch (updatingDone)
  {
    case STATE_CALCULATE_LOCATION:
      console.log('Состояние: определения местонахождения');
      return calculateLocation();      
    case STATE_LOADING_DATA:
      console.log('Состояние: загрузка данных')
      return LoadingView();
    case STATE_DATA_LOADED:
      console.log('Состояние: данные загружены')
      return LoadedView();
    case STATE_DATA_ERROR:
      console.log('Состояние: Ошибка')
      return errorView();
    default:
        return <Text>Неизвестное состояние</Text>
  }

}

export default MainScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    flexDirection: 'column'
  },

  infoScreen: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonStyle: {
    flex: 1,
    justifyContent: 'flex-end',
  }
  
})