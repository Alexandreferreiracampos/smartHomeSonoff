import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, SafeAreaView, Text, ScrollView, ToastAndroid, TextInput, StyleSheet, Image } from 'react-native';
import { Entypo, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange } from 'react-native-responsive-screen';

export default function Config() {

  const [valueFan, setValueFan] = useState('')
  const [valueBedroom, setValueBedroom] = useState('')
  const [valuelivingRoom, setValueLivingRoom] = useState('')
  const [valueName, setValueName] = useState('')
  const [valueEscritorio, setValueEscritorio] = useState('')
  const [valueCozinha, setValueCozinha] = useState('')
  const [valueEdicula, setValueEdicula] = useState('')
  const [valueHost, setHost] = useState('')
  const [valueAuth, setAuth] = useState('')
  const [valueFoxesscloud, setFoxesscloud] = useState('')
  const [valueSN, setSN] = useState('')
  const [valueTarifa, setTarifa] = useState('')
  const [nameGroup, setNameGroup] = useState('')


  const [value, setValue] = useState({ fan: '', Bedroom: '', livingRoom: '', name: '', escritorio: '', cozinha: '', edicula: '', host: '', auth: '', foxx: '', sn: '', tarifa: '' })


  useEffect(() => {
    loadStorage();
  }, [])


  const loadStorage = async () => {
    const dataDevices = await AsyncStorage.getItem('@smartHome:device')
    if (dataDevices != null || '') {
      const objeto = JSON.parse(dataDevices || '');
      setValue(objeto);
    }

  }

  const salvarDevices = () => {
    if (valueFan != '' || valueBedroom != '' || valuelivingRoom != "" || valueName != '' || valueAuth != '' || valueHost != '' || valueEscritorio != '' || valueCozinha != '' || valueEdicula != '' || valueFoxesscloud != '' || valueSN != '' || valueTarifa != '') {


      const data = {
        fan: valueFan || value.fan,
        Bedroom: valueBedroom || value.Bedroom,
        livingRoom: valuelivingRoom || value.livingRoom,
        name: valueName || value.name,
        escritorio: valueEscritorio || value.escritorio,
        cozinha: valueCozinha || value.cozinha,
        edicula: valueEdicula || value.edicula,
        host: valueHost || value.host,
        auth: valueAuth || value.auth,
        foxx: valueFoxesscloud || value.foxx,
        sn: valueSN || value.sn,
        tarifa: valueTarifa || value.tarifa
      }

      storeData(data)
      ToastAndroid.showWithGravityAndOffset(
        "Salvo os novos dispositivos",
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
        25,
        50
      );

    } 
    else {
      ToastAndroid.showWithGravityAndOffset(
        "Por favor infomar ao menos um Device ou grupo.",
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
        25,
        50
      );
    }

  }

  const storeData = async (value) => {
    try {

      const jsonData = JSON.stringify(value)
      await AsyncStorage.setItem('@smartHome:device', jsonData)

    } catch (e) {
      ToastAndroid.showWithGravityAndOffset(
        `Não foi possivel salvar os dados`,
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
        25, 50)
    }
  }

  
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/walpaperHeader.jpg')} style={{ flex: 1, width: '100%', height: '100%', position: 'absolute', opacity: 0.8 }} />
      <View style={{ width: '100%', height: wp(20), justifyContent: 'space-between', alignItems: 'center', padding: wp(4), flexDirection: 'row' }}>
        <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(5), fontWeight: 'bold', color: 'white' }}>
          Configurar Dispositivos
        </Text>
        <TouchableOpacity onPress={() => salvarDevices()}>
          <FontAwesome name="floppy-o" size={wp(8)} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: wp(3) }}>
        <View style={{ width: '100%' }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontWeight: 'bold', color: 'white' }}>Nome de Uusário</Text></View>
        <TextInput
          numberOfLines={1}
          allowFontScaling={false}
          style={styles.inputText}
          placeholder={value.name || 'Nome de Uusário'}
          onChangeText={setValueName}

        />

        <View style={{ width: '100%', paddingLeft: 10 }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontWeight: 'bold', color: 'white' }}>Foxess Token</Text></View>
        <TextInput
          numberOfLines={1} allowFontScaling={false}
          style={styles.inputText}
          placeholder={value.foxx || 'Token Foxesscloud'}
          onChangeText={setFoxesscloud}

        />
        <View style={{ width: '100%', paddingLeft: 10 }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontWeight: 'bold', color: 'white' }}>Serial Inversor</Text></View>
        <TextInput
          numberOfLines={1} allowFontScaling={false}
          style={styles.inputText}
          placeholder={value.sn || 'SN Inversor'}
          onChangeText={setSN}

        />
        <View style={{ width: '100%', paddingLeft: 10 }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontWeight: 'bold', color: 'white' }}>Tarifa de Alimentação</Text></View>
        <TextInput
          numberOfLines={1} allowFontScaling={false}
          style={styles.inputText}
          keyboardType="numeric"
          placeholder={value.tarifa || 'Tarifa de alimentação'}
          onChangeText={setTarifa}

        />
      </ScrollView>

    </SafeAreaView>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0'
  },
  inputText: {

    width: '100%',
    height: wp(15),
    backgroundColor: 'white',
    borderRadius: 8,
    paddingLeft: 8,
    marginBottom: wp(5),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 1.22,
    elevation: 2,

  },
  buttonSalvar: {
    marginTop: 15,
    width: "40%",
    height: "13%",
    backgroundColor: '#39d76c',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 1.22,
    elevation: 5,

  }
})