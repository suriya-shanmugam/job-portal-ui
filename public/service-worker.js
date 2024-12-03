// frontend/public/service-worker.js
self.addEventListener('push', function(event) {
    const data = event.data.json();  // Assuming push message contains JSON data
    
    const title = data.title || 'New Notification';
    const options = {
      body: data.body || 'Click the button below to visit the site.',
      icon: '/images/icon.png',  // Specify the icon to show in the notification
      badge: '/images/badge.png',  // Optional: Badge for notification icon
      actions: [
        {
          action: 'open-url',
          title: 'Apply',
          icon: '/images/visit-icon.png'  // Icon for the button
        }
      ],
      data: {
        url: data.url || 'https://www.aws.com'  // The URL to open when the action button is clicked
      }
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // Handle click event on the notification
  self.addEventListener('notificationclick', function(event) {
    // Prevent the default action (like closing the notification)
    event.preventDefault();
  
    const notificationData = event.notification.data;  // Access the data passed with the notification
    const urlToOpen = notificationData.url;  // Get the URL to open
  
    // Open the URL when the notification action is clicked
    clients.openWindow(urlToOpen);
  
    // Optionally, close the notification
    event.notification.close();
  });
  