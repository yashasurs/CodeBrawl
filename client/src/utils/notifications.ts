import { toast } from 'sonner';

export const notify = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
    });
  },
  
  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
    });
  },
  
  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
    });
  },
  
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
    });
  },
  
  loading: (title: string, description?: string) => {
    return toast.loading(title, {
      description,
    });
  },
  
  // Special notifications for common actions
  auth: {
    loginSuccess: (userName: string) => {
      toast.success('Welcome back!', {
        description: `Welcome ${userName}! You are now logged in.`,
      });
    },
    
    logoutSuccess: () => {
      toast.success('Logged out successfully', {
        description: 'See you next time!',
      });
    },
    
    registrationSuccess: () => {
      toast.success('Account created successfully!', {
        description: 'Welcome to CodeBrawl! You are now logged in.',
      });
    },
    
    authError: (message: string) => {
      toast.error('Authentication Error', {
        description: message,
      });
    },
  },
  
  battle: {
    joined: (battleId: string) => {
      toast.success('Battle Joined!', {
        description: `You have joined battle ${battleId}`,
      });
    },
    
    left: () => {
      toast.info('Battle Left', {
        description: 'You have left the battle room.',
      });
    },
    
    victory: (eloGain: number) => {
      toast.success('Victory!', {
        description: `Congratulations! You gained ${eloGain} ELO points.`,
      });
    },
    
    defeat: (eloLoss: number) => {
      toast.error('Defeat', {
        description: `You lost ${eloLoss} ELO points. Better luck next time!`,
      });
    },
    
    codeSubmitted: () => {
      toast.loading('Submitting code...', {
        description: 'Your solution is being evaluated.',
      });
    },
    
    codeAccepted: (executionTime: number) => {
      toast.success('Code Accepted!', {
        description: `Execution time: ${executionTime}ms`,
      });
    },
    
    codeRejected: (error: string) => {
      toast.error('Code Rejected', {
        description: error,
      });
    },
  },
  
  profile: {
    updated: () => {
      toast.success('Profile Updated', {
        description: 'Your profile has been updated successfully.',
      });
    },
    
    eloUpdated: (newElo: number) => {
      toast.success('ELO Rating Updated', {
        description: `Your new ELO rating is ${newElo}`,
      });
    },
    
    achievementUnlocked: (achievement: string) => {
      toast.success('Achievement Unlocked!', {
        description: `You've earned: ${achievement}`,
      });
    },
  },
  
  // Dismiss toast by ID
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
  
  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
};

export default notify;
