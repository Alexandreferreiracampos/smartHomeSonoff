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
const SubDeviceInputGroup2 = ({ output, onInputChange, onCheckboxChange, onIconPress }) => {
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

const SubDeviceInputGroup = ({ output, onOutputChange, onCheckboxChange }) => (
    <View style={styles.subDeviceGroup}>
        <Text style={styles.subDeviceTitle}>Power {output.index}</Text>
        <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nome:</Text>
            <TextInput
                style={styles.textInput}
                value={output.name}
                onChangeText={(value) => onOutputChange(output.index, 'name', value)}
                placeholder={`Nome para Power ${output.index}`}
            />
        </View>
        <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Comando:</Text>
            <TextInput
                style={styles.textInput}
                value={output.command}
                onChangeText={(value) => onOutputChange(output.index, 'command', value)}
                placeholder={`Comando para Power ${output.index}`}
            />
        </View>
        <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Tipo de Controle:</Text>
            <View style={styles.controlTypeContainer}>
                <TouchableOpacity
                    style={[
                        styles.controlTypeOption,
                        !output.isSlider && styles.controlTypeOptionSelected
                    ]}
                    onPress={() => onCheckboxChange(output.index, 'button')}
                >
                    <Text style={styles.controlTypeText}>Botão</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.controlTypeOption,
                        output.isSlider && styles.controlTypeOptionSelected
                    ]}
                    onPress={() => onCheckboxChange(output.index, 'slider')}
                >
                    <Text style={styles.controlTypeText}>Slider</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.inputRow}>
        <Text style={styles.label}>Ícone</Text>
            <TouchableOpacity
                style={[styles.inputText, styles.iconPickerButton]}
                onPress={() => onIconPress(output.index)}
            >
                <Text style={styles.iconPickerText}>Escolher Ícone</Text>
                {output.icon?.image && <Image source={output.icon.image} style={styles.selectedIconImage} />}
            </TouchableOpacity>
            </View>

    </View>
);

// --- Estilos --- (Mantidos como no arquivo anterior)
const styles = StyleSheet.create({
    outerView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: wp('90%'),
        maxHeight: hp('80%'),
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
    },
    modalHeader: {
        padding: 15,
        backgroundColor: '#007AFF',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#e0e0e0',
        marginTop: 5,
    },
    formScrollView: {
        padding: 15,
    },
    primaryDeviceSection: {
        marginBottom: 20,
    },
    powerOutputsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    inputLabel: {
        width: wp('25%'),
        fontSize: 14,
        color: '#555',
    },
    textInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    iconSelector: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    selectedIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    iconSelectorText: {
        color: '#555',
    },
    subDeviceGroup: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    subDeviceTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#444',
    },
    controlTypeContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    controlTypeOption: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 5,
        borderRadius: 5,
    },
    controlTypeOptionSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    controlTypeText: {
        fontSize: 14,
        color: '#555',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
    },
    cancelButtonText: {
        color: '#555',
        fontWeight: 'bold',
    },
    saveButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#007AFF',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    iconModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconModalContainer: {
        width: wp('80%'),
        maxHeight: hp('70%'),
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
    },
    iconModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    iconItem: {
        width: wp('18%'),
        aspectRatio: 1,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconImage: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    iconText: {
        fontSize: 12,
        textAlign: 'center',
    },
    closeIconModalButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f2f2f2',
        borderRadius: 5,
        alignItems: 'center',
    },
    closeIconModalButtonText: {
        color: '#555',
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#555',
    },
    errorContainer: {
        padding: 15,
    },
    errorText: {
        color: '#d32f2f',
        marginBottom: 15,
    },
    rgbInfoContainer: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    rgbInfoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    rgbInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    rgbIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    rgbInfoText: {
        fontSize: 13,
        color: '#555',
    },
});
