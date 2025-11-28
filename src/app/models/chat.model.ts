export interface ChatMessage {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  response?: SmartHomeResponse;
}

export interface SmartHomeRequest {
  request: string;
}

export interface SmartHomeResponse {
  answer: string;
  ventilador: boolean;
  persianas: boolean;
  bulbs: boolean;
}
