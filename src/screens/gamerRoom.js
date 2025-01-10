import { useState } from 'react';
import { StyleSheet, Text, View, Image, Modal, TouchableOpacity,ScrollView } from 'react-native';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pcgamer from '../assets/pc-gamer.png';
import lamp from '../assets/lamp.png';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


import * as Animatable from 'react-native-animatable';

import Header from '../components/Header';

export default function LivingRoom() {



  const [validateData, setValidateData] = useState(true);
  const [devices, setDevices] = useState({fan:'',Bedroom:'',livingRoom:'', name:'',escritorio:'', edicula:'' });
  const [statusReguest, setReguest] = useState('#39d76c');

  
    if(validateData == true){
    async function loadStorgeUserName(){

        const dataDevices = await AsyncStorage.getItem('@smartHome:device')
        const objeto = JSON.parse(dataDevices || '');
        setDevices(objeto)
        
        setValidateData(false)
        }
    loadStorgeUserName()

    }

  

    const command = async (valor) => {
        setReguest('red')
        try {

            const response = await fetch(`http://${valor}`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setReguest('#39d76c')
            
        } catch (error) {
            
        }

    }

  return (
    <View style={styles.container}>
      <Header title='Escritório' status={statusReguest}/>
      <View style={styles.subHeader}>
        <Image source={require('../assets/pc.jpeg')} style={styles.image}></Image>
      </View>
      <View style={styles.containerButton}>
                <View style={styles.titleDevices}>
                    <Text numberOfLines={1} allowFontScaling={false}  style={{ fontSize: 20, fontWeight: 'bold', color: '#868686' }}>Devices</Text>
                </View>
             
                <Animatable.View animation="slideInUp" style={{ flexDirection: 'row'}}>
                    <View style={styles.row}>
                    <Button title='Luz' ico={lamp} width={80} height={80} onPress={() => command(devices.escritorio+"/luz")} />
                    </View>
                    <View style={styles.row}>
                    <Button title='pc' ico={pcgamer} width={80} height={80} onPress={() => command(devices.escritorio+"/pc")} />
                    </View>
                </Animatable.View>
                
                </View>
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: '100%',
    alignItems: 'center',
},
subHeader: {
    width: "100%",
    height: '37%',
    backgroundColor: '#cdcdcd',
    borderTopLeftRadius: 80,

},
image: {
    width: "100%",
    height: '100%',
    borderTopLeftRadius: 80,
    opacity: 0.5
},

titleDevices: {
    top: '-2%',
    left: '-31%',
},
containerButton: {
    top: '-5%',
    position: "relative",
    width: '100%',
    paddingTop: '7%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(243,243,243)'

},
row: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
},

})
