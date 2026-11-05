// src/hooks/useAuthGuard.ts
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase';
import type { UserDTO } from '../types/auth';

export function useAuthGuard(navigation: any) {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshMe = useCallback(async () => {
        try {
            // 1. Check if Supabase session exists
            const { data: sessionData } = await supabase.auth.getSession();
            const sessionUser = sessionData?.session?.user;

            if (sessionUser) {
                // Fetch user profile from public.users table in Supabase
                const { data: dbUser } = await supabase
                    .from('users')
                    .select('*')
                    .or(`auth_id.eq.${sessionUser.id},email.eq.${sessionUser.email}`)
                    .maybeSingle();

                if (dbUser) {
                    const u: UserDTO = {
                        id: dbUser.id,
                        name: dbUser.name,
                        email: dbUser.email || sessionUser.email || '',
                        role: dbUser.role === 'admin' ? 'admin' : (dbUser.role === 'practitioner' ? 'practitioner' : 'citizen'),
                        profile_picture: dbUser.profile_picture_url,
                        profile_picture_url: dbUser.profile_picture_url,
                        created_at: dbUser.created_at,
                        updated_at: dbUser.updated_at,
                    };
                    setUser(u);
                    await AsyncStorage.setItem('user', JSON.stringify(u));
                    return;
                }
            }

            // 2. Check local cached user from AsyncStorage
            const localUserStr = await AsyncStorage.getItem('user');
            if (localUserStr) {
                const u = JSON.parse(localUserStr);
                setUser(u);
                return;
            }

            // 3. Fallback learner from Supabase users table
            const { data: defaultLearner } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'learner')
                .limit(1)
                .single();

            if (defaultLearner) {
                const u: UserDTO = {
                    id: defaultLearner.id,
                    name: defaultLearner.name,
                    email: defaultLearner.email || 'learner@eliteracy.org.za',
                    role: 'citizen',
                    profile_picture: defaultLearner.profile_picture_url,
                    profile_picture_url: defaultLearner.profile_picture_url,
                };
                setUser(u);
                await AsyncStorage.setItem('user', JSON.stringify(u));
            }
        } catch (err) {
            console.error('Error refreshing user in useAuthGuard:', err);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const token = await AsyncStorage.getItem('token');
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (!token && !sessionData?.session) {
                const cachedUser = await AsyncStorage.getItem('user');
                if (!cachedUser) {
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    return;
                }
            }

            try {
                await refreshMe();
            } catch {
                await AsyncStorage.multiRemove(['token', 'user']);
                if (mounted) navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [navigation, refreshMe]);

    const signOut = async () => {
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
        await AsyncStorage.multiRemove(['token', 'user']);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return { user, loading, signOut, refreshMe };
}
