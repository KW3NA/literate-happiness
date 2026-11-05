import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

export type ExperienceItem = {
  company: string;
  period: string;
  description: string;
};

export type EducationItem = {
  institution: string;
  degree: string;
  period: string;
};

export type SkillItem = {
  name: string;
  level: number;
};

export type GreenProfessionalTemplateProps = {
  data: {
    name: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    aboutMe: string;
    description: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillItem[];
    languages?: string[];
    expertise?: string[];
    profileImage?: string | null;
    mainColor?: string;
  };
};

const GreenProfessionalTemplate: React.FC<GreenProfessionalTemplateProps> = ({ data }) => {
  const mainColor = data.mainColor || '#247C6F';

  const SkillBar: React.FC<{ skill: string; level: number; mainColor: string }> = ({ skill, level, mainColor }) => (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ color: '#222', fontSize: 13, fontWeight: '500' }}>{skill}</Text>
        <Text style={{ color: '#222', fontSize: 13, fontWeight: '700' }}>{level}%</Text>
      </View>
      <View style={{ width: '100%', backgroundColor: '#e5e5e5', height: 6, borderRadius: 3 }}>
        <View style={{ height: 6, borderRadius: 3, width: `${level}%`, backgroundColor: mainColor }} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { minHeight: 800 }]}> 
      {/* Left Sidebar */}
      <View style={styles.leftSidebar}>
        <View style={{ height: 24, backgroundColor: '#fff' }} />
        <View style={[styles.tealPanel, { backgroundColor: mainColor }]}> 
          <View style={{ padding: 24 }}>
            {/* Profile Section */}
            <View style={{ marginBottom: 12 }}>
              <View style={styles.profileImageWrapper}>
                {data.profileImage ? (
                  <Image source={{ uri: data.profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profileImage, { backgroundColor: '#e5e5e5', alignItems: 'center', justifyContent: 'center' }]}> 
                    <Text style={{ color: '#888', fontSize: 12 }}>Photo</Text>
                  </View>
                )}
              </View>
            </View>
            {/* About Me Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 18, color: '#fff',fontWeight: 'bold', marginBottom: 12 }}>About Me</Text>
              <Text style={{ fontSize: 13, color: '#fff', lineHeight: 18 }}>{data.aboutMe}</Text>
            </View>
            {/* Contact Info */}
            <View style={{ marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={styles.iconCircle}><Text style={{ color: mainColor }}>📞</Text></View>
                <Text style={styles.contactText}>{data.phone}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={styles.iconCircle}><Text style={{ color: mainColor }}>✉</Text></View>
                <Text style={styles.contactText}>{data.email}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={styles.iconCircle}><Text style={{ color: mainColor }}>📍</Text></View>
                <Text style={styles.contactText}>{data.address}</Text>
              </View>
            </View>
            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <View style={{ marginBottom: 32 }}>
                <View style={[styles.sectionHeader, { color: mainColor }]}><Text style={[styles.sectionHeaderText, { color: mainColor }]}>LANGUAGE</Text></View>
                {data.languages.map((lang, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={styles.bullet} />
                    <Text style={styles.languageText}>{lang}</Text>
                  </View>
                ))}
              </View>
            )}
            {/* Expertise */}
            {data.expertise && data.expertise.length > 0 && (
              <View>
                <View style={[styles.sectionHeader, { color: mainColor }]}><Text style={[styles.sectionHeaderText, { color: mainColor }]}>EXPERTISE</Text></View>
                {data.expertise.map((skill, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={styles.bullet} />
                    <Text style={styles.languageText}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={{ height: 8, backgroundColor: '#fff' }} />
      </View>
      {/* Right Content */}
      <View style={styles.rightContent}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[styles.name, { color: mainColor }]}>{data.name}</Text>
          <Text style={[styles.title, { color: mainColor }]}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>
        {/* Experience */}
        <View style={{ marginBottom: 32 }}>
          <View style={[styles.sectionHeader, { backgroundColor: mainColor }]}><Text style={styles.sectionHeaderTextWhite}>EXPERIENCE</Text></View>
          {data.experience && data.experience.map((exp, idx) => (
            <View key={idx} style={{ marginBottom: 16 }}>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={{ fontSize: 13, color: '#444', fontStyle: 'italic', marginBottom: 2 }}>{exp.period}</Text>
              <Text style={styles.expDescription}>{exp.description}</Text>
            </View>
          ))}
        </View>
        {/* Education */}
        <View style={{ marginBottom: 32 }}>
          <View style={[styles.sectionHeader, { backgroundColor: mainColor }]}><Text style={styles.sectionHeaderTextWhite}>EDUCATION</Text></View>
          {data.education && data.education.map((edu, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <Text style={styles.company}>{edu.institution}</Text>
              <Text style={styles.degree}>{edu.degree}</Text>
              <Text style={[styles.period, { color: mainColor }]}>{edu.period}</Text>
            </View>
          ))}
        </View>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    margin: 10,
    elevation: 2,
  } as ViewStyle,
  leftSidebar: {
    width: '45%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    overflow: 'hidden',
    
  } as ViewStyle,
  tealPanel: {
    borderRadius: 24,
    marginHorizontal: 8,
    overflow: 'hidden',
  } as ViewStyle,
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: '#fff',
  } as ViewStyle,
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  } as ImageStyle,
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  } as ViewStyle,
  contactText: {
    color: '#fff',
    fontSize: 13,
  } as TextStyle,
  sectionHeader: {
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,
  sectionHeaderTextWhite: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  } as TextStyle,
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 10,
  } as ViewStyle,
  languageText: {
    color: '#fff',
    fontSize: 13,
  } as TextStyle,
  rightContent: {
    width: '62%',
    padding: 24,
    backgroundColor: '#fff',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  } as ViewStyle,
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  } as TextStyle,
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  } as TextStyle,
  description: {
    color: '#444',
    fontSize: 13,
    marginBottom: 12,
  } as TextStyle,
  company: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  } as TextStyle,
  period: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  } as TextStyle,
  expDescription: {
    color: '#444',
    fontSize: 13,
    marginBottom: 4,
  } as TextStyle,
  degree: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  } as TextStyle,
});

export default GreenProfessionalTemplate; 