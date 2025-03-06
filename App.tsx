/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { Text, Button, View } from 'react-native';

function App() {
  const [updatingDone, setUpdatingState] = useState(false);
  const [currTemp, setCurrTemp] = useState(undefined);
  const [feelsLike, setFeelLike] = useState(undefined);
  const [minTemp, setMinTemp] = useState(undefined);
  const [maxTemp, setMaxTemp] = useState(undefined);
  const [presure, setPresure] = useState(undefined);
  const [humidity, setHumidity] = useState(undefined);
  const [seaLevel, setSeaLevel] = useState(undefined);
  const [groundLevel, setGroundLevel] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!updatingDone) {
      fetch('http://api.openweathermap.org/data/2.5/weather?lat=57&lon=53&units=metric&lang=ru&APPID=df970160e8498542cb823c972d5a8b35')
        .then((response) => {
          if (response.ok) {
            response.json()
              .then(data => {
                setCurrTemp(data.main.temp);
                setFeelLike(data.main.feels_like);
                setMinTemp(data.main.temp_min);
                setMaxTemp(data.main.temp_max);
                setSeaLevel(data.main.sea_level);
                setGroundLevel(data.main.grnd_level);
                setUpdatingState(true);
              });
          }
        })
        .catch((error) => {
          setError;
          setUpdatingState(true);
        });
    }
  }, [updatingDone]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {updatingDone ? (
        <>
          {error ? <Text>{error}</Text> : null}
          <Text>Настоящая темп.: {currTemp === undefined ? 'Ошибка' : currTemp}</Text>
          <Text>Чувствуется как: {feelsLike === undefined ? 'Ошибка': feelsLike}</Text>
          <Text>Мин темп.: {minTemp === undefined ? 'Ошибка' : minTemp}</Text>
          <Text>Макс темп.:{maxTemp === undefined ? 'Ошибка' : maxTemp}</Text>
          <Text>На уровене моря: {seaLevel === undefined ? 'Ошибка' : seaLevel}</Text>
          <Text>На Уровене земли {groundLevel === undefined ? 'Ошибка' : groundLevel}</Text>
          <Button
            onPress={() => {
              setUpdatingState(false);
              setCurrTemp(undefined);
              setFeelLike(undefined)
              setError(null);
            }}
            title="Обновить"
          />
        </>
      ) : (
        <Text>Обновление данных...</Text>
      )}
    </View>
  );
}

export default App;