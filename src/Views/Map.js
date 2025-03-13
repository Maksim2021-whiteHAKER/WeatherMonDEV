import React, {useState} from "react";
import { Button, View } from "react-native";
import YaMap, {Marker} from "react-native-yamap";

export default function Map({navigation, route}){
    
    const [position, setPosition] = useState(route.params.position);
    return (
        <View style={{flex: 1, paddingBottom: 10, flexDirection: 'column',}}>
            <YaMap
            initialRegion={{
                lat: position.lat,
                lon: position.lon,
                zoom: 10,
                azimuth: 0,
                tilt: 100,
            }}
            style={{flex: 10}}
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
            <View style={{flex: 1, paddingHorizontal: 20, justifyContent: 'flex-end'}}>
                <Button title = "Выбрать" onPress={()=>{
                    navigation.navigate({
                        name: 'Main',
                        params: {position: position}});
                }}/>
            </View>
        </View>
    )
}