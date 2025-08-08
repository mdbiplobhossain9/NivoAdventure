/**
 * Audio Manager for handling game sounds
 */
class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3; // Default volume
        this.initializeSounds();
    }

    /**
     * Initialize all game sounds
     */
    initializeSounds() {
        // Get audio elements from DOM
        this.sounds.jump = document.getElementById('jumpSound');
        this.sounds.collect = document.getElementById('collectSound');
        this.sounds.hit = document.getElementById('hitSound');

        // Set volume for all sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = this.volume;
            }
        });

        // Create additional sounds programmatically if needed
        this.createAdditionalSounds();
    }

    /**
     * Create additional sound effects using Web Audio API or data URIs
     */
    createAdditionalSounds() {
        // Checkpoint sound - a pleasant chime
        const checkpointSound = new Audio();
        checkpointSound.src = this.generateTone(523.25, 0.2, 'sine'); // C5 note
        checkpointSound.volume = this.volume;
        this.sounds.checkpoint = checkpointSound;

        // Level complete sound - ascending notes
        const levelCompleteSound = new Audio();
        levelCompleteSound.src = this.generateMelody([
            {freq: 261.63, duration: 0.15}, // C4
            {freq: 329.63, duration: 0.15}, // E4
            {freq: 392.00, duration: 0.15}, // G4
            {freq: 523.25, duration: 0.3}   // C5
        ]);
        levelCompleteSound.volume = this.volume;
        this.sounds.levelComplete = levelCompleteSound;

        // Enemy death sound
        const enemyDeathSound = new Audio();
        enemyDeathSound.src = this.generateTone(110, 0.3, 'sawtooth'); // Low A note
        enemyDeathSound.volume = this.volume * 0.7;
        this.sounds.enemyDeath = enemyDeathSound;
    }

    /**
     * Generate a simple tone using Web Audio API (fallback to data URI)
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
     * @returns {string} Data URI for the audio
     */
    generateTone(frequency, duration, type = 'sine') {
        try {
            // Try to use Web Audio API if available
            if (window.AudioContext || window.webkitAudioContext) {
                return this.generateWebAudioTone(frequency, duration, type);
            }
        } catch (e) {
            console.warn('Web Audio API not available, using fallback sound');
        }
        
        // Fallback to a simple beep sound data URI
        return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBSuNzfTNeCkFJH7M7eSLMwgYabrh3pJCCxFLpN7nsmEaBTaQ2+/BdSgHKYDL8+SMNgkDTKXe7bFdFgxImN7pp1MeCwdTqdvsrVkdCz2N0/PEeCoIKXzM+d2OOAceTKvi4alpFQxGo9zrr1sUBjqT3O/CdSgHKYHM9OWSNwkVXrTp66hVFApGn+DyvmAaBSuNzfTNeCkFJH7M7eSLMwgYabrh3pJCCxFLpN7nsmEaBTaQ2+/BdSgHKYDL8+SMNgkVXrTp66hVFApGn+DyvmAaBSuNzfTNeCkFJH7M7eSLMwgYabrh3pJCCxFLpN7nsmEaBTaQ2+/BdSgHKYDL8+SMNgk=";
    }

    /**
     * Generate a tone using Web Audio API
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type
     * @returns {string} Blob URL for the audio
     */
    generateWebAudioTone(frequency, duration, type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;
        const numFrames = duration * sampleRate;
        const arrayBuffer = audioContext.createBuffer(1, numFrames, sampleRate);
        const channelData = arrayBuffer.getChannelData(0);

        for (let i = 0; i < numFrames; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            switch (type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
                    break;
                case 'sawtooth':
                    sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                    break;
                case 'triangle':
                    sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
                    break;
            }
            
            // Apply envelope to avoid clicks
            const envelope = Math.min(t * 10, 1) * Math.min((duration - t) * 10, 1);
            channelData[i] = sample * envelope * 0.3;
        }

        // Convert to WAV and create blob URL
        const wavData = this.audioBufferToWav(arrayBuffer);
        const blob = new Blob([wavData], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }

    /**
     * Generate a melody using multiple tones
     * @param {Array} notes - Array of {freq, duration} objects
     * @returns {string} Blob URL for the audio
     */
    generateMelody(notes) {
        // For simplicity, just return the first note's tone
        // In a more complex implementation, you could concatenate audio buffers
        if (notes.length > 0) {
            return this.generateTone(notes[0].freq, notes[0].duration);
        }
        return this.generateTone(440, 0.2); // Default A4 note
    }

    /**
     * Convert AudioBuffer to WAV format (simplified implementation)
     * @param {AudioBuffer} buffer - Audio buffer to convert
     * @returns {ArrayBuffer} WAV data
     */
    audioBufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        const channelData = buffer.getChannelData(0);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);

        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }

        return arrayBuffer;
    }

    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound to play
     * @param {number} volume - Volume override (0-1)
     */
    play(soundName, volume = null) {
        if (!this.enabled || !this.sounds[soundName]) return;

        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0; // Reset to beginning
            
            if (volume !== null) {
                sound.volume = volume * this.volume;
            } else {
                sound.volume = this.volume;
            }
            
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Could not play sound ${soundName}:`, error);
                });
            }
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
        }
    }

    /**
     * Set master volume for all sounds
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = clamp(volume, 0, 1);
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = this.volume;
            }
        });
    }

    /**
     * Enable or disable all audio
     * @param {boolean} enabled - Whether audio should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Stop all currently playing sounds
     */
    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            if (sound && !sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }

    /**
     * Preload all sounds to avoid delays during gameplay
     */
    preloadSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.load) {
                sound.load();
            }
        });
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();
