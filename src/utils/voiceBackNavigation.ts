export type VoiceBackDestination = 'onboarding-entry' | 'capture-choice';

export function getVoiceBackDestination(isProfileOnboardingVoice:boolean):VoiceBackDestination {
  return isProfileOnboardingVoice ? 'onboarding-entry' : 'capture-choice';
}
