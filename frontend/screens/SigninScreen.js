import * as React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import styles, { colors, sizes } from "../styles/style";
import SigninScreenStyle from "../styles/components/SigninScreenStyle";
import { useNavigation } from "@react-navigation/native";
import InputWithEye from "../components/InputWithEye";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

import * as WebBrowser from 'expo-web-browser'
WebBrowser.maybeCompleteAuthSession();
import * as Google from 'expo-auth-session/providers/google'

const GOOGLE_ANDROID_CLIENT_ID = "308302070658-jfv4i7e2ibs2ks2n5dmdlp8h5qp4ln5c.apps.googleusercontent.com"
const WEB_CLIENT_ID = "308302070658-95rdvd7ldo3bi9vee4ehlom7rqeqil5a.apps.googleusercontent.com"

export default function SigninScreen({ updateActiveScreen }) {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [loading, setLoading] = useState(0);






  const [userInfo, setUserInfo] = useState('')

  /******************** Google SignIn *********************/
  const [request, response, promptAsync] = Google.useAuthRequest({
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      webClientId: WEB_CLIENT_ID,
  })

  useEffect(() => {
      handleSignInWithGoogle();
  }, [response])

  const handleSignInWithGoogle = async () => {
      if (response?.type === "success") {
          await getUserInfo(response.authentication.accessToken);
      }
  }

  const getUserInfo = async (token) => {
      try {
          const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
              headers: { Authorization: `Bearer ${token}` }
          })

          const user = await response.json();
          await AsyncStorage.setItem('@user', JSON.stringify(user))
          console.log(user)
          setUserInfo(user)
      } catch (e) {
          console.log(e)
      }
  }





























  useEffect(() => {
    const checkToken = async () => {
      token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.navigate("MyTabs");
      }
    };
    checkToken();
  });

  const handleSignin = async () => {
    try {
      const response = await axios.post(
        "http://192.168.221.234:5000/api/user/signin",
        {
          email,
          password,
        }
      );

   
      await AsyncStorage.setItem("token", response.data.token);
      navigation.navigate("MyTabs");

    } catch (error) {
      setLoading(1);
    
      if (error.status == 400) {
        setError("Sorry, looks like that’s the wrong email or password.");
      }
      else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <View style={[styles.container]}>
      <View
        style={[
          SigninScreenStyle.input__section,
          { borderColor: "purple", paddingTop: 20 },
        ]}
      >
        <Text>{JSON.stringify(userInfo)}</Text>
        <TextInput
          style={[styles.input__box]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <InputWithEye
          value={password}
          onChangeText={setPassword}
          placeholder={"Password"}
        ></InputWithEye>
        {loading ? <Text style={SigninScreenStyle.error}>{error}</Text> : null}
        <TouchableOpacity onPress={() => navigation.navigate("ForgetPassword")}>
          <Text style={[styles.orangeText, SigninScreenStyle.forgetPassword]}>
            Forget Password?
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[SigninScreenStyle.button__section]}>
        <TouchableOpacity style={styles.button} onPress={handleSignin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <View style={SigninScreenStyle.line__section}>
          <View style={SigninScreenStyle.line} />
          <Text style={{ fontSize: sizes.size_xl, fontWeight: "bold" }}>
            Or login with
          </Text>
          <View style={SigninScreenStyle.line} />
        </View>
        <View style={SigninScreenStyle.button__box}>
          <TouchableOpacity style={SigninScreenStyle.button}>
            <Image
              source={require("../assets/images/facebook-logo.png")}
              style={SigninScreenStyle.logo}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={SigninScreenStyle.button}
           
            onPress={() => { promptAsync() }}
          >
            <Image
              source={require("../assets/images/google-logo.png")}
              style={SigninScreenStyle.logo}
            />
          </TouchableOpacity>
          <TouchableOpacity style={SigninScreenStyle.button}>
            <Image
              source={require("../assets/images/apple-logo.png")}
              style={SigninScreenStyle.logo}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={SigninScreenStyle.footer__section}>
        <Text style={{ fontSize: sizes.size_base, fontWeight: "bold" }}>
          if you don't have an account.
        </Text>
        <TouchableOpacity onPress={() => updateActiveScreen("signup")}>
          <Text
            style={[
              styles.orangeText,
              { fontSize: sizes.size_base, fontWeight: "bold" },
            ]}
          >
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
