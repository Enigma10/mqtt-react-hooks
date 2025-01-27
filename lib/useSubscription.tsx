/* eslint-disable import-helpers/order-imports */
/* eslint-disable no-useless-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
import { useContext, useEffect, useCallback, useState } from 'react';
import { matches } from 'mqtt-pattern';

import { IClientSubscribeOptions } from 'mqtt';

import MqttContext from './Context';
import { IMqttContext as Context, IUseSubscription, IMessage } from './types';

export default function useSubscription(
  topic: string | string[],
  options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IUseSubscription {
  const { client, connectionStatus, parserMethod } = useContext<Context>(
    MqttContext,
  );

  const [message, setMessage] = useState<IMessage | undefined>(undefined);

  const subscribe = useCallback(async () => {
    client?.subscribe(topic, options);
  }, [client, options, topic]);

  useEffect((): any => {
    if (client?.connected) {
      subscribe();

      const callback = (receivedTopic: string, message) => {
        if (
          ([topic] as string[])
            .flat()
            .some(receivedTopic => matches(topic, receivedTopic))
        ) {
          setMessage({
            topic: receivedTopic,
            message: parserMethod?.(message) || message.toString(),
          });
        }
      };

      client.on('message', callback);

      return () => client.off('message', callback);
    }
    return;
  }, [client, subscribe]);

  return {
    client,
    topic,
    message,
    connectionStatus,
  };
}
