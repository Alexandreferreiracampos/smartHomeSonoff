import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Modal, TouchableOpacity, ScrollView, ToastAndroid, Alert } from 'react-native';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import led from '../assets/led.png';
import lustre from '../assets/lustre.png';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Slider from '@react-native-community/slider';

import * as Animatable from 'react-native-animatable';

import Header from '../components/Header';
import ModalDevice from '../components/modalDevice';

export default function Group({ route }) {

    const group = route.params; // Obtém o grupo passado

    const [modalVisible, setModalVisible] = useState(false);
    const [valueRequest, setReguest] = useState('#39d76c');

    useEffect(() => {
        loadDevices();
    }, [])

    const command = async (valor) => {

        console.log(valor)

        let url = 'http://' + valor
        let req = new XMLHttpRequest();

        req.onreadystatechange = () => {
            if (req.status == 200 && req.readyState == 4) {
                setReguest('#39d76c')
            } else {
                setReguest('red')
            }
        }

        req.open('GET', url)
        req.send()

    }

    const [buttonAll, setButtonAll] = useState([]);

    const [buttonsLeft, setButtonsLeft] = useState([]);

    const [buttonsRight, setButtonsRight] = useState([]);

    const loadDevices = async () => {
        try {
            const dataDevice = await AsyncStorage.getItem('Device1');
            if (dataDevice !== null) {
                const data = JSON.parse(dataDevice)
                const filterData = data.filter(grupo => grupo.grupo === group.grupo);
                console.log(filterData)

                // Retorna os grupos como um array de objetos
                const middleIndex = Math.ceil(filterData.length / 2);

                // Divide os botões em dois grupos: 'buttonsLeft' e 'buttonsRight'
                setButtonsLeft(filterData.slice(0, middleIndex));
                setButtonsRight(filterData.slice(middleIndex));
                return data;
            }
            return []; // Retorna um array vazio se não houver grupos salvos
        } catch (error) {
            console.log("Erro ao carregar os botões", error);
            return []; // Retorna um array vazio em caso de erro
        }
    };

    const deleDevice = async (value, valueIp) => {

        Alert.alert(
            'Excluir Dispositivo',
            'Deseja mesmo excluir este dispositivo?',
            [
                { text: 'Cancelar', onPress: () => console.log('Cancelado'), style: 'cancel' },
                { text: 'Confirmar', onPress: () => deleteGroupStorage(value, valueIp) },
            ],
            { cancelable: false }
        );

    }

    const deleteGroupStorage = async (value, valueip) => {

        try {
            // Carrega os grupos existentes
            const existingDevice = (await loadDevices()) || [];

            console.log(existingDevice)

            // Garante que existingDevice é sempre um array
            if (!Array.isArray(existingDevice)) {
                throw new Error('Grupos existentes não são um array válido.');
            }

            // Filtra os grupos, removendo aquele que tem o nome correspondente
            const updatedDevice = existingDevice.filter(group => group.ip !== valueip || group.nomeDevice !== value);
            console.log(updatedDevice);

            // Salva os grupos atualizados no AsyncStorage
            await AsyncStorage.setItem('Device1', JSON.stringify(updatedDevice));

            loadDevices();

            //console.log(`Grupo "${value}" foi removido com sucesso.`);
            console.log("Grupos atualizados:", updatedDevice);

        } catch (error) {
            console.log("Erro ao excluir o grupo", error);
        }
    }

    const [brilho, SetBrilho] = useState(0);

    const command1 = (value) => {

        if (value != brilho) {
            SetBrilho(value);
            let url = `http://${value}`
            let req = new XMLHttpRequest();
            req.open('GET', url)
            req.send()
            console.log(url)
        }

    }

    return (
        <View style={styles.container}>
            <Header title={group.grupo} status={valueRequest} statusModal={() => setModalVisible(true)} />
            <ModalDevice status={modalVisible} closed={() => [setModalVisible(false), loadDevices()]} group={group.grupo} />

            <View style={styles.containerButton}>

                <View style={styles.titleDevices}>
                    <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: 20, fontWeight: 'bold', color: '#868686' }}>Devices</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} >

                    <View style={{ width: '100%', flexDirection: 'row' }}>

                        <View style={styles.row}>

                            {buttonsLeft.map((button, index) => (

                                <Button
                                    key={index}
                                    title={button.nomeDevice}
                                    status={true}
                                    ico={button.ico.image}
                                    width={wp(20)}
                                    height={wp(20)}
                                    sliderStatus={button.slider}
                                    ip={button.ip}
                                    onLongPress={() => deleDevice(button.nomeDevice, button.ip)}
                                    onPress={() => command(`${button.ip}/${button.comando}`)} />

                            ))}
                        </View>
                        <View style={styles.row}>
                            {buttonsRight.map((button, index) => (

                                <Button
                                    key={index}
                                    title={button.nomeDevice}
                                    status={true}
                                    ico={button.ico.image}
                                    width={wp(20)}
                                    height={wp(20)}
                                    sliderStatus={button.slider}
                                    ip={button.ip}
                                    onLongPress={() => deleDevice(button.nomeDevice, button.ip)}
                                    onPress={() => command(`${button.ip}/${button.comando}`)} />

                            ))}

                        </View>

                    </View>
                    <View style={{ width: '100%', height: wp(50) }}>

                    </View>

                    <View style={{ width: "100%", height: 29, justifyContent: 'center' }}>
                    
                                        <Slider
                                            minimumValue={0}
                                            maximumValue={10}
                                            minimumTrackTintColor='rgb(47,93,180)'
                                            maximumTrackTintColor='#cdcdcd'
                                            thumbTintColor='rgb(47,93,180)'
                                            //onSlidingStart={RGB1(corRgb)}
                                            onValueChange={(valor) => command1(`192.168.0.100/${valor.toFixed()}`)}
                                            value={brilho}
                                        />
                    
                                    </View>

                </ScrollView>

            </View>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{ width: wp(15), height: wp(15), backgroundColor: 'rgb(47,93,180)', borderRadius: 100, position: 'absolute', bottom: wp(8), right: wp(8), justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    numberOfLines={1} allowFontScaling={false}
                    style={{ fontSize: wp(8), fontWeight: 'bold', color: 'white' }}
                >
                    +
                </Text>

                

            </TouchableOpacity>
                   

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
        left: 25
    },
    containerButton: {
        width: '100%',
        backgroundColor: 'rgb(243,243,243)'
    },
    row: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
    },

})
