import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { FontAwesome6 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import TranslatedText from './TranslatedText';

/**
 * ProctorOverlay - Mandatory camera + microphone proctoring for assessments/quizzes.
 *
 * Wrap any assessment screen with <ProctorGate>...</ProctorGate>. The learner CANNOT
 * answer a single question until they grant BOTH camera and microphone permissions
 * AND the live camera preview is active. If they background the app or revoke
 * permissions mid-assessment, the overlay re-covers the screen and blocks all input
 * until the camera is live again.
 */

type ProctorState = 'checking' | 'blocked' | 'ready';

const ProctorOverlayInner: React.FC<{
  children: React.ReactNode;
  onSessionEnd?: () => void;
}> = ({ children, onSessionEnd }) => {
  const { t } = useTranslation();
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const [state, setState] = useState<ProctorState>('checking');
  const [cameraKey, setCameraKey] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState('00:00');
  const camRef = useRef<any>(null);
  const isFocused = useIsFocused();

  const granted = !!camPerm?.granted && !!micPerm?.granted;

  // As soon as the gate opens, actively request camera + mic permissions.
  // Previously the overlay only waited passively for `canAskAgain` and showed
  // a static screen — if the OS didn't surface the prompt automatically the
  // learner got stuck. Now the native permission dialog fires immediately.
  const autoRequested = useRef(false);
  useEffect(() => {
    if (autoRequested.current) return;
    if (camPerm === null || micPerm === null) return; // still loading
    if (camPerm.granted && micPerm.granted) return;   // nothing to ask
    if (!camPerm.canAskAgain || !micPerm.canAskAgain) return; // permanently denied -> settings UI
    autoRequested.current = true;
    (async () => {
      try {
        if (!camPerm.granted) await requestCamPerm();
        if (!micPerm.granted) await requestMicPerm();
      } catch {
        /* the blocked screen's button remains as manual fallback */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camPerm, micPerm]);

  // Once the OS permission objects have loaded, decide whether to show the
  // grant screen or go straight through to the live camera session.
  useEffect(() => {
    if (state !== 'checking') return;
    if (camPerm === null || micPerm === null) return; // still loading
    if (camPerm.granted && micPerm.granted) {
      setCameraKey((k) => k + 1);
      setState('ready');
      setSessionStartedAt(Date.now());
    } else {
      setState('blocked');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camPerm, micPerm, state]);

  // If the learner navigates away (blur) mid-session, the next time they focus
  // this screen they must re-arm the camera — blocks tab-switching to cheat.
  useEffect(() => {
    if (!isFocused && state === 'ready') {
      setState('blocked');
    }
    // Re-arm the camera when returning to a blocked session whose permissions
    // are actually granted (fixes getting stuck on the REC bar with no camera).
    if (isFocused && state === 'blocked' && camPerm?.granted && micPerm?.granted) {
      setCameraKey((k) => k + 1);
      setState('ready');
      if (!sessionStartedAt) setSessionStartedAt(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, state]);

  // Live REC timer tick while proctored session is active.
  useEffect(() => {
    if (state !== 'ready' || !sessionStartedAt) return;
    const t = setInterval(() => {
      setElapsed(formatElapsed(Date.now() - sessionStartedAt));
    }, 1000);
    return () => clearInterval(t);
  }, [state, sessionStartedAt]);

  // Re-check permissions when focusing so a revoked permission instantly
  // re-blocks the assessment.
  useEffect(() => {
    if (isFocused && state === 'ready' && !(camPerm?.granted && micPerm?.granted)) {
      setState('blocked');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, camPerm, micPerm]);

  const openAppSettings = () => {
    // Deep-link straight into this app's permission settings page.
    Linking.openSettings().catch(() => {
      Alert.alert('Could not open settings', 'Please open your phone Settings and find the E-Literacy Citizen app manually.');
    });
  };

  const handlePermissionRequest = async () => {
    if (!camPerm?.granted) {
      const r = await requestCamPerm();
      if (!r.granted) {
        Alert.alert(
          t('proctor.cameraRequiredTitle'),
          t('proctor.cameraRequiredBody'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('proctor.openSettings'), onPress: openAppSettings },
          ],
        );
        return;
      }
    }
    if (!micPerm?.granted) {
      const r = await requestMicPerm();
      if (!r.granted) {
        Alert.alert(
          t('proctor.micRequiredTitle'),
          t('proctor.micRequiredBody'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('proctor.openSettings'), onPress: openAppSettings },
          ],
        );
        return;
      }
    }
    // Stay in 'checking' until the CameraView fires onCameraReady — this
    // prevents the "green bar but stuck / black screen" bug where the UI
    // assumed the session was live before the camera actually opened.
    setCameraKey((k) => k + 1);
    setState('checking');
    setSessionStartedAt(Date.now());
  };

  const handleCameraReady = () => {
    setState('ready');
    if (!sessionStartedAt) setSessionStartedAt(Date.now());
  };

  const handleCameraError = () => {
    setState('blocked');
  };

  // Safety net: if the camera preview never becomes ready (slow devices),
  // retry mounting it a few times instead of leaving the learner stuck.
  useEffect(() => {
    if (state !== 'checking' || !granted) return;
    let attempts = 0;
    const iv = setInterval(() => {
      attempts += 1;
      if (attempts >= 4) {
        clearInterval(iv);
        setState('blocked'); // show the friendly retry/settings screen
      } else {
        setCameraKey((k) => k + 1);
      }
    }, 2500);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, granted, cameraKey]);

  if (state === 'checking') {
    // Permissions loading, or camera is opening: show status AND mount the
    // CameraView (once granted) so onCameraReady can flip us to 'ready'.
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {granted && (
          <CameraView
            key={cameraKey}
            ref={camRef}
            facing="front"
            style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 2, opacity: 0.01 }}
            onCameraReady={handleCameraReady}
            onError={handleCameraError}
            mute
          />
        )}
        <FontAwesome6 name="shield-halved" size={48} color="#E67012" />
        <TranslatedText style={styles.title}>Starting secure assessment…</TranslatedText>
        <TranslatedText style={styles.subtitle}>Verifying camera and microphone</TranslatedText>
        {granted && (
          <TranslatedText style={[styles.subtitle, { marginTop: 12 }]}>Opening your camera…</TranslatedText>
        )}
      </View>
    );
  }

  if (!granted || state === 'blocked') {
    return (
      <View style={styles.blockedScroll}>
        <View style={styles.blockedInner}>
          <View style={styles.iconRow}>
            <FontAwesome6
              name="video-slash"
              size={40}
              color={camPerm?.granted ? '#4CAF50' : '#FF5252'}
            />
            <FontAwesome6
              name="microphone-slash"
              size={40}
              color={micPerm?.granted ? '#4CAF50' : '#FF5252'}
              style={{ marginLeft: 24 }}
            />
          </View>
          <TranslatedText style={styles.title}>Camera &amp; Microphone Required</TranslatedText>
          <TranslatedText style={styles.subtitle}>
            To prevent cheating, this assessment can only be written while your camera is on and
            recording. No answers can be entered without an active proctor session.
          </TranslatedText>

          {/* Per-permission status chips so the learner sees exactly what is missing */}
          <View style={styles.permStatusRow}>
            <View style={[styles.permChip, camPerm?.granted ? styles.permChipOk : styles.permChipBad]}>
              <FontAwesome6
                name={camPerm?.granted ? 'video' : 'video-slash'}
                size={14}
                color={camPerm?.granted ? '#A5D6A7' : '#FF8A80'}
              />
              <Text style={[styles.permChipText, { color: camPerm?.granted ? '#A5D6A7' : '#FF8A80' }]}>
                Camera {camPerm?.granted ? t('proctor.statusReady') : t('proctor.statusNotGranted')}
              </Text>
            </View>
            <View style={[styles.permChip, micPerm?.granted ? styles.permChipOk : styles.permChipBad]}>
              <FontAwesome6
                name={micPerm?.granted ? 'microphone' : 'microphone-slash'}
                size={14}
                color={micPerm?.granted ? '#A5D6A7' : '#FF8A80'}
              />
              <Text style={[styles.permChipText, { color: micPerm?.granted ? '#A5D6A7' : '#FF8A80' }]}>
                Mic {micPerm?.granted ? t('proctor.statusReady') : t('proctor.statusNotGranted')}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.enableButton} onPress={handlePermissionRequest} activeOpacity={0.85}>
            <Text style={styles.enableButtonText}>Enable Camera &amp; Mic to Start</Text>
          </TouchableOpacity>
          {!camPerm?.canAskAgain && !micPerm?.canAskAgain && (
            <>
              <TranslatedText style={styles.settingsHint}>
                Permission was denied permanently — please enable Camera and Microphone in your phone
                Settings, then reopen the app.
              </TranslatedText>
              <TouchableOpacity style={styles.settingsButton} onPress={openAppSettings}>
                <FontAwesome6 name="gear" size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.settingsButtonText}>Open Phone Settings</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // Proctored session: children rendered above the live camera feed.
  return (
    <View style={styles.container}>
      <CameraView
        key={cameraKey}
        ref={camRef}
        facing="front"
        style={StyleSheet.absoluteFill}
        onCameraReady={handleCameraReady}
        onError={handleCameraError}
        mute
      />
      {/* Dim veil so the quiz stays readable over the video */}
      <View pointerEvents="none" style={styles.veil} />
      <View style={styles.sessionBar}>
        <View style={styles.recGroup}>
          <View style={styles.recDot} />
          <Text style={styles.sessionText}>
            {t('proctor.recordingLabel')} {elapsed}
          </Text>
        </View>
        <TranslatedText style={styles.sessionText}>Do not cover your camera</TranslatedText>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * ProctorGate — drop-in wrapper. Renders the proctor blocking screen until the
 * camera session is live, then renders children inside the proctored layout.
 */
export const ProctorGate: React.FC<{
  active?: boolean;
  children: React.ReactNode;
  onSessionEnd?: () => void;
}> = ({ active = true, children, onSessionEnd }) => {
  if (!active) return <>{children}</>;
  return <ProctorOverlayInner onSessionEnd={onSessionEnd}>{children}</ProctorOverlayInner>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F14' },
  content: { flex: 1 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  blockedScroll: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  blockedInner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  permStatusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  permChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 6,
    marginBottom: 6,
  },
  permChipOk: { backgroundColor: 'rgba(76,175,80,0.18)', borderWidth: 1, borderColor: 'rgba(76,175,80,0.5)' },
  permChipBad: { backgroundColor: 'rgba(255,82,82,0.15)', borderWidth: 1, borderColor: 'rgba(255,82,82,0.5)' },
  permChipText: { fontSize: 12, fontWeight: '600', marginLeft: 6 },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  enableButton: {
    alignSelf: 'center',
    backgroundColor: '#E67012',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  enableButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  settingsButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: '#37474F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  settingsButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  settingsHint: {
    color: '#FFAB91',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  sessionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 44,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 10,
  },
  recGroup: { flexDirection: 'row', alignItems: 'center' },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF1744',
    marginRight: 8,
  },
  sessionText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});

export default ProctorGate;
