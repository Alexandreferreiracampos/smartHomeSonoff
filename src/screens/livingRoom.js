import { useState } from 'react';
import { StyleSheet, Text, View, Image, Modal, TouchableOpacity,ScrollView, ToastAndroid } from 'react-native';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import led from '../assets/led.png';
import lustre from '../assets/lustre.png';
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
        console.log(objeto);
        
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
      <Header title='Sala' status={statusReguest} />
      <View style={styles.subHeader}>
        <Image source={require('../assets/Living-Room.jpg')} style={styles.image}></Image>
      </View>
      <View style={styles.containerButton}>
                <View style={styles.titleDevices}>
                    <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: 20, fontWeight: 'bold', color: '#868686' }}>Devices</Text>
                </View>
             
                <Animatable.View animation="slideInUp" style={{ flexDirection: 'row', width:'100%'}}>
                <View style={styles.row}>
                    <Button title='Lustre' ico={lustre} width={wp(20)} height={wp(20)} onPress={() => command(devices.livingRoom+"/?rele6")} />
                </View>
                <View style={styles.row}>   
                    <Button title='Sanca' ico={led} width={wp(20)} height={wp(20)} onPress={() => command(devices.livingRoom+"/?rele5")} />
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
    alignItems: 'center'
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
