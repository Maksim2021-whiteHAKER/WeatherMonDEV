/* eslint-disable prettier/prettier */
import React  from 'react';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';


  export function LoadingView() {
    return (
      <View  style={{flex: 1}}>

        <View style={{flex: 2, alignContent:'center', alignItems:'center', alignSelf:'flex-start'}}>
        <SkeletonPlaceholder borderRadius={15}>
          <SkeletonPlaceholder.Item flexDirection="row" alignItems='center' height ="100%">
            <SkeletonPlaceholder.Item width="10%" height="40%" borderRadius={30} marginLeft="9%"/>
            <SkeletonPlaceholder.Item width="55%" height="40%" marginLeft="2%"/>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
        </View>

        <View style={{flex: 10, alignContent:'center',  alignSelf:'center'}}>
         <SkeletonPlaceholder borderRadius={15}>
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" height ="100%">
            <SkeletonPlaceholder.Item alignItems='flex-start' width="46%" height="100%" margin="2%">
              <SkeletonPlaceholder.Item width="90%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="70%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="70%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="60%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="40%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="60%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="50%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="55%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="40%" height="9%" margin="2%"/>
            </SkeletonPlaceholder.Item>
              <SkeletonPlaceholder.Item alignItems='flex-start' width="46%" height="100%" margin="2%">
              <SkeletonPlaceholder.Item width="60%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="30%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="30%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="25%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="27%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="25%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="65%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="40%" height="9%" margin="2%"/>
              <SkeletonPlaceholder.Item width="70%" height="9%" margin="2%"/>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
        </View>

        <View style={{flex: 1, alignContent:'center', width: "100%"}}>
          <SkeletonPlaceholder borderRadius={15}>
            <SkeletonPlaceholder.Item flexDirection="row" width="96%" height="70%" margin="2%"/>
        </SkeletonPlaceholder>
        </View>
      </View>
    );
  }

  export function CalculateLocation() {
    return (
      <View
      style={styles.awaitLoading}>
      <ActivityIndicator size="large" />
      <Text>Определение вашего местоположения...</Text>
    </View>
    );
  }


  export function LoadingFromStorageView(){
    return (
      <View
        style={styles.awaitLoading}>
        <ActivityIndicator size="large" />
      <Text>Загрузка...</Text>
    </View>
    );
  }

  const styles = StyleSheet.create({
    awaitLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },

  });
