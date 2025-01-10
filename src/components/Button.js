import { Text, StyleSheet, TouchableOpacity, View, Image, ToastAndroid } from 'react-native'
import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';

export default function Button({ title, slider, ico, width, height, sliderStatus, ip, ...rest }) {

    const [brilho, SetBrilho] = useState(0);
    const ipDivece = ip;

    const command = (value) => {
        try {
            if (value !== brilho) {
                SetBrilho(value);
                let url = `http://${ipDivece}/${value}`;
                let req = new XMLHttpRequest();
    
                req.open('GET', url);
                req.send();
    
                console.log(`Request sent to: ${url}`);
            }
        } catch (error) {
            console.error("Erro ao enviar o comando:", error.message);
            // Exibe uma mensagem para o usuário (exemplo para React Native)
            ToastAndroid.show("Erro ao enviar o comando!", ToastAndroid.SHORT);
        }
    };


    return (
        <TouchableOpacity {...rest} style={[styles.container, slider == 'red' ? { opacity: 0.7 } : { opacity: 1 }]}>
            <Image source={ico} style={{ width: width, height: height }} />

            {sliderStatus ?
                <View style={{ width: "100%", height: 29, justifyContent: 'center' }}>

                    <Slider
                        minimumValue={0}
                        maximumValue={10}
                        minimumTrackTintColor='rgb(47,93,180)'
                        maximumTrackTintColor='#cdcdcd'
                        thumbTintColor='rgb(47,93,180)'
                        //onSlidingStart={RGB1(corRgb)}
                        onValueChange={(valor) => command(valor.toFixed())}
                        value={brilho}
                    />

                </View>

                : <Text numberOfLines={1} allowFontScaling={false} style={styles.text}>

                    {title}
                </Text>}

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '80%',
        backgroundColor: 'white',
        margin: 10,
        padding: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 1.22,
        elevation: 2,

    },
    text: {
        fontSize: 21,
        color: '#868686',
        fontWeight: 'bold',
        bottom: '-8%'

    },
})