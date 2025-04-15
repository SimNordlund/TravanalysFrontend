// src/components/MessengerChat.jsx
import React, { useEffect } from 'react';

const MessengerChat = () => {
  useEffect(() => {
    // Add the fb-root div if it doesn't already exist
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.appendChild(fbRoot);
    }

    // Load the Facebook SDK if it's not already loaded
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
      document.body.appendChild(script);

      script.onload = () => {
        if (window.FB) {
          window.FB.init({
            xfbml: true,
            version: 'v16.0', // Ensure you use the latest version
          });
        }
      };
    }
  }, []);

  return (
    <div>
      {/* Facebook Messenger Plugin */}
      <div
        className="fb-customerchat"
        attribution="setup_tool"
        page_id="196322800239778" // Replace with your Page ID
        theme_color="#0084FF" // Optional: Customize the theme color
        logged_in_greeting="Hi! How can we help you?"
        logged_out_greeting="Hi! How can we help you?"
      ></div>
    </div>
  );
};

export default MessengerChat;
