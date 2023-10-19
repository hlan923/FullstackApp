import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LogInScreen from "./screens/LogInScreen";
import TabScreen from "./screens/TabScreen";
import SignUpScreen from "./screens/SignUpScreen";
import MembersRecipeScreen from "./screens/MembersRecipeScreen";
import MembersRecipeInfoScreen from "./screens/MembersRecipeInfoScreen";
import OnlineRecipeScreen from "./screens/OnlineRecipeScreen";
import OnlineRecipeInfoScreen from "./screens/OnlineRecipeInfoScreen";
import TDEEScreen from "./screens/TDEEScreen";
import MedicalHistoryScreen from "./screens/MedicalHistoryScreen";
import EditProfileScreen from "./screens/EditProfileScreen";

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
          name="Sign up"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TabScreen"
          component={TabScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Edit Profile" component={EditProfileScreen} />
        <Stack.Screen name="Calculate Calorie" component={TDEEScreen} />
        <Stack.Screen name="Medical History" component={MedicalHistoryScreen} />

        <Stack.Screen
          name="MembersRecipeScreen"
          component={MembersRecipeScreen}
        />
        <Stack.Screen
          name="MembersRecipeInfoScreen"
          component={MembersRecipeInfoScreen}
        />
        <Stack.Screen
          name="OnlineRecipeScreen"
          component={OnlineRecipeScreen}
        />
        <Stack.Screen
          name="OnlineRecipeInfoScreen"
          component={OnlineRecipeInfoScreen}
          options={{ headerTransparent: true, headerTitle: "" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
