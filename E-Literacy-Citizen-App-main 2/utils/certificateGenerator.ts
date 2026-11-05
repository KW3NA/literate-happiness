import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Alert } from 'react-native';

interface CertificateData {
  userName: string;
  courseName: string;
  completionDate: string;
  instructorName?: string;
  directorName?: string;
}

// Generate HTML template for certificate
const generateCertificateHTML = (data: CertificateData): string => {
  const {
    userName,
    courseName,
    completionDate,
    instructorName = 'Bartholomew Henderson',
    directorName = 'Rufus Stewart',
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Allura&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          width: 297mm;
          height: 210mm;
          position: relative;
          overflow: hidden;
          background: white;
          font-family: 'Roboto', sans-serif;
        }
        
        .certificate {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        /* Decorative corners */
        .corner-top {
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 400px 200px 0;
          border-color: transparent #ff6b1a transparent transparent;
        }
        
        .corner-top-inner {
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 380px 180px 0;
          border-color: transparent #ff8c42 transparent transparent;
        }
        
        .corner-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 200px 0 0 400px;
          border-color: transparent transparent transparent #4a4a4a;
        }
        
        .corner-bottom-inner {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 180px 0 0 380px;
          border-color: transparent transparent transparent #ff6b1a;
        }
        
        /* Content */
        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding-top: 60px;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 10px;
        }
        
        .e-literacy {
          color: #ff6b1a;
          font-size: 18px;
          font-weight: 400;
          margin-bottom: 20px;
          letter-spacing: 1px;
        }
        
        .certificate-title {
          color: #ff6b1a;
          font-size: 90px;
          font-weight: 700;
          letter-spacing: 8px;
          margin-bottom: 10px;
        }
        
        .subtitle {
          color: #000;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        
        .presented-to {
          color: #000;
          font-size: 16px;
          font-weight: 400;
          margin-bottom: 20px;
          letter-spacing: 2px;
        }
        
        .name {
          font-family: 'Allura', cursive;
          font-size: 70px;
          color: #000;
          margin: 20px 0;
          padding: 0 100px;
          border-bottom: 2px solid #000;
          display: inline-block;
          min-width: 600px;
        }
        
        .description {
          color: #000;
          font-size: 14px;
          line-height: 1.8;
          margin: 30px auto;
          max-width: 800px;
          padding: 0 50px;
        }
        
        .footer {
          display: flex;
          justify-content: space-around;
          align-items: center;
          margin-top: 50px;
          padding: 0 150px;
        }
        
        .signature {
          text-align: center;
          flex: 1;
        }
        
        .signature-name {
          color: #000;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .signature-title {
          color: #666;
          font-size: 12px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .seal {
          width: 100px;
          height: 100px;
          margin: 0 40px;
        }
        
        /* Logo SVG as background */
        .logo-svg {
          background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNDAgMTBMNTAgMjVMNjUgMjVMNTUgNDBMNjUgNTVMNTAgNTVMNDAgNzBMMzAgNTVMMTUgNTVMMjUgNDBMMTUgMjVMMzAgMjVaIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiMWEiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxyZWN0IHg9IjI1IiB5PSI1NSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjE1IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiMWEiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        
        @media print {
          body {
            width: 297mm;
            height: 210mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="corner-top"></div>
        <div class="corner-top-inner"></div>
        <div class="corner-bottom"></div>
        <div class="corner-bottom-inner"></div>
        
        <div class="content">
          <div class="logo logo-svg">
          <img src="./assets/logo.jpg" style="width: 80px; height: 80px;" />
          </div>
            
          <div class="certificate-title">CERTIFICATE</div>
          <div class="subtitle">OF COMPLETION</div>
          <div class="presented-to">IS PRESENTED TO :</div>
          <div class="name">Nombali Mafa</div>
          <div class="description">
            For his achievements and participation in ${courseName}.<br>
            Held on ${completionDate} by E-Literacy Citizen App.
          </div>
          
          <div class="footer">
            <div class="signature">
              <div class="signature-name">${instructorName}</div>
              <div class="signature-title">General Instructor</div>
            </div>
            
            <div class="seal">
              <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="#fbbf24"/>
                <circle cx="50" cy="50" r="35" fill="#f59e0b"/>
                <circle cx="50" cy="50" r="25" fill="#d97706"/>
                <path d="M50 70L35 85L40 65L25 55L45 55L50 35L55 55L75 55L60 65L65 85Z" fill="#fbbf24"/>
              </svg>
            </div>
            
            <div class="signature">
              <div class="signature-name">${directorName}</div>
              <div class="signature-title">Creative Director</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate and download certificate using Expo Print
export const generateCertificate = async (
  data: CertificateData
): Promise<string | null> => {
  try {
    const html = generateCertificateHTML(data);

    // Generate PDF using Expo Print
    const { uri } = await Print.printToFileAsync({
      html,
      width: 1122, // A4 landscape width in pixels (297mm)
      height: 794,  // A4 landscape height in pixels (210mm)
      base64: false,
    });

    console.log('PDF generated successfully:', uri);

    // The URI from Expo Print is already a permanent file path
    // No need to move it, just return the URI directly
    return uri;
  } catch (error) {
    console.error('Error generating certificate:', error);
    return null;
  }
};

// Share certificate
export const shareCertificate = async (fileUri: string): Promise<void> => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Certificate',
      });
    } else {
      Alert.alert('Sharing not available', 'Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error sharing certificate:', error);
    Alert.alert('Error', 'Failed to share certificate');
  }
};

// Complete certificate generation and sharing flow
export const downloadAndShareCertificate = async (
  data: CertificateData
): Promise<void> => {
  try {
    // Show loading state here if needed
    
    const filePath = await generateCertificate(data);
    
    if (filePath) {
      Alert.alert(
        'Certificate Generated',
        'Your certificate has been generated successfully!',
        [
          {
            text: 'Save Only',
            style: 'cancel',
            onPress: () => {
              Alert.alert('Success', `Certificate saved to: ${filePath}`);
            }
          },
          {
            text: 'Share',
            onPress: () => shareCertificate(filePath)
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to generate certificate');
    }
  } catch (error) {
    console.error('Error in certificate flow:', error);
    Alert.alert('Error', 'Failed to generate certificate');
  }
};

// Usage example in a component (e.g. from screens/apps/):
/*
import { downloadAndShareCertificate } from '../../utils/certificateGenerator';

const handleGenerateCertificate = async () => {
  await downloadAndShareCertificate({
    userName: 'Jacqueline Thompson',
    courseName: 'Creative Technology Summit',
    completionDate: '02 February 2022',
    instructorName: 'Bartholomew Henderson',
    directorName: 'Rufus Stewart',
  });
};
*/