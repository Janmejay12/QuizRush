// src/lib/websocket.ts
import { Participant} from './types'; // Import from your existing types
import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

// WebSocket message types (matching backend)
export enum WebSocketMessageType {
  // Quiz flow messages
  NEW_QUESTION = 'NEW_QUESTION',
  TIMER_UPDATE = 'TIMER_UPDATE',
  QUESTION_ENDED = 'QUESTION_ENDED',

  // Participant messages
  PARTICIPANT_JOINED = 'PARTICIPANT_JOINED',
  PARTICIPANT_LEFT = 'PARTICIPANT_LEFT',

  // Leaderboard messages
  LEADERBOARD_UPDATE = 'LEADERBOARD_UPDATE',

  // Status messages
  QUIZ_STARTED = 'QUIZ_STARTED',
  QUIZ_ENDED = 'QUIZ_ENDED',
  ERROR = 'ERROR'
}

// WebSocket message interface (matching your backend WebSocketMessage<T>)
export interface WebSocketMessage<T> {
  type: WebSocketMessageType;
  payload: T;
  roomCode: string;
  timestamp: number;
}

export interface ParticipantDTO {
    id: number;
    nickname: string;
    score: number;
    roomCode: string;
  }

export interface QuestionDTO {
    id: number;
    text: string;
    options: string[];
    duration: number;
    points: number;
  }

// Leaderboard entry interface
export interface LeaderboardEntry {
  participantId: number;
  nickname: string;
  score: number;
  totalTimeSpent: number;
  rank: number;
}

// Leaderboard data interface (matching your backend LeaderboardDTO)
export interface LeaderboardData {
  entries: LeaderboardEntry[];
  isFinal: boolean;
}

// WebSocket service class
class WebSocketService {
  private stompClient: Client | null = null;
  private subscriptions: { [key: string]: StompSubscription } = {};
  private connected: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private connectionResolve: (() => void) | null = null;
  private connectionReject: ((error: Error) => void) | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 2000; // Start with 2 seconds

  // Initialize the WebSocket connection
  public connect(): Promise<void> {
    if (this.connected && this.stompClient?.connected) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectionResolve = resolve;
      this.connectionReject = reject;

      try {
        // Create SockJS instance
        const socket = new SockJS('http://localhost:8080/quiz-ws');
        
        // Create STOMP client
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          
          // Configure connection options
          connectHeaders: {
            'heart-beat': '20000,20000', // Send heartbeat every 20 seconds, expect every 20 seconds
          },
          
          // Heartbeat configuration
          heartbeatIncoming: 20000, // Expect heartbeat from server every 20 seconds
          heartbeatOutgoing: 20000, // Send heartbeat to server every 20 seconds
          
          // Reconnection configuration
          reconnectDelay: 0, // We'll handle reconnection manually
          
          // Connection success callback
          onConnect: this.onConnect.bind(this),
          
          // Connection error callback
          onStompError: this.onError.bind(this),
          
          // WebSocket error callback
          onWebSocketError: this.onError.bind(this),
          
          // Connection closed callback
          onWebSocketClose: this.onClose.bind(this),
        });

        // Activate the STOMP client (initiates connection)
        this.stompClient.activate();
        
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        if (this.connectionReject) {
          this.connectionReject(error as Error);
        }
        this.resetConnection();
      }
    });

    return this.connectionPromise;
  }

  // Handle successful connection
  private onConnect(): void {
    console.log('WebSocket connected successfully');
    this.connected = true;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 2000; // Reset timeout

    if (this.connectionResolve) {
      this.connectionResolve();
    }
  }

  // Handle connection error
  private onError(error: any): void {
    console.error('WebSocket connection error:', error);
    this.connected = false;

    if (this.connectionReject) {
      this.connectionReject(new Error('WebSocket connection failed'));
    }

    // Attempt to reconnect
    this.attemptReconnect();
  }

  // Handle connection close
  private onClose(event: any): void {
    console.log('WebSocket connection closed:', event);
    this.connected = false;
    
    // Attempt to reconnect if it wasn't a clean close
    if (!event.wasClean) {
      this.attemptReconnect();
    }
  }

  // Attempt to reconnect
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`);
      this.resetConnection();
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectTimeout / 1000}s...`);

    setTimeout(() => {
      this.resetConnection();
      this.connect().catch(error => {
        console.error('Reconnection attempt failed:', error);
      });
    }, this.reconnectTimeout);

    // Exponential backoff
    this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, 30000); // Max 30 seconds
  }

  // Reset connection state
  private resetConnection(): void {
    if (this.stompClient) {
      try {
        this.stompClient.deactivate();
      } catch (e) {
        console.warn('Error deactivating STOMP client:', e);
      }
    }

    this.stompClient = null;
    this.connected = false;
    this.connectionPromise = null;
    this.connectionResolve = null;
    this.connectionReject = null;
    this.subscriptions = {};
  }

  // Subscribe to a quiz room
  public subscribeToQuiz(roomCode: string, callbacks: {
    onParticipantJoined?: (participant: ParticipantDTO) => void;
    onParticipantLeft?: (participant: ParticipantDTO) => void;
    onQuizStarted?: () => void;
    onQuizEnded?: () => void;
    onNewQuestion?: (question: QuestionDTO) => void;
    onQuestionEnded?: () => void;
    onTimerUpdate?: (remainingSeconds: number) => void;
    onLeaderboardUpdate?: (leaderboard: LeaderboardData) => void;
    onError?: (error: any) => void;
  }): Promise<void> {
    return this.connect().then(() => {
      if (!this.stompClient || !this.connected) {
        throw new Error('WebSocket not connected');
      }

      const destination = `/topic/quiz/${roomCode}`;
      
      // Unsubscribe if already subscribed
      if (this.subscriptions[destination]) {
        this.subscriptions[destination].unsubscribe();
      }

      // Subscribe to the destination
      this.subscriptions[destination] = this.stompClient.subscribe(
        destination,
        (message: IMessage) => {
          try {
            const parsedMessage: WebSocketMessage<any> = JSON.parse(message.body);
            console.log('Received WebSocket message:', parsedMessage);

            // Handle different message types
            switch (parsedMessage.type) {
              case WebSocketMessageType.PARTICIPANT_JOINED:
                if (callbacks.onParticipantJoined) {
                  callbacks.onParticipantJoined(parsedMessage.payload);
                }
                break;
              case WebSocketMessageType.PARTICIPANT_LEFT:
                if (callbacks.onParticipantLeft) {
                  callbacks.onParticipantLeft(parsedMessage.payload);
                }
                break;
              case WebSocketMessageType.QUIZ_STARTED:
                if (callbacks.onQuizStarted) {
                  callbacks.onQuizStarted();
                }
                break;
              case WebSocketMessageType.QUIZ_ENDED:
                if (callbacks.onQuizEnded) {
                  console.log('[WebSocket] Quiz ended event received, calling handler');
                  callbacks.onQuizEnded();
                } else {
                  console.warn('[WebSocket] Quiz ended event received but no handler registered');
                }
                break;
              case WebSocketMessageType.NEW_QUESTION:
                if (callbacks.onNewQuestion) {
                  callbacks.onNewQuestion(parsedMessage.payload);
                }
                break;
              case WebSocketMessageType.QUESTION_ENDED:
                if (callbacks.onQuestionEnded) {
                  callbacks.onQuestionEnded();
                }
                break;
              case WebSocketMessageType.TIMER_UPDATE:
                if (callbacks.onTimerUpdate) {
                  callbacks.onTimerUpdate(parsedMessage.payload);
                }
                break;
              case WebSocketMessageType.LEADERBOARD_UPDATE:
                if (callbacks.onLeaderboardUpdate) {
                  callbacks.onLeaderboardUpdate(parsedMessage.payload);
                }
                break;
              case WebSocketMessageType.ERROR:
                if (callbacks.onError) {
                  callbacks.onError(parsedMessage.payload);
                }
                break;
              default:
                console.warn('Unknown message type:', parsedMessage.type);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
            if (callbacks.onError) {
              callbacks.onError(error);
            }
          }
        }
      );

      console.log(`Subscribed to ${destination}`);
    });
  }

  // Send a message to join a quiz room
  public joinQuizRoom(roomCode: string, participant: Participant): void {
    if (!this.stompClient || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    this.stompClient.publish({
      destination: `/app/quiz/${roomCode}/join`,
      body: JSON.stringify(participant),
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  // Send a message to leave a quiz room
  public leaveQuizRoom(roomCode: string, participant: Participant): void {
    if (!this.stompClient || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    this.stompClient.publish({
      destination: `/app/quiz/${roomCode}/leave`,
      body: JSON.stringify(participant),
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  // Unsubscribe from a quiz room
  public unsubscribeFromQuiz(roomCode: string): void {
    const destination = `/topic/quiz/${roomCode}`;
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
      console.log(`Unsubscribed from ${destination}`);
    }
  }

  // Check if WebSocket is connected
  public isConnected(): boolean {
    return this.connected && this.stompClient?.connected === true;
  }

  // Get connection state
  public getConnectionState(): string {
    if (!this.stompClient) return 'DISCONNECTED';
    return this.stompClient.connected ? 'CONNECTED' : 'CONNECTING';
  }

  // Disconnect WebSocket
  public disconnect(): void {
    if (this.stompClient) {
      // Unsubscribe from all subscriptions
      Object.values(this.subscriptions).forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.warn('Error unsubscribing:', e);
        }
      });

      // Deactivate STOMP client (this closes the connection)
      try {
        this.stompClient.deactivate();
      } catch (e) {
        console.warn('Error deactivating STOMP client:', e);
      }
    }

    this.resetConnection();
    console.log('WebSocket disconnected');
  }
}

// Create and export a singleton instance
export const websocketService = new WebSocketService();