import React, {useState} from "react";
import {TouchableOpacity, StyleSheet, Text, Button, View, Image } from "react-native";
import YaMap, {Marker} from "react-native-yamap";

export default function Map({navigation, route}){
    
    const [position, setPosition] = useState(route.params.position);
    const [isNightMode, setIsNightMode] = useState(false); // переменная состояния
    const [iconName, setIconName] = useState(require("../assets/icons/sun.png"))

    return (
        <View style={{flex: 1, paddingBottom: 10, flexDirection: 'column',}}>
            <YaMap
            showUserPosition={false}
            rotateGesturesEnabled={false}
            nightMode={isNightMode}
            initialRegion={{
                lat: position.lat,
                lon: position.lon,
                zoom: 100,
                azimuth: 0,
                tilt: 100,
            }}
            style={styles.mapStyle}
            onMapLongPress={(e) => {
                console.log(e.nativeEvent);
                setPosition(e.nativeEvent);
            }}>
                <Marker 
                point = {{lat: position.lat, lon: position.lon}}
                source = {require('../assets/icons/position.png')}
                scale = {1}
                visible = {true}
                zIndex = {99}/>
            </YaMap>
            <View style={styles.buttonViewStyle}>
                <TouchableOpacity style={styles.buttonStyle}
                onPress={()=>{
                    navigation.navigate({
                        name: 'Main',
                        params: {position: position}
                    })
                }}>
                    <Text style={{textAlign: 'center'}}>Выбрать</Text>                    
                </TouchableOpacity>
            </View>
            <TouchableOpacity 
                    style={styles.nightModeToggleBtn}
                    onPress={() => {
                        setIsNightMode((prevMode) => !prevMode);
                        setIconName(
                            isNightMode 
                            ? require("../assets/icons/sun.png")
                            : require("../assets/icons/moon.png")
                        );
                    }}
                >
                    <Image source={iconName} style={styles.imageStyle}/>
                </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 10,
        flexDirection: 'column'
    },

    mapStyle: {
        flex: 100
    },

    buttonViewStyle: {
        justifyContent: 'center',
        //alignItems: 'center',
        paddingLeft: '4%',
        height: '10%',
        width: '120%',
        position: 'absolute',
        bottom: 0,
    },

    buttonStyle: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignContent: 'center',
        height: '55%',
        width: '60%',
    },

    imageStyle: {
        width: 64,
        height: 64
    },

    nightModeToggleBtn: {
        position: 'absolute',
        top: 10,                   // начинаем отсчёт сверху
        left: 10,              // центральное положение по ширине
        // borderColor: 'black',
        // borderWidth: 1,
        zIndex: 100,              // обеспечиваем, что кнопка будет сверху всех элементов
    },
})