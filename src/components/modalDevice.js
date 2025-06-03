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
    ActivityIndicator
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Network from 'expo-network';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Componente Principal
export default function ModalDevice({ status, group, closed, ...rest }) {

    // --- Estados --- 
    // Formulário
    const [valueName, setValueName] = useState('');
    const [valueIP, setValueIP] = useState('');
    const [valueComando, setValueComando] = useState('?m=1&o=1');
    const [selectedIcon, setSelectedIcon] = useState(icons.find(icon => icon.name === 'Lâmpada') || icons[0]); // Ícone padrão Lâmpada
    const [isCheckedButton, setCheckedButton] = useState(true);
    const [isCheckedSlide, setCheckedSlide] = useState(false);

    // Modais Auxiliares
    const [iconModalVisible, setIconModalVisible] = useState(false); // Modal de seleção de ícones
    const [searchViewVisible, setSearchViewVisible] = useState(false); // Controla a visibilidade da UI de busca

    // Scanner Tasmota
    const [localIp, setLocalIp] = useState(null);
    const [networkPrefix, setNetworkPrefix] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [foundDevices, setFoundDevices] = useState([]);
    const [scanError, setScanError] = useState(null);

    // --- Funções --- 

    // Seleção de Ícone
    const handleSelectIcon = (icon) => {
        setSelectedIcon(icon);
        setIconModalVisible(false);
    };

    // Carregar Devices Salvos
    const loadDevices = async () => {
        try {
            const dataDevice = await AsyncStorage.getItem('Device1');
            return dataDevice ? JSON.parse(dataDevice) : [];
        } catch (error) {
            console.log("Erro ao carregar os devices", error);
            return [];
        }
    };

    // Salvar Novo Device
    const saveDevice = async () => {
        const newDevice = {
            nomeDevice: valueName.trim(), // Remove espaços extras
            ico: selectedIcon,
            ip: valueIP.trim(),
            comando: valueComando.trim(),
            grupo: group,
            slider: isCheckedSlide
        };

        // Validação mais robusta
        if (!newDevice.nomeDevice || !newDevice.ico || !newDevice.ip || !newDevice.comando) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha Nome, Ícone, IP e Comando.');
            return;
        }
        // Validação simples de IP (pode ser melhorada com regex)
        if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(newDevice.ip)) {
             Alert.alert('IP Inválido', 'Por favor, insira um endereço IP válido.');
             return;
        }

        try {
            const existingDevices = await loadDevices();
            const updatedDevices = [...existingDevices, newDevice];
            await AsyncStorage.setItem('Device1', JSON.stringify(updatedDevices));
            console.log("Device salvo:", newDevice);

            // Limpa o formulário
            setValueName('');
            setValueIP('');
            setValueComando('?m=1&o=1');
            setSelectedIcon(icons.find(icon => icon.name === 'Lâmpada') || icons[0]);
            setCheckedButton(true);
            setCheckedSlide(false);

            closed(); // Fecha o modal principal

        } catch (error) {
            console.log("Erro ao salvar o device", error);
            Alert.alert('Erro', 'Ocorreu um erro ao salvar o dispositivo.');
        }
    };

    // Controle dos Checkboxes
    const handleCheckboxChange = (type) => {
        if (type === 'button') {
            setCheckedButton(true);
            setCheckedSlide(false);
        } else {
            setCheckedButton(false);
            setCheckedSlide(true);
        }
    };

    // --- Funções do Scanner Tasmota --- 

    // Verifica um IP
    const checkDevice = useCallback(async (ip) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // Timeout de 1.5s
        try {
            // Usa http por padrão para Tasmota
            const response = await fetch(`http://${ip}/`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    // Alguns fetches podem precisar de cabeçalhos padrão
                    'Accept': 'application/json, text/plain, */*'
                }
            });
            clearTimeout(timeoutId);
            const serverHeader = response.headers.get('server');
            // Verifica se o cabeçalho existe e inclui 'tasmota' (case-insensitive)
            if (serverHeader && serverHeader.toLowerCase().includes('tasmota')) {
                return ip;
            }
        } catch (e) {
            clearTimeout(timeoutId);
            // Ignora erros esperados (timeout, conexão recusada, etc.)
            if (e.name !== 'AbortError' && !e.message.includes('Network request failed')) {
                 console.log(`Erro não esperado ao verificar ${ip}: ${e.name} - ${e.message}`);
            }
        }
        return null;
    }, []);

    // Executa a varredura completa
    const runFullScan = useCallback(async (prefix) => {
        if (!prefix || isScanning) return;

        setIsScanning(true);
        setFoundDevices([]);
        setScanError(null);
        setScanProgress(0);

        const promises = [];
        const totalHosts = 254;
        let foundCount = 0;
        console.log(`Iniciando varredura Tasmota na faixa: ${prefix}1 - ${prefix}${totalHosts}`);

        for (let i = 1; i <= totalHosts; i++) {
            const currentIp = `${prefix}${i}`;
            promises.push(
                checkDevice(currentIp).then(foundIp => {
                    if (foundIp) {
                        foundCount++;
                        console.log(`(${foundCount}) Dispositivo Tasmota encontrado: ${foundIp}`);
                        // Atualiza estado de forma segura e ordenada
                        setFoundDevices(prevDevices => {
                            if (!prevDevices.includes(foundIp)) {
                                const newDevices = [...prevDevices, foundIp];
                                // Ordena numericamente pelo último octeto
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
                    // Atualiza progresso após cada tentativa
                    setScanProgress(prev => prev + (1 / totalHosts));
                    return foundIp;
                })
            );

            // Controla a concorrência para não sobrecarregar
            if (promises.length >= 20 || i === totalHosts) { // Processa em lotes de 20
                await Promise.all(promises);
                promises.length = 0; // Limpa o array de promessas
                // Pequena pausa para liberar a thread principal
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        // Garante que qualquer promessa restante seja resolvida
        if (promises.length > 0) {
             await Promise.all(promises);
        }

        console.log('Varredura Tasmota concluída.');
        setIsScanning(false);
        // Garante que o progresso chegue a 100% no final
        setScanProgress(1);

    }, [isScanning, checkDevice]); // checkDevice é dependência do useCallback

    // Botão "Buscar IP"
    const handleSearchClick = useCallback(async () => {
        setSearchViewVisible(true); // Mostra a UI de busca
        setIsScanning(false);
        setFoundDevices([]);
        setScanProgress(0);
        setScanError(null);
        setLocalIp(null);
        setNetworkPrefix(null);

        try {
            console.log("Obtendo IP local...");
            const ip = await Network.getIpAddressAsync();
            setLocalIp(ip);
            const ipParts = ip.split('.');
            if (ipParts.length === 4) {
                const prefix = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.`;
                setNetworkPrefix(prefix);
                console.log(`Prefixo de rede determinado: ${prefix}`);
                // Inicia a varredura
                runFullScan(prefix);
            } else {
                setScanError('Não foi possível determinar o prefixo da rede a partir do IP: ' + ip);
                // Não fecha a view de busca, permite ao usuário voltar manualmente
            }
        } catch (e) {
            console.error('Erro ao obter IP ou iniciar varredura:', e);
            setScanError('Falha ao obter o endereço IP local para iniciar a varredura.');
             // Não fecha a view de busca, permite ao usuário voltar manualmente
        }
    }, [runFullScan]); // runFullScan é dependência

    // Seleciona um IP da lista de encontrados
    const handleSelectFoundIP = (ip) => {
        setValueIP(ip);
        setSearchViewVisible(false); // Volta para o formulário
    };

    // Fecha a view de busca
    const closeSearchView = () => {
        // TODO: Adicionar lógica para cancelar a varredura se estiver em andamento (se necessário)
        setIsScanning(false); // Para o indicador de progresso visualmente
        setSearchViewVisible(false);
    };

    // --- Renderização --- 

    return (
        <Modal
            animationType='slide'
            transparent={true}
            statusBarTranslucent={true}
            visible={status} // Controla visibilidade do Modal principal
            onRequestClose={closed} // Permite fechar com botão voltar (Android)
        >
            <View style={styles.outerView}>
                {/* Container principal do conteúdo do modal */}
                <View style={styles.modalContainer}>

                    {/* Cabeçalho Fixo */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {searchViewVisible ? 'Buscar Dispositivos Tasmota' : 'Adicionar Novo Dispositivo'}
                        </Text>
                    </View>

                    {/* Conteúdo Condicional: Formulário ou Busca */}
                    {!searchViewVisible ? (
                        // --- Formulário --- 
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScrollView}>
                            <Text style={styles.label}>Nome do Dispositivo</Text>
                            <TextInput
                                style={styles.inputText}
                                placeholder='Ex: Luz Cozinha'
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
                                placeholder='Ex: Power' // Ou Power1, Dimmer, etc.
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

                            {/* Botões de Ação do Formulário */}
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity onPress={saveDevice} style={[styles.buttonBase, styles.saveButton]}>
                                    <Text style={styles.buttonText}>Salvar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSearchClick} style={[styles.buttonBase, styles.searchButton]}>
                                    <Text style={styles.buttonText}>Buscar IP</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={closed} style={[styles.buttonBase, styles.closeButton]}>
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    ) : (
                        // --- View de Busca --- 
                        <View style={styles.searchContainer}>
                            {localIp && <Text style={styles.searchInfo}>Seu IP: {localIp}</Text>}
                            {networkPrefix && <Text style={styles.searchInfo}>Buscando em: {networkPrefix}1 - 254</Text>}
                            
                            {isScanning && (
                                <View style={styles.progressContainer}>
                                    <ActivityIndicator size="large" color="#007AFF" />
                                    <Text style={styles.progressText}>Buscando... {Math.round(scanProgress * 100)}%</Text>
                                </View>
                            )}

                            {scanError && <Text style={styles.errorText}>{scanError}</Text>}

                            <Text style={styles.foundDevicesTitle}>Dispositivos Encontrados:</Text>
                            {foundDevices.length === 0 && !isScanning && (
                                <Text style={styles.noDevicesText}>Nenhum dispositivo Tasmota encontrado na rede.</Text>
                            )}
                            <FlatList
                                data={foundDevices}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleSelectFoundIP(item)} style={styles.foundDeviceItem}>
                                        <Text style={styles.foundDeviceText}>{item}</Text>
 
                                    </TouchableOpacity>
                                )}
                                style={styles.foundDevicesList}
                                ListEmptyComponent={() => (
                                    // Mostra apenas se não estiver buscando e a lista estiver vazia
                                    !isScanning && foundDevices.length === 0 ? (
                                        <Text style={styles.noDevicesText}>Nenhum dispositivo Tasmota encontrado.</Text>
                                    ) : null
                                )}
                            />
                           
                            <TouchableOpacity onPress={closeSearchView} style={[styles.buttonBase, styles.closeSearchButton]}>
                                <Text style={styles.buttonText}>Voltar ao Cadastro</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* --- Modal de Seleção de Ícones --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={iconModalVisible}
                onRequestClose={() => setIconModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.iconModalOverlay}
                    onPress={() => setIconModalVisible(false)} // Fecha ao clicar fora
                    activeOpacity={1}
                >
                    <View style={styles.iconModalContent} onStartShouldSetResponder={() => true} /* Evita fechar ao clicar dentro */>
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
                            numColumns={3} // 3 colunas de ícones
                            contentContainerStyle={styles.iconListContainer}
                        />
                         <TouchableOpacity onPress={() => setIconModalVisible(false)} style={[styles.buttonBase, styles.closeButton, { alignSelf: 'center', marginTop: 15 }]}>
                            <Text style={styles.buttonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </Modal>
    );
}

// --- Estilos --- (Refatorados e Organizados)
const styles = StyleSheet.create({
    // Estilos Gerais do Modal Principal
    outerView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '90%', // Aumentado um pouco a altura máxima
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
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: wp(5.5),
        color: '#333',
        textAlign: 'center',
    },
    // Estilos do Formulário
    formScrollView: {
        padding: wp(4),
    },
    label: {
        fontWeight: '600', // Semi-bold
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
        marginBottom: hp(2.5),
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
        justifyContent: 'space-between', // Espaço entre botões
        marginTop: hp(2),
        marginBottom: hp(1),
    },
    buttonBase: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3),
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: wp(1), // Espaço entre botões
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: wp(4),
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50', // Verde
    },
    searchButton: {
        backgroundColor: '#2196F3', // Azul
    },
    closeButton: {
        backgroundColor: '#f44336', // Vermelho
    },
    // Estilos da View de Busca
    searchContainer: {
        margin:10,
        justifyContent:'center',
        alignItems: 'center'
    },
    searchInfo: {
        fontSize: wp(3.8),
        color: '#666',
        marginBottom: hp(1),
        textAlign: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: hp(2.5),
    },
    progressText: {
        marginLeft: wp(4),
        fontSize: wp(4),
        color: '#333',
    },
    errorText: {
        color: 'red',
        marginVertical: hp(1.5),
        textAlign: 'center',
        fontSize: wp(3.8),
        paddingHorizontal: wp(2),
    },
    foundDevicesTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#333',
        marginTop: hp(2),
        marginBottom: hp(1.5),
    },
    foundDevicesList: {
        width: '100%',
     
        marginBottom: hp(1.5),
    },
    foundDeviceItem: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
        marginBottom: hp(0.8),
    },
    foundDeviceText: {
        fontSize: wp(4),
        textAlign: 'center',
        color: '#007AFF'
    },
    noDevicesText: {
        fontSize: wp(4),
        color: '#888',
        marginTop: hp(3),
        textAlign: 'center',
        fontStyle: 'italic',
    },
    closeSearchButton: {
        backgroundColor: '#ff9800', // Laranja
        width: '80%', // Botão mais largo
        alignSelf: 'center',
        marginTop: hp(1.5),
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
        width: wp(28), // Largura para 3 colunas
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

