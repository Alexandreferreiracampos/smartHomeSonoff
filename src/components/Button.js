import { Text, StyleSheet, TouchableOpacity, View, Image } from 'react-native'



export default function Button({ title, status, ico, width, height,  ...rest }) {
    return (
        <TouchableOpacity {...rest} style={[styles.container, status == 'red'? {opacity:0.7} : {opacity:1}]}>
            <Image source={ico} style={{ width: width , height: height}} />
            <Text numberOfLines={1} allowFontScaling={false}  style={styles.text}>

                {title}
            </Text>
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
        bottom:'-8%'
     
    },
})