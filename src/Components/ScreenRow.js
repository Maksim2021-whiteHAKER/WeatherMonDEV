/* eslint-disable prettier/prettier */
import React  from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
//import {weatherImages} from '../const/imagesTags';

export default function ScreenRow(props){
    return (
      <View style={styles.paramRow}>
        <View style={styles.paramIcon}>
          <Image style ={styles.iconStyle} source={props.icon}/>
        </View>
        <View style={styles.paramName}>
          <Text style ={styles.textParamStyle}>{props.param}</Text>
        </View>
        <View style={styles.paramValue}>
        <Text style ={styles.textValueStyle}>{props.value}</Text>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({

    paramRow: {
      height: 45,
      flexDirection: 'row',
      //borderColor: 'black',
      //borderWidth: 1,
    },

    paramIcon: {
      flex: 2,
      paddingLeft: 5,
      justifyContent: 'center',
    },

    paramName: {
      flex: 5,
      justifyContent: 'center',
      paddingRight: 5,
      //paddingLeft: 10,
    },

    paramValue: {
      flex: 6,
      justifyContent: 'center',
      paddingRight: 10,
      paddingLeft: 10,
    },

    iconStyle: {
      resizeMode: 'center',
      width: '100%',
    },

    textValueStyle: {
        //fontSize: 16,
        color: 'black',
      },

      textParamStyle: {
        //fontSize: 16,
        color: 'gray',
      },

  });
