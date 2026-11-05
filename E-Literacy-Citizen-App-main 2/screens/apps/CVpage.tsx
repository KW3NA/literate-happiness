import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image, // For the CV Preview image
  Modal, // Added for modal and fullscreen preview
  FlatList,
  Alert,
} from 'react-native';
import TranslatedText from '../../components/TranslatedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import BottomTabBar from '../../components/BottomTabBar'; // Assuming this path is correct
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import GreenProfessionalTemplate from '../../components/GreenProfessionalTemplate';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import Constants from 'expo-constants';
import { encode as btoa } from 'base-64';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../components/ThemeContext';
import { useUser } from '../../components/UserContext';

type Experience = {
  title: string;
  company: string;
  duration: string;
  description: string;
};

type Certification = {
  name: string;
};

type Award = {
  name: string;
};

type CvData = {
  name: string;
  surname: string;
  contactInfo: string;
  email: string;
  physicalAddress: string;
  summary: string;
  highestQualification: string;
  yearObtained: string;
  certifications: Certification[];
  awards: Award[];
  experience: Experience[];
  skills: string[];
  profileImage?: string | null;
};

type CvBuilderStep = {
    id: number;
    title: string;
    subtitle?: string;
    description?: string[];
    type: 'intro' | 'personal_info' | 'skills_experience' | 'upload_docs' | 'preview' | 'download';
}

type Props = NativeStackScreenProps<RootStackParamList, 'CVBuilder'>;

const TemplateSelectionScreen = ({ onTemplateSelect, onColorSelect, selectedTemplate, selectedColor }) => {
  const { colors, isDark } = useTheme();
  const templateImages = [
    { key: 'template_1', src: require('../../assets/template_1.png') },
    { key: 'template_2', src: require('../../assets/template_2.png') },
  ];
  const colorOptions = ['#E67012', '#1E90FF', '#28a745', '#ff6347', '#333', '#000', '#247C6F', '#19203E'];
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
  <TranslatedText style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: colors.text }}>Choose a Template</TranslatedText>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 }}>
        {templateImages.map(tmpl => (
          <TouchableOpacity key={tmpl.key} onPress={() => onTemplateSelect(tmpl.key)} style={{ borderWidth: selectedTemplate === tmpl.key ? 3 : 1, borderColor: selectedTemplate === tmpl.key ? '#E67012' : '#ccc', borderRadius: 10, padding: 4 }}>
            <Image source={tmpl.src} style={{ width: 120, height: 160, borderRadius: 8 }} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>
  <TranslatedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.text }}>Choose Main Colour</TranslatedText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {colorOptions.map(color => (
          <TouchableOpacity key={color} onPress={() => onColorSelect(color)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color, marginRight: 12, marginBottom: 12, borderWidth: selectedColor === color ? 3 : 1, borderColor: selectedColor === color ? '#000' : '#ccc' }} />
        ))}
      </View>
    </View>
  );
};

// MyTemplatesScreen: shows all generated templates
const MyTemplatesScreen = ({ templates, onPreview }) => {
  const { colors, isDark } = useTheme();
  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={{ padding: 20 }}>
  <TranslatedText style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: colors.text }}>My Generated CVs</TranslatedText>
      <FlatList
        data={templates}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => onPreview(index)} style={{ marginBottom: 20, borderWidth: 1, borderColor: isDark ? colors.muted : '#eee', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card }}>
            <FontAwesome5 name="file-pdf" size={32} color="#E67012" style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <TranslatedText style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>{item.data.name || 'CV'}</TranslatedText>
              <TranslatedText style={{ color: colors.muted, fontSize: 13 }}>{item.data.title || 'Template'}</TranslatedText>
              <TranslatedText style={{ color: colors.muted, fontSize: 13 }}>{item.date}</TranslatedText>
            </View>
            <FontAwesome5 name="eye" size={20} color="#1E90FF" />
          </TouchableOpacity>
        )}
  ListEmptyComponent={<TranslatedText style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>No CVs generated yet.</TranslatedText>}
      />
    </View>
  </SafeAreaView>
  );
};

const CVBuilder = ({ navigation }: Props) => {
  const { colors, isDark } = useTheme();
  // State to manage the current step of the CV builder flow
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Logged-in user's actual name (used for the "Generate with AI" button + CV data)
  const { userData } = useUser();
  const trimmedUserName = (userData?.name ?? '').trim();
  const userNameParts = trimmedUserName.split(/\s+/).filter(Boolean);
  const aiButtonLabel = trimmedUserName
    ? `Generate ${trimmedUserName}'s CV with AI`
    : 'Generate CV with AI';

  // State to manage CV data
  const [cvData, setCvData] = useState<CvData>({
    name: '',
    surname: '',
    contactInfo: '',
    email: '',
    physicalAddress: '',
    summary: '', // Added summary field
    highestQualification: '',
    yearObtained: '', // Added yearObtained field
    certifications: [],
    awards: [],
    experience: [],
    skills: [],
    profileImage: null,
  });

  // Pre-fill the CV with the logged-in user's actual details so the generated
  // CV always carries their real name (and they can still edit it afterwards).
  React.useEffect(() => {
    if (trimmedUserName) {
      setCvData(prev => {
        if (prev.name || prev.surname) return prev; // don't overwrite user edits
        return {
          ...prev,
          name: userNameParts[0] ?? '',
          surname: userNameParts.slice(1).join(' '),
          email: prev.email || (userData?.email ?? ''),
          physicalAddress: prev.physicalAddress || (userData?.location ?? ''),
        };
      });
    }
  }, [trimmedUserName]);

  // State for AI generation loading (repurposed for simulated processing)
  const [isProcessingDocument, setIsProcessingDocument] = useState<boolean>(false);
  // State to control the visibility of the AI generation choice modal
  const [showGenerateAIChoice, setShowGenerateAIChoice] = useState<boolean>(false);
  const [showTemplateScreen, setShowTemplateScreen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('template_1');
  const [selectedColor, setSelectedColor] = useState('#E67012');
  const navigation2 = useNavigation();
  // Add state for modal and fullscreen preview:
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [myTemplates, setMyTemplates] = useState<{data: any, template: string, color: string, date: string}[]>([]);
  const [showMyTemplatesScreen, setShowMyTemplatesScreen] = useState(false);
  // Add state for PDF URI
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  // Add state for showing the success screen
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Define the steps of the CV builder
  const cvBuilderSteps: CvBuilderStep[] = [
    {
      id: 0,
      title: "CV Builder Intro",
      subtitle: "How to Build your Personalized CV Today!",
      description: [
        "1. Enter your personal details (or explore AI generate option).",
        "2. Enter any of your accomplished skills and experience.",
        "3. Upload all supporting documents required.",
      ],
      type: "intro",
    },
    {
      id: 1,
      title: "Personal Information",
      type: "personal_info",
    },
    {
      id: 2,
      title: "Skills and Experience",
      type: "skills_experience",
    },
    {
      id: 3,
      title: "Upload Documents",
      type: "upload_docs",
    },
    {
      id: 4,
      title: "CV Preview",
      type: "preview",
    },
    {
      id: 5,
      title: "Download CV",
      type: "download",
    },
  ];

  // Function to handle changes in text inputs
  const handleChange = (field: keyof CvData, value: string) => {
    setCvData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  type ArraySection = 'certifications' | 'awards' | 'experience' | 'skills';

  // Function to handle changes in array items (e.g., experience, education)
  const handleArrayItemChange = <S extends 'certifications' | 'awards' | 'experience', K extends keyof CvData[S][0]>(
    section: S,
    index: number,
    field: K,
    value: CvData[S][0][K]
  ) => {
    setCvData(prevData => {
        const sectionData = prevData[section];
        return {
            ...prevData,
            [section]: sectionData.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        };
    });
  };

  // Function to add a new item to an array section (e.g., new experience)
  const addArrayItem = (section: 'certifications' | 'awards' | 'experience' | 'skills') => {
    if (section === 'skills') {
      setCvData(prevData => ({ ...prevData, skills: [...prevData.skills, ''] }));
      return;
    }

    if (section === 'experience') {
        setCvData(prevData => ({ ...prevData, experience: [...prevData.experience, { title: '', company: '', duration: '', description: '' }] }));
        return;
    }

    if (section === 'certifications') {
        setCvData(prevData => ({ ...prevData, certifications: [...prevData.certifications, { name: '' }] }));
        return;
    }

    if (section === 'awards') {
        setCvData(prevData => ({ ...prevData, awards: [...prevData.awards, { name: '' }] }));
        return;
    }
  };

  // Function to remove an item from an array section
  const removeArrayItem = (section: ArraySection, index: number) => {
    setCvData(prevData => ({
      ...prevData,
      [section]: prevData[section].filter((_: any, i: number) => i !== index),
    }));
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < cvBuilderSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function called when "Generate with AI" button is clicked
  const handleGenerateAIClick = () => {
    setShowGenerateAIChoice(true); // Show the choice modal
  };

  // Simulated document upload and CV generation
  const handleGenerateFromDocument = async () => {
    setShowGenerateAIChoice(false); // Close the choice modal
    setIsProcessingDocument(true);

    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate AI scanning and data extraction with dummy data.
    // The user's ACTUAL name always takes priority over the extracted/dummy name.
    const dummyCvData = {
      name: userNameParts[0] ?? 'Jane',
      surname: userNameParts.slice(1).join(' ') || 'Doe',
      contactInfo: '+27 81 234 5678',
      email: userData?.email || 'jane.doe@example.com',
      physicalAddress: userData?.location || '456 Oak Avenue, Cityville',
      summary: 'Highly motivated and results-oriented Software Developer with 5 years of experience in full-stack web development. Proficient in JavaScript, React, and Node.js, with a strong understanding of agile methodologies and a passion for building scalable and user-friendly applications.',
      highestQualification: 'BSc Computer Science',
      yearObtained: '2019',
      certifications: [{ name: 'Certified Scrum Master' }, { name: 'AWS Cloud Practitioner' }],
      awards: [{ name: 'Employee of the Year 2023' }],
      experience: [
        {
          title: 'Software Developer',
          company: 'Innovate Solutions',
          duration: '2021 - Present',
          description: 'Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions. Implemented RESTful APIs and integrated with various third-party services. Participated in code reviews and mentored junior developers.',
        },
        {
          title: 'Junior Developer',
          company: 'Startup Tech',
          duration: '2019 - 2020',
          description: 'Assisted in front-end development and bug fixing on client-side applications. Gained hands-on experience with version control (Git) and agile methodologies. Contributed to improving application performance and user experience.',
        },
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Agile', 'RESTful APIs', 'HTML', 'CSS', 'MongoDB', 'Cloud Computing'],
    };

    setCvData(dummyCvData);
    setIsProcessingDocument(false);
    setCurrentStep(cvBuilderSteps.findIndex(step => step.type === 'personal_info')); // Move to personal info step
  };

  // Simulated CV generation from existing app info
  const handleGenerateFromAppInfo = async () => {
    setShowGenerateAIChoice(false); // Close the choice modal
    setIsProcessingDocument(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Merge in the logged-in user's actual name/contact so the generated CV
    // always reflects their real identity.
    setCvData(prev => ({
      ...prev,
      name: prev.name || userNameParts[0] || '',
      surname: prev.surname || userNameParts.slice(1).join(' '),
      email: prev.email || (userData?.email ?? ''),
      physicalAddress: prev.physicalAddress || (userData?.location ?? ''),
    }));

    console.log("Generating CV from existing app info:", cvData);

    setIsProcessingDocument(false);
    setCurrentStep(cvBuilderSteps.findIndex(step => step.type === 'personal_info')); // Move to personal info step
  };

  // Helper: Generate HTML for GreenProfessionalTemplate
  function generateGreenTemplateHTML(data: any, mainColor: string, base64Image?: string) {
    // Split skills into up to 3 columns for clean table (no bullets)
    const skills = (data.skills || []).map((skill: any) => typeof skill === 'string' ? skill : skill.name);
    const colCount = 3;
    const skillsPerCol = Math.ceil(skills.length / colCount);
    const skillCols = Array.from({ length: colCount }, (_, i) => skills.slice(i * skillsPerCol, (i + 1) * skillsPerCol));
    // Helper for safe field
    const safe = (val: any) => (val === undefined || val === null ? '' : val);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Green Professional CV</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f0f0f0; margin: 0; padding: 2rem; }
    table.cv-table { width: 100%; max-width: 960px; margin: auto; background: white; min-height: 800px; border-collapse: separate; border-spacing: 0; }
    .sidebar-content { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; }
    .sidebar-bg-fallback { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: ${mainColor} !important; z-index: 1; }
    .photo { width: 128px; height: 128px; border-radius: 50%; border: 4px solid white; background: #ccc; display: block; margin: 0 auto 1.5rem; object-fit: cover; }
    h2 { font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; }
    p, li, span { font-size: 0.95rem; }
    .contact { margin-top: 2rem; margin-bottom: 2rem; }
    .contact-item { display: flex; align-items: center; margin-bottom: 1.2rem; }
    .icon-circle { width: 32px; height: 32px; background: white !important; color: ${mainColor} !important; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-right: 0.75rem; }
    .section-title { background: white !important; color: ${mainColor} !important; text-align: center; padding: 0.5rem; font-weight: bold; margin-bottom: 1rem; font-size: 0.95rem; }
    .main h1 { font-size: 2.5rem; color: ${mainColor} !important; margin-bottom: 0.5rem; }
    .main h2 { font-size: 1.125rem; color: ${mainColor} !important; margin-bottom: 1rem; }
    .desc { font-size: 0.95rem; color: #4a4a4a; margin-bottom: 2rem; }
    .block-section { margin-bottom: 2rem; }
    .block-title { background-color: ${mainColor} !important; color: white !important; text-align: center; padding: 0.5rem; font-weight: bold; font-size: 1rem; margin-bottom: 1.5rem; }
    .entry { margin-bottom: 1.5rem; }
    .entry h3 { font-weight: bold; color: #333; margin-bottom: 0.25rem; }
    .entry .period { font-weight: bold; color: ${mainColor} !important; font-size: 0.95rem; margin-bottom: 0.5rem; }
    .entry p { font-size: 0.95rem; color: #4a4a4a; }
    /* Skills table */
    .skills-table { width: 100%; border-collapse: separate; border-spacing: 0 0.5rem; margin-top: 0.5rem; }
    .skills-table td { padding: 0 0.5rem; font-size: 1rem; color: #222; }
    .skills-table tr { vertical-align: top; }
    /* Sidebar button style */
    .sidebar-btn { background: white; color: ${mainColor}; border: none; border-radius: 4px; padding: 0.5rem 0; font-weight: bold; width: 90%; margin: 0.5rem auto; display: block; text-align: center; font-size: 1rem; }
  </style>
</head>
<body>
  <table class="cv-table">
    <tr>
      <td style="width:40%;background:${mainColor};color:white;vertical-align:top;padding:2rem;position:relative;">
        <div class="sidebar-bg-fallback"></div>
        <div class="sidebar-content">
          <div style="text-align:center;">
            ${base64Image ? `<img src="${base64Image}" class="photo" />` : `<div class="photo"></div>`}
          </div>
          <div class="about" style="width:100%;">
            <h2>About Me</h2>
            <p>${safe(data.aboutMe)}</p>
          </div>
          <div class="contact" style="width:100%;">
            <div class="contact-item"><div class="icon-circle">&#128222;</div><span>${safe(data.phone)}</span></div>
            <div class="contact-item"><div class="icon-circle">&#9993;</div><span>${safe(data.email)}</span></div>
            <div class="contact-item"><div class="icon-circle">&#128205;</div><span>${safe(data.address)}</span></div>
          </div>
          <button class="sidebar-btn">LANGUAGE</button>
          <button class="sidebar-btn">EXPERTISE</button>
        </div>
      </td>
      <td class="main" style="width:60%;vertical-align:top;padding:2rem;">
        <h1>${safe(data.name)}</h1>
        <h2>${safe(data.title)}</h2>
        <p class="desc">${safe(data.description)}</p>
        <div class="block-section">
          <div class="block-title">EXPERIENCE</div>
          ${(data.experience || []).map((exp: any) => `
            <div class="entry">
              <h3>${safe(exp.company)}</h3>
              <div class="period">${safe(exp.period) || ''}</div>
              <p>${safe(exp.description)}</p>
            </div>
          `).join('')}
        </div>
        <div class="block-section">
          <div class="block-title">EDUCATION</div>
          ${(data.education || []).map((edu: any) => `
            <div class="entry">
              <h3>${safe(edu.institution)}</h3>
              <div class="period">${safe(edu.period)}</div>
              <p>${safe(edu.degree)}</p>
            </div>
          `).join('')}
        </div>
        <div class="block-section">
          <div class="block-title">SKILLS SUMMARY</div>
          <table class="skills-table"><tr>
            ${skillCols.map(col => `
              <td style="vertical-align:top;width:${100 / colCount}%;">
                ${col.map(skill => `<div>${skill}</div>`).join('')}
              </td>
            `).join('')}
          </tr></table>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
     `;
  }

  function generateTemplate1HTML(data: any, mainColor: string, base64Image?: string) {
    // Debug logging
    console.log('Template 1 - Data received:', JSON.stringify(data, null, 2));
    console.log('Template 1 - Main color:', mainColor);
    console.log('Template 1 - Base64 image exists:', !!base64Image);
    
    // Helper for safe field
    const safe = (val: any) => (val === undefined || val === null ? '' : val);
    
    // Format experience data
    const experienceItems = (data.experience || []).map((exp: any) => `
      <div class="experience-item">
        <div class="timeline-marker"></div>
        <div class="experience-content">
          <div class="experience-year">${safe(exp.duration) || safe(exp.period) || ''}</div>
          <div class="company-info">${safe(exp.company)} | ${safe(data.physicalAddress) || 'Any City'}</div>
          <div class="position-title">${safe(exp.title)}</div>
          <div class="job-description">${safe(exp.description)}</div>
        </div>
      </div>
    `).join('');

    // Format education data - use the correct field names from CvData
    const educationItems = `
      <div class="education-item">
        <div class="education-year">${safe(data.yearObtained) || ''}</div>
        <div class="education-degree">${safe(data.highestQualification) || ''}</div>
        <div class="education-school">University</div>
      </div>
    `;

    // Format skills/expertise
    const skills = (data.skills || []).map((skill: any) => typeof skill === 'string' ? skill : skill.name);
    const expertiseItems = skills.map(skill => `<li class="expertise-item">${skill}</li>`).join('');

    // Format references (using certifications as references for now)
    const references = (data.certifications || []).slice(0, 2).map((cert: any, index: number) => `
      <div class="reference-item">
        <div class="reference-name">${safe(cert.name) || `Reference ${index + 1}`}</div>
        <div class="reference-title">Company | Position</div>
        <div class="reference-contact">Phone: 123-456-7890</div>
        <div class="reference-contact">Email: reference@email.com</div>
      </div>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safe(data.name)} - CV</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            line-height: 1.4;
        }

        .container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: row;
            min-height: 1000px;
            width: 100%;
        }

        .sidebar {
            background-color: ${mainColor};
            width: 200px;
            min-width: 200px;
            padding: 20px 15px;
            color: white;
            flex-shrink: 0;
            flex-grow: 0;
            position: relative;
        }

        .profile-container {
            text-align: center;
            margin-bottom: 25px;
            margin-top: 10px;
        }

        .profile-image {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid white;
            object-fit: cover;
        }

        .sidebar-section {
            margin-bottom: 25px;
        }

        .sidebar-title {
            color: white;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 3px;
        }

        .contact-item {
            margin-bottom: 10px;
        }

        .contact-label {
            color: white;
            font-size: 11px;
            font-weight: bold;
            display: block;
            margin-bottom: 2px;
        }

        .contact-value {
            color: white;
            font-size: 11px;
            line-height: 1.3;
        }

        .education-item {
            margin-bottom: 15px;
        }

        .education-year {
            color: white;
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .education-degree {
            color: white;
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 1px;
            line-height: 1.2;
        }

        .education-school {
            color: #D1D5DB;
            font-size: 10px;
        }

        .expertise-list {
            list-style: none;
        }

        .expertise-item {
            color: white;
            font-size: 11px;
            margin-bottom: 3px;
            position: relative;
            padding-left: 8px;
        }

        .expertise-item:before {
            content: "•";
            position: absolute;
            left: 0;
        }

        .language-item {
            color: white;
            font-size: 11px;
            margin-bottom: 5px;
        }

        .main-content {
            flex: 1;
            flex-grow: 1;
            padding: 25px 20px;
            background: white;
            min-width: 0;
        }

        .header {
            margin-bottom: 25px;
        }

        .name {
            font-size: 28px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 3px;
            letter-spacing: -0.5px;
        }

        .job-title {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 12px;
            font-weight: normal;
        }

        .description {
            font-size: 11px;
            color: #6B7280;
            line-height: 1.4;
        }

        .content-section {
            margin-bottom: 25px;
        }

        .content-section-title {
            font-size: 16px;
            font-weight: bold;
            color: ${mainColor};
            margin-bottom: 15px;
            border-bottom: 1px solid #D1D5DB;
            padding-bottom: 5px;
        }

        .experience-item {
            margin-bottom: 20px;
            display: flex;
            align-items: flex-start;
        }

        .timeline-marker {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: ${mainColor};
            margin-right: 10px;
            margin-top: 4px;
            flex-shrink: 0;
            border: 2px solid ${mainColor};
        }

        .experience-content {
            flex: 1;
        }

        .experience-year {
            font-size: 11px;
            color: #6B7280;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .company-info {
            font-size: 11px;
            color: #374151;
            margin-bottom: 1px;
        }

        .position-title {
            font-size: 12px;
            color: #374151;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .job-description {
            font-size: 10px;
            color: #6B7280;
            line-height: 1.4;
            text-align: justify;
        }

        .references-container {
            display: flex;
            justify-content: space-between;
            gap: 15px;
        }

        .reference-item {
            flex: 1;
        }

        .reference-name {
            font-size: 12px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 2px;
        }

        .reference-title {
            font-size: 10px;
            color: #6B7280;
            margin-bottom: 5px;
        }

        .reference-contact {
            font-size: 10px;
            color: #6B7280;
            margin-bottom: 1px;
        }

        /* Force horizontal layout - prevent any responsive behavior */
        @media (max-width: 768px) {
            .container {
                flex-direction: row !important;
                margin: 20px auto !important;
            }
            
            .sidebar {
                width: 200px !important;
                min-width: 200px !important;
            }
            
            .main-content {
                flex: 1 !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Left Sidebar -->
        <div class="sidebar">
            <!-- Profile Image -->
            <div class="profile-container">
                ${base64Image ? `<img src="${base64Image}" alt="${safe(data.name)}" class="profile-image">` : `<div class="profile-image" style="background: #ccc; width: 80px; height: 80px; border-radius: 50%; border: 3px solid white;"></div>`}
            </div>

            <!-- Contact Section -->
            <div class="sidebar-section">
                <h3 class="sidebar-title">Contact</h3>
                <div class="contact-item">
                    <span class="contact-label">Phone</span>
                    <span class="contact-value">${safe(data.contactInfo)}</span>
                </div>
                <div class="contact-item">
                    <span class="contact-label">Email</span>
                    <span class="contact-value">${safe(data.email)}</span>
                </div>
                <div class="contact-item">
                    <span class="contact-label">Address</span>
                    <span class="contact-value">${safe(data.physicalAddress)}</span>
                </div>
            </div>

            <!-- Education Section -->
            <div class="sidebar-section">
                <h3 class="sidebar-title">Education</h3>
                ${educationItems}
            </div>

            <!-- Expertise Section -->
            <div class="sidebar-section">
                <h3 class="sidebar-title">Expertise</h3>
                <ul class="expertise-list">
                    ${expertiseItems}
                </ul>
            </div>

            <!-- Language Section -->
            <div class="sidebar-section">
                <h3 class="sidebar-title">Language</h3>
                <div class="language-item">English</div>
                <div class="language-item">Spanish</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <div class="header">
                <h1 class="name">${safe(data.name)} ${safe(data.surname)}</h1>
                <h2 class="job-title">${safe(data.summary) || 'Professional'}</h2>
                <p class="description">
                    ${safe(data.summary) || 'Professional with extensive experience in the field.'}
                </p>
            </div>

            <!-- Experience Section -->
            <div class="content-section">
                <h2 class="content-section-title">Experience</h2>
                ${experienceItems}
            </div>

            <!-- Reference Section -->
            <div class="content-section">
                <h2 class="content-section-title">Reference</h2>
                <div class="references-container">
                    ${references}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
    
    console.log('Template 1 - Generated HTML length:', html.length);
    return html;
  }


  // Build the full template payload from the current CV data (single source of truth)
  const buildTemplateData = () => {
    const mappedExperience = (cvData.experience || []).map(exp => ({
      title: exp.title,
      company: exp.company,
      period: exp.duration, // ensure period is set
      duration: exp.duration,
      description: exp.description,
    }));
    return {
      name: `${cvData.name} ${cvData.surname}`.trim() || 'Professional',
      title: 'Professional',
      email: cvData.email,
      phone: cvData.contactInfo,
      address: cvData.physicalAddress,
      aboutMe: cvData.summary,
      description: '',
      experience: mappedExperience,
      education: cvData.highestQualification ? [{ institution: '', degree: cvData.highestQualification, period: cvData.yearObtained }] : [],
      skills: cvData.skills.map(skill => ({ name: skill, level: 80 })),
      languages: [],
      expertise: [],
      profileImage: cvData.profileImage,
      mainColor: selectedColor,
      ...cvData
    };
  };

  // Read the selected profile photo (if any) as a base64 data URI for the HTML templates
  const getBase64ProfileImage = async (): Promise<string> => {
    if (!cvData.profileImage) return '';
    if (cvData.profileImage.startsWith('file://')) {
      const base64 = await FileSystem.readAsStringAsync(cvData.profileImage, { encoding: 'base64' });
      return `data:image/jpeg;base64,${base64}`;
    }
    return cvData.profileImage;
  };

  // Generate the PDF locally with expo-print and open it in the system viewer
  // (preview + download/save-to-files/share all come from that one viewer).
  const generatePdfLocally = async () => {
    try {
      setIsGeneratingPdf(true);
      const templateData = buildTemplateData();
      const base64Image = await getBase64ProfileImage();
      const html =
        selectedTemplate === 'template_1'
          ? generateTemplate1HTML(templateData, selectedColor, base64Image)
          : generateGreenTemplateHTML(templateData, selectedColor, base64Image);

      const safeName = (templateData.name || 'CV').replace(/[^a-zA-Z0-9]+/g, '_');
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const finalUri = `${FileSystem.documentDirectory}${safeName}_CV.pdf`;
      await FileSystem.moveAsync({ from: uri, to: finalUri });
      setPdfUri(finalUri);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        // Opens the native PDF preview with options to save/download/share the file
        await Sharing.shareAsync(finalUri, {
          mimeType: 'application/pdf',
          dialogTitle: `${templateData.name} CV`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF ready', `Your CV was saved to: ${finalUri}`);
      }
    } catch (e: any) {
      console.error('Local PDF generation failed:', e);
      Alert.alert('Error', 'Could not generate the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // HTML2PDF Rocket integration (cloud PDF generation)
  async function generatePdfViaHtml2PdfRocket(html: string) {
    // Get API key from environment variable (set in app.config.js or app.json under extra)
    const apiKey = (Constants.expoConfig?.extra?.HTML2PDFROCKET_API_KEY || Constants.manifest?.extra?.HTML2PDFROCKET_API_KEY || 'YOUR_HTML2PDFROCKET_API_KEY_HERE');
    console.log('DEBUG: HTML2PDFROCKET_API_KEY used:', apiKey);
    if (!apiKey || apiKey === 'YOUR_HTML2PDFROCKET_API_KEY_HERE') {
      Alert.alert('Oops, this feature is under maintenance, Try again later');
      return;
    }
    try {
      setIsGeneratingPdf(true);
      const params = new URLSearchParams();
      params.append('apikey', apiKey);
      params.append('value', html);

      const response = await fetch('https://api.html2pdfrocket.com/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        alert('HTML2PDF Rocket failed: ' + errText);
        console.error('HTML2PDF Rocket error:', errText);
        setIsGeneratingPdf(false);
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert Uint8Array to base64 in chunks to avoid stack overflow
      let binaryString = '';
      const chunkSize = 8192; // Process in chunks of 8KB
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binaryString);
      const fileUri = FileSystem.documentDirectory + 'cv.pdf';
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
      setPdfUri(fileUri);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      }
      Alert.alert('PDF generated!', 'Your CV PDF is ready. Use the Download & Preview button to open it.');
    } catch (e: any) {
      Alert.alert('Oops, this feature is under maintenance, Try again later');
      console.error('HTML2PDF Rocket exception:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  // Polyfill btoa for React Native if needed
  if (typeof btoa === 'undefined') {
    global.btoa = function (str) {
      return Buffer.from(str, 'binary').toString('base64');
    };
  }

  const renderStepContent = () => {
    // Find the index of the 'preview' step
    const previewStepIndex = cvBuilderSteps.findIndex(step => step.type === 'preview');

    switch (cvBuilderSteps[currentStep].type) {
      case "intro":
        return (
          <View style={styles.introContainer}>
            
            <Image
              source={require('../../assets/cv.png')}
              style={styles.introImage}
              resizeMode="contain"
            />
            <TranslatedText style={[styles.introTitle, { color: isDark ? '#fff' : '#000' }]}>{cvBuilderSteps[currentStep].subtitle}</TranslatedText>
            {cvBuilderSteps[currentStep].description?.map((line, index) => (
              <TranslatedText key={index} style={styles.introDescription}>{line}</TranslatedText>
            ))}
            <TouchableOpacity
              onPress={handleGenerateAIClick} // Now shows the choice modal
              style={[styles.generateAIButton, isProcessingDocument ? styles.disabledButton : {}]}
              disabled={isProcessingDocument}
            >
                <LinearGradient
            colors={['#1DACFF', '#1E90FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
              {isProcessingDocument ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text>
                  <FontAwesome6 name="wand-magic-sparkles" size={20} color="white" style={styles.buttonIcon} />
                </Text>
              )}
              <TranslatedText style={styles.generateAIButtonText}>
                {isProcessingDocument ? 'Processing...' : aiButtonLabel}
              </TranslatedText>
            </TouchableOpacity>
          </View>
        );
      case "personal_info":
        return (
          <View style={[styles.section, {backgroundColor: isDark ? '#1c1c1e' : '#fff'}]}>
            <View style={styles.sectionHeader}>
              <Text>
                <FontAwesome6 name="user" size={20} color={isDark ? '#fff' : '#000'} />
              </Text>
              <TranslatedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Personal Information</TranslatedText>
            </View>
            
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <TranslatedText style={{ fontWeight: 'bold', marginBottom: 4, alignSelf: 'flex-start' }}>Image:</TranslatedText>
              <Image
                source={cvData.profileImage ? { uri: cvData.profileImage } : require('../../assets/person.png')}
                style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
              />
              <TouchableOpacity
                style={[styles.uploadButton, { width: 150, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                onPress={async () => {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.5,
                  });
                  if (!result.canceled) {
                    setCvData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
                  }
                }}
              >
                <Text>
                  <FontAwesome6 name="camera" size={18} color="#E67012" style={{ marginRight: 8 }} />
                </Text>
                  <TranslatedText style={styles.uploadButtonText}>
                    {cvData.profileImage ? 'Change Photo' : 'Upload Photo'}
                  </TranslatedText>
              </TouchableOpacity>
            </View>
            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Name & Surname (*)</TranslatedText>
            <TextInput
              style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
              value={cvData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Name"
              placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
            />
            <TextInput
              style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
              value={cvData.surname}
              onChangeText={(text) => handleChange('surname', text)}
              placeholder="Surname"
              placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
            />
            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Contact Information (*)</TranslatedText>
            <TextInput
              style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
              value={cvData.contactInfo}
              onChangeText={(text) => handleChange('contactInfo', text)}
              placeholder="+27"
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Email Address (*)</TranslatedText>
            <TextInput
              style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
              value={cvData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Email Address"
              keyboardType="email-address"
              placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
            />
            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Physical Address</TranslatedText>
            <TextInput
              style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
              value={cvData.physicalAddress}
              onChangeText={(text) => handleChange('physicalAddress', text)}
              placeholder="e.g., 123 Main St"
              placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
            />
            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Summary</TranslatedText>
            <TextInput
              style={[styles.input, styles.summaryInput, { color: isDark ? '#d6d2d2ff' : '#333'}]}
              value={cvData.summary}
              onChangeText={(text) => handleChange('summary', text)}
              placeholder="Highly motivated..."
              multiline
              placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
            />
          </View>
        );
      case "skills_experience":
        return (
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Text>
                <FontAwesome6 name="briefcase" size={18} color={isDark ? '#fff' : '#000'} />
              </Text>
              <TranslatedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Skills and Experience</TranslatedText>
            </View>

            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Highest Qualification (*)</TranslatedText>
            <TextInput
              style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
              value={cvData.highestQualification}
              onChangeText={(text) => handleChange('highestQualification', text)}
              placeholder="Highest Qualification"
              placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
            />
            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Year Obtained</TranslatedText>
            <TextInput
              style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
              value={cvData.yearObtained}
              onChangeText={(text) => handleChange('yearObtained', text)}
              placeholder="Select year"
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
            />

            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Certifications</TranslatedText>
            {cvData.certifications.map((cert, index) => (
              <View key={index} style={styles.arrayItemRow}>
                <TextInput
                  style={[styles.input, styles.arrayItemInput, {color: isDark ? '#d6d2d2ff' : '#333' }]}
                  value={cert.name}
                  onChangeText={(text) => handleArrayItemChange('certifications', index, 'name', text)}
                  placeholder="Certification Name"
                  placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
                />
                <TouchableOpacity onPress={() => removeArrayItem('certifications', index)} style={styles.removeArrayItemButton}>
                
                <AntDesign name="minus-circle" size={24} color="#E67012" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addArrayItem('certifications')} style={styles.addArrayItemButton}>
              <AntDesign name="plus-circle" size={24} color="#E67012" />
              <TranslatedText style={styles.addArrayItemText}>Add Certification</TranslatedText>
            </TouchableOpacity>

            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000'}]}>Awards</TranslatedText>
            {cvData.awards.map((award, index) => (
              <View key={index} style={styles.arrayItemRow}>
                <TextInput
                  style={[styles.input, styles.arrayItemInput, { color: isDark ? '#d6d2d2ff' : '#333' }]}
                  value={award.name}
                  onChangeText={(text) => handleArrayItemChange('awards', index, 'name', text)}
                  placeholder="Award Name"
                  placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
                />
                <TouchableOpacity onPress={() => removeArrayItem('awards', index)} style={styles.removeArrayItemButton}>
                
                <AntDesign name="minus-circle" size={24} color="#E67012" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addArrayItem('awards')} style={styles.addArrayItemButton}>
              
              <AntDesign name="plus-circle" size={24} color="#E67012" />
              <TranslatedText style={styles.addArrayItemText}>Add Award</TranslatedText>
            </TouchableOpacity>

            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Experience (*)</TranslatedText>
            {cvData.experience.map((exp, index) => (
              <View key={index} style={styles.itemContainer}>
                <TextInput
                  style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
                  value={exp.title}
                  onChangeText={(text) => handleArrayItemChange('experience', index, 'title', text)}
                  placeholder="Job Title"
                  placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
                />
                <TextInput
                  style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
                  value={exp.company}
                  onChangeText={(text) => handleArrayItemChange('experience', index, 'company', text)}
                  placeholder="Company"
                  placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
                />
                <TextInput
                  style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
                  value={exp.duration}
                  onChangeText={(text) => handleArrayItemChange('experience', index, 'duration', text)}
                  placeholder="Duration (e.g.,   Jan 2022 - Present)"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={[styles.input, styles.multilineInput, { color: isDark ? '#d6d2d2ff' : '#333' }]}
                  value={exp.description}
                  onChangeText={(text) => handleArrayItemChange('experience', index, 'description', text)}
                  placeholder="Description"
                  multiline
                  placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
                />
                <TouchableOpacity onPress={() => removeArrayItem('experience', index)} style={styles.removeItemButton}>
                  <TranslatedText style={[styles.removeItemText, { color: "#fff"}]}>Remove Experience</TranslatedText>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addArrayItem('experience')} style={[styles.addItemButton, { backgroundColor: isDark ? '#333' : '#fff', borderColor: '#E67012', borderWidth: 1 }]}>
            <AntDesign name="plus-circle" size={24} color="#E67012" />
              <TranslatedText style={[styles.addItemText, { color:'#E67012', marginLeft: 12 }]}> Add Experience</TranslatedText>
            </TouchableOpacity>

            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Skills</TranslatedText>
            <View style={styles.skillsContainer}>
              {cvData.skills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <TextInput
                    style={[styles.skillInput, { color: isDark ? '#d6d2d2ff' : '#333' }]}
                    value={skill}
                    onChangeText={(text) => {
                      const newSkills = [...cvData.skills];
                      newSkills[index] = text;
                      setCvData(prevData => ({ ...prevData, skills: newSkills }));
                    }}
                    placeholder="Skill"
                    placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
                  />
                  <TouchableOpacity onPress={() => {
                    const newSkills = cvData.skills.filter((_, i) => i !== index);
                    setCvData(prevData => ({ ...prevData, skills: newSkills }));
                  }} style={styles.removeSkillButton}>
                    <Text style={styles.removeSkillText}>x</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => addArrayItem('skills')} style={styles.addSkillButton}>
                <TranslatedText style={[styles.addSkillText, { color: isDark ? '#fff' : '#fff' }]}>+ Add Skill</TranslatedText>
              </TouchableOpacity>
            </View>
          </View>
        );
      case "upload_docs":
        return (
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
            <View style={styles.sectionHeader}>
                              <Text>
                  <FontAwesome6 name="upload" size={20} color="#000" />
                </Text>
              <TranslatedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Upload Documents</TranslatedText>
            </View>
            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Highest Qualification:</TranslatedText>
            <TextInput
              style={[styles.input, { color: isDark ? '#d6d2d2ff' : '#333' }]}
              value={cvData.highestQualification}
              onChangeText={(text) => handleChange('highestQualification', text)}
              placeholder="Highest Qualification"
              placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
            />
            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Certifications:</TranslatedText>
            {cvData.certifications.map((cert, index) => (
              <View key={index} style={styles.arrayItemRow}>
                <TextInput
                  style={[styles.input, styles.arrayItemInput, { color: isDark ? '#d6d2d2ff' : '#333' }]}
                  value={cert.name}
                  onChangeText={(text) => handleArrayItemChange('certifications', index, 'name', text)}
                  placeholder="Certification Name"
                  placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
                />
                <TouchableOpacity onPress={() => removeArrayItem('certifications', index)} style={styles.removeArrayItemButton}>
                  <AntDesign name="minus-circle" size={24} color="#E67012" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addArrayItem('certifications')} style={styles.addArrayItemButton}>
              <AntDesign name="plus-circle" size={24} color="#E67012" />
              <TranslatedText style={styles.addArrayItemText}>Add Certification</TranslatedText>
            </TouchableOpacity>

            <TranslatedText style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>Awards:</TranslatedText>
            {cvData.awards.map((award, index) => (
              <View key={index} style={styles.arrayItemRow}>
                <TextInput
                  style={[styles.input, styles.arrayItemInput, { color: isDark ? '#d6d2d2ff' : '#333' }]}
                  value={award.name}
                  onChangeText={(text) => handleArrayItemChange('awards', index, 'name', text)}
                  placeholder="Award Name"
                  placeholderTextColor={isDark ? "#d6d2d2ff" : "#888"}
                />
                <TouchableOpacity onPress={() => removeArrayItem('awards', index)} style={styles.removeArrayItemButton}>
                  <AntDesign name="minus-circle" size={24} color="#E67012" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addArrayItem('awards')} style={styles.addArrayItemButton}>
              <AntDesign name="plus-circle" size={24} color="#E67012" />
              <TranslatedText style={styles.addArrayItemText}>Add Award</TranslatedText>
            </TouchableOpacity>

            <TranslatedText style={styles.uploadOptionTitle}>Choose upload option</TranslatedText>
            <TouchableOpacity style={styles.uploadButton}>
              <TranslatedText style={styles.uploadButtonText}>Select from Platform courses</TranslatedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton}>
              <TranslatedText style={styles.uploadButtonText}>Upload from Device</TranslatedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowTemplateScreen(true)}
              style={styles.generateCVButton}
            >
                  <LinearGradient
            colors={['#1DACFF', '#1E90FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
              <TranslatedText style={styles.generateCVButtonText}>Choose Template & Colour</TranslatedText>
            </TouchableOpacity>
          </View>
        );
      case "preview":
        return (
          selectedTemplate === 'template_2' ? (
            <GreenProfessionalTemplate
              data={{
                name: cvData.name + ' ' + cvData.surname,
                title: 'Professional', // You can map this from your data
                email: cvData.email,
                phone: cvData.contactInfo,
                address: cvData.physicalAddress,
                aboutMe: cvData.summary,
                description: '', // You can map this from your data
                experience: cvData.experience.map(exp => ({
                  company: exp.company,
                  period: exp.duration,
                  description: exp.description,
                })),
                education: cvData.highestQualification ? [{ institution: '', degree: cvData.highestQualification, period: cvData.yearObtained }] : [],
                skills: cvData.skills.map(skill => ({ name: skill, level: 80 })), // Example skill level
                languages: [], // Add if you have
                expertise: [], // Add if you have
                profileImage: cvData.profileImage,
                mainColor: selectedColor,
                ...cvData
              }}
            />
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text>
                  <FontAwesome6 name="eye" size={20} color="#E67012" />
                </Text>
                <TranslatedText style={styles.sectionTitle}>CV Preview</TranslatedText>
              </View>
              <Image
                source={cvData.profileImage ? { uri: cvData.profileImage } : require('../../assets/person.png')}
                style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 }}
              />
             
              <ScrollView style={styles.cvContentContainer}>
                
                <Text style={styles.cvName}>{cvData.name} {cvData.surname}</Text>
                <Text style={styles.cvContact}>{cvData.contactInfo} | {cvData.email}</Text>
                {cvData.physicalAddress ? <Text style={styles.cvContact}>{cvData.physicalAddress}</Text> : null}
                
                {cvData.summary ? (
                  <>
                    <Text style={styles.cvSectionHeader}>Summary</Text>
                    <Text style={styles.cvText}>{cvData.summary}</Text>
                  </>
                ) : null}
               
                {cvData.highestQualification ? (
                  <>
                    <Text style={styles.cvSectionHeader}>Education</Text>
                    <Text style={styles.cvItemTitle}>{cvData.highestQualification}</Text>
                    {cvData.yearObtained ? <Text style={styles.cvItemDetails}>Obtained: {cvData.yearObtained}</Text> : null}
                  </>
                ) : null}
                
                {cvData.experience.length > 0 && (
                  <>
                    <Text style={styles.cvSectionHeader}>Experience</Text>
                    {cvData.experience.map((exp, index) => (
                      <View key={index} style={styles.cvItem}>
                        <Text style={styles.cvItemTitle}>{exp.title}</Text>
                        <Text style={styles.cvItemDetails}>{exp.company} | {exp.duration}</Text>
                        <Text style={styles.cvItemDescription}>{exp.description}</Text>
                      </View>
                    ))}
                  </>
                )}
                
                {cvData.skills.length > 0 && (
                  <>
                    <Text style={styles.cvSectionHeader}>Skills</Text>
                    <Text style={styles.cvText}>{cvData.skills.join(', ')}</Text>
                  </>
                )}
                
                {cvData.certifications.length > 0 && (
                  <>
                    <Text style={styles.cvSectionHeader}>Certifications</Text>
                    {cvData.certifications.map((cert, index) => (
                      <Text key={index} style={styles.cvText}>• {cert.name}</Text>
                    ))}
                  </>
                )}
                
                {cvData.awards.length > 0 && (
                  <>
                    <Text style={styles.cvSectionHeader}>Awards</Text>
                    {cvData.awards.map((award, index) => (
                      <Text key={index} style={styles.cvText}>• {award.name}</Text>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>
          )
        );
      case "download":
        return (
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Text>
                <FontAwesome6 name="download" size={20} color="#E67012" />
              </Text>
              <TranslatedText style={styles.sectionTitle}>Download CV</TranslatedText>
            </View>
            <Image
              source={{ uri: 'https://placehold.co/300x400/E67012/ffffff?text=CV+Download' }} // Placeholder for CV download
              style={styles.cvPreviewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.downloadButton}
              disabled={isGeneratingPdf}
              onPress={async () => {
                if (pdfUri) {
                  try {
                    const info = await FileSystem.getInfoAsync(pdfUri);
                    if (info.exists) {
                      const canShare = await Sharing.isAvailableAsync();
                      if (canShare) {
                        // Native viewer: preview + save/download/share the PDF
                        await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Your CV', UTI: 'com.adobe.pdf' });
                        return;
                      }
                    }
                  } catch (e) { console.error('Existing PDF open failed:', e); }
                }
                // No usable PDF yet — generate it now, then open it
                await generatePdfLocally();
              }}
            >
              {isGeneratingPdf ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.downloadButtonText}>Download CV</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              disabled={isGeneratingPdf}
              onPress={async () => {
                if (!pdfUri) {
                  Alert.alert('No CV yet', 'Generate your CV first (choose a template), then share it.');
                  return;
                }
                try {
                  const info = await FileSystem.getInfoAsync(pdfUri);
                  if (!info.exists) {
                    Alert.alert('File missing', 'Please generate your CV again before sharing.');
                    return;
                  }
                  const canShare = await Sharing.isAvailableAsync();
                  if (!canShare) {
                    Alert.alert('Sharing unavailable', 'Your device does not allow file sharing right now.');
                    return;
                  }
                  await Sharing.shareAsync(pdfUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Share your CV',
                    UTI: 'com.adobe.pdf',
                  });
                } catch (e: any) {
                  console.error('Share CV failed:', e);
                  Alert.alert('Error', 'Could not share the CV. Please try again.');
                }
              }}
            >
              <Text style={styles.shareButtonText}>Share as Email</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return <Text>Unknown Step</Text>;
    }
  };

  if (showTemplateScreen) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1c1c1e' : '#f8f8f8' }}>
        <TemplateSelectionScreen
          onTemplateSelect={setSelectedTemplate}
          onColorSelect={setSelectedColor}
          selectedTemplate={selectedTemplate}
          selectedColor={selectedColor}
        />
        <TouchableOpacity style={{ margin: 24, backgroundColor: '#1E90FF', borderRadius: 8, padding: 16, alignItems: 'center' }} onPress={async () => {
          setShowTemplateScreen(false);
          // Prepare data for template (single source of truth — includes the user's actual name)
          const templateData = buildTemplateData();
          try {
            setIsGeneratingPdf(true);
            const base64Image = await getBase64ProfileImage();
            // Generate HTML based on selected template
            let html;
            if (selectedTemplate === 'template_1') {
              html = generateTemplate1HTML(templateData, selectedColor, base64Image);
            } else {
              html = generateGreenTemplateHTML(templateData, selectedColor, base64Image);
            }
            console.log('HTML sent to PDFLayer:', html.length, 'chars');
            // Try the cloud API first; fall back to reliable local generation via expo-print
            const apiKey = (Constants.expoConfig?.extra?.HTML2PDFROCKET_API_KEY || Constants.manifest?.extra?.HTML2PDFROCKET_API_KEY || 'YOUR_HTML2PDFROCKET_API_KEY_HERE');
            if (!apiKey || apiKey === 'YOUR_HTML2PDFROCKET_API_KEY_HERE') {
              await generatePdfLocally();
            } else {
              await generatePdfViaHtml2PdfRocket(html);
            }
            setShowSuccessScreen(true);
            setMyTemplates(prev => [
              ...prev,
              {
                data: templateData,
                template: selectedTemplate,
                color: selectedColor,
                date: new Date().toLocaleString()
              }
            ]);
          } catch (e: any) {
            console.error('CV generation failed:', e);
            Alert.alert('Error', 'Could not generate your CV. Please try again.');
          } finally {
            setIsGeneratingPdf(false);
          }
        }}>
          <LinearGradient
            colors={['#1DACFF', '#1E90FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
          <TranslatedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Generate CV</TranslatedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (showMyTemplatesScreen) {
    return <MyTemplatesScreen templates={myTemplates} onPreview={async idx => {
      // Restore the saved CV + template selection and open the preview screen.
      const saved = myTemplates[idx];
      setSelectedTemplate(saved.template);
      setSelectedColor(saved.color);
      setCvData(prev => ({
        ...prev,
        ...(saved.data && typeof saved.data === 'object'
          ? {
              name: saved.data.name ?? prev.name,
              surname: saved.data.surname ?? prev.surname,
              contactInfo: saved.data.contactInfo ?? saved.data.phone ?? prev.contactInfo,
              email: saved.data.email ?? prev.email,
              physicalAddress: saved.data.physicalAddress ?? saved.data.address ?? prev.physicalAddress,
              summary: saved.data.summary ?? saved.data.aboutMe ?? prev.summary,
            }
          : {}),
      }));
      setShowMyTemplatesScreen(false);
      setCurrentStep(cvBuilderSteps.findIndex(step => step.type === 'preview'));
      // Also let the user open the previously generated PDF directly
      if (pdfUri) {
        try {
          const info = await FileSystem.getInfoAsync(pdfUri);
          if (info.exists && (await Sharing.isAvailableAsync())) {
            Alert.alert('Preview ready', 'You can view your CV now, or tap Download CV to open the PDF.', [
              { text: 'Stay here', style: 'cancel' },
              { text: 'Open PDF', onPress: () => Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' }) },
            ]);
          }
        } catch (e) { /* non-blocking */ }
      }
    }} />;
  }

  if (showSuccessScreen) {
    return <GenerationSuccessScreen pdfUri={pdfUri} onDownload={async () => {
      if (!pdfUri) {
        // No PDF yet — generate it now so the button always works
        await generatePdfLocally();
        return;
      }
      try {
        const info = await FileSystem.getInfoAsync(pdfUri);
        if (!info.exists) {
          Alert.alert('File missing', 'The CV file could not be found. Please generate your CV again.');
          setShowSuccessScreen(false);
          return;
        }
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          // Opens the native viewer: preview + save-to-device/download/share in one place
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Your CV',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Sharing unavailable', 'Enable sharing on your device or update Expo Go to open the PDF.', [{ text: 'OK' }]);
        }
      } catch (e: any) {
        console.error('Failed to open CV PDF:', e);
        Alert.alert('Error', 'Could not open the CV PDF. Please try again.');
      }
    }} onBack={() => { setShowSuccessScreen(false); setCurrentStep(0); }} />;
  }

  if (isGeneratingPdf) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={{ marginTop: 24, fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Generating PDF, please wait...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: isDark  ? '#121212' : '#f8f8f8'}]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
     
        <View style={styles.header}>
          <TouchableOpacity onPress={goToPreviousStep} disabled={currentStep === 0} style={styles.backButton}>
            <Text>
              <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CV Builder</Text>
          <View style={{ width: 20 }} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent} // Apply contentContainerStyle here
        >

          {renderStepContent()}

        
        

          
          <View style={styles.navigationContainer}>
            
            {currentStep === 0 && (
              <TouchableOpacity
                onPress={goToNextStep}
                style={styles.continueButton}
              >  <LinearGradient
              colors={['#FF9800', '#FF6D00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
            />
                <TranslatedText style={styles.nextButtonText}>Continue</TranslatedText>
              </TouchableOpacity>
            )}
          
            {(currentStep === cvBuilderSteps.findIndex(step => step.type === 'personal_info') ||
              currentStep === cvBuilderSteps.findIndex(step => step.type === 'skills_experience')) && (
              <TouchableOpacity
                onPress={goToNextStep}
                style={styles.nextButton}
              >
                  <LinearGradient
            colors={['#FF9800', '#FF6D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
                <TranslatedText style={styles.nextButtonText}>Next</TranslatedText>
              </TouchableOpacity>
            )}
           
            {(currentStep === cvBuilderSteps.findIndex(step => step.type === 'preview') ||
              currentStep === cvBuilderSteps.findIndex(step => step.type === 'download')) && (
              <View style={{ height: 40 }} /> // Spacer to maintain layout
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
        <BottomTabBar />


      {showGenerateAIChoice && (
        <View style={styles.overlay}>
          <View style={[styles.choiceModal, {backgroundColor: isDark ? '#313131ff' : '#fff'}]}>
            <TranslatedText style={[styles.choiceModalTitle, {color: isDark ? '#fff' : '#000'}]}>How would you like to generate your CV?</TranslatedText>
            <TouchableOpacity
              onPress={handleGenerateFromDocument} // Triggers simulated upload and CV generation
              style={[styles.choiceButton, {backgroundColor: isDark ? '#444' : '#f0f0f0'}]}
              disabled={isProcessingDocument}
            >
              {isProcessingDocument ? (
                <ActivityIndicator size="small" color="#E67012" style={styles.buttonIcon} />
              ) : (
                <Text>
                  <FontAwesome6 name="upload" size={20} color="#E67012" style={styles.buttonIcon} />
                </Text>
              )}
              <Text style={styles.choiceButtonText}>Upload Document</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGenerateFromAppInfo} // Triggers CV generation from current app data
              style={styles.choiceButton}
              disabled={isProcessingDocument}
            >
              {isProcessingDocument ? (
                <ActivityIndicator size="small" color="#E67012" style={styles.buttonIcon} />
              ) : (
                <Text>
                  <FontAwesome6 name="tablet-screen-button" size={20} color="#E67012" style={styles.buttonIcon} />
                </Text>
              )}
              <Text style={styles.choiceButtonText}>Use My App Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowGenerateAIChoice(false)}
              style={styles.cancelChoiceButton}
              disabled={isProcessingDocument}
            >
              <Text style={styles.cancelChoiceButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollViewContent: {
    paddingBottom: 80, // Add padding to the bottom of the scroll view to make space for the tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    paddingTop: 15,
    
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E67012',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 15,
  },
  // Intro Screen Styles
  introContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  introImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  introDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
    bottom: 10,
  },
  generateAIButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 30,
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    bottom: 25,
  },
  generateAIButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
  // General Section Styles
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    // color: '#E67012',
    marginLeft: 10,
  },
  viewCvButton: {
    marginLeft: 2, // Push to the right
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    
  },
  viewCvButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E67012',
    textAlign: 'center'
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  summaryInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Array Item Styles (for Certifications, Awards, Experience)
  arrayItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  arrayItemInput: {
    flex: 1,
    marginRight: 10,
  },
  removeArrayItemButton: {
    padding: 5,
  },
  addArrayItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E67012',
    marginTop: 5,
  },
  addArrayItemText: {
    color: '#E67012',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  itemContainer: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addItemButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E67012',
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  addItemText: {
    color: '#E67012',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeItemButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  removeItemText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Skills Styles
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillItem: {
    backgroundColor: 'rgba(255, 141, 60, 0.63)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  skillInput: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
    marginRight: 5,
    minWidth: 80,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  addSkillButton: {
    backgroundColor: '#5cb85c',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  addSkillText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeSkillButton: {
    marginLeft: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSkillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Upload Documents Styles
  uploadOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  uploadButton: {
    // backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E67012',
  },
  // CV Preview/Download Styles
  cvPreviewImage: {
    width: '100%',
    height: 400, // Fixed height for preview
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  cvContentContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    minHeight: 400, // Ensure it's tall enough to be visible
  },
  cvName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cvContact: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 3,
  },
  cvSectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E67012',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  cvText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
    lineHeight: 22,
  },
  cvItem: {
    marginBottom: 10,
  },
  cvItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cvItemDetails: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 2,
  },
  cvItemDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  generateCVButton: {
    // backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  generateCVButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#28a745', // Green for download
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#007bff', // Blue for share
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationContainer: {
    marginTop: 20,
    marginBottom: 20, // Add some space at the bottom
    alignItems: 'center',
  },
  nextButton: {
    // backgroundColor: '#E67012',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    
  },
  continueButton: {
    // backgroundColor: '#E67012',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    bottom: 50,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Styles for the choice modal overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's above other content
  },
  choiceModal: {
    borderRadius: 15,
    padding: 25,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  choiceModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',

    marginBottom: 20,
    textAlign: 'center',
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E67012',
    marginLeft: 10,
  },
  cancelChoiceButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelChoiceButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

// Add GenerationSuccessScreen
const GenerationSuccessScreen = ({ pdfUri, onDownload, onBack }) => {
  const { colors, isDark } = useTheme();
  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ alignItems: 'center', padding: 32 }}>
      <FontAwesome5 name="file-pdf" size={64} color="red" style={{ marginBottom: 24 }} />
      <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 12, color: isDark ?  colors.text : '#000'}}>CV Generated Successfully!</Text>
      <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 32, textAlign: 'center' }}>Your CV has been generated. Tap below to download and preview your PDF.</Text>
      <TouchableOpacity style={{ backgroundColor: '#1E90FF', borderRadius: 8, padding: 16, alignItems: 'center', width: "80%", marginBottom: 16 }} onPress={onDownload}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Download & Preview PDF</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ borderColor: '#E67012', borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center', width: "80%" }} onPress={onBack}>
        <Text style={{ color: '#E67012', fontWeight: 'bold', fontSize: 16 }}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
  );
};

export default CVBuilder;
