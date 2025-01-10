import { View, Text, TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';





import * as Animatable from 'react-native-animatable';
import { useState } from 'react';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    status: string;
    statusModal:()=>void;
    comandos:string
}


export default function Header({ title, status,statusModal,comandos, ...rest }: ButtonProps) {

    const [modalActive, setModalAtive] = useState(false);
    const navigation = useNavigation();
 
    const navigatioScreen = (valor: any) => {
        navigation.navigate(valor)
    }

    const close=()=>{
        setModalAtive(false)
    }

    return (
        <View style={styles.header}>
           
            <TouchableOpacity style={{ width: 45, height: 35}}  >
                <Animatable.Text numberOfLines={1} allowFontScaling={false}  animation="slideInLeft" onPress={() => navigatioScreen('Home')}><AntDesign name="back" size={35} color="#868686"/></Animatable.Text>
            </TouchableOpacity>
            
            <Animatable.Text animation="slideInLeft"  style={styles.title}>{title}</Animatable.Text>
            <TouchableOpacity style={{ width: 30, height: 25}} onPress={()=>statusModal(true)}>
                <Animatable.Text numberOfLines={1} allowFontScaling={false} animation="slideInRight" delay={500} style={{ width: 40, height: 30}}>
                    <AntDesign name="pluscircleo" size={24} color={status} />
                    </Animatable.Text>
            </TouchableOpacity>
            
           

        </View>
    )
}
const styles = StyleSheet.create({
    header: {
        width: "100%",
        height: '12%',
        paddingTop: 10,
        padding: 20,
        backgroundColor: 'rgb(243,243,243)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'

    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        left: -80,
        color: '#868686'

    },
   
})