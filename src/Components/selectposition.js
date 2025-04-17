import React from "react";
import { StyleSheet, Text, Button, View, Switch, TouchableOpacity } from "react-native";

export default function SelectPositionBar({navigation, position, useCurrentPos, setCurrentPosHandler, getLocation, onMyLocationPress}){

    const styles = StyleSheet.create({

        settingsBar: {
            flex: 1,
            flexDirection:'row',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'space-between',
        },
    
        myPosSwitchText: {
            fontSize: 12
        },
    
        myPositionView: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
    
        myPositionBtn: {
            borderColor: 'gray',
            bottom: 20,
            borderWidth: 2,
            borderRadius: 20,
            backgroundColor: useCurrentPos ? '#4682b4' : 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: '95%',
            height: '43%',
        },
    
        myPositionBtnText: {
            color: useCurrentPos ? 'white' : 'black',
        },
    
        mapView: {
            flex: 1,           
            alignItems: 'center',
            justifyContent: 'center',
        },
    
        mapBtn: {
            bottom: 20,
            borderColor: 'gray',
            borderWidth: 2,
            borderRadius: 20,
            backgroundColor: useCurrentPos ? '#4682b4' : 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: '95%',
            height: '43%',
        },
    
        mapBtnText: {
            color: useCurrentPos ? 'white' : 'black',
        }
    })

    return (
        <View style={styles.settingsBar}>
            <View style={styles.myPositionView}>
                <TouchableOpacity style={styles.myPositionBtn}
                    onPress={onMyLocationPress}>
                    <Text style={styles.myPositionBtnText}>Моё местоположение</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.mapView}>
                <TouchableOpacity style={styles.mapBtn}
                onPress={()=>{
                    setCurrentPosHandler(false);
                    navigation.navigate('Map', {position: position})
                }}>
                    <Text style={styles.mapBtnText}>Место на карте</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
