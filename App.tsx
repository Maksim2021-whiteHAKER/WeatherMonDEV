import React, {useEffect} from "react";
import {YaMap} from "react-native-yamap";
import Navigate from "./src/Components/navigate";

// baddd321-f078-4366-ac14-164644cbeb95


function App() {
  useEffect(()=>{
    YaMap.init('964dddde-f670-4a63-a4ea-d31f75050a0d')
  })

  return (<Navigate/>)
}
export default App;