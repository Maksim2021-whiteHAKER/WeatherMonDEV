import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, Button, View, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Состояния
const STATE_CALCULATE_LOCATION = 0; // Вычисление местоположения
const STATE_LOADING_DATA       = 1; // Загрузка данных
const STATE_DATA_LOADED        = 2; // Данные загружены
const STATE_DATA_ERROR         = 3; // Ошибка данных

function App() {
  const [updatingDone, setUpdatingState] = useState(STATE_CALCULATE_LOCATION);
  const currTemp = useRef(undefined);
  const [feelsLike, setFeelLike] = useState(undefined);
  const [minTemp, setMinTemp] = useState(undefined);
  const [maxTemp, setMaxTemp] = useState(undefined);
  const [pressure, setPressure] = useState(undefined);
  const [humidity, setHumidity] = useState(undefined);
  const [seaLevel, setSeaLevel] = useState(undefined);
  const [groundLevel, setGroundLevel] = useState(undefined);
  
  const location:any = useRef(undefined);

  interface FetchOptions extends RequestInit{
    timeout?: number;
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

  async function fetchWithTimeout(resource: string, options: FetchOptions = {}) {
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
        .then(data=>{
          currTemp.current = data.main.temp;
          setFeelLike(data.main.feels_like);
          setMinTemp(data.main.temp_min);
          setMaxTemp(data.main.temp_max);
          setPressure(data.main.pressure);
          setHumidity(data.main.humidity);
          setSeaLevel(data.main.sea_level);
          setGroundLevel(data.main.grnd_level);
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

  function LoadingView(){
    return (
      <View style = {styles.awaitLoading}>
        <Text>Обновление...</Text>
      </View>
    )
  }

  function calculateLocation(){
    return (
    <View style = {styles.awaitLoading}>
      <Text>Определение вашего местоположения😁</Text>
    </View>
    )
  }

  function errorView(){
    return (
    <View style = {styles.container}>
      <View style = {styles.awaitLoading}>
      <Text style = {styles.errorTXT}>Ошибка...🤔</Text>
      <Button onPress={() => setUpdatingState(STATE_CALCULATE_LOCATION)} title='Попробовать снова🔃'/>
      </View>
    </View>
    )
  }

  function LoadedView(){
      return (
      <View style = {styles.container}>
        <View style = {styles.infoScreen}>
        <Text style = {styles.textStyle}>Текущая темп.: {currTemp.current === undefined ? 'Ошибка' : currTemp.current + '°C'}</Text>
        <Text style = {styles.textStyle}>Чувствуется как: {feelsLike === undefined ? 'Ошибка' : feelsLike + '°C'}</Text>
        <Text style = {styles.textStyle}>Мин темп.: {minTemp === undefined ? 'Ошибка' : minTemp + '°C'}</Text>
        <Text style = {styles.textStyle}>Макс темп.: {maxTemp === undefined ? 'Ошибка' : maxTemp + '°C'}</Text>
        <Text style = {styles.textStyle}>Давление: {pressure === undefined ? 'Ошибка' : pressure + ' рт.с'}</Text>
        <Text style = {styles.textStyle}>Влажность: {humidity === undefined ? 'Ошибка' : humidity + '%'}</Text>
        <Text style = {styles.textStyle}>На уровне моря: {seaLevel === undefined ? 'Ошибка' : seaLevel}</Text>
        <Text style = {styles.textStyle}>На уровне земли: {groundLevel === undefined ? 'Ошибка' : groundLevel}</Text>
      </View>
        <View style = {styles.buttonStyle}>
          <Button onPress={() => {
            setUpdatingState(STATE_CALCULATE_LOCATION);
            currTemp.current = undefined;
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

export default App;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    flexDirection: 'column'
  },

  awaitLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },

  textStyle: {
    fontSize: 20,
  },

  errorTXT: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  }

})