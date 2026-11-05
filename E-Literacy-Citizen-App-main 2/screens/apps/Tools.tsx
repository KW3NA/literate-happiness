import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TranslatedText from '../../components/TranslatedText';
import { useTheme } from '../../components/ThemeContext';
import  BottomTabBar  from '../../components/BottomTabBar';
import ARMenu from '../../components/ARMenu';


const Tools = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [showARMenu, setShowARMenu] = useState(false);

  // ARMenu items — all launch the E-Lit AR experience in a fullscreen webview
  // (camera permission is requested by WebViewScreen before the AR session starts)
  const AR_URL = 'https://e-lit-ar.netlify.app';
  const arMenuItems = [
    {
      id: 'ar1',
      title: 'Explore Computers',
      icon: 'computer',
      gradient: ['#667eea', '#764ba2'],
      action: () => navigation.navigate('WebView Screen', { uri: AR_URL, title: 'AR Environment' }),
    },
    {
      id: 'ar2',
      title: 'Writing an Email',
      icon: 'envelope',
      gradient: ['#f093fb', '#f5576c'],
      action: () => navigation.navigate('WebView Screen', { uri: AR_URL, title: 'AR Environment' }),
    },
  ];

  const tools = [
    {
      id: 1,
      title: 'AR Environment',
      description: 'Experience immersive augmented reality learning environments',
      icon: 'cube',
      gradient: ['#667eea', '#764ba2'],
      imageUrl: 'https://ux247.com/wp-content/uploads/2018/04/testing-AR-1.png',
      features: [
        'Interactive 3D models',
        'Virtual simulations',
        'Hands-on learning',
        'Real-world applications'
      ],
      onPress: () => setShowARMenu(true)
    },
    {
      id: 2,
      title: 'Mock Interview',
      description: 'Practice your interview skills with AI-powered feedback',
      icon: 'microphone',
      gradient: ['#f093fb', '#f5576c'],
      imageUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/4AtCUbG4jgt14YATdUiwDX/1ec93ac986047bc6ec033aec901acbb7/GettyImages-1463681237.jpg?w=1500&h=680&q=60&fit=fill&f=faces&fm=jpg&fl=progressive&auto=format%2Ccompress&dpr=1&w=1000',
      features: [
        'AI-powered questions',
        'Real-time feedback',
        'Performance analytics',
        'Industry-specific prep'
      ],
      onPress: () => navigation.navigate('MockInterview')
    }
  ];

  const renderToolCard = (tool) => (
    <TouchableOpacity
      key={tool.id}
      style={[styles.toolCard, { backgroundColor: isDark ? "#1e1e1eff" : '#fff'  }]}
      onPress={tool.onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: tool.imageUrl }}
          style={styles.toolImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={tool.gradient}
          style={styles.iconContainer}
        >
          <FontAwesome6 name={tool.icon} size={24} color="white" />
        </LinearGradient>
      </View>

      <View style={[styles.cardContent, { backgroundColor: isDark ? "1e1e1eff" : '#fff'  }]}>
        <Text style={[styles.toolTitle, { color: colors.text }]}>
          {tool.title}
        </Text>
        <Text style={[styles.toolDescription, { color: colors.muted }]}>
          {tool.description}
        </Text>

        <View style={styles.featuresContainer}>
          {tool.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <FontAwesome6 name="check" size={12} color="#4CAF50" />
              <Text style={[styles.featureText, { color: colors.muted }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.launchButton}>
          <LinearGradient
            colors={tool.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.launchGradient}
          >
            <Text style={styles.launchButtonText}>Launch Tool</Text>
            <FontAwesome6 name="arrow-right" size={16} color="white" />
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
        </TouchableOpacity>
        <TranslatedText style={styles.headerTitle}>Explore Tools</TranslatedText>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <FontAwesome5 name="magic" size={32} color="#E67012" />
          <TranslatedText style={[styles.introTitle, { color: colors.text }]}>
            Learning Enhancement Tools
          </TranslatedText>
          <TranslatedText style={[styles.introText, { color: colors.muted }]}>
            Discover powerful tools designed to enhance your learning experience through interactive technology
          </TranslatedText>
        </View>

        <View style={styles.toolsList}>
          {tools.map(renderToolCard)}
        </View>
      </ScrollView>

      <ARMenu
        visible={showARMenu}
        onClose={() => setShowARMenu(false)}
        menuItems={arMenuItems}
      />
      
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E67012',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  toolsList: {
    paddingBottom: 100,
  },
  toolCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  cardHeader: {
    position: 'relative',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  toolImage: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 20,
  },
  toolTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  toolDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 24,
    
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 14,
  },
  launchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  launchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  launchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default Tools;