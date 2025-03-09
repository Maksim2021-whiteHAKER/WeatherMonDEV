import React from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";

export  function LoadingView(){
    return (
      <View style = {styles.awaitLoading}>
        <ActivityIndicator size={"large"}/>
        <Text>Обновление...⏳</Text>
      </View>
    )
  }

export  function calculateLocation(){
    return (
    <View style = {styles.awaitLoading}>
      <ActivityIndicator size={"large"}/>
      <Text>Определение вашего местоположения😁</Text>
    </View>
    )
  }

export  function errorView(){
    return (
    <View style = {styles.container}>
      <View style = {styles.awaitLoading}>
        <ActivityIndicator size={"large"}/>
      <Text style = {styles.errorTXT}>Ошибка...🤔</Text>
      </View>
    </View>
    )
  }

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

    errorTXT: {
      color: 'red',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20
    }
  })
