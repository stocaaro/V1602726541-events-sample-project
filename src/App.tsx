import type { EventsChannel, EventsOptions } from 'aws-amplify/data';
import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { events } from 'aws-amplify/data';

const eventAuth: EventsOptions = {
  authMode: 'userPool',
authToken: "YOUR_AUTH_TOKEN" // from CLI
}

Amplify.configure({
  API: {
    Events: {
      endpoint:
        'YOUR_ENDPOINT_URL',
      region: 'us-west-2',
      defaultAuthMode: 'apiKey',
            apiKey: 'YOUR_API_KEY_HERE' // from AWS Console
    }
  },
  Auth: {
    Cognito: {
      userPoolClientId: "YOUR_POOL_CLIENT", // from AWS Console
      userPoolId: "YOUR_POOL_ID" // from AWS Console
    }
  }
});

export default function App() {
  const [myEvents, setMyEvents] = useState<unknown[]>([]);

  useEffect(() => {
    let channel: EventsChannel;

    const connectAndSubscribe = async () => {
      channel = await events.connect('default/channel', eventAuth);

      channel.subscribe({
        next: (data) => {
          console.log('received', data);
          setMyEvents((prev) => [data, ...prev]);
        },
        error: (err) => console.error('error', err)
      });
    };

    connectAndSubscribe();

    return () => channel && channel.close();
  }, []);

  async function publishEvent() {
    await events.post('default/channel', { some: 'data' });
  }

  return (
    <>
      <button onClick={publishEvent}>Publish Event</button>
      <ul>
        {myEvents.map((event, index) => (
          <li key={index}>{JSON.stringify(event)}</li>
        ))}
      </ul>
    </>
  );
}