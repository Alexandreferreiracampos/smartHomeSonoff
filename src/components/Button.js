import { Text, StyleSheet, TouchableOpacity, View, Image, ToastAndroid } from 'react-native'
import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';

export default function Button({ title, slider, ico, width, height, sliderStatus, ip, ...rest }) {

    const [brilho, SetBrilho] = useState(0);
    const [corPoint, setCorPoint] = useState("black")
    const ipDivece = ip;

    const commandRGB = (value) => {

        setCorPoint(hueToRGBString(value))
        try {
            if (value !== brilho) {
                SetBrilho(value);
                let url = `http://${ipDivece}/${'?m=1&h0=' + value}`;
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

    const commandBrilho = (value) => {
        try {
            if (value !== brilho) {
                SetBrilho(value);
                let url = `http://${ipDivece}/${'?m=1&d0=' + value}`;
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

    const commandWhite = (value) => {
        try {
            if (value !== brilho) {
                SetBrilho(value);
                let url = `http://${ipDivece}/${'?m=1&n0=' + value}`;
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



    function hueToRGBString(hue) {
        const h = hue % 360;
        const s = 1;
        const v = 1;

        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;

        let r = 0, g = 0, b = 0;

        if (h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (h < 180) {
            [r, g, b] = [0, c, x];
        } else if (h < 240) {
            [r, g, b] = [0, x, c];
        } else if (h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `rgb(${r}, ${g}, ${b})`;
    }



    return (
        <TouchableOpacity {...rest} style={[styles.container, slider == 'red' ? { opacity: 0.7 } : { opacity: 1 }]}>
            {!sliderStatus ?
                <Image source={ico} style={{ width: !sliderStatus ? width : 50, height: !sliderStatus ? height : 55 }} />
                :
                <View style={{ width: !sliderStatus ? width : 50, height: !sliderStatus ? height : 26 }}>

                    <Text numberOfLines={1} allowFontScaling={false} style={[styles.text, {color:corPoint}]}>
                        {title}
                    </Text>

                </View>

            }


            {sliderStatus ?
                <View style={{ width: "100%", flexDirection: 'column', justifyContent: 'space-between' }}>
                    <View style={{ width: "100%", height: 29 }}>

                        <Slider
                            minimumValue={0}
                            maximumValue={359}
                            minimumTrackTintColor={corPoint}
                            maximumTrackTintColor={corPoint}
                            thumbTintColor='White'
                            //onSlidingStart={RGB1(corRgb)}
                            onValueChange={(valor) => commandRGB(valor.toFixed())}
                            value={brilho}
                        />


                    </View>

                    <View style={{ width: "100%", height: 29 }}>

                        <Slider
                            minimumValue={0}
                            maximumValue={100}
                            minimumTrackTintColor='rgb(238, 233, 238)'
                            maximumTrackTintColor='#cdcdcd'
                            thumbTintColor='rgb(47,93,180)'
                            //onSlidingStart={RGB1(corRgb)}
                            onValueChange={(valor) => commandBrilho(valor.toFixed())}
                            value={brilho}
                        />


                    </View>
                    <View style={{ width: "100%", height: 29 }}>

                        <Slider
                            minimumValue={0}
                            maximumValue={100}
                            minimumTrackTintColor='rgb(238, 233, 238)'
                            maximumTrackTintColor='#cdcdcd'
                            thumbTintColor='rgb(47,93,180)'
                            //onSlidingStart={RGB1(corRgb)}
                            onValueChange={(valor) => commandWhite(valor.toFixed())}
                            value={brilho}
                        />


                    </View>

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