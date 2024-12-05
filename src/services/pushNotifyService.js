import { useState } from "react";
import axios from "axios";


const API2_URL = process.env.REACT_APP_API2_URL || 'http://localhost:3000/api';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BGWNHwBlYOAdOHlSx7HjEmRUAFcF7Wp4Vj2sl9z2ge9XElwPdiz9XTg81yF-s2Q2iO6fimv3TU4HS88J_oJNsbY'; //BGWNHwBlYOAdOHlSx7HjEmRUAFcF7Wp4Vj2sl9z2ge9XElwPdiz9XTg81yF-s2Q2iO6fimv3TU4HS88J_oJNsbY


export const usePushNotificationService = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);

  const subscribeUser = async (userID, username, email) => {
    
    try {
      // Check if the browser supports Push Notification and Service Worker
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker not supported in this browser");
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      
      console.log("Service Worker registered");
      /*
      // Wait for the service worker to be ready (active)
      if (!registration.active) {
        console.log("Service Worker is not yet active. Retrying...");
        await new Promise((resolve) => {
          registration.addEventListener("statechange", () => {
            if (registration.active) {
              resolve();
            }
          });
        });
      }*/

      

      // Check if PushManager is available
      if (!("PushManager" in window)) {
        throw new Error("PushManager not supported in this browser");
      }

      // Request permission to show notifications
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permission to receive notifications was denied");
      }

      // Get the push subscription details from the service worker
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Notifications must be visible
        applicationServerKey: VAPID_PUBLIC_KEY, // Your VAPID public key
      });

      // Prepare the device data to send to the backend
      const deviceData = {
        pushEndpoint: subscription.endpoint,
        publicKey: btoa(
          String.fromCharCode.apply(
            null,
            new Uint8Array(subscription.getKey("p256dh"))
          )
        ),
        authToken: btoa(
          String.fromCharCode.apply(
            null,
            new Uint8Array(subscription.getKey("auth"))
          )
        ),
      };

      // Send the subscription details to the backend API to register the device
      const response = await axios.post(`${API2_URL}/user/add`, {
        "userData":{userID,
        username,
        email},
        deviceData,
      });

      console.log("User subscribed successfully:", response.data);
      setIsSubscribed(true);
    } catch (error) {
      setSubscriptionError(error.message);
      console.error("Error subscribing user:", error);
    }
  };

  return { isSubscribed, subscriptionError, subscribeUser };
};
