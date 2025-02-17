import { useCallback, useState } from 'react';

import OpenAIClient from '@/client';
import { GPT_MODELS, GPTModel } from '@/constants';
import { ChatCompletionsResponse, OpenAIModel } from '@/types';

function getRadomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function useChatGPTStream() {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    (params: { token: string; engine: OpenAIModel; prompt: string; tempretureParam: number; queryText: string }) => {
      const { token, engine, prompt, queryText, tempretureParam } = params;
      if (loading) {
        console.warn('Already loading!');
        return;
      }
      setData('');
      setLoading(true);
      if (!token) {
        setError('No API Key found!');
        setLoading(false);
        return;
      }
      if (!prompt) {
        setError('No prompt found!');
        setLoading(false);
        return;
      }

      const tmpParam = +tempretureParam > 0.4 && +tempretureParam <= 1.0 ? +tempretureParam : getRadomNumber(0.5, 1.0);

      const isGptModel = GPT_MODELS.includes(engine as GPTModel);

      OpenAIClient.chatCompletionsStream(
        {
          token,
          prompt,
          query: queryText,
          model: isGptModel ? (engine as GPTModel) : 'gpt-3.5-turbo',
          temperature: tmpParam,
        },
        {
          async onopen(res) {
            setData('');
            setLoading(true);
            if (res.ok && res.status === 200) {
              console.log('Connection made ', res.status);
              setError('');
            } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
              console.warn('Client side error ', res);
              setError('Client side error ' + res.status);
              setLoading(false);
            }
          },
          onmessage(event) {
            if (event.data === '[DONE]') {
              setError('');
              setLoading(false);
              return;
            }
            const parsedData = JSON.parse(event.data) as ChatCompletionsResponse;
            const text = parsedData.choices
              .map((choice) => {
                if (choice.delta) {
                  return choice.delta.content;
                }
                return '';
              })
              .join('');
            setData((prev) => prev + text);
          },
          onclose() {
            setError('');
            setLoading(false);
          },
          onerror(err) {
            setError(err);
            setLoading(false);
          },
        },
      ).catch((err) => {
        setError(err);
        setLoading(false);
      });
    },
    [loading],
  );
  return { data, mutate, isError: !!error, isLoading: loading };
}
