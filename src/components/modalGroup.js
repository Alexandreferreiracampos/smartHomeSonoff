import { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Modal, ScrollView, TextInput, FlatList, Image, Alert } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
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



export default function ModalGroup({ status, onDayPress, onMonthChange, closed, ...rest }) {

    const [valueName, setValueName] = useState('');
    const [valueIP, setValueIP] = useState('');
    const [valueComando, setValueComando] = useState('');
    const [buttonAll, setButtonAll] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(Lampada);

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


    const handleSelectIcon = (icon) => {
        setSelectedIcon(icon); // Atualiza o ícone selecionado
        console.log(icon)
        setModalVisible(false); // Fecha o modal
    };


    const saveGroup = async (newGroup) => {
        if(valueName != '' && selectedIcon != ''){
            setValueName('')
            setSelectedIcon('')
            try {
                // Carrega os grupos existentes ou inicializa como um array vazio
                const existingGroups = (await loadGroup()) || [];
        
                // Garante que existingGroups é sempre um array
                if (!Array.isArray(existingGroups)) {
                    throw new Error('Grupos existentes não são um array válido.');
                }
        
                // Adiciona o novo grupo à lista
                const updatedGroups = [...existingGroups, newGroup];
        
                // Salva os grupos atualizados no AsyncStorage
                await AsyncStorage.setItem('Group1', JSON.stringify(updatedGroups));
        
                console.log("Grupos salvos:", updatedGroups);
                closed();
        
            } catch (error) {
                console.log("Erro ao salvar os botões", error);
            }
        }else{
            Alert.alert('Preencha todos os campos para salvar o Grupo.')
        }
       
    };
    
    const loadGroup = async () => {
        try {
            const savedGroups = await AsyncStorage.getItem('Group1');
            if (savedGroups !== null) {
                // Retorna os grupos como um array de objetos
                
                return JSON.parse(savedGroups);
            }
            return []; // Retorna um array vazio se não houver grupos salvos
        } catch (error) {
            console.log("Erro ao carregar os botões", error);
            return []; // Retorna um array vazio em caso de erro
        }
    };
    

    return (
        <Modal
            animationType='slide'
            transparent={true}
            statusBarTranslucent={true}
            visible={status}

        >
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Escolha um Ícone</Text>
                        <FlatList
                            data={icons}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.iconItem}
                                    onPress={() => handleSelectIcon(item)}
                                >
                                    <Image
                                        source={item.image}
                                        style={{ width: 40, height: 40, marginRight: 10 }}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.iconText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <View activeOpacity={1} style={styles.outerView}>



                <View style={{ width: '90%', height: wp(100), margin: 10, backgroundColor: 'white', borderRadius: 10 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', width: "100%", padding: 20 }}>
                        <Text
                            numberOfLines={1}
                            allowFontScaling={false}
                            style={{ fontWeight: 'bold', fontSize: wp(6), color: 'gray' }}
                        >Novo Grupo
                        </Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: wp(3) }}>
                        <View style={{ width: '100%', paddingBottom: 2 }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontWeight: 'bold', color: 'grey' }}>Nome do Grupo</Text></View>
                        <TextInput
                            numberOfLines={1}
                            allowFontScaling={false}
                            style={styles.inputText}
                            placeholder={'Nome do Grupo'}
                            onChangeText={setValueName}

                        />

                        <View style={{ width: '100%', paddingBottom: 2 }}><Text numberOfLines={1} allowFontScaling={false} style={{ fontWeight: 'bold', color: 'grey' }}>Icone do Grupo</Text></View>
                        <TouchableOpacity
                            style={[styles.inputText, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: 10 }]}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text numberOfLines={1} allowFontScaling={false} style={{ color: 'rgb(12, 116, 235)' }}  >Ecolher Icone</Text>
                            <Image source={selectedIcon.image} style={{ width: 29, height: 29 }} />
                        </TouchableOpacity>

                        <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', paddingLeft:50, paddingRight:50}}>

                            <TouchableOpacity onPress={() => saveGroup({nomeGrupo:valueName, ico:selectedIcon})} style={styles.button}>
                                <Text
                                    numberOfLines={1}
                                    allowFontScaling={false}
                                    style={{ color: 'white' }}
                                >Adicionar</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => closed()} style={styles.button}>
                                <Text
                                    style={{ color: 'white' }}
                                    numberOfLines={1}
                                    allowFontScaling={false}
                                >Fechar</Text></TouchableOpacity>

                        </View>



                    </ScrollView>

                </View>



            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    outerView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    dark: {
        shadowColor: 'blak',
        shadowRadius: 4,
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 0,
            height: 2,
        },

        elevation: 4
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
    button: {
        width: '40%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(12, 116, 235)',
        borderRadius: 10,
        margin: 10
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    button: {
        backgroundColor: 'blue',
        padding: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '80%',
        height: 500,
        padding: 16,
        borderRadius: 8,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    iconItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: 'red',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

})
