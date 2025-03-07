/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Button, View, FetchResult } from 'react-native';

function App() {
  const [updatingDone, setUpdatingState] = useState(false);
  const [currTemp, setCurrTemp] = useState(undefined);
  const [feelsLike, setFeelLike] = useState(undefined);
  const [minTemp, setMinTemp] = useState(undefined);
  const [maxTemp, setMaxTemp] = useState(undefined);
  const [pressure, setPressure] = useState(undefined);
  const [humidity, setHumidity] = useState(undefined);
  const [seaLevel, setSeaLevel] = useState(undefined);
  const [groundLevel, setGroundLevel] = useState(undefined);
  const [error, setError] = useState(null);

  interface FetchOptions extends RequestInit{
    timeout?: number;
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

  useEffect(() => {
    fetchWithTimeout('http://api.openweathermap.org/data/2.5/weather?lat=57&lon=53&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35')
    .then((response) => {
      if (response.ok){
        response.json()
        .then(data=>{
          setCurrTemp(data.main.temp);
          setFeelLike(data.main.feels_like);
          setMinTemp(data.main.temp_min);
          setMaxTemp(data.main.temp_max);
          setPressure(data.main.pressure);
          setHumidity(data.main.humidity);
          setSeaLevel(data.main.sea_level);
          setGroundLevel(data.main.grnd_level);
          setUpdatingState(true);
        })
      }
    })
    .catch(
      (error) => setUpdatingState(true)
    );
  }, [updatingDone]);

  function LoadingView(){
    return (
      <View style = {styles.awaitLoading}>
        <Text>Обновление...</Text>
      </View>
    )
  }

  function LoadedView(){

    return (
      <View style = {styles.container}>
        {error ? (
          <Text style = {styles.errorTXT}>(error)</Text>
        ):(
        <View style = {styles.infoScreen}>
        <Text style = {styles.textStyle}>Текущая темп.: {currTemp === undefined ? 'Ошибка' : currTemp + '°C'}</Text>
        <Text style = {styles.textStyle}>Чувствуется как: {feelsLike === undefined ? 'Ошибка' : feelsLike + '°C'}</Text>
        <Text style = {styles.textStyle}>Мин темп.: {minTemp === undefined ? 'Ошибка' : minTemp + '°C'}</Text>
        <Text style = {styles.textStyle}>Макс темп.: {maxTemp === undefined ? 'Ошибка' : maxTemp + '°C'}</Text>
        <Text style = {styles.textStyle}>Давление(рт.с): {pressure === undefined ? 'Ошибка' : pressure + ' hPa'}</Text>
        <Text style = {styles.textStyle}>Влажность: {humidity === undefined ? 'Ошибка' : humidity + '%'}</Text>
        <Text style = {styles.textStyle}>На уровне моря: {seaLevel === undefined ? 'Ошибка' : seaLevel}</Text>
        <Text style = {styles.textStyle}>На уровне земли: {groundLevel === undefined ? 'Ошибка' : groundLevel}</Text>
        </View>)}
        <View style = {styles.buttonStyle}>
          <Button onPress={() => {
            setUpdatingState(false);
          }}
          title='Обновить'></Button>
        </View>
      </View>
    )
  };

  if (!updatingDone){
    return LoadingView();
  } 
  else {
    return LoadedView();
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

  buttonStyle: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  textStyle: {
    fontSize: 20,
  },

  errorTXT: {
    color: '0xff0000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  }

})