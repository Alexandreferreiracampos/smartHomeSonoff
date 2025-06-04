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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';

// Componente para o Modal de Configuração de Sub-Devices Tasmota com Logs
export default function TasmotaSubDeviceConfigModal({ visible, onClose, selectedIp, icons, group, onSaveMultipleDevices }) {

    const [isLoading, setIsLoading] = useState(false);
    const [htmlError, setHtmlError] = useState(null);
    const [detectedOutputs, setDetectedOutputs] = useState([]);
    const [iconModalVisible, setIconModalVisible] = useState(false);
    const [editingOutputIndex, setEditingOutputIndex] = useState(null);

    // Função para buscar e parsear o HTML do Tasmota
    const fetchAndParseTasmotaHtml = useCallback(async () => {
        if (!selectedIp) {
            console.log("[SubDeviceModal] fetchAndParseTasmotaHtml: selectedIp é nulo, retornando.");
            return;
        }

        console.log(`[SubDeviceModal] Iniciando fetchAndParseTasmotaHtml para IP: ${selectedIp}`);
        setIsLoading(true);
        setHtmlError(null);
        setDetectedOutputs([]);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log(`[SubDeviceModal] Timeout ao buscar HTML de ${selectedIp}`);
                controller.abort();
            }, 5000);

            console.log(`[SubDeviceModal] Fetching HTML from http://${selectedIp}/`);
            const response = await fetch(`http://${selectedIp}/`, {
                 method: 'GET',
                 signal: controller.signal,
                 headers: { 'Accept': 'text/html' }
                });
            clearTimeout(timeoutId);
            console.log(`[SubDeviceModal] Fetch para ${selectedIp} concluído. Status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            console.log(`[SubDeviceModal] HTML recebido de ${selectedIp} (length: ${html.length})`);

            const regex = /(?:onclick=["']la\(&quot;&o=(\d+)&quot;\);?["'])|(?:&o=(\d+))/g;
            let match;
            const outputs = new Set();

            while ((match = regex.exec(html)) !== null) {
                const outputIndex = match[1] || match[2];
                if (outputIndex) {
                    outputs.add(parseInt(outputIndex, 10));
                }
            }

            console.log("[SubDeviceModal] Detected output indices:", Array.from(outputs));

            if (outputs.size === 0) {
                 console.log("[SubDeviceModal] Nenhuma saída específica (&o=N) encontrada, assumindo dispositivo único (Power).");
                 setDetectedOutputs([
                    {
                        index: 1,
                        name: '',
                        command: '?m=1&o=',
                        icon: icons.find(icon => icon.name === 'Lâmpada') || icons[0],
                        isSlider: false
                    }
                ]);
            } else {
                const outputArray = Array.from(outputs).sort((a, b) => a - b).map(index => ({
                    index: index,
                    name: ``,
                    command: `?m=1&o=${index}`,
                    icon: icons.find(icon => icon.name === 'Lâmpada') || icons[0],
                    isSlider: false
                }));
                console.log("[SubDeviceModal] Estrutura de outputs criada:", outputArray);
                setDetectedOutputs(outputArray);
            }

        } catch (e) {
            console.error("[SubDeviceModal] Erro em fetchAndParseTasmotaHtml:", e);
            setHtmlError(`Falha ao buscar ou analisar informações do dispositivo ${selectedIp}. Verifique a conexão ou o IP.`);
             setDetectedOutputs([
                {
                    index: 1,
                    name: '',
                    command: '?m=1&o=',
                    icon: icons.find(icon => icon.name === 'Lâmpada') || icons[0],
                    isSlider: false
                }
            ]);
        } finally {
            console.log("[SubDeviceModal] fetchAndParseTasmotaHtml finalizado.");
            setIsLoading(false);
        }
    }, [selectedIp, icons]);

    // Busca o HTML quando o modal se torna visível e o IP é válido
    useEffect(() => {
        console.log(`[SubDeviceModal] useEffect disparado. Visible: ${visible}, Selected IP: ${selectedIp}`);
        if (visible && selectedIp) {
            fetchAndParseTasmotaHtml();
        } else if (!visible) {
            // Limpa o estado ao fechar para evitar mostrar dados antigos na próxima abertura
            console.log("[SubDeviceModal] Modal não visível, limpando estados internos.");
            setDetectedOutputs([]);
            setHtmlError(null);
            setIsLoading(false);
        }
    }, [visible, selectedIp, fetchAndParseTasmotaHtml]);

    // --- Funções de Manipulação do Formulário Dinâmico ---

    const handleInputChange = (index, field, value) => {
        // console.log(`[SubDeviceModal] handleInputChange: index=${index}, field=${field}, value=${value}`);
        setDetectedOutputs(prevOutputs =>
            prevOutputs.map(output =>
                output.index === index ? { ...output, [field]: value } : output
            )
        );
    };

    const handleCheckboxChange = (index, type) => {
        // console.log(`[SubDeviceModal] handleCheckboxChange: index=${index}, type=${type}`);
         setDetectedOutputs(prevOutputs =>
            prevOutputs.map(output =>
                output.index === index ? { ...output, isSlider: type === 'slider' } : output
            )
        );
    };

    const openIconPicker = (index) => {
        console.log(`[SubDeviceModal] Abrindo seletor de ícone para output index: ${index}`);
        setEditingOutputIndex(index);
        setIconModalVisible(true);
    };

    const handleSelectIcon = (icon) => {
        console.log(`[SubDeviceModal] Ícone selecionado: ${icon.name} para output index: ${editingOutputIndex}`);
        if (editingOutputIndex !== null) {
            handleInputChange(editingOutputIndex, 'icon', icon);
        }
        setIconModalVisible(false);
        setEditingOutputIndex(null);
    };

    // --- Função de Salvamento --- 

    const handleSave = () => {
        console.log("[SubDeviceModal] Botão Salvar pressionado.");
        const devicesToSave = [];
        let validationError = false;

        detectedOutputs.forEach(output => {
            const trimmedName = output.name.trim();
            const trimmedCommand = output.command.trim();

            if (!trimmedName || !trimmedCommand) {
                console.warn(`[SubDeviceModal] Validação falhou para output index: ${output.index}. Nome ou Comando vazio.`);
                validationError = true;
            }

            devicesToSave.push({
                nomeDevice: trimmedName,
                ico: output.icon,
                ip: selectedIp,
                comando: trimmedCommand,
                grupo: group,
                slider: output.isSlider
            });
        });

        if (validationError) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha o Nome e o Comando para todos os dispositivos detectados.');
            return;
        }

        if (devicesToSave.length > 0) {
            console.log("[SubDeviceModal] Chamando onSaveMultipleDevices com:", devicesToSave);
            onSaveMultipleDevices(devicesToSave);
            onClose();
        } else {
             console.warn("[SubDeviceModal] Nenhum dispositivo configurado para salvar.");
             Alert.alert('Nenhum Dispositivo', 'Nenhum dispositivo foi configurado para salvar.');
        }
    };

    // --- Renderização --- 
    console.log(`[SubDeviceModal] Renderizando... Visible: ${visible}, isLoading: ${isLoading}, htmlError: ${htmlError}, detectedOutputs count: ${detectedOutputs.length}`);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.outerView}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Configurar Dispositivo Tasmota</Text>
                        <Text style={styles.modalSubtitle}>{selectedIp || 'Nenhum IP selecionado'}</Text>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Buscando informações do dispositivo...</Text>
                        </View>
                    ) : htmlError ? (
                         <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{htmlError}</Text>
                             <ScrollView contentContainerStyle={styles.formScrollView}>
                                {detectedOutputs.map((output) => (
                                    <SubDeviceInputGroup
                                        key={`error-${output.index}`}
                                        output={output}
                                        onInputChange={handleInputChange}
                                        onCheckboxChange={handleCheckboxChange}
                                        onIconPress={openIconPicker}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    ) : detectedOutputs.length > 0 ? (
                        <ScrollView contentContainerStyle={styles.formScrollView}>
                            {detectedOutputs.map((output) => (
                                <SubDeviceInputGroup
                                    key={output.index}
                                    output={output}
                                    onInputChange={handleInputChange}
                                    onCheckboxChange={handleCheckboxChange}
                                    onIconPress={openIconPicker}
                                />
                            ))}
                        </ScrollView>
                    ) : (
                         <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Nenhuma saída detectada ou dispositivo não respondeu.</Text>
                             <ScrollView contentContainerStyle={styles.formScrollView}>
                                {detectedOutputs.map((output) => (
                                    <SubDeviceInputGroup
                                        key={`fallback-${output.index}`}
                                        output={output}
                                        onInputChange={handleInputChange}
                                        onCheckboxChange={handleCheckboxChange}
                                        onIconPress={openIconPicker}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Botões de Ação */}
                    {!isLoading && (
                         <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity onPress={handleSave} style={[styles.buttonBase, styles.saveButton]}>
                                <Text style={styles.buttonText}>Salvar Dispositivos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} style={[styles.buttonBase, styles.closeButton]}>
                                <Text style={styles.buttonText}>Cancelar</Text>
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
        </Modal>
    );
}

// Componente Auxiliar para o Grupo de Inputs de cada Sub-Device
const SubDeviceInputGroup = ({ output, onInputChange, onCheckboxChange, onIconPress }) => {
    // console.log(`[SubDeviceInputGroup] Renderizando para output index: ${output.index}`);
    return (
        <View style={styles.subDeviceGroup}>
            <Text style={styles.subDeviceTitle}>Dispositivo {output.index}</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
                style={styles.inputText}
                placeholder={`Nome para Dispositivo ${output.index}`}
                value={output.name}
                onChangeText={(text) => onInputChange(output.index, 'name', text)}
            />

            <Text style={styles.label}>Comando Tasmota</Text>
            <TextInput
                style={styles.inputText}
                placeholder={`Comando (ex: Power${output.index})`}
                value={output.command}
                onChangeText={(text) => onInputChange(output.index, 'command', text)}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <Text style={styles.label}>Ícone</Text>
            <TouchableOpacity
                style={[styles.inputText, styles.iconPickerButton]}
                onPress={() => onIconPress(output.index)}
            >
                <Text style={styles.iconPickerText}>Escolher Ícone</Text>
                {output.icon?.image && <Image source={output.icon.image} style={styles.selectedIconImage} />}
            </TouchableOpacity>

            <Text style={styles.label}>Tipo de Controle</Text>
            <View style={styles.checkboxContainer}>
                <TouchableOpacity style={styles.checkboxOption} onPress={() => onCheckboxChange(output.index, 'button')}>
                    <Checkbox value={!output.isSlider} onValueChange={() => onCheckboxChange(output.index, 'button')} color={!output.isSlider ? '#4630EB' : undefined} />
                    <Text style={styles.checkboxLabel}>Botão</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxOption} onPress={() => onCheckboxChange(output.index, 'slider')}>
                    <Checkbox value={output.isSlider} onValueChange={() => onCheckboxChange(output.index, 'slider')} color={output.isSlider ? '#4630EB' : undefined} />
                    <Text style={styles.checkboxLabel}>Slider</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

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
    modalSubtitle: {
        fontSize: wp(4),
        color: '#666',
        marginTop: hp(0.5),
    },
    formScrollView: {
        padding: wp(4),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(5),
        minHeight: hp(30), // Garante altura mínima
    },
    loadingText: {
        marginTop: hp(2),
        fontSize: wp(4),
        color: '#555',
    },
    errorContainer: {
        padding: wp(4),
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: wp(4),
        marginBottom: hp(2),
    },
    subDeviceGroup: {
        marginBottom: hp(3),
        paddingBottom: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    subDeviceTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: hp(1.5),
        color: '#007AFF',
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
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: wp(4),
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    closeButton: {
        backgroundColor: '#f44336',
    },
    // Estilos do Modal de Ícones (mantidos)
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

