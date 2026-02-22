import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions
} from 'react-native';

import TeamMember from '../components/TeamMember';
import strunaLogo from '../assets/HomePage/struna-logo.png';

const { height } = Dimensions.get('window');

export default function AboutScreen({ navigation }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { text: 'Home', route: 'Home' },
    { text: 'Contact Us', route: 'Contact' },
    { text: 'Sign Up', route: 'Signup' },
    { text: 'Log In', route: 'Login' }
  ];

  const menuAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    menuAnims.forEach(anim => anim.setValue(0));

    if (!menuOpen) {
      Animated.stagger(
        80,
        menuAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          })
        )
      ).start();
    }
  };

  const navigateAndClose = (route) => {
    navigation.navigate(route);
    setMenuOpen(false);
  };

  /* ===== SMOOTH REVEAL ===== */
  const getScrollAnimStyle = (start, end, distance = 35) => ({
    opacity: scrollY.interpolate({
      inputRange: [start, end],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    }),
    transform: [{
      translateY: scrollY.interpolate({
        inputRange: [start, end],
        outputRange: [distance, 0],
        extrapolate: 'clamp'
      })
    }]
  });

  /* ===== HEADER FADE ===== */
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.92],
    extrapolate: 'clamp'
  });

  /* ===== SCROLL PROGRESS ===== */
  const progressScale = scrollY.interpolate({
    inputRange: [0, height * 2],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f8fa' }}>

      {/* Progress Bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            transform: [{ scaleX: progressScale }]
          }
        ]}
      />

      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Image source={strunaLogo} style={styles.logo} />
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* DROPDOWN */}
      {menuOpen && (
        <View style={styles.dropdown}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: menuAnims[index],
                transform: [{
                  translateY: menuAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0]
                  })
                }]
              }}
            >
              <TouchableOpacity onPress={() => navigateAndClose(item.route)}>
                <Text style={styles.menuItem}>{item.text}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
          <View style={styles.divider} />
        </View>
      )}

      <Animated.ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >

        {/* HERO */}
        <Animated.View
          style={[
            styles.hero,
            {
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [-150, 0, 150],
                  outputRange: [-30, 0, 30],
                  extrapolate: 'clamp'
                })
              }]
            }
          ]}
        >
          <Text style={styles.heroTitle}>About Struna</Text>
          <Text style={styles.heroText}>
            We build smart wearable technology that helps people maintain healthy posture effortlessly,
            improving long-term wellbeing through innovation and thoughtful design.
          </Text>
        </Animated.View>

        {/* Cards */}
        <View style={styles.cardsSection}>
          <View style={styles.card}>
            <Image source={require('../assets/AboutUsPage/mision.jpg')} style={styles.cardImage} />
            <Text style={styles.cardTitle}>Our Mission</Text>
            <Text style={styles.cardText}>
              Deliver real-time posture feedback that empowers users to improve their daily health habits.
            </Text>
          </View>
        </View>

        <Animated.View style={[styles.cardsSection, getScrollAnimStyle(100, 300)]}>
          <View style={styles.card}>
            <Image source={require('../assets/AboutUsPage/goodposture.jpg')} style={styles.cardImage} />
            <Text style={styles.cardTitle}>Our Vision</Text>
            <Text style={styles.cardText}>
              A world where maintaining good posture feels natural and seamless.
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.cardsSection, getScrollAnimStyle(300, 500)]}>
          <View style={styles.card}>
            <Image source={require('../assets/AboutUsPage/inovation.png')} style={styles.cardImage} />
            <Text style={styles.cardTitle}>Our Values</Text>
            <Text style={styles.cardText}>
              Innovation, comfort and long-term health.
            </Text>
          </View>
        </Animated.View>

        {/* TEAM */}
        <Animated.View style={[styles.team, getScrollAnimStyle(500, 650)]}>
          <Text style={styles.teamTitle}>Meet the Team</Text>

          <View style={styles.teamGrid}>
            {[
              { name: "Didi", role: "Founder", image: require('../assets/AboutUsPage/Team/didi.jpg') },
              { name: "Nikol", role: "Founder", image: require('../assets/AboutUsPage/Team/nikol.jpg') },
              { name: "Mimi", role: "Founder", image: require('../assets/AboutUsPage/Team/milena.jpg') },
              { name: "Maq", role: "Founder", image: require('../assets/AboutUsPage/Team/maq.jpg') },
              { name: "Ina", role: "Founder", image: require('../assets/AboutUsPage/Team/ina.jpg') }
            ].map((member, index) => {

              const start = 600 + index * 120;
              const end = 750 + index * 120;

              return (
                <Animated.View
                  key={index}
                  style={getScrollAnimStyle(start, end)}
                >
                  <TeamMember {...member} />
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.footer, getScrollAnimStyle(700, 900)]}>
          <Text style={styles.footerText}>
            © 2026 Struna. All rights reserved.
          </Text>
        </Animated.View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    backgroundColor: '#33ce7d',
    zIndex: 999
  },

  header: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    elevation: 5,
    zIndex: 100
  },

  logo: { width: 80, height: 80, resizeMode: 'contain' },
  menuIcon: { fontSize: 30 },

  dropdown: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 220,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.97)',
    elevation: 15,
    zIndex: 200
  },

  menuItem: { paddingVertical: 14, paddingHorizontal: 18, fontSize: 16, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 6, marginHorizontal: 16 },

  hero: { paddingTop: 60, paddingHorizontal: 30, alignItems: 'center' },
  heroTitle: { fontSize: 38, fontWeight: '800', marginBottom: 12 },
  heroText: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },

  cardsSection: { marginTop: 40, paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, marginBottom: 30, elevation: 8 },
  cardImage: { width: '100%', height: 170, borderRadius: 20, marginBottom: 16 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#33ce7d', marginBottom: 10 },
  cardText: { fontSize: 15, color: '#555', lineHeight: 22 },

  team: { marginTop: 40, paddingHorizontal: 20 },
  teamTitle: { fontSize: 28, fontWeight: '800', marginBottom: 25, textAlign: 'center' },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },

  footer: { marginTop: 60, padding: 25, alignItems: 'center', backgroundColor: '#f7f8fa' },
  footerText: { fontSize: 14, color: '#888', textAlign: 'center' }
});