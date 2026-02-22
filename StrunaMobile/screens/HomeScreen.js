import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing
} from 'react-native';

const { width } = Dimensions.get('window');

import strunaLogo from '../assets/HomePage/struna-logo.png';
import postureHero from '../assets/HomePage/struna_pic.webp';
import devicePreview from '../assets/HomePage/device.png';
import appPreview from '../assets/HomePage/telefon.png';

export default function HomeScreen({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { text: 'About Us', route: 'About' },
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

  /* SMOOTH REVEAL */
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

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f8fa' }}>

      {/* HEADER */}
      <View style={styles.header}>
        <Image source={strunaLogo} style={styles.logo} />
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

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

      {/* SCROLL */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >

        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.headline}>
            Maintain Good{'\n'}
            <Text style={styles.highlight}>POSTURE</Text>{'\n'}
            Every Day
          </Text>

          <Image source={postureHero} style={styles.heroImage} />
        </View>

        {/* CTA */}
        <Animated.View style={[styles.cta, getScrollAnimStyle(50, 250)]}>
          <Text style={styles.ctaTitle}>Join Us Now</Text>
          <Text style={styles.ctaSubtitle}>Your success starts here</Text>

          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.btnOutlineText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSolid}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.btnSolidText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* DEVICE */}
        <Animated.View style={[styles.services, getScrollAnimStyle(300, 500)]}>
          <View style={styles.serviceCard}>
            <Text style={styles.serviceChip}>Device</Text>
            <Text style={styles.serviceText}>
              Our posture monitoring system is embedded in a tank top,
              providing discreet and comfortable real-time posture tracking.
            </Text>
            <Image source={devicePreview} style={styles.serviceImage} />
          </View>
        </Animated.View>

        {/* APP */}
        <Animated.View style={[styles.services, getScrollAnimStyle(550, 750)]}>
          <View style={styles.serviceCard}>
            <Text style={styles.serviceChip}>App</Text>
            <Text style={styles.serviceText}>
              The companion app lets users monitor posture in real time,
              track posture quality and receive notifications.
            </Text>
            <Image source={appPreview} style={styles.serviceImage} />
          </View>
        </Animated.View>

        {/* FOOTER */}
        <Animated.View style={[styles.footer, getScrollAnimStyle(800, 1000)]}>
          <Text style={styles.footerText}>
            © 2026 Struna. All rights reserved.
          </Text>
        </Animated.View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 6,
    marginHorizontal: 16
  },

  hero: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center'
  },

  headline: {
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 44
  },

  highlight: { color: '#33ce7d' },

  heroImage: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width,
    resizeMode: 'cover',
    marginTop: 30
  },

  cta: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 20
  },

  ctaTitle: { fontSize: 34, fontWeight: '800' },
  ctaSubtitle: { fontSize: 18, color: '#555', marginBottom: 20 },

  ctaButtons: {
    flexDirection: 'row',
    marginTop: 20
  },

  btnOutline: {
    borderWidth: 2,
    borderColor: '#33ce7d',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 12
  },

  btnOutlineText: {
    color: '#33ce7d',
    fontWeight: '700'
  },

  btnSolid: {
    backgroundColor: '#33ce7d',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24
  },

  btnSolidText: {
    color: '#fff',
    fontWeight: '700'
  },

  services: {
    marginTop: 60,
    paddingHorizontal: 20
  },

  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    elevation: 6
  },

  serviceChip: {
    backgroundColor: '#33ce7d',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    fontWeight: '700',
    marginBottom: 10,
    alignSelf: 'flex-start'
  },

  serviceText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
    color: '#555'
  },

  serviceImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    resizeMode: 'cover'
  },

  footer: {
    marginTop: 80,
    padding: 25,
    alignItems: 'center'
  },

  footerText: {
    fontSize: 14,
    color: '#888'
  }
});