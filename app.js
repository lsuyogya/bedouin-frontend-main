// Update frontend to connect to the deployed backend
const BACKEND_URL = 'https://bedouin-backend.vercel.app';

document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const chatMessages = document.getElementById('chatMessages');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');
  const llmProvider = document.getElementById('llmProvider');
  const themeButtons = document.querySelectorAll('.theme-button');
  const beginButton = document.querySelector('#beginBtn');

  // State
  let conversationHistory = [];
  let currentTheme = 'all';
  let isWaitingForResponse = false;
  let activeTypingAnimations = [];

  // Event Listeners
  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Theme selection
  themeButtons.forEach((button) => {
    button.addEventListener('click', function () {
      themeButtons.forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');
      currentTheme = this.dataset.theme;
    });
  });

  //begin button ckick
  beginButton.addEventListener('click', () => {
    const timingProperty = getComputedStyle(document.body).getPropertyValue(
      '--transitionDuration'
    );
    const timingValue = timingProperty?.endsWith('ms')
      ? parseFloat(timingProperty)
      : timingProperty?.endsWith('s')
      ? parseFloat(timingProperty) * 1000
      : 0;

    removeInitialTxt();
    bodyGradient();
    setTimeout(reduceHeader, timingValue);
    setTimeout(showChatContainer, timingValue);
    setTimeout(() => {
      addMessageToChat(
        'bot',
        'Peace be upon you, traveler. I am Sawt Al Bedouin, a voice from the desert. Ask me anything about the Bedouin way of life, our traditions, or our stories. I speak from the heart of Dhaid, where the wind carries memories older than the tallest buildings in Dubai.'
      );
    }, timingValue * 3);
    setTimeout(() => userInput.focus(), timingValue * 3);
  });

  // Functions

  function addMessageToChat(sender, content) {
    completeExistingAnimations();

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    const paragraphs = content.split('\n').filter((p) => p.trim() !== '');
    const paragraphData = paragraphs.map((text) => ({
      text,
      isComplete: false,
    }));

    const paragraphElements = paragraphs.map(() => {
      const p = document.createElement('p');
      const textSpan = document.createElement('span');
      const cursorSpan = document.createElement('span');
      cursorSpan.classList.add('typing-cursor');

      p.appendChild(textSpan);
      p.appendChild(cursorSpan);
      cursorSpan.style.display = 'none';

      messageDiv.appendChild(p);
      return { p, textSpan, cursorSpan };
    });

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const typingSpeed = 10; // milliseconds per character

    const messageTimeouts = [];
    // Add this message's animations to the active list
    const animationInfo = {
      messageDiv,
      timeouts: messageTimeouts,
      paragraphData: paragraphData,
      paragraphElements: paragraphElements,
      currentParagraphIndex: 0,
    };
    activeTypingAnimations.push(animationInfo);

    function typeText(elements, paragraphIndex, text, index, callback) {
      const { textSpan, cursorSpan } = elements;
      const paraData = paragraphData[paragraphIndex];

      // Show cursor for active paragraph
      cursorSpan.style.display = 'inline-block';

      if (index < text.length) {
        // Add next character
        textSpan.textContent = text.substring(0, index + 1);

        const timeout = setTimeout(() => {
          // Remove this timeout from the list
          const timeoutIndex = messageTimeouts.indexOf(timeout);
          if (timeoutIndex > -1) messageTimeouts.splice(timeoutIndex, 1);

          typeText(elements, paragraphIndex, text, index + 1, callback);
        }, typingSpeed);

        // Store timeout ID
        messageTimeouts.push(timeout);
      } else {
        // Mark this paragraph as complete
        paraData.isComplete = true;

        if (callback) {
          // Keep cursor visible at end of paragraph
          const timeout = setTimeout(() => {
            // Remove this timeout from the list
            const timeoutIndex = messageTimeouts.indexOf(timeout);
            if (timeoutIndex > -1) messageTimeouts.splice(timeoutIndex, 1);

            callback();
          }, typingSpeed * 3);

          // Store timeout ID
          messageTimeouts.push(timeout);
        }
      }
    }

    function typeParagraphs(paragraphIndex) {
      // Update the current paragraph index in the animation info
      animationInfo.currentParagraphIndex = paragraphIndex;

      if (paragraphIndex < paragraphs.length) {
        // Hide cursors on previous paragraphs
        if (paragraphIndex > 0) {
          paragraphElements[paragraphIndex - 1].cursorSpan.style.display =
            'none';
        }

        const elements = paragraphElements[paragraphIndex];
        elements.textSpan.textContent = '';

        typeText(
          elements,
          paragraphIndex,
          paragraphs[paragraphIndex],
          0,
          () => {
            typeParagraphs(paragraphIndex + 1);
          }
        );
      } else {
        // Hide cursor on last paragraph when done
        if (paragraphs.length > 0) {
          paragraphElements[paragraphs.length - 1].cursorSpan.style.display =
            'none';
        }

        // Remove this animation from active list when complete
        const animIndex = activeTypingAnimations.indexOf(animationInfo);
        if (animIndex > -1) activeTypingAnimations.splice(animIndex, 1);
      }
    }

    typeParagraphs(0);
  }

  function completeExistingAnimations() {
    activeTypingAnimations.forEach((animation) => {
      animation.timeouts.forEach((timeout) => clearTimeout(timeout));
      animation.timeouts = [];

      for (let i = 0; i < animation.paragraphData.length; i++) {
        const data = animation.paragraphData[i];
        const elements = animation.paragraphElements[i];

        elements.textSpan.textContent = data.text;
        elements.cursorSpan.style.display = 'none';
      }

      const index = activeTypingAnimations.indexOf(animation);
      if (index > -1) {
        activeTypingAnimations.splice(index, 1);
      }
    });
  }

  function sendMessage() {
    if (isWaitingForResponse) return;

    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);

    // Clear input
    userInput.value = '';

    // Add to conversation history
    conversationHistory.push({ role: 'user', content: message });

    // Show typing indicator
    showTypingIndicator();

    // Set waiting state
    isWaitingForResponse = true;
    document.body.setAttribute('data-isWaitingForResponse', true);

    // Send to API
    fetchBotResponse(message);
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing-indicator');
    typingDiv.id = 'typingIndicator';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      typingDiv.appendChild(dot);
    }

    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  async function fetchBotResponse(message) {
    try {
      const provider = llmProvider.value;
      console.log('Sending request to:', `${BACKEND_URL}/api/conversation`);
      console.log('Request data:', {
        message: message,
        provider: provider,
        conversationHistory: conversationHistory,
        theme: currentTheme,
      });

      const response = await fetch(`${BACKEND_URL}/api/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        body: JSON.stringify({
          message: message,
          provider: provider,
          conversationHistory: conversationHistory,
          theme: currentTheme,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Remove typing indicator
      removeTypingIndicator();

      // Add bot response to chat
      addMessageToChat('bot', data.response);

      // Add to conversation history
      conversationHistory.push({ role: 'assistant', content: data.response });

      // Reset waiting state
      isWaitingForResponse = false;
      document.body.setAttribute('data-isWaitingForResponse', false);
    } catch (error) {
      console.error('Error:', error);

      // Remove typing indicator
      removeTypingIndicator();

      // Add error message
      addMessageToChat(
        'bot',
        'Forgive me, traveler. The desert winds have carried away my words. Please try again later.'
      );

      // Reset waiting state
      isWaitingForResponse = false;
      document.body.setAttribute('data-isWaitingForResponse', false);
    }
  }

  function reduceHeader() {
    const header = document.querySelector('header');
    header.style.width = '400px';
  }

  function bodyGradient() {
    const body = document.querySelector('body');
    body.style.setProperty('--gradColor1', 'rgba(0, 0, 0, 0.5)');
    body.style.setProperty('--gradColor2', 'rgba(0, 0, 0, 1)');
  }

  function removeInitialTxt() {
    const initialText = document.querySelector('#initialTxt');
    initialText.classList.add('hide');
  }

  function showChatContainer() {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.classList.add('show');
  }
});
