import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StatusBar, StyleSheet, SafeAreaView, Platform, ScrollView, ToastAndroid, Switch, Alert } from "react-native";

import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from "md5";
import Portao from '../assets/gate.png';
import Quarto from '../assets/Bedroom1.png';
import Sala from '../assets/sofa.png';
import Escritorio from '../assets/escritorio.png';
import Cozinha from '../assets/cozinha.png';
import Ventilador from '../assets/fan.png';
import Edicula from '../assets/churrasco.png';
import Som from '../assets/nota-musical.png';
import Computador from '../assets/pc-gamer.png';
import Lustre from '../assets/lustre.png';
import Led from '../assets/led.png';
import Lampada from '../assets/lamp.png';
import Piscina from '../assets/piscina.png';
import Pendente from '../assets/pendente.png';
import Planta from '../assets/planta.png';
import Solar from '../assets/solar.png';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Entypo, MaterialIcons, EvilIcons } from "@expo/vector-icons";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import *as Animatable from 'react-native-animatable';
import Button from "../components/Button";
import * as LocalAuthentication from 'expo-local-authentication';
import ModalGroup from "../components/modalGroup";

const ios = Platform.OS == 'ios';
const topMargin = ios ? 'mt-50' : 'mt-80';

export default function Home() {

    const navigation = useNavigation();

    const [valueGeneration, setGeneration] = useState({ "cumulative": 0, "month": 0, "today": 0 })
    const [device, setDevice] = useState({ fan: '', Bedroom: '', livingRoom: '', name: '', escritorio: '', cozinha: '', edicula: '', host: '', auth: '', foxx: '', sn: '', tarifa: '' });
    const [KWNow, setKWNow] = useState([]);
    const [circularProgress, setCircularProgress] = useState(0);
    const [statusInversor, setStatusInversor] = useState('red');
    const [statusSala, setStatusSala] = useState('red');
    const [statusQuarto, setStatusQuarto] = useState('red');
    const [statusCozinha, setStatusCozinha] = useState('red');
    const [statusEscritorio, setStatusEscritorio] = useState('red');
    const [statusReguest, setReguest] = useState('red');
    const [activeTextLeds, setActiveTextLeds] = useState(false);
    const [activeTextArandela, setActiveTextArandela] = useState(false);
    const [activeTextGaragem, setActiveTextGaragem] = useState(false);
    const [awaitToken, setAwaitToken] = useState(false);
    const [modal, setModal] = useState(false);

    const icons = [
        { name: 'Pendentes', image: Pendente },
        { name: 'Lâmpada', image: Lampada },
        { name: 'Lustre', image: Lustre },
        { name: 'Led', image: Led },
        { name: 'Quarto', image: Quarto },
        { name: 'Sala', image: Sala },
        { name: 'Escritório', image: Escritorio },
        { name: 'Cozinha', image: Cozinha },
        { name: 'Ventilador', image: Ventilador },
        { name: 'Edícula', image: Edicula },
        { name: 'Portão', image: Portao },
        { name: 'Som', image: Som },
        { name: 'Computador', image: Computador },
        { name: 'Piscina', image: Piscina },
        { name: 'Jardim', image: Planta },
    ];


    const url = 'https://www.foxesscloud.com';
    const token = device.foxx;
    const sn = device.sn;
    const parametersGeneration = '/op/v0/device/generation';
    const parametershistory = '/op/v0/device/report/query';
    const parameterReal = '/op/v0/device/real/query';

    useEffect(() => {
        loadStorage();
        loadGroup();
    }, [])

    //executa sempre que voltar pelo metodo goback
    useFocusEffect(
        React.useCallback(() => {
            loadStorage();
        }, [])
    );

    useEffect(() => {
        status();
        setAwaitToken(false);
    }, [device])


    const loadStorage = async () => {
        const dataDevices = await AsyncStorage.getItem('@smartHome:device')
        if (dataDevices != null || '') {
            const objeto = JSON.parse(dataDevices || '');
            setDevice(objeto);
        }

    }

    const status = async () => {

        const dataDevice = [device.livingRoom, device.cozinha, device.Bedroom, device.escritorio];

        for (let i = 0; dataDevice.length > i; i++) {
            verifiqueStatus(dataDevice[i], i);
            console.log(dataDevice[i]);
        }

    }

    const verifiqueStatus = async (value, i) => {
        try {
            const response = await fetch(`http://${value}`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            if (i == 0) {
                setStatusSala('green');
            }
            if (i == 1) {
                setStatusCozinha('green')
            }
            if (i == 2) {
                setStatusQuarto('green');
            }
            if (i == 3) {
                setStatusEscritorio('green');
            }


        } catch (error) {

            if (i == 0) {
                setStatusSala('red');
            }
            if (i == 1) {
                setStatusCozinha('red')
            }
            if (i == 2) {
                setStatusQuarto('red');
            }
            if (i == 3) {
                setStatusEscritorio('red');
            }

        }
    }

    const headers = async = (param) => {
        const timestamp = new Date().getTime();
        console.log(1);
        const signature = [param, token, timestamp].join('\\r\\n');
        const signatureMD5 = md5(signature);
        console.log(timestamp, signatureMD5);
        return {
            'Content-Type': 'application/json',
            'token': token,
            'timestamp': timestamp,
            'signature': signatureMD5,
            'lang': 'en',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
    }

    const generation = async () => {
        console.log(5);
        try {
            const response = await fetch(url + parametersGeneration + '?sn=' + sn, {
                method: 'GET',
                headers: headers(parametersGeneration)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            try {
                if (data.result.today) {
                    setGeneration(data.result);
                    console.log(data.result)
                } else {
                    const dataToday = data.result;
                    dataToday.today = 0;
                    setGeneration(dataToday)
                }

            } catch (error) {
                setStatusInversor('red');
            }


        } catch (error) {
            console.error('There was a problem with the request:', error);
            setStatusInversor('red');
        }

    }

    const KW = async () => {
        console.log(2);
        setCircularProgress(0);
        try {
            const response = await fetch(url + parameterReal, {
                method: 'POST',
                headers: headers(parameterReal),
                body: JSON.stringify({
                    "sn": sn,
                    "variables": ["feedinPower"]
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(3);

            const data = await response.json();
            if (data.errno) {
                ToastAndroid.showWithGravityAndOffset(
                    data.msg,
                    ToastAndroid.LONG,
                    ToastAndroid.CENTER,
                    25,
                    50
                );
            }
            setStatusInversor('green');
            try {
                const numeroFormatado = Math.round(data.result[0].datas[0].value * 100) / 100;
                setKWNow(numeroFormatado);
                setStatusInversor('green');
                setCircularProgress((numeroFormatado / 5.5) * 100);
                generation();
            } catch (error) {
                setStatusInversor('red');
            }

        } catch (error) {
            console.error('There was a problem with the request:', error);
            console.log(4);
            setStatusInversor('red');
        }
    }

    if (device.foxx != '' && awaitToken == false) {
        setAwaitToken(true);
        KW()
    }

    const command = async (valor) => {
        console.log(`http://${valor}`)
        try {

            const response = await fetch(`http://${valor}`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }


        } catch (error) {

        }

        switch (valor) {
            case device.livingRoom + "/rele1":
                setActiveTextLeds(!activeTextLeds)
                break;
            case device.livingRoom + "/?rele4":
                setActiveTextArandela(!activeTextArandela)
                break;
            case device.livingRoom + "?rele3":
                setActiveTextGaragem(!activeTextGaragem)
                break;

        }

    }

    const biometric = async () => {


        const authenticationBiometric = await LocalAuthentication.authenticateAsync({
            promptMessage: "Portão eletrônico",
            cancelLabel: "Cancelar",
            disableDeviceFallback: false,
        });

        if (authenticationBiometric.success) {
            openGate()
        }

    };

    const biometricOnLong = async () => {


        const authenticationBiometric = await LocalAuthentication.authenticateAsync({
            promptMessage: "Acionar Remotamente Portão da Garagem?",
            cancelLabel: "Cancelar",
            disableDeviceFallback: false,
        });

        if (authenticationBiometric.success) {
            remoteDevice("true", "portao", "Acionado Remotamente")
        } else {
            remoteDevice("false", "portao", "Cancelado")
        }

    };


    const openGate = () => {

        command(device.livingRoom + "/relea")

        ToastAndroid.showWithGravityAndOffset(
            "Acionando Portão",
            ToastAndroid.LONG,
            ToastAndroid.CENTER,
            25,
            50
        );

    }

    const formatCurrency = (value) => {
        // Converte o valor para número e verifica se é um número válido
        const floatValue = parseFloat(value);
        if (isNaN(floatValue)) {
            return '';
        }

        // Formata o valor como moeda brasileira
        return floatValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    // Função para verificar se o dispositivo responde com "Tasmota" no cabeçalho
    const fetch = require('node-fetch'); // Certifique-se de ter o node-fetch instalado para fazer as requisições

    // Função para verificar se o dispositivo responde com "Tasmota" no cabeçalho
    async function checkTasmota(ip, foundDevices) {
        try {
            // Tentando fazer a requisição para o IP na porta 80 (http)
            const response = await fetch(`http://${ip}`);

            // Verificando se o cabeçalho contém a palavra "tasmota"
            const serverHeader = response.headers.get('server');
            if (serverHeader && serverHeader.toLowerCase().includes("tasmota")) {
                foundDevices.push(ip); // Adiciona o IP encontrado no array
            }
        } catch (error) {
            // Em caso de erro (como o dispositivo não responder)
            //console.log(`Não foi possível conectar no IP: ${ip}`);
        }
    }

    // Função para iterar sobre a faixa de IPs da rede e verificar
    async function scanNetwork() {
        const networkBase = "192.168.97."; // Base da rede
        const foundDevices = []; // Array para armazenar os dispositivos encontrados
        const promises = [];

        console.log("Buscando...");

        // Verificando IPs de 1 a 254
        for (let i = 1; i <= 254; i++) {
            const ip = `${networkBase}${i}`;
            promises.push(checkTasmota(ip, foundDevices)); // Adiciona a promessa para cada IP
        }

        // Aguarda todas as promessas de verificação
        await Promise.all(promises);

        // Exibe os dispositivos encontrados ao final
        if (foundDevices.length > 0) {
            console.log("\nDispositivos Tasmota encontrados:");
            foundDevices.forEach(ip => console.log(ip));
        } else {
            console.log("\nNenhum dispositivo Tasmota encontrado.");
        }

        console.log("Escaneamento concluído.");
    }

    const navigatioScreen = (value, grupo) => {
        // Navega para a tela 'value' passando 'parametros' como parte dos parâmetros
        navigation.navigate(value, { grupo });
    };

    const [buttonAll, setButtonAll] = useState([]);

    const [buttonsLeft, setButtonsLeft] = useState([]);

    const [buttonsRight, setButtonsRight] = useState([]);

    const loadGroup = async () => {
        try {
            const savedGroups = await AsyncStorage.getItem('Group1');
            if (savedGroups !== null) {
                const data = JSON.parse(savedGroups)
                // Retorna os grupos como um array de objetos
                const middleIndex = Math.ceil(data.length / 2);

                // Divide os botões em dois grupos: 'buttonsLeft' e 'buttonsRight'
                setButtonsLeft(data.slice(0, middleIndex));
                setButtonsRight(data.slice(middleIndex));
                
                return JSON.parse(savedGroups)

            }
            return []; // Retorna um array vazio se não houver grupos salvos
        } catch (error) {
            console.log("Erro ao carregar os botões", error);
            return []; // Retorna um array vazio em caso de erro
        }
    };


    const deleGroup = async (value) => {

        Alert.alert(
            'Excluir Grupo',
            'Deseja mesmo excluir este grupo?',
            [
                { text: 'Cancelar', onPress: () => console.log('Cancelado'), style: 'cancel' },
                { text: 'Confirmar', onPress: () => deleteGroupStorage(value) },
            ],
            { cancelable: false }
        );

    }

    const deleteGroupStorage = async (value) => {

        try {
            // Carrega os grupos existentes
            const existingGroups = (await loadGroup()) || [];

            console.log(existingGroups)

            // Garante que existingGroups é sempre um array
            if (!Array.isArray(existingGroups)) {
                throw new Error('Grupos existentes não são um array válido.');
            }

            // Filtra os grupos, removendo aquele que tem o nome correspondente
            const updatedGroups = existingGroups.filter(group => group.nomeGrupo !== value);

            // Salva os grupos atualizados no AsyncStorage
            await AsyncStorage.setItem('Group1', JSON.stringify(updatedGroups));

            loadGroup();

            console.log(`Grupo "${value}" foi removido com sucesso.`);
            console.log("Grupos atualizados:", updatedGroups);

        } catch (error) {
            console.log("Erro ao excluir o grupo", error);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={'rgb(47,93,180)'} barStyle="auto-content" />
            <ModalGroup status={modal} closed={() => [setModal(false), loadGroup()]} />
            <ScrollView showsVerticalScrollIndicator={false} >

                <View style={styles.header}>
                    <Animatable.Text numberOfLines={1} allowFontScaling={false} animation="slideInLeft" style={styles.title}>Olá {device.name}!</Animatable.Text>
                    <Animatable.Text style={{ marginRight: 15 }} numberOfLines={1} allowFontScaling={false} animation="slideInRight" onPress={() => navigatioScreen('Config')}>
                        <Entypo name={'add-to-list'} size={wp(8)} color={'white'} />
                    </Animatable.Text>
                </View>

                <View style={styles.subHeader}>
                    <Image source={require('../assets/4.png')} className="absolute" style={styles.backgroundImage} />
                    <View style={styles.containerGeneration}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp(1) }}>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(4), color: 'white' }}>Hoje</Text>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(5), fontWeight: 'bold', color: 'white' }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(3), color: 'white' }}>kwh: </Text>{valueGeneration.today.toFixed(2)}</Text>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(3), fontWeight: 'bold', color: 'white' }}>{formatCurrency(valueGeneration.today * device.tarifa)}</Text>

                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp(1), borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'gray' }}>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(4), color: 'white' }}>Mês</Text>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(5), fontWeight: 'bold', color: 'white' }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(3), color: 'white' }}>kwh: </Text>{valueGeneration.month.toFixed(2)}</Text>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(3), fontWeight: 'bold', color: 'white' }}>{formatCurrency(valueGeneration.month * device.tarifa)}</Text>

                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp(1) }}>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(4), color: 'white' }}>Acumulado</Text>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(5), fontWeight: 'bold', color: 'white' }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(3), color: 'white' }}>kwh: </Text>{valueGeneration.cumulative.toFixed(2)}</Text>
                            <Text numberOfLines={1} allowFontScaling={false} style={{ fontSize: wp(3), fontWeight: 'bold', color: 'white' }}>{formatCurrency(valueGeneration.cumulative * device.tarifa)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity activeOpacity={0.6} onPress={() => navigatioScreen('History')} onLongPress={() => KW()} style={styles.overlayContainer}>
                        <AnimatedCircularProgress
                            style={{ position: 'absolute', }}
                            size={wp(35)}
                            width={4}
                            fill={circularProgress}
                            tintColor="white"
                            onAnimationComplete={() => console.log('onAnimationComplete')}
                            backgroundColor="rgba(240,240,240,0.4)"
                            rotation={0}
                        />
                        <Image source={require('../assets/icon_ennergy_bg.png')} style={styles.overlayImage} />
                        <Text numberOfLines={1} allowFontScaling={false} style={styles.overlayText}>kw</Text>
                        <Text numberOfLines={1} allowFontScaling={false} style={[styles.overlayText, { fontWeight: 'bold', fontSize: wp(6) }]}>{KWNow}</Text>
                    </TouchableOpacity >
                </View>

                <View style={{ width: '100%', flexDirection: 'row', top: -wp(5) }}>
                    <View style={styles.row}>
                        {/*<Button title='Sala' status={statusSala} ico={BTLivingRoom} width={wp(20)} height={wp(20)} onPress={() => navigatioScreen('LivingRoom')} onLongPress={() => command(device.livingRoom+"/?rele6")} />
                    <Button title='Edícula' status={statusSala} ico={churrasco} width={wp(20)} height={wp(20)} onPress={() => navigatioScreen('PratyArea')} onLongPress={() => command(device.edicula+"/relee")}/>
                    <Button title='Escritório' status={statusEscritorio} ico={escritorio} width={wp(20)} height={wp(20)} onPress={() => navigatioScreen('GamerRoom')} onLongPress={() => command(device.escritorio+"/pc")}/>
                    </View>*/}
                        {buttonsLeft.map((button, index) => (

                            <Button
                                key={index}
                                title={button.nomeGrupo}
                                status={true}
                                ico={button.ico.image}
                                width={wp(20)}
                                height={wp(20)}
                                onLongPress={() => deleGroup(button.nomeGrupo)}
                                onPress={() => navigatioScreen('Group', button.nomeGrupo)} />


                        ))}
                    </View>
                    <View style={styles.row}>
                        {buttonsRight.map((button, index) => (

                            <Button
                                key={index}
                                title={button.nomeGrupo}
                                status={true}
                                ico={button.ico.image}
                                width={wp(20)}
                                height={wp(20)}
                                onLongPress={() => deleGroup(button.nomeGrupo)}
                                onPress={() => navigatioScreen('Group', button.nomeGrupo)} />

                        ))}
                        {/*<Button title='Cozinha' status={statusCozinha} ico={cozinha} width={wp(20)} height={wp(20)} onLongPress={() => scanNetwork()} onPress={() => command(device.cozinha + "/Controle?Rele1=on")} />
                        <Button title='Quarto' status={statusQuarto} ico={BTBedroom1} width={wp(20)} height={wp(20)} onPress={() => navigatioScreen('Bedroom')} onLongPress={() => command(device.Bedroom + "/rele4")} />
                        <Button title='Placa Solar' status={statusInversor} ico={Pv} width={wp(20)} height={wp(20)} onPress={() => navigatioScreen('History')} />*/}
                    </View>

                </View>
                <View style={{ width: '100%', height: wp(19) }}>

                </View>

            </ScrollView>
            <TouchableOpacity
                onPress={() => setModal(true)}
                style={{ width: wp(15), height: wp(15), backgroundColor: 'rgb(47,93,180)', borderRadius: 100, position: 'absolute', bottom: wp(8), right: wp(8), justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    numberOfLines={1} allowFontScaling={false}
                    style={{ fontSize: wp(8), fontWeight: 'bold', color: 'white' }}
                >
                    +
                </Text>

            </TouchableOpacity>


        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f0f0f0'
    },
    header: {
        width: "100%",
        height: wp(20),
        position: 'absolute',
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,

    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white'

    },
    subHeader: {
        width: wp(100),
        height: wp(80),
        justifyContent: 'center',
        alignItems: 'center'
    },
    backgroundImage: {
        position: 'absolute',
        width: '140%',
        height: '120%',
    },
    overlayContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: wp(12),
        height: wp(12),
        top: wp(41),
        left: wp(70),
    },
    overlayText: {
        fontSize: wp(4),
        color: 'white',
        textAlign: 'center',
    },
    overlayImage: {
        position: 'absolute',
        width: wp(33),
        height: wp(33),
    },
    containerGeneration: {
        position: 'absolute',
        width: wp(30),
        left: wp(13),
        height: wp(57),
        top: wp(18),
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: wp(2),
        zIndex: 100
    },
    row: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        width: "19%",
        height: "56%",
        margin: 5,
        backgroundColor: 'rgb(243,243,243)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 1.22,
        elevation: 5,

    },
    titleButton: {
        color: '#868686',
        fontWeight: 'bold'
    },
    titleButtonActive: {
        color: '#5994ec',
        fontWeight: 'bold'
    },
});