import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LogInScreen from "./screens/LogInScreen";
import TabScreen from "./screens/TabScreen";
import SignUpScreen from "./screens/SignUpScreen";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogInScreen">
        <Stack.Screen name="LogInScreen" component={LogInScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="TabScreen" component={TabScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
