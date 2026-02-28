import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  PanResponder
} from 'react-native';

const TOTAL_MINUTES = 1440;
const SCREEN_WIDTH = Dimensions.get('window').width - 40;
const BASE_URL = 'http://192.168.1.2:5000';

export default function ReportDetailsScreen({ navigation, route }) {

  const [timeline, setTimeline] = useState([]);
  const [goodPosture, setGoodPosture] = useState(100);
  const [badPosture, setBadPosture] = useState(0);

  // Ref за PanResponder
  const lastGestureTime = useRef(0);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          const now = Date.now();
          if (now - lastGestureTime.current > 500) {
            lastGestureTime.current = now;
            navigation.navigate('Angle');
          }
        }
      }
    })
  ).current;

  useEffect(() => {
    fetchTodayData();
  }, []);

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

  return (
    <View style={styles.wrapper} {...panResponder.panHandlers}>
      <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Daily Posture Report</Text>

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Timeline</Text>

        <View style={styles.timeline}>
          {timeline.map((entry, idx) => {
            const [h, m] = entry.time.split(':').map(Number);
            const totalMinutes = h * 60 + m;
            const left = (totalMinutes / TOTAL_MINUTES) * SCREEN_WIDTH;

            return (
              <View
                key={idx}
                style={{
                  position: 'absolute',
                  left: left,
                  width: 2,
                  height: '100%',
                  backgroundColor: '#ff3b30'
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

      {/* Daily posture percentage */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Posture Percentage</Text>

        <View style={styles.progressBar}>
          <View style={[styles.goodBar, { width: `${goodPosture}%` }]}>
            <Text style={styles.barText}>{goodPosture.toFixed(1)}%</Text>
          </View>
          <View style={[styles.badBar, { width: `${badPosture}%` }]}>
            <Text style={styles.barText}>{badPosture.toFixed(1)}%</Text>
          </View>
        </View>
      </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  wrapper: { flex: 1, backgroundColor: '#f7f8fa' },

  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#f7f8fa',
    flexGrow: 1
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 30,
    textAlign: 'center'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 5
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },

  timeline: {
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    overflow: 'hidden'
  },

  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },

  timeLabel: {
    fontWeight: '700',
    color: '#555'
  },

  progressBar: {
    flexDirection: 'row',
    height: 36,
    borderRadius: 12,
    overflow: 'hidden'
  },

  goodBar: {
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center'
  },

  badBar: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center'
  },

  barText: {
    color: '#fff',
    fontWeight: '700'
  }

});