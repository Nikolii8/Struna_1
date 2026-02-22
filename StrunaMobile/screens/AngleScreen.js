import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
  Image,
  PanResponder
} from 'react-native';

const TOTAL_MINUTES = 1440;
const SCREEN_WIDTH = Dimensions.get('window').width - 40;
const BAD_ANGLE_THRESHOLD = 100;
const BASE_URL = 'http://192.168.1.22:5000';

export default function ReportScreen({ navigation, route }) {

  const userId = route?.params?.userId;

  const [currentAngle, setCurrentAngle] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [goodPosture, setGoodPosture] = useState(100);
  const [badPosture, setBadPosture] = useState(0);
  const [profilePic, setProfilePic] = useState(`${BASE_URL}/uploads/avatar.png`);

  // Ref за PanResponder
  const lastGestureTime = useRef(0);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50) {
          const now = Date.now();
          if (now - lastGestureTime.current > 500) {
            lastGestureTime.current = now;
            navigation.navigate('TimeLine');
          }
        }
      }
    })
  ).current;

  useEffect(() => {
    fetchTodayData();

    if (userId) {
      fetchUserProfile();
    }

    const interval = setInterval(fetchCurrentAngle, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  // ---------------- CURRENT ANGLE ----------------
  const fetchCurrentAngle = async () => {
    try {
      const res = await fetch(`${BASE_URL}/current-angle`);
      const data = await res.json();

      if (data.angle !== undefined) {
        setCurrentAngle(data.angle);

        if (data.angle > BAD_ANGLE_THRESHOLD) {
          Alert.alert(
            'Warning',
            `Poor posture detected!\nAngle: ${data.angle.toFixed(2)}°`
          );
        }
      }
    } catch (err) {
      console.log('Angle error:', err);
    }
  };

  // ---------------- TODAY DATA ----------------
  const fetchTodayData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/today-data`);
      const data = await res.json();

      const badEntries = data.timeline.filter(entry => entry.slouched);
      setTimeline(badEntries);

      setGoodPosture(data.good_posture);
      setBadPosture(data.bad_posture);
    } catch (err) {
      console.log('Today error:', err);
    }
  };

  // ---------------- USER PROFILE ----------------
  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/${userId}`);

      if (!res.ok) {
        console.log("User fetch failed:", res.status);
        return;
      }

      const data = await res.json();

      if (data.profile_pic && data.profile_pic !== "avatar.png") {
        setProfilePic(`${BASE_URL}/uploads/${data.profile_pic}`);
      } else {
        setProfilePic(`${BASE_URL}/uploads/avatar.png`);
      }

    } catch (err) {
      console.log('Profile fetch error:', err);
    }
  };

  const goToProfile = () => {
    navigation.navigate('Profile', { userId });
  };

  return (
    <View style={styles.wrapper} {...panResponder.panHandlers}>

      {/* PROFILE BUTTON */}
      <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
        <Image source={{ uri: profilePic }} style={styles.profileIcon} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Current Posture</Text>

        {/* Current angle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Spine Angle</Text>
          <Text
            style={[
              styles.angle,
              { color: currentAngle > BAD_ANGLE_THRESHOLD ? '#ff3b30' : '#2ecc71' }
            ]}
          >
            {currentAngle.toFixed(2)}°
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f7f7f7' },

  profileButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10
  },

  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25
  },

  container: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 40
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 30,
    textAlign: 'center'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 4
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },

  angle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center'
  }
});
