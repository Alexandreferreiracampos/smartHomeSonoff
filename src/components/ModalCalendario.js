import { Text, StyleSheet, TouchableOpacity, View, Modal } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars';



export default function ModalCalendar({status, onDayPress,onMonthChange,  ...rest }) {


    LocaleConfig.locales.pt = {
        monthNames: [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro"
        ],
        monthNamesShort: [
            "Jan.",
            "Fev.",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul.",
            "Ago",
            "Set.",
            "Out.",
            "Nov.",
            "Dez."
        ],
        dayNames: [
            "Domingo",
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado"
        ],
        dayNamesShort: ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."]
    };

    LocaleConfig.defaultLocale = "pt";

    return (
        <Modal
        animationType='slide'
        transparent={true}
        statusBarTranslucent={true}
        visible={status}
        onPress={() => closed()}
    >
        <View activeOpacity={1} style={styles.outerView}>
            <View style={{width:'80%',backgroundColor:'white', borderRadius:10, padding:10}}>
            <Calendar
                //markedDates={markedDates2}
                //minDate={dataMinima}
                onDayPress={onDayPress}
                onMonthChange={onMonthChange}
                style={[styles.shadow, { borderRadius: 10 }]}
                theme={
                    {
                        calendarBackground: 'white', // Cor de fundo do calendário
                        textSectionTitleColor: '#00BCD4', // Cor dos dias da semana
                        selectedDayBackgroundColor: '#00BCD4', // Cor de fundo do dia selecionado
                        selectedDayTextColor: 'white', // Cor do texto do dia selecionado
                        todayTextColor: '#00BCD4', // Cor do texto do dia atual
                        dayTextColor: 'gray', // Cor dos dias
                        monthTextColor: '#00BCD4',
                        textDisabledColor: 'gray', // Cor do texto dos dias desabilitados
                        arrowColor: '#00BCD4'
                    }
                }
            />

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
        backgroundColor: 'rgba(0,0,0,0.4)',
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
   
})