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
  Animated
} from 'react-native';

const TOTAL_MINUTES = 1440;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BAD_ANGLE_THRESHOLD = 100;
const BASE_URL = 'http://172.20.10.2:5000';

export default function PostureCarousel({ navigation, route }) {
  const userId = route?.params?.userId;

  const [currentAngle, setCurrentAngle] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [goodPosture, setGoodPosture] = useState(100);
  const [badPosture, setBadPosture] = useState(0);
  const [profilePic, setProfilePic] = useState(`${BASE_URL}/uploads/avatar.png`);
  const [scrollIndex, setScrollIndex] = useState(0);

  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTodayData();
    if (userId) {
      fetchUserProfile();
    }

    // Switch angles every 1 second
    const angleInterval = setInterval(fetchCurrentAngle, 1000);

    // Refresh daily data every 10 seconds (for demo purposes, in real app this could be every hour or so)
    const dailyInterval = setInterval(fetchTodayData, 10000);

    return () => {
      clearInterval(angleInterval);
      clearInterval(dailyInterval);
    };
  }, [userId]);

  const fetchCurrentAngle = async () => {
    try {
      const res = await fetch(`${BASE_URL}/current-angle`);
      const data = await res.json();

      if (data.angle !== undefined) {
        setCurrentAngle(data.angle);

        Animated.timing(rotationAnim, {
          toValue: data.angle,
          duration: 500,
          useNativeDriver: false
        }).start();

        if (data.angle > BAD_ANGLE_THRESHOLD) {
          Alert.alert(
            '⚠️ Warning',
            `Poor posture detected!\nAngle: ${data.angle.toFixed(2)}°\n\nStraighten up! 📊`
          );
        }
      }
    } catch (err) {
      console.log('Angle error:', err);
    }
  };

  const fetchTodayData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/today-data`);
      const data = await res.json();

      const allEntries = data.timeline || [];
      setTimeline(allEntries);

      let goodTime = 0;
      let badTime = 0;

      allEntries.forEach(entry => {
        if (entry.slouched) {
          badTime += 1;
        } else {
          goodTime += 1;
        }
      });

      const totalTime = goodTime + badTime || 1;
      const goodPercentage = (goodTime / totalTime) * 100;
      const badPercentage = (badTime / totalTime) * 100;

      setGoodPosture(goodPercentage);
      setBadPosture(badPercentage);
    } catch (err) {
      console.log('Today error:', err);
    }
  };

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

  const goToHome = () => {
    navigation.navigate('Home');
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setScrollIndex(index);
    scrollX.setValue(offsetX);
  };

  return (
    <View style={styles.container}>
      {/* PROFILE BUTTON IN HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
          <Image source={{ uri: profilePic }} style={styles.profileIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Struna</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* HORIZONTAL SCROLL VIEW */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        style={styles.scrollView}
      >
        {/* ANGLE SCREEN */}
        <View style={[styles.screen, { width: SCREEN_WIDTH }]}>
          <View style={styles.screenGradient}>
            <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
              <View style={styles.angleHeader}>
                <Text style={styles.angleTitle}>Your Posture</Text>
                <Text style={styles.angleSubtitle}>Right Now</Text>
              </View>

              <View style={styles.largeCard}>
                <View style={styles.angleCircleContainer}>
                  <Animated.View 
                    style={[
                      styles.angleCircleGradient,
                      {
                        backgroundColor: currentAngle > BAD_ANGLE_THRESHOLD ? '#ff3b30' : '#33ce7d',
                        transform: [{
                          rotate: Animated.divide(currentAngle, 100).interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                          })
                        }]
                      }
                    ]}
                  />
                  <View style={styles.angleCircleContent}>
                    <Text style={styles.largeAngle}>
                      {currentAngle.toFixed(1)}°
                    </Text>
                  </View>
                </View>
                <Text style={[styles.angleStatus, {
                  color: currentAngle > BAD_ANGLE_THRESHOLD ? '#ff3b30' : '#33ce7d'
                }]}>
                  {currentAngle > BAD_ANGLE_THRESHOLD ? '⚠ Poor Posture' : '✓ Good Posture'}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={[styles.infoValue, {
                    color: currentAngle > BAD_ANGLE_THRESHOLD ? '#ff3b30' : '#33ce7d'
                  }]}>
                    {currentAngle > BAD_ANGLE_THRESHOLD ? 'Slouching' : 'Excellent'}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Recommendation</Text>
                  <Text style={styles.infoValue}>
                    {currentAngle > BAD_ANGLE_THRESHOLD ? 'Straighten up!' : 'Keep it up!'}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* TIMELINE SCREEN */}
        <View style={[styles.screen, { width: SCREEN_WIDTH }]}>
          <View style={styles.screenGradient}>
            <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
              <View style={styles.angleHeader}>
                <Text style={styles.angleTitle}>Daily Report</Text>
                <Text style={styles.angleSubtitle}>Today's Progress</Text>
              </View>

              <View style={styles.largeCard}>
                <Text style={styles.timelineTitle}>Timeline of Posture</Text>

                <View style={styles.timeline}>
                  {/* BACKGROUND BARS */}
                  {timeline.map((entry, idx) => {
                    const [h, m] = entry.time.split(':').map(Number);
                    const totalMinutes = h * 60 + m;
                    const left = (totalMinutes / TOTAL_MINUTES) * (SCREEN_WIDTH - 80);
                    const width = (SCREEN_WIDTH - 80) / timeline.length;

                    return (
                      <View
                        key={`bg-${idx}`}
                        style={{
                          position: 'absolute',
                          left: left,
                          width: width,
                          height: '100%',
                          backgroundColor: entry.slouched ? '#ffe0e0' : '#e0ffe8',
                          opacity: 0.6
                        }}
                      />
                    );
                  })}

                  {/* RED MARKS */}
                  {timeline.map((entry, idx) => {
                    const [h, m] = entry.time.split(':').map(Number);
                    const totalMinutes = h * 60 + m;
                    const left = (totalMinutes / TOTAL_MINUTES) * (SCREEN_WIDTH - 80);

                    if (!entry.slouched) return null;

                    return (
                      <View
                        key={idx}
                        style={{
                          position: 'absolute',
                          left: left,
                          width: 3,
                          height: '100%',
                          backgroundColor: '#ff3b30',
                          borderRadius: 1.5
                        }}
                      />
                    );
                  })}
                </View>

                <View style={styles.timeLabels}>
                  <Text style={styles.timeLabel}>00:00</Text>
                  <Text style={styles.timeLabel}>24:00</Text>
                </View>
              </View>

              <View style={styles.largeCard}>
                <Text style={styles.timelineTitle}>Daily Statistics</Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressRow}>
                    <View style={styles.progressLabelContainer}>
                      <View style={[styles.progressIndicator, { backgroundColor: '#33ce7d' }]} />
                      <Text style={styles.progressLabel}>Good</Text>
                    </View>
                    <Text style={styles.progressPercentage}>{goodPosture.toFixed(1)}%</Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View style={[styles.goodBar, { width: `${goodPosture}%` }]} />
                    <View style={[styles.badBar, { width: `${badPosture}%` }]} />
                  </View>

                  <View style={styles.progressRow}>
                    <View style={styles.progressLabelContainer}>
                      <View style={[styles.progressIndicator, { backgroundColor: '#ff3b30' }]} />
                      <Text style={styles.progressLabel}>Bad</Text>
                    </View>
                    <Text style={styles.progressPercentage}>{badPosture.toFixed(1)}%</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION MENU */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={goToHome}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Angle', { userId })}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Posture</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={goToProfile}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc'
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#33ce7d',
    letterSpacing: -0.5
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden'
  },

  profileIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 20
  },

  scrollView: {
    flex: 1
  },

  screen: {
    flex: 1,
    backgroundColor: '#fafbfc'
  },

  screenGradient: {
    flex: 1,
    backgroundColor: '#fafbfc'
  },

  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 120
  },

  angleHeader: {
    marginBottom: 40,
    alignItems: 'center'
  },

  angleTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0a0a0a',
    marginBottom: 8,
    letterSpacing: -0.5
  },

  angleSubtitle: {
    fontSize: 17,
    color: '#33ce7d',
    fontWeight: '600'
  },

  largeCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12
  },

  angleCircleContainer: {
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
    height: 220,
    justifyContent: 'center'
  },

  angleCircleGradient: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8
  },

  angleCircleContent: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 10
  },

  largeAngle: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff'
  },

  angleStatus: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 15
  },

  infoCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#33ce7d'
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },

  infoLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600'
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333'
  },

  infoDivider: {
    height: 1,
    backgroundColor: '#e0e0e0'
  },

  timelineTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a0a0a',
    marginBottom: 20
  },

  timeline: {
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#efefef'
  },

  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  timeLabel: {
    fontWeight: '700',
    color: '#666',
    fontSize: 12
  },

  progressContainer: {
    gap: 20
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },

  progressIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },

  progressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333'
  },

  progressPercentage: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0a0a0a'
  },

  progressBar: {
    height: 12,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#efefef',
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },

  goodBar: {
    backgroundColor: '#33ce7d',
    borderRadius: 8
  },

  badBar: {
    backgroundColor: '#ff3b30',
    borderRadius: 8
  },

  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    paddingBottom: 24
  },

  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12
  },

  navIcon: {
    fontSize: 32,
    marginBottom: 8
  },

  navLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    letterSpacing: -0.2
  }
});
