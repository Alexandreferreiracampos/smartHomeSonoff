import React, { useState, useEffect, useCallback } from 'react';
import {
    Text,
    StyleSheet,
    TouchableOpacity,
    View,
    Modal,
    ScrollView,
    TextInput,
    FlatList,
    Image,
    Alert,
    ActivityIndicator,
    Platform // Import Platform
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Network from 'expo-network';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import o novo modal
import TasmotaSubDeviceConfigModal from './TasmotaSubDeviceConfigModal_Debug'; // Ajuste o caminho se necessário

// Importações de Ícones (mantidas do seu código)
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

// Definição dos ícones (mantida do seu código)
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

// Componente Principal Modificado com Logs
export default function ModalDevice({ status, group, closed, ...rest }) {

    // --- Estados --- 
    const [valueName, setValueName] = useState('');
    const [valueIP, setValueIP] = useState('');
    const [valueComando, setValueComando] = useState('?m=1&o=1');
    const [selectedIcon, setSelectedIcon] = useState(icons.find(icon => icon.name === 'Lâmpada') || icons[0]);
    const [isCheckedButton, setCheckedButton] = useState(true);
    const [isCheckedSlide, setCheckedSlide] = useState(false);
    const [iconModalVisible, setIconModalVisible] = useState(false);
    const [searchViewVisible, setSearchViewVisible] = useState(false);
    const [subDeviceModalVisible, setSubDeviceModalVisible] = useState(false);
    const [configuringIp, setConfiguringIp] = useState(null);
    const [localIp, setLocalIp] = useState(null);
    const [networkPrefix, setNetworkPrefix] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [foundDevices, setFoundDevices] = useState([]);
    const [scanError, setScanError] = useState(null);

    // --- Funções --- 

    const handleSelectIcon = (icon) => {
        setSelectedIcon(icon);
        setIconModalVisible(false);
    };

    const loadDevices = async () => {
        try {
            const dataDevice = await AsyncStorage.getItem('Device1');
            return dataDevice ? JSON.parse(dataDevice) : [];
        } catch (error) {
            console.log("Erro ao carregar os devices", error);
            return [];
        }
    };

    const saveDevice = async () => {
        const newDevice = {
            nomeDevice: valueName.trim(),
            ico: selectedIcon,
            ip: valueIP.trim(),
            comando: valueComando.trim(),
            grupo: group,
            slider: isCheckedSlide
        };
        if (!newDevice.nomeDevice || !newDevice.ico || !newDevice.ip || !newDevice.comando) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha Nome, Ícone, IP e Comando.');
            return;
        }
        if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(newDevice.ip)) {
             Alert.alert('IP Inválido', 'Por favor, insira um endereço IP válido.');
             return;
        }
        try {
            const existingDevices = await loadDevices();
            const updatedDevices = [...existingDevices, newDevice];
            await AsyncStorage.setItem('Device1', JSON.stringify(updatedDevices));
            console.log("Device manual salvo:", newDevice);
            resetForm();
            closed();
        } catch (error) {
            console.log("Erro ao salvar o device manual", error);
            Alert.alert('Erro', 'Ocorreu um erro ao salvar o dispositivo.');
        }
    };

    const handleSaveMultipleDevices = async (devicesArray) => {
        if (!devicesArray || devicesArray.length === 0) {
            Alert.alert('Nenhum Dispositivo', 'Nenhum sub-dispositivo foi configurado para salvar.');
            return;
        }
        console.log("[ModalDevice] Tentando salvar múltiplos devices:", devicesArray);
        try {
            const existingDevices = await loadDevices();
            const updatedDevices = [...existingDevices, ...devicesArray];
            await AsyncStorage.setItem('Device1', JSON.stringify(updatedDevices));
            console.log(`[ModalDevice] ${devicesArray.length} sub-dispositivo(s) salvo(s) com sucesso.`);
            resetForm();
            closed();
        } catch (error) {
            console.log("[ModalDevice] Erro ao salvar múltiplos devices", error);
            Alert.alert('Erro', 'Ocorreu um erro ao salvar os sub-dispositivos.');
        }
    };

    const resetForm = () => {
        console.log("[ModalDevice] Resetando formulário e estados...");
        setValueName('');
        setValueIP('');
        setValueComando('?m=1&o=1');
        setSelectedIcon(icons.find(icon => icon.name === 'Lâmpada') || icons[0]);
        setCheckedButton(true);
        setCheckedSlide(false);
        setSearchViewVisible(false);
        setSubDeviceModalVisible(false);
        setConfiguringIp(null);
        setFoundDevices([]); // Limpa a lista de encontrados também
        setIsScanning(false);
        setScanProgress(0);
        setScanError(null);
    };

    const handleCheckboxChange = (type) => {
        if (type === 'button') {
            setCheckedButton(true);
            setCheckedSlide(false);
        } else {
            setCheckedButton(false);
            setCheckedSlide(true);
        }
    };

    const checkDevice = useCallback(async (ip) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        try {
            const response = await fetch(`http://${ip}/`, {
                method: 'GET',
                signal: controller.signal,
                headers: { 'Accept': 'application/json, text/plain, */*' }
            });
            clearTimeout(timeoutId);
            const serverHeader = response.headers.get('server');
            if (serverHeader && serverHeader.toLowerCase().includes('tasmota')) {
                return ip;
            }
        } catch (e) {
            clearTimeout(timeoutId);
            if (e.name !== 'AbortError' && !e.message.includes('Network request failed')) {
                 console.log(`[ModalDevice] Erro não esperado ao verificar ${ip}: ${e.name} - ${e.message}`);
            }
        }
        return null;
    }, []);

    const runFullScan = useCallback(async (prefix) => {
        if (!prefix || isScanning) return;
        console.log("[ModalDevice] Iniciando runFullScan com prefixo:", prefix);
        setIsScanning(true);
        setFoundDevices([]);
        setScanError(null);
        setScanProgress(0);
        const promises = [];
        const totalHosts = 254;
        let foundCount = 0;

        for (let i = 1; i <= totalHosts; i++) {
            const currentIp = `${prefix}${i}`;
            promises.push(
                checkDevice(currentIp).then(foundIp => {
                    if (foundIp) {
                        foundCount++;
                        // console.log(`(${foundCount}) Dispositivo Tasmota encontrado: ${foundIp}`); // Log menos verboso
                        setFoundDevices(prevDevices => {
                            if (!prevDevices.includes(foundIp)) {
                                const newDevices = [...prevDevices, foundIp];
                                newDevices.sort((a, b) => {
                                    const numA = parseInt(a.split('.').pop());
                                    const numB = parseInt(b.split('.').pop());
                                    return numA - numB;
                                });
                                return newDevices;
                            }
                            return prevDevices;
                        });
                    }
                    setScanProgress(prev => prev + (1 / totalHosts));
                    return foundIp;
                })
            );

            if (promises.length >= 20 || i === totalHosts) {
                await Promise.all(promises);
                promises.length = 0;
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        if (promises.length > 0) {
             await Promise.all(promises);
        }
        console.log('[ModalDevice] Varredura Tasmota concluída.');
        setIsScanning(false);
        setScanProgress(1);
    }, [isScanning, checkDevice]);

    const handleSearchClick = useCallback(async () => {
        console.log("[ModalDevice] Botão Buscar Tasmota clicado.");
        setSearchViewVisible(true);
        setIsScanning(false);
        setFoundDevices([]);
        setScanProgress(0);
        setScanError(null);
        setLocalIp(null);
        setNetworkPrefix(null);
        try {
            console.log("[ModalDevice] Obtendo IP local...");
            const ip = await Network.getIpAddressAsync();
            console.log("[ModalDevice] IP Local obtido:", ip);
            setLocalIp(ip);
            const ipParts = ip.split('.');
            if (ipParts.length === 4) {
                const prefix = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.`;
                setNetworkPrefix(prefix);
                console.log(`[ModalDevice] Prefixo de rede determinado: ${prefix}`);
                runFullScan(prefix);
            } else {
                console.error("[ModalDevice] IP Local inválido:", ip);
                setScanError('Não foi possível determinar o prefixo da rede a partir do IP: ' + ip);
            }
        } catch (e) {
            console.error('[ModalDevice] Erro ao obter IP ou iniciar varredura:', e);
            setScanError('Falha ao obter o endereço IP local para iniciar a varredura.');
        }
    }, [runFullScan]);

    // **MODIFICADO COM LOGS: Seleciona um IP da lista e ABRE O NOVO MODAL**
    const handleSelectFoundIP = (ip) => {
        console.log(`[ModalDevice] handleSelectFoundIP chamado com IP: ${ip}`);
        console.log('[ModalDevice] Definindo configuringIp...');
        setConfiguringIp(ip);
        console.log('[ModalDevice] Definindo subDeviceModalVisible para true...');
        setSubDeviceModalVisible(true);
        console.log('[ModalDevice] Definindo searchViewVisible para false...');
        setSearchViewVisible(false);
        console.log('[ModalDevice] handleSelectFoundIP concluído.');
    };

    const closeSearchView = () => {
        console.log("[ModalDevice] Fechando Search View...");
        setIsScanning(false);
        setSearchViewVisible(false);
    };

    // --- Renderização --- 
    console.log(`[ModalDevice] Renderizando... searchViewVisible: ${searchViewVisible}, subDeviceModalVisible: ${subDeviceModalVisible}, configuringIp: ${configuringIp}`);

    return (
        <Modal
            animationType='slide'
            transparent={true}
            statusBarTranslucent={true}
            visible={status}
            onRequestClose={closed}
        >
            <View style={styles.outerView}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {searchViewVisible ? 'Buscar Dispositivos Tasmota' : 'Adicionar Novo Dispositivo'}
                        </Text>
                    </View>

                    {!searchViewVisible ? (
                        // --- Formulário Manual --- 
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScrollView}>
                            {/* ... (campos do formulário manual mantidos) ... */}
                             <Text style={styles.label}>Nome do Dispositivo</Text>
                            <TextInput
                                style={styles.inputText}
                                placeholder='Ex: Luz Cozinha (Manual)'
                                value={valueName}
                                onChangeText={setValueName}
                            />
                            <Text style={styles.label}>Ícone</Text>
                            <TouchableOpacity
                                style={[styles.inputText, styles.iconPickerButton]}
                                onPress={() => setIconModalVisible(true)}
                            >
                                <Text style={styles.iconPickerText}>Escolher Ícone</Text>
                                {selectedIcon?.image && <Image source={selectedIcon.image} style={styles.selectedIconImage} />}
                            </TouchableOpacity>
                            <Text style={styles.label}>Endereço IP</Text>
                            <TextInput
                                style={styles.inputText}
                                keyboardType="numeric"
                                placeholder='Ex: 192.168.1.55'
                                value={valueIP}
                                onChangeText={setValueIP}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Text style={styles.label}>Comando Tasmota</Text>
                            <TextInput
                                style={styles.inputText}
                                placeholder='Ex: Power (ou Power1, Dimmer)'
                                value={valueComando}
                                onChangeText={setValueComando}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Text style={styles.label}>Tipo de Controle</Text>
                            <View style={styles.checkboxContainer}>
                                <TouchableOpacity style={styles.checkboxOption} onPress={() => handleCheckboxChange('button')}>
                                    <Checkbox value={isCheckedButton} onValueChange={() => handleCheckboxChange('button')} color={isCheckedButton ? '#4630EB' : undefined} />
                                    <Text style={styles.checkboxLabel}>Botão (Liga/Desliga)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.checkboxOption} onPress={() => handleCheckboxChange('slider')}>
                                    <Checkbox value={isCheckedSlide} onValueChange={() => handleCheckboxChange('slider')} color={isCheckedSlide ? '#4630EB' : undefined} />
                                    <Text style={styles.checkboxLabel}>Slider (Dimmer)</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity onPress={saveDevice} style={[styles.buttonBase, styles.saveButton]}>
                                    <Text style={styles.buttonText}>Salvar Manual</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSearchClick} style={[styles.buttonBase, styles.searchButton]}>
                                    <Text style={styles.buttonText}>Buscar Tasmota</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={closed} style={[styles.buttonBase, styles.closeButton]}>
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    ) : (
                        // --- View de Busca Tasmota --- 
                        <View style={styles.searchViewContainer}>
                            {isScanning && (
                                <View style={styles.progressContainer}>
                                    <Text style={styles.progressText}>
                                        Buscando... {Math.round(scanProgress * 100)}%
                                    </Text>
                                    <View style={styles.progressBarBackground}>
                                        <View style={[styles.progressBarForeground, { width: `${Math.round(scanProgress * 100)}%` }]} />
                                    </View>
                                </View>
                            )}
                            {scanError && <Text style={styles.errorText}>{scanError}</Text>}
                            {foundDevices.length > 0 ? (
                                <FlatList
                                    data={foundDevices}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.foundDeviceItem}
                                            onPress={() => {
                                                console.log(`[ModalDevice] TouchableOpacity para IP ${item} pressionado.`); // Log no onPress
                                                handleSelectFoundIP(item);
                                            }}
                                        >
                                            <Text style={styles.foundDeviceText}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ListHeaderComponent={<Text style={styles.foundListHeader}>Dispositivos Tasmota Encontrados:</Text>}
                                />
                            ) : (
                                !isScanning && <Text style={styles.noDevicesText}>Nenhum dispositivo Tasmota encontrado.</Text>
                            )}
                            <TouchableOpacity onPress={closeSearchView} style={[styles.buttonBaseVoltar, styles.closeButton, { marginTop: hp(2) }]}>
                                <Text style={styles.buttonText}>Voltar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* --- Modal de Seleção de Ícones (para o formulário manual) --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={iconModalVisible}
                onRequestClose={() => setIconModalVisible(false)}
            >
                 {/* ... (conteúdo do modal de ícones mantido) ... */}
                 <TouchableOpacity
                    style={styles.iconModalOverlay}
                    onPress={() => setIconModalVisible(false)}
                    activeOpacity={1}
                >
                    <View style={styles.iconModalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.iconModalTitle}>Selecione um Ícone</Text>
                        <FlatList
                            data={icons}
                            keyExtractor={(item, index) => item.name + index}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.iconItemContainer} onPress={() => handleSelectIcon(item)}>
                                    <Image source={item.image} style={styles.iconImage} />
                                    <Text style={styles.iconText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            numColumns={3}
                            contentContainerStyle={styles.iconListContainer}
                        />
                        <TouchableOpacity onPress={() => setIconModalVisible(false)} style={[styles.buttonBase, styles.closeButton, { alignSelf: 'center', marginTop: 15 }]}>
                            <Text style={styles.buttonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* --- **NOVO**: Renderiza o Modal de Configuração de Sub-Devices --- */}
            {/* Adicionado log para verificar se este componente está sendo montado */}
            {subDeviceModalVisible && console.log("[ModalDevice] Tentando renderizar TasmotaSubDeviceConfigModal...")}
            <TasmotaSubDeviceConfigModal
                visible={subDeviceModalVisible}
                onClose={() => {
                    console.log("[ModalDevice] Fechando TasmotaSubDeviceConfigModal...");
                    setSubDeviceModalVisible(false);
                    setConfiguringIp(null); // Limpa o IP em configuração
                }}
                selectedIp={configuringIp}
                icons={icons}
                group={group}
                onSaveMultipleDevices={handleSaveMultipleDevices}
            />
        </Modal>
    );
}

// --- Estilos --- (Mantidos como no arquivo anterior)
const styles = StyleSheet.create({
    outerView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '90%',
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: wp(5.5),
        color: '#333',
        textAlign: 'center',
    },
    formScrollView: {
        padding: wp(4),
    },
    label: {
        fontWeight: '600',
        color: '#444',
        marginBottom: hp(0.8),
        fontSize: wp(4),
    },
    inputText: {
        width: '100%',
        height: hp(6.5),
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: wp(3),
        marginBottom: hp(2),
        fontSize: wp(4),
        borderWidth: 1,
        borderColor: '#ccc',
    },
    iconPickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(3),
    },
    iconPickerText: {
        color: 'rgb(12, 116, 235)',
        fontSize: wp(4),
    },
    selectedIconImage: {
        width: wp(8),
        height: wp(8),
        resizeMode: 'contain',
    },
    checkboxContainer: {
        flexDirection: 'row',
        marginBottom: hp(1.5),
        marginTop: hp(1),
    },
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: wp(6),
    },
    checkboxLabel: {
        marginLeft: wp(2),
        fontSize: wp(4),
        color: '#333',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#f8f8f8',
    },
    buttonBase: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3),
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: wp(1.5),
    },
    buttonBaseVoltar: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3),
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: wp(1.5),
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: wp(4),
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    searchButton: {
        backgroundColor: '#007AFF',
    },
    closeButton: {
        backgroundColor: '#f44336',
    },
    // Estilos da View de Busca
    searchViewContainer: {
        padding: wp(4),
        // flex: 1, // Removido para evitar problemas de layout com FlatList
        minHeight: hp(50), // Altura mínima para a área de busca
    },
    progressContainer: {
        marginBottom: hp(2),
        alignItems: 'center',
    },
    progressText: {
        fontSize: wp(4),
        color: '#555',
        marginBottom: hp(1),
    },
    progressBarBackground: {
        height: hp(1.5),
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: hp(0.75),
        overflow: 'hidden',
    },
    progressBarForeground: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: hp(0.75),
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: wp(4),
        marginBottom: hp(2),
    },
    foundListHeader: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: hp(1.5),
        color: '#333',
    },
    foundDeviceItem: {
        backgroundColor: '#f0f0f0',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3),
        borderRadius: 5,
        marginBottom: hp(1),
    },
    foundDeviceText: {
        fontSize: wp(4),
        color: '#007AFF',
    },
    noDevicesText: {
        fontSize: wp(4),
        color: '#888',
        textAlign: 'center',
        marginTop: hp(3),
    },
    // Estilos do Modal de Ícones
    iconModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(5),
    },
    iconModalContent: {
        backgroundColor: 'white',
        width: '100%',
        maxHeight: '80%',
        padding: wp(4),
        borderRadius: 10,
        elevation: 5,
    },
    iconModalTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: hp(2),
        textAlign: 'center',
        color: '#333',
    },
    iconListContainer: {
        alignItems: 'center',
        paddingBottom: hp(1),
    },
    iconItemContainer: {
        padding: wp(2),
        alignItems: 'center',
        width: wp(28),
        marginBottom: hp(1.5),
    },
    iconImage: {
        width: wp(12),
        height: wp(12),
        marginBottom: hp(0.5),
        resizeMode: 'contain',
    },
    iconText: {
        fontSize: wp(3.5),
        textAlign: 'center',
        color: '#555',
    },
});

