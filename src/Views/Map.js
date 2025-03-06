/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {TouchableOpacity, StyleSheet, View, Text, useWindowDimensions} from 'react-native';
import { screensEnabled } from 'react-native-screens';
import YaMap, {Marker} from 'react-native-yamap';

export default function Map({navigation, route}) {
  const [position, setPosition] = useState(route.params.position);
  const screen = useWindowDimensions();
  return (
    <View style={styles.container}>
        <YaMap
        initialRegion={{
            lat: position.lat,
            lon: position.lon,
            zoom: 10,
            azimuth: 0,
            tilt: 100,
        }}
        style={styles.mapStyle}
        onMapLongPress={(e)=>{
            console.log(e.nativeEvent);
            setPosition(e.nativeEvent);
        }}
        >
        <Marker
            point = {{lat: position.lat, lon: position.lon}}
            source = {require('../assets/icons/position.png')}
            scale = {1}
            visible = {true}
            zindex = {99}
        />
        </YaMap>
        <View style={styles.buttonViewStyle}>
            <TouchableOpacity
                style = {[styles.buttonStyle, {height: screen.width > screen.height ? '80%' : '40%'}]}
                onPress={()=>{
                    navigation.navigate({
                    name: 'Main',
                    params: {position: position}});
                }}
            >
            <Text>Выбрать</Text>
            </TouchableOpacity>
        </View>
    </View>

  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom : 10,
        flexDirection: 'column',
    },

    mapStyle: {
        flex: 100,
    },

    buttonViewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '15%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },

    buttonStyle: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        //height: '55%',
        width: '60%',
    },

});
