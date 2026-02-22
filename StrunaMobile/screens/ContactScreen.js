import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Dimensions,
  Easing
} from 'react-native';

import strunaLogo from '../assets/HomePage/struna-logo.png';

const { width } = Dimensions.get('window');

export default function ContactScreen({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { text: 'Home', route: 'Home' },
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

  const getImageAnimStyle = (start, end, distance = 35) => ({
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
          <Text style={styles.heroTitle}>Get in Touch</Text>
          <Text style={styles.heroText}>
            Have questions or want to collaborate?
            Reach out to us and we’ll get back to you shortly.
          </Text>
        </View>

        {/* EMAIL CARD */}
        <View style={styles.cardsSection}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Email Us</Text>
            <Text style={styles.cardText}>nikolii._.08@abv.bg</Text>
          </View>
        </View>

        {/* PHONE CARD */}
        <View style={styles.cardsSection}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Call Us</Text>
            <Text style={styles.cardText}>+359 88 499 9440</Text>
          </View>
        </View>

        {/* FORM */}
        <View style={styles.formWrapper}>
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Send a Message</Text>

            <TextInput placeholder="Your Name" style={styles.input} />
            <TextInput placeholder="Your Email" style={styles.input} keyboardType="email-address" />
            <TextInput
              placeholder="Your Message"
              style={[styles.input, { height: 120 }]}
              multiline
            />

            <TouchableOpacity style={styles.submitBtn}>
              <Text style={styles.submitText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* IMAGE */}
        <Animated.Image
          source={require('../assets/ContactPage/contact.jpg')}
          style={[styles.image, getImageAnimStyle(50, 300)]}
        />

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Struna. All rights reserved.
          </Text>
        </View>
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
  menuItem: { paddingVertical: 14, paddingHorizontal: 18, fontSize: 16, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 6, marginHorizontal: 16 },

  hero: { paddingTop: 50, paddingHorizontal: 30, alignItems: 'center' },
  heroTitle: { fontSize: 36, fontWeight: '800', marginBottom: 12 },
  heroText: { fontSize: 16, color: '#555', textAlign: 'center', lineHeight: 24 },

  cardsSection: { marginTop: 30, paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, elevation: 6 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#33ce7d', marginBottom: 6 },
  cardText: { fontSize: 15, color: '#555' },

  formWrapper: { marginTop: 30, paddingHorizontal: 20 },
  formCard: { backgroundColor: '#fff', borderRadius: 24, padding: 22, elevation: 6 },
  input: { backgroundColor: '#f7f8fa', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#ddd' },
  submitBtn: { marginTop: 20, backgroundColor: '#33ce7d', paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  image: { width: width * 0.9, height: 220, borderRadius: 20, marginVertical: 40, alignSelf: 'center', resizeMode: 'cover' },

  footer: { padding: 25, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#888' }
});