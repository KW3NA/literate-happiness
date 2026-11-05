// @ts-ignore
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import TranslatedText from './TranslatedText';
interface Ad {
  id: number;
  businessName: string;
  description: string;
  subDescription: string;
  image: string;
  action: string;
  verified?: boolean;
}

interface NativeAdProps {
  visible: boolean;
  onClose: () => void;
}

const NativeAd: React.FC<NativeAdProps> = ({ visible, onClose }) => {
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [showInquire, setShowInquire] = useState(false);

  const ads: Ad[] = [
    {
      id: 1,
      businessName: 'ElatedTech',
      description: 'Need a Device to upskill your digital literacy skills?',
      subDescription: 'Get one at an affordable price from ElatedTech!',
      image: 'laptop.png',
      action: 'Contact on WhatsApp',
      verified: true,
      
    },
    // {
    //   id: 2,
    //   businessName: 'TechMart',
    //   description: 'Quality electronics and gadgets for all your tech needs at competitive prices!',
    //   image: 'laptop.jpg',
    //   action: 'Contact on WhatsApp',
    //   verified: true,
    // },
    // {
    //   id: 3,
    //   businessName: 'DigitalHub',
    //   description: 'Professional tech support and device repairs. Get your devices fixed today!',
    //   image: 'laptop.jpg',
    //   action: 'Contact on WhatsApp',
    //   verified: true,
    // },
  ];

  useEffect(() => {
    if (visible) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)];
      setCurrentAd(randomAd);
      setShowInquire(false);

      const inquireTimer = setTimeout(() => {
        setShowInquire(true);
      }, 5000);

      const closeTimer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => {
        clearTimeout(inquireTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [visible]);

  if (!visible || !currentAd) return null;

  return (
      <LinearGradient
        colors={['#FF9800', '#FF6D00']}
        style={styles.container}
      >
        <View style={styles.content}>
          {!showInquire ? (
            <>
             <Image 
                source={require('../assets/laptop.png')} 
                style={styles.productImage}
                resizeMode="contain"
              />
              <View style={styles.verifiedBadge}>
                <FontAwesome6 name="circle-check" size={16} color="#4CAF50" />
                <TranslatedText style={styles.verifiedText}>Verified Source</TranslatedText>
              </View>

              <TranslatedText style={styles.description}>{currentAd.description}</TranslatedText>
              <TranslatedText style={styles.subDescription}>{currentAd.subDescription}</TranslatedText>

            </>
          ) : (
            <>
              <TranslatedText style={styles.inquireText}>Inquire Now!</TranslatedText>
              
              <View style={styles.logoPlaceholder}>
                <Image source={require('../assets/Elated Tech logo white.png')} style={{width:"100%", height: "100%", marginBottom: 20}} />
              </View>
              
              <TouchableOpacity 
                style={styles.whatsappButton}
                onPress={() => Linking.openURL('https://wa.me/c/27814842844')}
              >
                <FontAwesome6 name="whatsapp" size={20} color="white" />
                <Text style={styles.buttonText}>{currentAd.action}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>

  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    bottom: 100,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 30,
    marginTop: 15,
  },
  verifiedText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  description: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
  },
  subDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  productImage: {
    width: 200,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  inquireText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'white',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default NativeAd;