'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import {
  initPushNotifications,
  scheduleStreakReminder,
} from '@/lib/notifications';
import { createClient } from '@/lib/supabase/client';

export const useCapacitor = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const init = async () => {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1A1A2E' });

      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });

      if (Capacitor.getPlatform() === 'ios') {
        Keyboard.addListener('keyboardWillShow', () => {
          document.body.classList.add('keyboard-open');
        });
        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open');
        });
      }

      await initPushNotifications(async (token) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('user_profiles')
            .update({
              push_token: token,
              push_platform: Capacitor.getPlatform(),
            })
            .eq('id', user.id);
        }
      });

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('streak_days')
          .eq('id', user.id)
          .single();

        if (profile?.streak_days) {
          await scheduleStreakReminder(profile.streak_days);
        }
      }

      await SplashScreen.hide();
    };

    init();
  }, []);
};
