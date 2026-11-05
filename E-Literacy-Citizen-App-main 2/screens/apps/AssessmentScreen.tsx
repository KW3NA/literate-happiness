import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import TranslatedText from '../../components/TranslatedText';
import { useTheme } from '../../components/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import ProctorGate from '../../components/ProctorOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase';

// Mock questions data - replace with actual data from your state management
const mockQuestions = {
  1: [ // Digital Literacy Basics
    {
      id: 1,
      type: 'multiple_choice',
      question: 'What does "URL" stand for?',
      options: ['Universal Resource Locator', 'Uniform Resource Locator', 'United Resource Link', 'Universal Reference Link'],
      correctAnswer: 1,
    },
    {
      id: 2,
      type: 'true_false',
      question: 'A web browser is required to access the internet.',
      correctAnswer: true,
    },
    {
      id: 3,
      type: 'fill_blank',
      question: 'The _____ is the main screen area that you see after you turn on your computer.',
      correctAnswer: 'desktop',
    },
    {
      id: 4,
      type: 'multiple_choice',
      question: 'Which of the following is NOT an operating system?',
      options: ['Windows', 'macOS', 'Chrome', 'Linux'],
      correctAnswer: 2,
    },
    {
      id: 5,
      type: 'fill_blank',
      question: 'To save a file, you typically use the keyboard shortcut Ctrl + _____.',
      correctAnswer: 'S',
    },
    { id: 6, type: 'multiple_choice', question: 'Which hardware component stores your files permanently?', options: ['RAM', 'Hard drive / SSD', 'CPU fan', 'Mouse pad'], correctAnswer: 1 },
    { id: 7, type: 'true_false', question: "Closing all browser tabs frees up your computer's memory (RAM).", correctAnswer: true },
    { id: 8, type: 'multiple_choice', question: 'What does "Wi-Fi" allow you to do?', options: ['Print without ink', 'Connect to the internet wirelessly', 'Charge your laptop', 'Scan documents'], correctAnswer: 1 },
    { id: 9, type: 'fill_blank', question: "The software that manages a computer's basic functions is called the operating _____.", correctAnswer: 'system' },
    { id: 10, type: 'multiple_choice', question: 'Which key combination copies selected text?', options: ['Ctrl + V', 'Ctrl + C', 'Ctrl + P', 'Ctrl + Z'], correctAnswer: 1 },
    { id: 11, type: 'true_false', question: 'A megabyte (MB) is larger than a gigabyte (GB).', correctAnswer: false },
    { id: 12, type: 'multiple_choice', question: 'Where do most email programs store deleted messages temporarily?', options: ['Recycle/Trash folder', 'Clipboard', 'Cache', 'Cloud only'], correctAnswer: 0 },
    { id: 13, type: 'fill_blank', question: 'A program that harms your computer is commonly called a virus or _____.', correctAnswer: 'malware' },
    { id: 14, type: 'multiple_choice', question: 'What should you do before plugging in a found USB drive?', options: ['Open all files quickly', 'Scan it with antivirus software', 'Format your computer', 'Rename the drive'], correctAnswer: 1 },
    { id: 15, type: 'true_false', question: 'Restarting a device can fix many minor software problems.', correctAnswer: true },
    { id: 16, type: 'multiple_choice', question: 'Which file extension belongs to a PDF document?', options: ['.jpg', '.mp4', '.pdf', '.zip'], correctAnswer: 2 },
    { id: 17, type: 'fill_blank', question: 'The moving pointer on your screen controlled by mouse or touchpad is called the _____.', correctAnswer: 'cursor' },
    { id: 18, type: 'multiple_choice', question: 'What is the purpose of antivirus software?', options: ['Speed up internet', 'Detect and remove malicious programs', 'Edit videos', 'Organise photos'], correctAnswer: 1 },
    { id: 19, type: 'true_false', question: 'Files moved to the Recycle Bin are gone forever immediately.', correctAnswer: false },
    { id: 20, type: 'multiple_choice', question: 'Which of these is an input device?', options: ['Printer', 'Speaker', 'Keyboard', 'Monitor'], correctAnswer: 2 },
    { id: 21, type: 'fill_blank', question: 'The bar on a desktop where running apps appear as buttons is the task_____.', correctAnswer: 'bar' },
    { id: 22, type: 'multiple_choice', question: 'What does RAM stand for?', options: ['Rapid Access Memory', 'Random Access Memory', 'Read And Manage', 'Runtime App Mode'], correctAnswer: 1 },
    { id: 23, type: 'true_false', question: 'File extensions like .docx help your computer choose which program opens the file.', correctAnswer: true },
    { id: 24, type: 'multiple_choice', question: 'Safest place to download an Android app?', options: ['Any APK website', 'Google Play Store', 'Email attachments', 'QR codes from strangers'], correctAnswer: 1 },
    { id: 25, type: 'fill_blank', question: 'Files stored inside one compressed file for easy transfer form an _____.', correctAnswer: 'archive' },
  ],
  2: [ // Online Safety
    {
      id: 1,
      type: 'true_false',
      question: 'It is safe to use the same password for all your online accounts.',
      correctAnswer: false,
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: 'What is phishing?',
      options: ['A type of computer virus', 'Fraudulent attempt to obtain sensitive information', 'A way to speed up internet', 'A social media feature'],
      correctAnswer: 1,
    },
    {
      id: 3,
      type: 'fill_blank',
      question: 'A strong password should contain at least _____ characters.',
      correctAnswer: '8',
    },
    {
      id: 4,
      type: 'multiple_choice',
      question: 'Which of these is a sign of a secure website?',
      options: ['HTTP in the URL', 'HTTPS in the URL', 'No lock icon', 'Pop-up advertisements'],
      correctAnswer: 1,
    },
    { id: 5, type: 'true_false', question: 'Two-factor authentication adds an extra step when logging in.', correctAnswer: true },
    { id: 6, type: 'fill_blank', question: 'A fake website designed to steal your login details is part of a _____ attack.', correctAnswer: 'phishing' },
    { id: 7, type: 'multiple_choice', question: 'What should you do with software security updates?', options: ['Ignore them', 'Install them promptly', 'Delay for a year', 'Uninstall the app'], correctAnswer: 1 },
    { id: 8, type: 'true_false', question: 'Free public Wi-Fi is always safe for online banking.', correctAnswer: false },
    { id: 9, type: 'multiple_choice', question: 'Which is the best password habit?', options: ['Reuse one strong password', 'Different password per account', 'Use your name', 'Write it on the device'], correctAnswer: 1 },
    { id: 10, type: 'fill_blank', question: 'Software that encrypts your files and demands payment is called _____.', correctAnswer: 'ransomware' },
    { id: 11, type: 'multiple_choice', question: 'Who should see your ATM PIN?', options: ['Anyone asking politely', 'Only you', 'Your bank via WhatsApp', 'Family members'], correctAnswer: 1 },
    { id: 12, type: 'true_false', question: 'Checking "HTTPS" and the padlock helps confirm a site is secured.', correctAnswer: true },
    { id: 13, type: 'multiple_choice', question: 'A suspicious email from your "bank" with urgent links should be…', options: ['Clicked quickly', 'Reported and deleted', 'Forwarded to all friends', 'Answered with your PIN'], correctAnswer: 1 },
    { id: 14, type: 'fill_blank', question: 'Logging out of shared computers protects your _____.', correctAnswer: 'account' },
    { id: 15, type: 'multiple_choice', question: 'Which app permission request is a red flag?', options: ['Camera for selfies', 'Contacts for a torch app', 'Location for maps', 'Microphone for calls'], correctAnswer: 1 },
    { id: 16, type: 'true_false', question: 'Updating your apps and operating system patches security holes.', correctAnswer: true },
    { id: 17, type: 'fill_blank', question: 'Unsolicited bulk emails promoting scams are called _____.', correctAnswer: 'spam' },
    { id: 18, type: 'multiple_choice', question: 'A password manager helps you…', options: ['Reuse one password everywhere', 'Store unique strong passwords safely', 'Share passwords automatically', 'Forget your PIN publicly'], correctAnswer: 1 },
    { id: 19, type: 'true_false', question: 'Scammers can spoof caller ID to look like your bank.', correctAnswer: true },
    { id: 20, type: 'fill_blank', question: 'Privacy settings that limit who sees your posts control your audience _____.', correctAnswer: 'visibility' },
  ],

  3: [ // Intro to Email & Messaging
    { id: 1, type: 'multiple_choice', question: 'What does "CC" stand for in an email?', options: ['Carbon Copy', 'Computer Call', 'Central Contact', 'Confidential Chat'], correctAnswer: 0 },
    { id: 2, type: 'true_false', question: 'Writing in ALL CAPS in an email is considered shouting and unprofessional.', correctAnswer: true },
    { id: 3, type: 'fill_blank', question: 'To attach a document or photo to an email, click the _____ icon.', correctAnswer: 'paperclip' },
    { id: 4, type: 'multiple_choice', question: 'Which of the following is a secure way to access your email?', options: ['Two-Factor Authentication', 'Leaving it open in a public cafe', 'Using password123', 'Sharing your password with coworkers'], correctAnswer: 0 },
    { id: 5, type: 'multiple_choice', question: '"Bcc" in an email means recipients are…', options: ['Copied invisibly', 'Copied visibly to all', 'Blocked', 'Auto-replied'], correctAnswer: 0 },
    { id: 6, type: 'true_false', question: 'You should reply to suspicious emails asking for your password.', correctAnswer: false },
    { id: 7, type: 'fill_blank', question: 'The short line summarising an email topic is the subject _____.', correctAnswer: 'line' },
    { id: 8, type: 'multiple_choice', question: 'A professional email sign-off is…', options: ['"Later!"', '"Kind regards,"', '"!!!"', 'Silence'], correctAnswer: 1 },
    { id: 9, type: 'true_false', question: 'Attachments can carry viruses even from known senders if their account is hacked.', correctAnswer: true },
    { id: 10, type: 'multiple_choice', question: 'Best inbox practice is…', options: ['Delete everything', 'Use folders and archive', 'Never read email', 'Keep 5000 unread'], correctAnswer: 1 },
    { id: 11, type: 'fill_blank', question: 'The option to stop receiving marketing emails is called _____.', correctAnswer: 'unsubscribe' },
    { id: 12, type: 'true_false', question: 'Video calls need both a camera and a microphone to work well.', correctAnswer: true },
    { id: 13, type: 'multiple_choice', question: 'In messaging apps, two grey ticks usually mean…', options: ['Read', 'Delivered', 'Failed', 'Blocked'], correctAnswer: 1 },
    { id: 14, type: 'multiple_choice', question: 'When joining a work video call you should first…', options: ['Test audio/video', 'Share your screen music', 'Mute everyone else', 'Leave immediately'], correctAnswer: 0 },
    { id: 15, type: 'fill_blank', question: 'Typing in ALL CAPS online is interpreted as _____.', correctAnswer: 'shouting' },
    { id: 16, type: 'true_false', question: 'It is safe to send bank details over plain SMS.', correctAnswer: false },
    { id: 17, type: 'multiple_choice', question: 'Which tool is mainly used for team chat at work?', options: ['Excel', 'Microsoft Teams', 'Paint', 'VLC'], correctAnswer: 1 },
    { id: 18, type: 'multiple_choice', question: 'An out-of-office reply is used when…', options: ['You are on leave', 'You are angry', 'Email is broken', 'You travel offline forever'], correctAnswer: 0 },
    { id: 19, type: 'fill_blank', question: 'Saving an email address list for quick sending is called _____.', correctAnswer: 'contacts' },
    { id: 20, type: 'true_false', question: 'Clear subject lines increase the chance your email gets opened.', correctAnswer: true },
  ],
  4: [ // Content Creation Toolkit
    { id: 1, type: 'multiple_choice', question: 'Which format is best for transparent digital graphics and logos?', options: ['.PNG', '.JPEG', '.TXT', '.MP3'], correctAnswer: 0 },
    { id: 2, type: 'true_false', question: 'You can freely use any image found on Google without checking for copyright or license.', correctAnswer: false },
    { id: 3, type: 'fill_blank', question: 'The visual balance and arrangement of elements in a design is called the _____.', correctAnswer: 'layout' },
    { id: 4, type: 'multiple_choice', question: 'What is the main goal of a content creation thumbnail?', options: ['Catch audience interest honestly', 'Crash the viewer phone', 'Hide what the video is about', 'Make the file as big as possible'], correctAnswer: 0 },
    { id: 5, type: 'multiple_choice', question: 'Which layout principle groups related items together?', options: ['Proximity', 'Randomness', 'Blur', 'Noise'], correctAnswer: 0 },
    { id: 6, type: 'true_false', question: 'Most social media viewers watch videos with the sound off.', correctAnswer: true },
    { id: 7, type: 'fill_blank', question: 'Vertical video format used by TikTok/Reels has ratio 9:_____.', correctAnswer: '16' },
    { id: 8, type: 'multiple_choice', question: 'A good video hook appears within…', options: ['First 2 seconds', 'Last minute', 'The description only', 'Mid-roll ad'], correctAnswer: 0 },
    { id: 9, type: 'multiple_choice', question: 'Which app is commonly used for free graphic design?', options: ['Photoshop only', 'Canva', 'Notepad', 'WinRAR'], correctAnswer: 1 },
    { id: 10, type: 'true_false', question: 'You may use any famous song in your video without a license.', correctAnswer: false },
    { id: 11, type: 'fill_blank', question: 'Text captions added over video improve accessibility and _____.', correctAnswer: 'engagement' },
    { id: 12, type: 'multiple_choice', question: 'Best lighting for phone video is…', options: ['Window behind you', 'Light facing your face', 'Pitch dark room', 'Flashing torch'], correctAnswer: 1 },
    { id: 13, type: 'multiple_choice', question: 'Which font count keeps a poster readable?', options: ['About two', 'At least eight', 'One per corner', 'Twenty'], correctAnswer: 0 },
    { id: 14, type: 'true_false', question: 'Repurposing one lesson into several posts saves time.', correctAnswer: true },
    { id: 15, type: 'fill_blank', question: 'The profile picture and bio together form your online _____.', correctAnswer: 'brand' },
    { id: 16, type: 'multiple_choice', question: 'Trimming silence during editing makes videos…', options: ['Longer', 'Tighter and clearer', 'Corrupted', 'Slower to load'], correctAnswer: 1 },
    { id: 17, type: 'multiple_choice', question: 'Colour contrast in design helps…', options: ['Hide information', 'Make key elements stand out', 'Reduce readability', 'Increase file size'], correctAnswer: 1 },
    { id: 18, type: 'true_false', question: 'Consistent posting schedules beat occasional viral spikes.', correctAnswer: true },
    { id: 19, type: 'fill_blank', question: 'A short repeated intro style across videos shows good _____.', correctAnswer: 'consistency' },
    { id: 20, type: 'multiple_choice', question: 'Royalty-free images are chosen because they…', options: ['Are always free of quality', 'Can be legally reused', 'Load slower', 'Have no copyright info needed'], correctAnswer: 1 },
    { id: 21, type: 'multiple_choice', question: 'Which metric best shows content resonance?', options: ['File size', 'Watch time / engagement', 'Upload speed', 'Battery drain'], correctAnswer: 1 },
    { id: 22, type: 'true_false', question: 'White space in a design is wasted area.', correctAnswer: false },
    { id: 23, type: 'fill_blank', question: 'Editing clips on a phone can be done with CapCut or In_____.', correctAnswer: 'Shot' },
    { id: 24, type: 'multiple_choice', question: 'A thumbnail should…', options: ['Hide the topic', 'Honestly spark interest', 'Be pure black', 'Contain your ID number'], correctAnswer: 1 },
    { id: 25, type: 'true_false', question: 'Captions also help viewers who are hard of hearing.', correctAnswer: true },
    { id: 26, type: 'multiple_choice', question: 'Batch-creating content means…', options: ['Posting once a year', 'Making several posts in one session', 'Deleting drafts', 'Buying followers'], correctAnswer: 1 },
    { id: 27, type: 'fill_blank', question: 'The story arc of a reel is often hook, value, call-to-_____.', correctAnswer: 'action' },
    { id: 28, type: 'multiple_choice', question: 'Which audio source gives the clearest voice?', options: ['Phone mic far away', 'Mic/close recording near mouth', 'Speakerphone outdoors', 'Muted video'], correctAnswer: 1 },
    { id: 29, type: 'true_false', question: 'Hashtags never help discovery on social platforms.', correctAnswer: false },
    { id: 30, type: 'multiple_choice', question: 'Before publishing, you should always…', options: ['Skip proofreading', 'Review spelling, links and privacy', 'Post from another person phone', 'Delete the project'], correctAnswer: 1 },
  ],
  5: [ // Digital Banking & Finance
    { id: 1, type: 'true_false', question: 'Your bank will frequently call you asking for your confidential ATM PIN.', correctAnswer: false },
    { id: 2, type: 'multiple_choice', question: 'What is an OTP in digital banking?', options: ['One-Time Password / PIN', 'Online Tax Payment', 'Official Transfer Paper', 'Optional Tech Protection'], correctAnswer: 0 },
    { id: 3, type: 'fill_blank', question: 'A digital _____ lets you pay for goods using your smartphone without touching a physical card.', correctAnswer: 'wallet' },
    { id: 4, type: 'true_false', question: 'Sharing your full card number and OTP with a caller is safe if they claim to be your bank.', correctAnswer: false },
    { id: 5, type: 'multiple_choice', question: 'The safest way to check your balance is…', options: ['Official banking app', 'Random SMS link', 'Cafe Wi-Fi portal', 'Stranger WhatsApp'], correctAnswer: 0 },
    { id: 6, type: 'fill_blank', question: 'A monthly plan tracking income and spending is called a _____.', correctAnswer: 'budget' },
    { id: 7, type: 'multiple_choice', question: 'What does EFT mean in South African banking?', options: ['Electronic Funds Transfer', 'Easy Fast Tax', 'External Fee Ticket', 'Email For Transaction'], correctAnswer: 0 },
    { id: 8, type: 'true_false', question: 'Enabling transaction alerts helps detect fraud early.', correctAnswer: true },
    { id: 9, type: 'multiple_choice', question: 'Interest charged on unpaid credit debt is called…', options: ['Dividend', 'Interest', 'Commission', 'Levy'], correctAnswer: 1 },
    { id: 10, type: 'fill_blank', question: 'Paying by tapping your phone uses contactless _____.', correctAnswer: 'technology' },
    { id: 11, type: 'multiple_choice', question: 'A savings account differs from a transactional account because it…', options: ['Cannot earn interest', 'Is meant for storing money, often earning interest', 'Has no login', 'Is illegal'], correctAnswer: 1 },
    { id: 12, type: 'true_false', question: 'Checking statements monthly is good financial practice.', correctAnswer: true },
    { id: 13, type: 'multiple_choice', question: 'Which is a red flag in an investment offer?', options: ['Guaranteed huge returns overnight', 'Licensed company disclosures', 'Written contract', 'Regulator registration'], correctAnswer: 0 },
    { id: 14, type: 'fill_blank', question: 'The secure code sent to your phone to confirm payments is the _____.', correctAnswer: 'OTP' },
    { id: 15, type: 'multiple_choice', question: 'Digital invoicing mainly saves…', options: ['Electricity only', 'Time and paper costs', 'Your PIN', 'Storage battery'], correctAnswer: 1 },
    { id: 16, type: 'true_false', question: 'You should save passwords inside the banking app itself.', correctAnswer: false },
    { id: 17, type: 'multiple_choice', question: 'Mobile data caps matter because…', options: ['Data is unlimited everywhere', 'Overuse costs extra money', 'Apps stop working', 'Phones overheat'], correctAnswer: 1 },
    { id: 18, type: 'fill_blank', question: 'A small business ledger tracks money in and money _____.', correctAnswer: 'out' },
    { id: 19, type: 'multiple_choice', question: 'PayFast, Yoco and SnapScan are examples of…', options: ['Social networks', 'Payment gateways/apps', 'Antivirus tools', 'Cloud drives'], correctAnswer: 1 },
    { id: 20, type: 'true_false', question: 'Logging out of internet banking on shared devices protects your account.', correctAnswer: true },
    { id: 21, type: 'multiple_choice', question: 'Compound interest means…', options: ['Interest earned only on principal', 'Earning interest on previous interest too', 'No growth', 'Fixed tax'], correctAnswer: 1 },
    { id: 22, type: 'fill_blank', question: 'The fee banks charge for keeping an account open is a monthly service _____.', correctAnswer: 'fee' },
    { id: 23, type: 'multiple_choice', question: 'Best habit before clicking a payment link is…', options: ['Verify sender and URL', 'Enter PIN quickly', 'Screenshot your card', 'Turn off internet'], correctAnswer: 0 },
    { id: 24, type: 'true_false', question: 'Emergency funds should ideally cover about three months of expenses.', correctAnswer: true },
    { id: 25, type: 'multiple_choice', question: 'Which document proves a bank transaction occurred?', options: ['Bank statement/receipt', 'Selfie', 'Music playlist', 'Calendar note'], correctAnswer: 0 },
    { id: 26, type: 'multiple_choice', question: 'An emergency fund is mainly used for…', options: ['Impulse purchases', 'Unexpected expenses like repairs or job loss', 'Buying crypto on a tip', 'Paying for adverts'], correctAnswer: 1 },
    { id: 27, type: 'true_false', question: 'Checking your credit report occasionally is a healthy financial habit.', correctAnswer: true },
    { id: 28, type: 'fill_blank', question: 'Money you owe to others is called a _____.', correctAnswer: 'debt' },
    { id: 29, type: 'multiple_choice', question: 'Which is usually the cheapest way to move money between your own accounts?', options: ['Same-bank transfer', 'Cash courier', 'International wire', 'Payday loan'], correctAnswer: 0 },
    { id: 30, type: 'true_false', question: "An SMS saying 'Your account is blocked, click here' should be clicked quickly.", correctAnswer: false },
    { id: 31, type: 'fill_blank', question: 'Card number, expiry date and CVV together are your card _____.', correctAnswer: 'details' },
    { id: 32, type: 'multiple_choice', question: 'Regular monthly savings are easiest to keep up by…', options: ['Setting up an automatic transfer', 'Hoping you remember', 'Asking friends to save for you', 'Keeping cash under the mattress'], correctAnswer: 0 },
    { id: 33, type: 'true_false', question: 'Investing always guarantees that you will make money.', correctAnswer: false },
    { id: 34, type: 'fill_blank', question: 'The price of one currency expressed in another is the exchange _____.', correctAnswer: 'rate' },
    { id: 35, type: 'multiple_choice', question: 'If you suspect card fraud, the FIRST step is…', options: ['Block the card and contact your bank', 'Post about it online', 'Wait and see', 'Order a new card from a random website'], correctAnswer: 0 },
  ],
  6: [ // E-Government Services
    { id: 1, type: 'multiple_choice', question: 'Which official portal in South Africa is zero-rated on mobile networks for young job seekers?', options: ['SA Youth (sayouth.mobi)', 'Facebook', 'Twitter', 'Amazon'], correctAnswer: 0 },
    { id: 2, type: 'true_false', question: 'South African citizens can renew vehicle licenses and apply for smart IDs through official government online portals.', correctAnswer: true },
    { id: 3, type: 'fill_blank', question: 'The South African Revenue Service online portal is called SARS _____.', correctAnswer: 'eFiling' },
    { id: 4, type: 'multiple_choice', question: 'eFiling is used to submit taxes to which department?', options: ['Home Affairs', 'SARS', 'Health', 'Transport'], correctAnswer: 1 },
    { id: 5, type: 'true_false', question: 'Zero-rated educational sites like sayouth.mobi do not consume your mobile data.', correctAnswer: true },
    { id: 6, type: 'fill_blank', question: 'The national electronic identity card is called the smart _____.', correctAnswer: 'ID' },
    { id: 7, type: 'multiple_choice', question: 'Where can you book an Home Affairs appointment online?', options: ['DHA official website', 'Any random blog', 'Paper queue only', 'Social DM'], correctAnswer: 0 },
    { id: 8, type: 'true_false', question: 'Government portals never ask for personal information.', correctAnswer: false },
    { id: 9, type: 'multiple_choice', question: 'NSFAS applications for students are submitted via…', options: ['The NSFAS online portal', 'WhatsApp voice note', 'Radio ad', 'Postal letter only'], correctAnswer: 0 },
    { id: 10, type: 'fill_blank', question: 'The official government domain in South Africa ends in gov._____.', correctAnswer: 'za' },
    { id: 11, type: 'multiple_choice', question: 'To verify a site is truly government-run, look for…', options: ['Bright colours', 'Official domain and padlock (HTTPS)', 'Pop-ups', 'Celebrity photos'], correctAnswer: 1 },
    { id: 12, type: 'true_false', question: 'Roadworthy and vehicle licence services can be partly accessed online.', correctAnswer: true },
    { id: 13, type: 'multiple_choice', question: 'A digital receipt from an e-service is useful because it…', options: ['Uses more paper', 'Provides proof of transaction', 'Blocks updates', 'Costs extra'], correctAnswer: 1 },
    { id: 14, type: 'fill_blank', question: 'Registering voters and checking status can be done on the Electoral Commission _____.', correctAnswer: 'website' },
    { id: 15, type: 'multiple_choice', question: 'If an official portal is down, a sensible step is…', options: ['Give up forever', 'Retry later or use an official alternative channel', 'Pay a stranger to apply', 'Share your ID publicly'], correctAnswer: 1 },
    { id: 16, type: 'true_false', question: 'Scammers sometimes impersonate government departments via SMS.', correctAnswer: true },
    { id: 17, type: 'multiple_choice', question: 'Keeping records of application reference numbers helps you…', options: ['Track progress and follow up', 'Delete accounts', 'Slow the internet', 'Charge your device'], correctAnswer: 0 },
    { id: 18, type: 'fill_blank', question: 'The citizen portal for national services is often called a ____-services platform.', correctAnswer: 'e' },
    { id: 19, type: 'multiple_choice', question: 'Public library e-services typically provide…', options: ['Free internet access and digital catalogues', 'Car rentals', 'Flight tickets', 'Salary payment'], correctAnswer: 0 },
    { id: 20, type: 'true_false', question: 'You should photograph your ID and post it online for faster approvals.', correctAnswer: false },
    { id: 21, type: 'multiple_choice', question: 'Which is an official channel for service complaints?', options: ['The department contact centre/call centre', 'Anonymous forum', 'A rumour group', 'None exist'], correctAnswer: 0 },
    { id: 22, type: 'fill_blank', question: 'Applying for grants such as child support is handled by the Department of Social _____.', correctAnswer: 'Development' },
    { id: 23, type: 'multiple_choice', question: 'Using e-government services reduces…', options: ['Need for electricity', 'Travel time and queues', 'Number of citizens', 'Internet availability'], correctAnswer: 1 },
    { id: 24, type: 'true_false', question: 'Passwords for government portals should be unique and secret.', correctAnswer: true },
    { id: 25, type: 'multiple_choice', question: 'After completing an online application you should…', options: ['Save/download confirmation', 'Forget it exists', 'Share OTP publicly', 'Reapply ten times'], correctAnswer: 0 },
  ],
};

const AssessmentScreen = ({ route, navigation }) => {
  const { assessment, proctored } = route.params;
  const { colors } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  // Per-assessment duration comes from TakeAssessmentsMenu (e.g. '40 min');
  // fall back to 30 minutes. Question count is taken from the actual bank.
  const durationMinutes = (() => {
    const match = String(assessment?.duration || '').match(/(\d+)/);
    return match ? Math.max(5, parseInt(match[1], 10)) : 30;
  })();
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [questions] = useState(() => {
    const bank = mockQuestions[assessment.id] || mockQuestions[1];
    // Fisher–Yates shuffle so retakes are not identical (still lengthiest bank intact)
    const arr = [...bank];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Live refs so the interval never calls a stale closure and cannot double-submit.
  const submittedRef = React.useRef(false);
  const submitFnRef = React.useRef<(auto?: boolean) => void>(() => {});
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!submittedRef.current) {
            submittedRef.current = true;
            submitFnRef.current(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishSubmission = () => {
    submittedRef.current = true;
    // Calculate score and navigate to results
    navigation.navigate('AssessmentResults', {
      assessment,
      answers,
      questions
    });

    // Persist the attempt to Supabase (quiz_attempts). Best-effort, never blocks.
    (async () => {
      try {
        let userId: string | null = null;
        const raw = await AsyncStorage.getItem('user');
        const cached = raw ? JSON.parse(raw) : null;
        if (cached?.id) userId = cached.id;
        if (!userId && cached?.email) {
          const { data } = await supabase.from('users').select('id').eq('email', cached.email).maybeSingle();
          userId = data?.id ?? null;
        }
        if (!userId) return;
        const total = questions.length || 1;
        const correct = questions.filter((q: any) => {
          const a = answers[q.id];
          if (a === undefined || a === null) return false;
          if (typeof q.correctAnswer !== 'undefined') {
            if (q.type === 'true_false') return a === q.correctAnswer;
            if (q.type === 'multiple_choice') return Number(a) === Number(q.correctAnswer);
            return String(a).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
          }
          return false;
        }).length;
        const scorePct = Math.round((correct / total) * 100);
        await supabase.from('quiz_attempts').insert({
          user_id: userId,
          score: scorePct,
          passed: scorePct >= 70,
        });
      } catch (err) {
        console.log('Failed to save assessment attempt:', err);
      }
    })();
  };

  const doSubmit = (auto?: boolean) => {
    setShowQuitModal(false);
    if (auto) {
      // Time expired — auto-submit without a blocking alert (an Alert over the
      // camera overlay was part of the "stuck at green bar" bug).
      finishSubmission();
      return;
    }
    Alert.alert(
      'Time Not Up Yet',
      'You still have time remaining. Are you sure you want to submit your assessment now?',
      [
        { text: 'Keep Answering', style: 'cancel' },
        { text: 'Submit Now', onPress: () => finishSubmission() },
      ],
    );
  };

  // Keep the ref pointing at the latest closure so the timer always sees fresh answers.
  submitFnRef.current = doSubmit;

  const handleSubmitAssessment = () => doSubmit(false);

  const handleQuitAssessment = () => {
    setShowQuitModal(false);
    navigation.goBack();
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple_choice':
        return (
          <View style={styles.questionContainer}>
            <TranslatedText style={[styles.questionText, { color: colors.text }]}>
              {question.question}
            </TranslatedText>
            <View style={styles.optionsContainer}>
              {(question.options ?? []).map((option, index) => {
                const isSelected = currentAnswer === index;
                
                if (isSelected) {
                  // Selected option with gradient
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionButton}
                      onPress={() => handleAnswer(question.id, index)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#E67012', '#F4842B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.selectedOptionGradient}
                      >
                        <Text style={styles.selectedOptionText}>
                          {String.fromCharCode(65 + index)}. {option}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                } else {
                  // Unselected options
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: '#E0E0E0',
                        }
                      ]}
                      onPress={() => handleAnswer(question.id, index)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: colors.text }
                      ]}>
                        {String.fromCharCode(65 + index)}. {option}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              })}
            </View>
          </View>
        );

      case 'true_false':
        return (
          <View style={styles.questionContainer}>
            <TranslatedText style={[styles.questionText, { color: colors.text }]}>
              {question.question}
            </TranslatedText>
            <View style={styles.trueFalseContainer}>
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  {
                    backgroundColor: currentAnswer === true ? '#4CAF50' : colors.card,
                    borderColor: '#E0E0E0',
                  }
                ]}
                onPress={() => handleAnswer(question.id, true)}
                activeOpacity={0.7}
              >
                <TranslatedText style={[
                  styles.trueFalseText,
                  { color: currentAnswer === true ? 'white' : colors.text }
                ]}>
                  True
                </TranslatedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  {
                    backgroundColor: currentAnswer === false ? '#F44336' : colors.card,
                    borderColor: '#E0E0E0',
                  }
                ]}
                onPress={() => handleAnswer(question.id, false)}
                activeOpacity={0.7}
              >
                <TranslatedText style={[
                  styles.trueFalseText,
                  { color: currentAnswer === false ? 'white' : colors.text }
                ]}>
                  False
                </TranslatedText>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'fill_blank':
        return (
          <View style={styles.questionContainer}>
            <TranslatedText style={[styles.questionText, { color: colors.text }]}>
              {question.question}
            </TranslatedText>
            <TextInput
              style={[
                styles.fillBlankInput,
                {
                  backgroundColor: colors.card,
                  borderColor: '#E0E0E0',
                  color: colors.text,
                }
              ]}
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChangeText={(text) => handleAnswer(question.id, text)}
              placeholder="Type your answer here..."
              placeholderTextColor={colors.muted}
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (!questions.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            No questions available for this assessment.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <ProctorGate active>
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TranslatedText style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {assessment.title}
        </TranslatedText>
        <TouchableOpacity onPress={() => setShowQuitModal(true)} style={styles.quitButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome6 name="xmark" size={20} color="#FF0000" />
        </TouchableOpacity>
      </View>

      {/* Timer + question counter on one row to save vertical space */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: timeRemaining <= 10 * 60 ? '#FF0000' : '#4CAF50' }]}>Time: {formatTime(timeRemaining)}</Text>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Question Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentInner, !!proctored && styles.proctoredContentInner]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderQuestion(currentQuestion)}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={[styles.navigationContainer, !!proctored && styles.navigationContainerProctored]}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { opacity: currentQuestionIndex === 0 ? 0.5 : 1 }
            ]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <TranslatedText style={styles.navButtonText}>Previous</TranslatedText>
          </TouchableOpacity>

          {currentQuestionIndex === questions.length - 1 ? (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAssessment}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.submitGradient}
              >
                <TranslatedText style={styles.submitButtonText}>Submit Assessment</TranslatedText>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <LinearGradient
                colors={['#FF9800', '#FF6D00']}
                style={styles.nextGradient}
              >
                <TranslatedText style={styles.nextButtonText}>Next</TranslatedText>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Quit Modal */}
      <Modal
        visible={showQuitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Quit Assessment?
            </Text>
            <Text style={[styles.modalMessage, { color: colors.muted }]}>
              Are you sure you want to quit? Your progress will be lost.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowQuitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.quitModalButton]}
                onPress={handleQuitAssessment}
              >
                <Text style={styles.quitButtonText}>Quit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </ProctorGate>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E67012',
    flex: 1,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  timerText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67012',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E67012',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentInner: {
    paddingBottom: 16,
  },
  // Extra top clearance so questions/options never hide behind the REC bar
  // while the live proctor camera overlay is active.
  proctoredContentInner: {
    paddingTop: 76,
  },
  questionContainer: {
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    minHeight: 54,
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    lineHeight: 22,
    padding: 16,
  },
  selectedOptionGradient: {
    padding: 16,
    borderRadius: 10,
  },
  selectedOptionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  trueFalseContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  trueFalseButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  trueFalseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fillBlankInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  navigationContainerProctored: {
    paddingBottom: 28,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 16,
  },
  navButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  nextGradient: {
    padding: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitGradient: {
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  quitButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  quitModalButton: {
    backgroundColor: '#FF0000',
  },
  quitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AssessmentScreen;