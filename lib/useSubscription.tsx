import { useState, useContext, useEffect } from 'react';

import { IClientSubscribeOptions } from 'mqtt';
import MQTTPattern from 'mqtt-pattern';

import MqttContext from './Context';
import { IMqttContext as Context, IMessage, IuseSubscription } from './types';

export default function useSubscription(
  topic: string,
  options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IuseSubscription {
  const { mqtt } = useContext<Context>(MqttContext);
  const [lastMessage, setMessage] = useState<IMessage | undefined>();

  useEffect(() => {
    mqtt
      ?.subscribe(topic, options)
      .on('message', (t: string, message: { toString: () => string }) => {
        let msg: string;
        try {
          msg = JSON.parse(message.toString());
        } catch (e) {
          msg = message.toString();
        }
        const packet = {
          message: msg,
          topic: t,
        };
        if (MQTTPattern.matches(topic, t)) {
          setMessage(packet);
        }
      });

    return () => {
      mqtt?.unsubscribe(topic);
    };
  }, [mqtt, options, topic]);

  return {
    mqtt,
    topic,
    lastMessage,
  };
}