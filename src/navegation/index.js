import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/home';
import History from '../screens/history';
import Config from '../screens/config';
import LivingRom from '../screens/livingRoom';
import PratyArea from '../screens/partryArea';
import Bedroom from '../screens/bedroom';
import GamerRoom from '../screens/gamerRoom';
import Group from '../screens/group';


const Stack = createNativeStackNavigator();

export default function Navigation(){
    return(
        <NavigationContainer>
           <Stack.Navigator 
            initialRouteName='Login' 
            screenOptions={{
              headerShown: false,
              cardStyle: {
                opacity: ({ current }) => current.progress, // Ajuste conforme necessário
              },
            }}
           >
             <Stack.Screen name="Home" component={Home}/>
             <Stack.Screen name="History" component={History}/>
             <Stack.Screen name="Config" component={Config}/>
             <Stack.Screen name="Group" component={Group}/>
             <Stack.Screen name="LivingRoom" component={LivingRom}/>
             <Stack.Screen name="PratyArea" component={PratyArea}/>
             <Stack.Screen name="Bedroom" component={Bedroom}/>
             <Stack.Screen name="GamerRoom" component={GamerRoom}/>

           </Stack.Navigator>
        </NavigationContainer>
    )
}