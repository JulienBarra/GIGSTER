import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect } from "react";
import { FRONT_IP } from "../hide-ip";

//changer la ligne dans le tab navigator pour aller sur
//      <Tab.Screen name="Add" component={StatusScreen} />

export default function DiyTourScreen() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);



  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentPosition(location.coords);
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });

        Location.watchPositionAsync({ distanceInterval: 10 }, (location) => {
          setCurrentPosition(location.coords);
        });
      }
    })();
  }, []);

  if (!mapRegion) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  fetch(`http://${FRONT_IP}:3000/users/all`)
    .then(response => response.json())
    .then(data => {
      console.log("RETOUR DE TOUT LES USER:", data)
      const host = data.filter()

    })



  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}

        initialRegion={{
          latitude: mapRegion.latitude,
          longitude: mapRegion.longitude,
          latitudeDelta: mapRegion.latitudeDelta,
          longitudeDelta: mapRegion.longitudeDelta,
        }}
      >
        {currentPosition && (
          <Marker coordinate={currentPosition} title="Me!" pinColor="#fecb2d" />
        )}
      </MapView>

      <View style={styles.topContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={'Search'}
          placeholderTextColor={'#666'}
        />

        <TouchableOpacity style={styles.btnSearch}>
          <Text style={styles.textSearch}>
            Go
          </Text>
        </TouchableOpacity>
      </View>




      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Mon Parcours</Text>
        <ScrollView style={styles.roadmap} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.date}>
            <Text>HELLO</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center,'
  },
  loading: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  topContainer: {
    position: 'absolute',
    top: 40,
    width: '70%',
    marginLeft: '15%',
    marginRight: '15%',
    height: 50,
    borderColor: 'black',
    borderWidth: 1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 13,
    margin: 10,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',

  },
  textInput: {
    color: '#000',
    height: 45,
    width: '40%',
    paddingHorizontal: 10,
    fontSize: 16,
    color: 'black'
  },
  btnSearch: {
    backgroundColor: '#5100FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 100,
    width: '89%',
    height: '25%',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    marginLeft: '5.5%',
    borderRadius: 13,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderRightWidth: 4,



  },
  title: {
    width: '50%',
    textAlign: 'center',
    fontFamily: 'Helvetica',
    fontSize: 25,
    marginBottom: 10,
  },
  roadmap: {
    backgroundColor: 'white',
    width: '90%',


  },
  textSearch: {
    color: 'white',
    fontWeight: 'bold',
  },
  date: {
    width: '90%',
    height: 40,
    borderColor: '#5100FF',
    borderWidth: 1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 10,
    justifyContent: 'center',
    padding: 5,


  }

});