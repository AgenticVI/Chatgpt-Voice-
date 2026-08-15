/**
 * AI Voice Assistant Mobile Prototype - Application Controller
 * Single Chatbot Flow: User Query -> AI Result + Voice Nudge CTA -> Voice Mode Journey
 */

document.addEventListener('DOMContentLoaded', () => {
  const audio = new AudioEngine();
  let voiceOrb = null;
  let currentTopic = "Pronunciation practice";

  // Elements
  const chatView = document.getElementById('chat-view');
  const voiceView = document.getElementById('voice-view');
  const chatBottomBar = document.getElementById('chat-bottom-bar');
  const voiceBottomBar = document.getElementById('voice-bottom-bar');
  const initialHero = document.getElementById('initial-hero');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const suggestedPromptBtn = document.getElementById('suggested-prompt-btn');
  const topicChips = document.querySelectorAll('.topic-chip');
  const btnReset = document.getElementById('btn-reset');
  const btnExitVoice = document.getElementById('btn-exit-voice');
  const voiceContextPill = document.getElementById('voice-context-pill');
  const voiceStatusText = document.getElementById('voice-status-text');
  const practiceCards = document.getElementById('practice-cards');
  const drillQuote = document.getElementById('drill-quote');
  const userTurnStatus = document.getElementById('user-turn-status');
  const metricClarity = document.getElementById('metric-clarity');
  const btnReplayAi = document.getElementById('btn-replay-ai');
  const btnSpeakNow = document.getElementById('btn-speak-now');

  // Initialize Canvas Orb
  const canvas = document.getElementById('voice-canvas');
  if (canvas) {
    voiceOrb = new VoiceOrbVisualizer(canvas);
  }

  // Update Clock in iOS status bar
  function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const timeStr = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    const statusTime = document.getElementById('status-time');
    if (statusTime) statusTime.textContent = timeStr;
  }
  updateTime();
  setInterval(updateTime, 30000);

  // Dynamic Drill Library based on topic
  const drillLibrary = {
    "Pronunciation tips": {
      quote: "The thorough thought was thoughtful",
      drill: "Say after me: 'The thorough thought was thoughtful'",
      context: "Pronunciation practice"
    },
    "Interview prep": {
      quote: "My greatest strength is solving complex engineering problems systematically",
      drill: "Say after me: 'My greatest strength is solving complex engineering problems systematically'",
      context: "Interview behavioral drill"
    },
    "Presentations": {
      quote: "Today, I would like to walk you through our core product strategy",
      drill: "Say after me: 'Today, I would like to walk you through our core product strategy'",
      context: "Presentation speech drill"
    },
    "More": {
      quote: "Consistent daily verbal practice builds natural conversational fluency",
      drill: "Say after me: 'Consistent daily verbal practice builds natural conversational fluency'",
      context: "Fluency practice"
    }
  };

  // Submit Query Handler
  function handleUserQuery(queryText, topicName = "Pronunciation tips") {
    if (!queryText || queryText.trim() === '') return;
    currentTopic = topicName;
    audio.playClick();

    // Hide Initial Hero and Show Messages Stream
    initialHero.style.display = 'none';
    chatMessages.style.display = 'flex';
    chatMessages.innerHTML = '';

    // 1. Render User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'user-bubble';
    userBubble.textContent = queryText;
    chatMessages.appendChild(userBubble);
    chatInput.value = '';

    // Scroll to bottom
    chatView.scrollTop = chatView.scrollHeight;

    // 2. Simulate AI Processing & Render AI Response + Voice Nudge CTA
    setTimeout(() => {
      renderAiResponse(topicName);
    }, 600);
  }

  function renderAiResponse(topicName) {
    audio.playNudgeChime();

    // Create AI Response Card
    const aiCard = document.createElement('div');
    aiCard.className = 'ai-response-card';
    aiCard.innerHTML = `
      <div class="card-heading">Here are key techniques to improve:</div>
      <ol>
        <li><strong>Shadowing</strong> — mimic native speakers</li>
        <li><strong>Record & review</strong> — catch patterns</li>
        <li><strong>Stress & rhythm</strong> — emphasis matters</li>
        <li><strong>Slow down</strong> — clarity over speed</li>
      </ol>
    `;
    chatMessages.appendChild(aiCard);

    // Create Voice Nudge CTA Card (Matching Image 2)
    const ctaCard = document.createElement('div');
    ctaCard.className = 'voice-nudge-cta';
    ctaCard.id = 'voice-nudge-cta-btn';
    ctaCard.innerHTML = `
      <div class="cta-orb-preview"></div>
      <div class="cta-text-wrap">
        <div class="cta-nudge-title">💡 Want to practice this out loud?</div>
        <div class="cta-nudge-subtitle">Opening Voice Mode... <span>›</span></div>
      </div>
    `;
    chatMessages.appendChild(ctaCard);

    chatView.scrollTop = chatView.scrollHeight;

    // Attach CTA Click Listener (Transitions to Voice Mode - Image 3 -> 4)
    ctaCard.addEventListener('click', () => {
      triggerVoiceModeTransition(ctaCard, topicName);
    });
  }

  // One-Tap Voice Mode Transition (Image 3 -> 4 -> 5)
  function triggerVoiceModeTransition(ctaElement, topicName) {
    audio.playClick();
    ctaElement.classList.add('active-transition');
    ctaElement.querySelector('.cta-nudge-subtitle').innerHTML = 'Opening Voice Mode... <span>•••</span>';

    setTimeout(() => {
      audio.playVoiceModeOpen();

      // Switch views to Voice Mode
      chatView.classList.remove('active');
      voiceView.classList.add('active');
      chatBottomBar.style.display = 'none';
      voiceBottomBar.style.display = 'flex';

      // Setup Voice Mode context
      const drillData = drillLibrary[topicName] || drillLibrary["Pronunciation tips"];
      voiceContextPill.textContent = `✓ Context loaded: ${drillData.context}`;
      voiceStatusText.innerHTML = 'Listening... <span class="mic-pulse-icon">🎙</span>';
      practiceCards.style.display = 'none';

      // Resize Canvas Orb
      if (voiceOrb) {
        voiceOrb.resize();
        voiceOrb.setListening(true);
      }

      // After 1.5s, Practice Session Begins (Screen 5)
      setTimeout(() => {
        startPracticeSession(drillData);
      }, 1600);

    }, 800);
  }

  // Practice Begins (Screen 5)
  function startPracticeSession(drillData) {
    practiceCards.style.display = 'flex';
    drillQuote.innerHTML = `"Say after me: <span class="highlight">'${drillData.quote}'</span>"`;
    userTurnStatus.textContent = 'Speak the phrase clearly...';
    metricClarity.textContent = 'Clarity 87%';

    // AI Speaks the drill text
    audio.speakText(`Say after me: ${drillData.quote}`, () => {
      if (voiceOrb) voiceOrb.setAmplitude(0.8);
    }, () => {
      if (voiceOrb) voiceOrb.setAmplitude(0.0);
    });
  }

  // Replay AI Button
  btnReplayAi?.addEventListener('click', () => {
    audio.playClick();
    const drillData = drillLibrary[currentTopic] || drillLibrary["Pronunciation tips"];
    audio.speakText(`Say after me: ${drillData.quote}`);
  });

  // User Speak / Record Button
  btnSpeakNow?.addEventListener('click', () => {
    audio.playClick();
    userTurnStatus.innerHTML = '<span style="color: #38bdf8;">Listening to you... 🎙</span>';
    btnSpeakNow.innerHTML = '<span>Listening...</span>';

    const drillData = drillLibrary[currentTopic] || drillLibrary["Pronunciation tips"];
    audio.startListening(
      (text, score) => {
        userTurnStatus.innerHTML = `You said: "<span style="color:#fff;">${text}</span>"`;
        metricClarity.textContent = `Clarity ${score}%`;
        metricClarity.style.animation = 'fadeInSlideUp 0.3s ease';
      },
      () => {
        btnSpeakNow.innerHTML = '<span>🎤 Tap & Speak</span>';
      }
    );
  });

  // Exit Voice Session -> Return to Chat
  function returnToChat() {
    audio.playClick();
    audio.stopSpeaking();
    audio.stopListening();

    voiceView.classList.remove('active');
    chatView.classList.add('active');
    voiceBottomBar.style.display = 'none';
    chatBottomBar.style.display = 'flex';
  }

  btnExitVoice?.addEventListener('click', returnToChat);

  // Reset Button (Returns to Welcome Screen)
  function resetToInitial() {
    audio.playClick();
    audio.stopSpeaking();
    audio.stopListening();

    voiceView.classList.remove('active');
    chatView.classList.add('active');
    voiceBottomBar.style.display = 'none';
    chatBottomBar.style.display = 'flex';

    chatMessages.style.display = 'none';
    chatMessages.innerHTML = '';
    initialHero.style.display = 'flex';
    chatInput.value = '';
  }

  btnReset?.addEventListener('click', resetToInitial);

  // Event Listeners: Chat Input Form
  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (query) {
      handleUserQuery(query, "Pronunciation tips");
    }
  });

  // Event Listeners: Suggested Prompt Bubble
  suggestedPromptBtn?.addEventListener('click', () => {
    handleUserQuery("How can I improve my English pronunciation for job interviews?", "Pronunciation tips");
  });

  // Event Listeners: Topic Chips
  topicChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const topic = chip.dataset.topic;
      const query = chip.dataset.query;
      handleUserQuery(query, topic);
    });
  });

  // Mic Icon in Input bar
  document.getElementById('btn-input-mic')?.addEventListener('click', () => {
    audio.playClick();
    chatInput.value = "How can I improve my English pronunciation for job interviews?";
    handleUserQuery(chatInput.value, "Pronunciation tips");
  });
});
