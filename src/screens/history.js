import React,{useEffect, useState} from "react";
import {View, TouchableOpacity, Text, ScrollView, StatusBar,} from 'react-native';
import md5 from "md5";
import { VictoryLabel, VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo, FontAwesome,EvilIcons } from "@expo/vector-icons";
import ModalCalendar from "../components/ModalCalendario";



export default function History(){

    const [dataday, setDataday] = useState([{ x: 0, y: 0 }]);
    const [datamonth, setDatamonth] = useState([{ x: 0, y: 0 }]);
    const [datayear, setDatayear] = useState([{ x: 0, y: 0 }]);
    const [value, setValue] = useState({ fan: '', Bedroom: '', livingRoom: '', name: '', escritorio: '', cozinha: '', edicula: '', host: '', auth: '', foxx: '', sn: '' });
    const [awaitToken, setAwaitToken] = useState(false); 
    const [statusModal, setStatusModal] = useState(false);

    const url = 'https://www.foxesscloud.com';
    const token = value.foxx;
    const sn = value.sn;
    const parametersGeneration = '/op/v0/device/generation';
    const parametershistory = '/op/v0/device/report/query';
    const parameterReal = '/op/v0/device/real/query';

    useEffect(()=>{
        loadStorage();
        
    },[])

    const loadStorage=async()=>{
        const dataDevices = await AsyncStorage.getItem('@smartHome:device')
        if(dataDevices != null || ''){
            const objeto = JSON.parse(dataDevices || '');
            setValue(objeto);
        }
 
    }

    const headers = async = (param) => {
        const timestamp = new Date().getTime();
        const signature = [param, token, timestamp].join('\\r\\n');
        const signatureMD5 = md5(signature);
        console.log(timestamp, signatureMD5);
        return {
            'Content-Type': 'application/json',
            'token': token,
            'timestamp': timestamp,
            'signature': signatureMD5,
            'lang': 'en',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
    }

    const filterHistorico=(dataString)=>{
        history('day', dataString)
        history('month', dataString)
        history('year', dataString)
    }

    const history = async (value, dataString) => {
        setStatusModal(false);
        const date = dataString;
        const day = date.getUTCDate(); 
        const month = date.getMonth() + 1; 
        const year = date.getFullYear(); 
        try {
            const response = await fetch(url + parametershistory, {
                method: 'POST',
                headers: headers(parametershistory),
                body: JSON.stringify({
                    "sn": sn,
                    "year": year,
                    "month": month,
                    "day": day,
                    "dimension": value,
                    "variables": ["generation"]
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const dataGrafic = data.result[0].values.map(value => parseFloat(value.toFixed(2)));
            console.log(data.result)
            if(value == 'day'){
                setDataday(dataGrafic.map((value, index) => ({ x: index + 1, y: value }))); 
            }
            if(value == 'month'){
                setDatamonth(dataGrafic.map((value, index) => ({ x: index + 1, y: value })));
            }
            if(value == 'year'){
                setDatayear(dataGrafic.map((value, index) => ({ x: index + 1, y: value })));
            }

        } catch (error) {
            console.error('There was a problem with the request:', error);
        }

    }

   

    if( value.foxx != '' && awaitToken == false){
        setAwaitToken(true);
        console.log(1)
        history('day', new Date())
        history('month', new Date())
        history('year', new Date())
        
    }

    return(
        <View style={{flex:1, backgroundColor:'rgb(47,93,180)'}}>
            <ModalCalendar status={statusModal} onDayPress={(item)=>filterHistorico(new Date(item.dateString))}/>
            <StatusBar backgroundColor={'rgb(47,93,180)'} barStyle="light-content" />
            <View style={{padding:20, height:wp(20), flexDirection:'row',backgroundColor:'rgb(47,93,180)', justifyContent:'space-between', alignItems:'center'}}>
                <Text numberOfLines={1} allowFontScaling={false} style={{fontSize:wp(6),fontWeight:'bold', color: 'white'}}>Rendimento</Text>
                <TouchableOpacity onPress={()=>setStatusModal(true)}>
                <FontAwesome name="calendar" size={wp(9)} color="white" />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{position:'relative'}}>
            <View style={{flex:1, backgroundColor:'white', marginBottom:10}}>
                <View style={{width:'100%', height:'10%', justifyContent:'center', alignItems:'center'}}>
                <Text numberOfLines={1} allowFontScaling={false} style={{fontWeight:'bold', color:'gray', top:wp(2), fontSize:wp(5)}}>Gerado no dia</Text>
                </View>
                <View style={{width:'100%', height:'90%'}}>
            <VictoryChart
                    theme={VictoryTheme.material}
                    maxDomain={{ x: dataday.length }}
                    domainPadding={10}
                    width={wp(100)}
                    height={wp(50)}
                >
                    <VictoryBar

                        data={dataday}
                        labels={({ datum }) => datum.y}
                        style={{ labels: { fill: "black", fontSize: 8 }, data: { fill: "#c43a31" } }}
                        labelComponent={<VictoryLabel dy={0} />}

                    />
                </VictoryChart>
                </View>
            </View>
            <View style={{flex:1,backgroundColor:'white',marginBottom:10}}>
                <View style={{width:'100%', height:'10%', justifyContent:'center', alignItems:'center'}}>
                <Text numberOfLines={1} allowFontScaling={false} style={{fontWeight:'bold', color:'gray', top:wp(2),fontSize:wp(5)}}>Gerado no mês</Text>
                </View>
                <View style={{width:'100%', height:'90%'}}>
            <VictoryChart
                    theme={VictoryTheme.material}
                    maxDomain={{ x: datamonth.length }}
                    domainPadding={10}
                    width={wp(100)}
                    height={wp(50)}
                >
                    <VictoryBar

                        data={datamonth}
                        labels={({ datum }) => datum.y}
                        style={{ labels: { fill: "black", fontSize: 8 }, data: { fill: "#c43a31" } }}
                        labelComponent={<VictoryLabel dy={0} />}

                    />
                </VictoryChart>
                </View>
            </View>
            <View style={{flex:1,backgroundColor:'white',marginBottom:10}}>
                <View style={{width:'100%', height:'10%', justifyContent:'center', alignItems:'center'}}>
                <Text numberOfLines={1} allowFontScaling={false} style={{fontWeight:'bold', color:'gray', top:wp(2), fontSize:wp(5)}}>Gerado no Ano</Text>
                </View>
                <View style={{width:'100%', height:'90%'}}>
            <VictoryChart
                    theme={VictoryTheme.material}
                    maxDomain={{ x: datayear.length }}
                    domainPadding={10}
                    width={wp(100)}
                    height={wp(50)}
                >
                    <VictoryBar

                        data={datayear}
                        labels={({ datum }) => datum.y}
                        style={{ labels: { fill: "black", fontSize: 8 }, data: { fill: "#c43a31" } }}
                        labelComponent={<VictoryLabel dy={0} />}

                    />
                </VictoryChart>
                </View>
            </View>
            </ScrollView>
        </View>
    )

}