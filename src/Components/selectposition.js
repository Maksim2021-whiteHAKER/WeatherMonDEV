import React from "react";
import { StyleSheet, Text, Button, View, Switch } from "react-native";

export default function SelectPositionBar({navigation, position, useCurrentPos, setCurrentPosHandler}){

    return (
        <View style={styles.settingsBar}>
            <View style={{flex: 25, flexDirection: 'row', alignItems: 'center'}}>
                <Switch trackColor={{false: '#767577', true: '#81b0ff'}}
                onValueChange={() => {
                    setCurrentPosHandler(previousState => !previousState);
                }}
                value = {useCurrentPos}/>
                <Text style={styles.myPosSwitchText}>Использовать мою позицию</Text>
            </View>
            <View style={{flex: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                {!useCurrentPos && <Button onPress={()=>{
                    navigation.navigate('Map', {position: position});
                }} title="Карта"/>
            }
            </View>
        </View>
    );
}

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
    }
})