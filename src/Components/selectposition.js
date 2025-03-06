/* eslint-disable prettier/prettier */
import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';


export default function SelectPositionBar({navigation, position, useCurrentPos, setCurrentPosHandler}){

  const styles = StyleSheet.create({

    settingsBar: {
        flex: 1,
        flexDirection:'row',
      },

      myPositionView: {

        flex:1,
        //flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
      },

      myPositionButton: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: useCurrentPos ? '#4682B4' : 'white',
        alignItems: 'center',
        justifyContent: 'center',
        width: '95%',
        height: '70%',
      },

      myPositionButtonText:{
        //fontSize: 12,
        color: useCurrentPos ? 'white' : 'black',
      },

      mapView: {
        flex:1,
        //flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
      },

      mapButton: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: !useCurrentPos ? '#4682B4' : 'white',
        alignItems: 'center',
        justifyContent: 'center',
        width: '95%',
        height: '70%',
      },

      mapButtonText:{
        //fontSize: 12,
        color: !useCurrentPos ? 'white' : 'black',
      },
  });

  return (
    <View style={styles.settingsBar}>
      <View style={styles.myPositionView}>
        <TouchableOpacity
          style={styles.myPositionButton}
          onPress={()=>{
            setCurrentPosHandler(true);
          }}
        >
          <Text style = {styles.myPositionButtonText}>Мое местоположение</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapView}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={()=>{
            setCurrentPosHandler(false);
            navigation.navigate('Map', {position: position});
          }}
        >
          <Text style = {styles.mapButtonText}>Место на карте</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

