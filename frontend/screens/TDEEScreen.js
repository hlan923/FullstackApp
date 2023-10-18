import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  View,
  TextInput,
  Button,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const TDEEScreen = () => {
  const navigation = useNavigation();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [tdee, setTDEE] = useState("0");
  const [calorieCalculated, setCalorieCalculated] = useState(false);

  const calculateTDEE = () => {
    // Check if essential fields are empty
    if (
      weight === "" ||
      height === "" ||
      age === "" ||
      gender === "" ||
      activityLevel === "" ||
      goal === ""
    ) {
      alert("Please fill in all fields.");
    } else {
      let formulaResult = 0;
      if (gender === "male") {
        formulaResult =
          10 * parseFloat(weight) +
          6.25 * parseFloat(height) -
          5 * parseInt(age) +
          5;
      } else if (gender === "female") {
        formulaResult =
          10 * parseFloat(weight) +
          6.25 * parseFloat(height) -
          5 * parseInt(age) -
          161;
      }
      switch (activityLevel) {
        case "sedentary":
          formulaResult *= 1.2;
          break;
        case "lightly-active":
          formulaResult *= 1.375;
          break;
        case "moderately-active":
          formulaResult *= 1.55;
          break;
        case "very-active":
          formulaResult *= 1.725;
          break;
        case "extra-active":
          formulaResult *= 1.9;
          break;
        default:
          break;
      }

      switch (goal) {
        case "lose":
          formulaResult -= 500;
          break;
        case "gain":
          formulaResult += 500;
          break;
        default:
          break;
      }

      setTDEE(formulaResult.toFixed(2).toString());
      setCalorieCalculated(true);
      Keyboard.dismiss();
    }
  };

  return (
    <View style={style.container}>
      <TextInput
        style={style.input}
        value={weight}
        onChangeText={(text) => setWeight(text)}
        keyboardType="numeric"
        placeholder="Weight (in kilograms)"
      />
      <TextInput
        style={style.input}
        value={height}
        onChangeText={(text) => setHeight(text)}
        keyboardType="numeric"
        placeholder="Height (in centimeters)"
      />
      <TextInput
        style={style.input}
        value={age}
        onChangeText={(text) => setAge(text)}
        keyboardType="numeric"
        placeholder="Age"
      />
      <Text style={style.radioLabel}>Select your gender:</Text>
      <Button
        title="Male"
        onPress={() => setGender("male")}
        color={gender === "male" ? "orange" : "#0066cc"}
      />
      <Button
        title="Female"
        onPress={() => setGender("female")}
        color={gender === "female" ? "orange" : "#0066cc"}
      />
      <Text style={style.radioInput}>Select your activity level:</Text>
      <Button
        title="Sedentary"
        onPress={() => setActivityLevel("sedentary")}
        color={activityLevel === "sedentary" ? "orange" : "#0066cc"}
      />
      <Button
        title="Lightly Active"
        onPress={() => setActivityLevel("lightly-active")}
        color={activityLevel === "lightly-active" ? "orange" : "#0066cc"}
      />
      <Button
        title="Moderately Active"
        onPress={() => setActivityLevel("moderately-active")}
        color={activityLevel === "moderately-active" ? "orange" : "#0066cc"}
      />
      <Button
        title="Very Active"
        onPress={() => setActivityLevel("very-active")}
        color={activityLevel === "very-active" ? "orange" : "#0066cc"}
      />
      <Button
        title="Extra Active"
        onPress={() => setActivityLevel("extra-active")}
        color={activityLevel === "extra-active" ? "orange" : "#0066cc"}
      />
      <Text style={style.radioLabel}>Select your goal:</Text>
      <Button
        title="Lose Weight"
        onPress={() => setGoal("lose")}
        color={goal === "lose" ? "orange" : "#0066cc"}
      />
      <Button
        title="Maintain Weight"
        onPress={() => setGoal("maintain")}
        color={goal === "maintain" ? "orange" : "#0066cc"}
      />
      <Button
        title="Gain Weight"
        onPress={() => setGoal("gain")}
        color={goal === "gain" ? "orange" : "#0066cc"}
      />
      <Button title="Calculate calorie" onPress={calculateTDEE} />
      <Text style={style.result}> Your daily calorie intake is: {tdee}</Text>
      {calorieCalculated && (
        <Button
          title="Next"
          onPress={() => navigation.push("Medical History")}
        />
      )}
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
  button: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#0066cc",
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  radio: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
  radioLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  radioInput: {
    marginRight: 5,
  },
  result: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
});

export default TDEEScreen;
