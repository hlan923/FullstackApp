import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LogInScreen from "./screens/LogInScreen";
import TabScreen from "./screens/TabScreen";
import SignUpScreen from "./screens/SignUpScreen";
import MembersRecipeScreen from "./screens/MembersRecipeScreen";
import MembersRecipeInfoScreen from "./screens/MembersRecipeInfoScreen";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogInScreen">
        <Stack.Screen
          name="LogInScreen"
          component={LogInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TabScreen"
          component={TabScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MembersRecipeScreen" 
          component={MembersRecipeScreen}
        />
        <Stack.Screen 
          name="MembersRecipeInfoScreen" 
          component={MembersRecipeInfoScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
