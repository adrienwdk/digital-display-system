// client/src/utils/reactionAnimations.js
  export class ReactionAnimations {
    
    // Animation de burst de particules quand on réagit
    static createReactionBurst(element, emoji, color) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Créer des particules
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = emoji;
        particle.style.cssText = `
          position: fixed;
          left: ${centerX}px;
          top: ${centerY}px;
          font-size: 16px;
          pointer-events: none;
          z-index: 9999;
          animation: particleBurst 0.8s ease-out forwards;
          transform-origin: center;
        `;
        
        // Angle aléatoire pour chaque particule
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 50 + Math.random() * 30;
        
        particle.style.setProperty('--angle', `${angle}rad`);
        particle.style.setProperty('--velocity', `${velocity}px`);
        
        document.body.appendChild(particle);
        
        // Nettoyer après l'animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 800);
      }
    }
    
    // Animation de like à la Facebook/LinkedIn
    static createLikeAnimation(button) {
      button.style.transform = 'scale(1.2)';
      button.style.transition = 'transform 0.1s ease-out';
      
      setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.transition = 'transform 0.2s ease-out';
      }, 100);
    }
    
    // Animation de floating emoji
    static createFloatingEmoji(element, emoji) {
      const rect = element.getBoundingClientRect();
      const floatingEmoji = document.createElement('div');
      
      floatingEmoji.innerHTML = emoji;
      floatingEmoji.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top}px;
        font-size: 20px;
        pointer-events: none;
        z-index: 9999;
        animation: floatUp 1s ease-out forwards;
      `;
      
      document.body.appendChild(floatingEmoji);
      
      setTimeout(() => {
        if (floatingEmoji.parentNode) {
          floatingEmoji.parentNode.removeChild(floatingEmoji);
        }
      }, 1000);
    }
    
    // Effet de ripple comme Material Design
    static createRippleEffect(element, event) {
      const ripple = document.createElement('span');
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
      `;
      
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    }
    
    // Shake animation pour les erreurs
    static createShakeAnimation(element) {
      element.style.animation = 'shake 0.5s ease-in-out';
      
      setTimeout(() => {
        element.style.animation = '';
      }, 500);
    }
  }
  
  // Ajouter les styles CSS pour les animations
  export const addAnimationStyles = () => {
    if (document.getElementById('reaction-animations-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'reaction-animations-styles';
    style.textContent = `
      @keyframes particleBurst {
        0% {
          transform: translate(0, 0) scale(1) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translate(
            calc(cos(var(--angle)) * var(--velocity)), 
            calc(sin(var(--angle)) * var(--velocity))
          ) scale(0) rotate(180deg);
          opacity: 0;
        }
      }
      
      @keyframes floatUp {
        0% {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translateY(-50px) scale(1.5);
          opacity: 0;
        }
      }
      
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    `;
    
    document.head.appendChild(style);
  };
  
  // Service de sons (optionnel)
  export class ReactionSounds {
    static sounds = {
      like: null,
      love: null,
      wow: null,
      haha: null,
      sad: null,
      angry: null
    };
    
    static init() {
      // Créer des sons synthétiques ou utiliser des fichiers audio
      this.createSyntheticSounds();
    }
    
    static createSyntheticSounds() {
      if (!window.AudioContext && !window.webkitAudioContext) return;
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Son de "like" - note claire et positive
      this.sounds.like = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      };
      
      // Son de "love" - accord harmonieux
      this.sounds.love = () => {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.frequency.value = 523; // Do
        oscillator2.frequency.value = 659; // Mi
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.2);
        oscillator2.stop(audioContext.currentTime + 0.2);
      };
    }
    
    static play(reactionType) {
      if (this.sounds[reactionType]) {
        try {
          this.sounds[reactionType]();
        } catch (error) {
          console.log('Could not play sound:', error);
        }
      }
    }
  }
  
  // Hook React pour utiliser les animations
  export const useReactionAnimations = () => {
    const animateReaction = (element, reactionType, emoji, color) => {
      // Animation principale
      ReactionAnimations.createLikeAnimation(element);
      
      // Effet de burst
      setTimeout(() => {
        ReactionAnimations.createReactionBurst(element, emoji, color);
      }, 100);
      
      // Emoji flottant
      setTimeout(() => {
        ReactionAnimations.createFloatingEmoji(element, emoji);
      }, 150);
      
      // Son (si activé)
      ReactionSounds.play(reactionType);
    };
    
    const animateError = (element) => {
      ReactionAnimations.createShakeAnimation(element);
    };
    
    return { animateReaction, animateError };
  };