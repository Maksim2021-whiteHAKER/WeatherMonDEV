import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, PermissionsAndroid, TouchableOpacity, Image, ViewComponent} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import ScreenRow from '../Components/ScreenRow';
import { LoadingFromStorageView, LoadingView, CalculateLocation } from './MainScreenStates';
import { storage } from '../store/storage';
import SelectPositionBar from '../Components/selectposition';
import { weatherImages } from '../const/imagesTags';

// Состояния
export const STATE_LOADING_FROM_STORAGE = 0;
export const STATE_CALCULATE_LOCATION   = 1; // Вычисление местоположения
export const STATE_LOADING_DATA         = 2; // Загрузка данных
export const STATE_DATA_LOADED          = 3; // Данные загружены
export const STATE_DATA_ERROR           = 4; // Ошибка данных
export const STATE_DATA_EMPTY           = 5; // Данные пусты

function MainScreen({navigation, route}) {

  const errors = useRef(
    {
      locationError: {
        active: false,
        message: '',
      },
      networkError: {
        active: false,
        message: 'Ошибка сети',
        responseCode: 0,
      },
    }
  );

  const [useCurrentPosition, setUseCurrentPosition] = useState(true);

  const [dataState, setUpdatingState] = useState({
    state: STATE_LOADING_FROM_STORAGE,
    currWeather: null,
    position: {}
  });

  const receivedPosition = route.params?.position || {};

  useEffect(() => {
    if (receivedPosition.lat && receivedPosition.lon){
      setUpdatingState((prevState)=>({
        ...prevState,
        position: receivedPosition
      }))      
    }
  }, [receivedPosition])

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

  async function myLocation() {
    setUseCurrentPosition(true);
    const res = await requestLocationPermission();
    console.log('Результат запроса разрешения:', res);

    if (res) {
      try {
        const position = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });

        const { latitude, longitude } = position;
        console.log('Получены координаты через геолокацию:', { lat: latitude, lon: longitude });

        storage.save({
          key: 'default',
          id: '1',
          data: { lat: latitude, lon: longitude },
        });

        setUpdatingState({
          ...dataState,
          state: STATE_LOADING_DATA,
          position: { lat: latitude, lon: longitude },
        });
      } catch (error) {
        console.error('Ошибка получения местоположения:', error.message);
        errors.current.locationError.active = true;
        errors.current.locationError.message = error.message;
        setUpdatingState({ ...dataState, state: STATE_DATA_ERROR });
      }
    } else {
      console.warn('Разрешение на геолокацию не получено');
    }
  }

  async function getLocation(){
      if (useCurrentPosition) {
        const res = await requestLocationPermission()
        console.log('Результат', res);
        if (res) {
          if (receivedPosition.lat && receivedPosition.lon){
            console.log('используется receivedPosition', receivedPosition);
            setUpdatingState({ 
              ...dataState, 
              state: STATE_LOADING_DATA,
              position: {lat: receivedPosition.lat, lon: receivedPosition.lon},
            });
          } else {
            console.log('receivedPosition Пуст, используется геолокация...')
            Geolocation.getCurrentPosition(
              (position) => {
                const {latitude, longitude} = position.coords;
                console.log('Местоположение обновлено геолокацией: Долгота-Широта', {lon: longitude, lat: latitude});
                setUpdatingState({
                  ...dataState, 
                  state: STATE_LOADING_DATA, 
                  position: {lat: latitude, lon: longitude}
              });
            },        
            (error) => {
              console.log("Код: ошибки и сообщение:", error.code, error.message)
              errors.current.locationError.active = true;
              errors.current.locationError.message = error.message
              setUpdatingState({...dataState, state: STATE_DATA_ERROR})
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        }
      } else {
        setUpdatingState({...dataState, state: STATE_LOADING_DATA});
      }
    }
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

  async function loadingFromStorage() {
    if (!useCurrentPosition) {
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
    //console.log("Позиция(pos): ", pos)
    errors.current.networkError.active = false;
    try {
      let response = await fetchWithTimeout(`https://api.openweathermap.org/data/2.5/weather?lat=${pos?.lat}&lon=${pos?.lon}&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35`, {timeout: 10000})
      errors.current.networkError.responseCode = response.status;
      if (response.ok){
        let data = await response.json();
        console.log('Данные: ',data)
        setUpdatingState({...dataState, state: STATE_DATA_LOADED, currWeather: data})
      } else {
        errors.current.networkError.active = true;
        errors.current.networkError.message = 'Invalid server response';
        setUpdatingState({...dataState, state: STATE_DATA_ERROR, currWeather: null})
      }
    } catch (error) {
      errors.current.networkError.active = true;
      errors.current.networkError.message = error.message;
      setUpdatingState({...dataState, state: STATE_DATA_ERROR, currWeather: null})
    }       
  }

  useEffect(()=>{
    if (route.params?.position !== undefined){
      // Записать новые координаты в хранилище     

      const storageKey = useCurrentPosition ? 'default' : 'mapPosition';

      storage.save({
        key: storageKey,
        id:  '1',
        data: route.params?.position,
      })
      setUpdatingState({...dataState, state: STATE_LOADING_FROM_STORAGE})
      //route.params.position = undefined;
    }
  }, [route.params?.position]);

  useEffect(() => {
    if (dataState.state === STATE_LOADING_FROM_STORAGE){
      loadingFromStorage();
    } else if (dataState.state === STATE_CALCULATE_LOCATION){
      getLocation();
    } else if (dataState.state === STATE_LOADING_DATA){
      loadingData(dataState.position);
    }
  }, [dataState]);

  function errorView() {
    return (
      <View style={styles.infoScreen}>
        <Image
          style={styles.errorImageStyle}
          source={require('../assets/icons/error.png')}
        />
        <Text>Ошибка...🤔</Text>
        {errors?.current?.locationError?.active && (
          <Text>
            Ваше местоположение не определено.{'\n'}
            Возможно отключена геолокация.{'\n'}
            Исправьте это и повторите попытку.
          </Text>
        )}
        {errors?.current?.networkError?.active && (
          <Text>
            Ошибка сети: {errors.current.networkError.message}
            {errors.current.networkError.responseCode > 299
              ? `\nКод ответа: ${errors.current.networkError.responseCode}`
              : ''}
          </Text>
        )}
      </View>
    );
  }

  function LoadedView() {
    let currWeather = dataState.currWeather; 
    return (
      <View style={styles.container}>
        <SelectPositionBar
          navigation={navigation}
          position={dataState.position}
          useCurrentPos={useCurrentPosition}
          setCurrentPosHandler={setUseCurrentPosition}
          onMyLocationPress={myLocation}
        />
        {
          dataState.state === STATE_DATA_EMPTY ? 
          <View style={styles.infoScreen}>
            <Text style={styles.textValueStyle}>
              Позиция: не определена. Используйте своё местоположение или выберите точку на карте😊
            </Text>
          </View>
          :
          (dataState.state === STATE_DATA_ERROR) ?
          errorView()
          :
          <View style={styles.container_weather}>
            <View style={styles.infoScreen}>
              <ScreenRow param={'Долгота'} value={currWeather.coord.lon} icon={weatherImages.lon}/>
              <ScreenRow param={'Широта'} value={currWeather.coord.lat} icon={weatherImages.lat}/>
              <ScreenRow param={'Местоположение:'} value={currWeather.name} icon={weatherImages.position} />
              <ScreenRow param={'Температура'} value={currWeather.main.temp + '°C'} icon={weatherImages.temperature} />
              <ScreenRow param={'По ощущению'} value={currWeather.main.feels_like + '°C'} icon={weatherImages.sens} />
              <ScreenRow param={'Влажность:'} value={currWeather.main.humidity + '%'} icon={weatherImages.humidity} />
              <ScreenRow param={'Небо:'} value={currWeather.weather[0].description} icon={weatherImages.sky}/>
              <ScreenRow param={'Облачность:'} value={currWeather.clouds.all + '%'} icon={weatherImages.clouds}/>
              <ScreenRow param={'Давление:'} value={currWeather.main.pressure * 0.75 + 'мм. рт.с'} icon={weatherImages.pressure}/>
              <ScreenRow param={'Видимость:'} value={currWeather.visibility + 'м.'} icon={weatherImages.visibility}/>
              <ScreenRow param={'Ветер:'} value={currWeather.wind.speed + 'м/сек - ' + windAngleToDirection(currWeather.wind.deg)} icon={weatherImages.wind}/>
            </View>
          </View>
        }
        <View style={styles.btnView}>
          <TouchableOpacity style={styles.buttonStyle} onPress={() => {
            setUpdatingState({ ...dataState, state: STATE_LOADING_FROM_STORAGE });
          }}>
            <Text style={{fontSize: 30}}>Обновить🔃</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  switch (dataState.state)
  {
    case STATE_LOADING_FROM_STORAGE:
      console.log('Состояние: определения местонахождения');
      return <LoadingFromStorageView/>;      
    case STATE_CALCULATE_LOCATION:
      console.log('Состояние: загрузка данных')
      return <CalculateLocation/>;
    case STATE_LOADING_DATA:
      console.log('Состояние: данные загружены')
      return <LoadingView/>;
    case STATE_DATA_LOADED:
    case STATE_DATA_EMPTY:
    case STATE_DATA_ERROR:
      return LoadedView();
    default:
        return <Text>Неизвестное состояние</Text>
  }
}

export default MainScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,  
    flexDirection: 'column',
  //  borderColor: 'black',
  //  borderWidth: 2,
  },

  container_weather: {
    bottom: 10,
    flex: 2,  
    flexDirection: 'column',
    //borderColor: 'black',
    //borderWidth: 2,
    paddingTop: '-15%',
    paddingLeft: '10%',
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
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    top: 10,
    backgroundColor: '#0f8a00b',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
    height: '60%',
  },

  errorImageStyle: {
    resizeMode: 'center',
    width: '50%',
    height: '50%', 
  },
 
})