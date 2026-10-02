import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('[ARHDN Socket] Connected to command center gateway:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('[ARHDN Socket] Disconnected from gateway');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('[ARHDN Socket] Connection error:', error.message);
      });
    }

    return this.socket;
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    this.getSocket()?.on(event, callback);
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    this.getSocket()?.off(event, callback);
  }

  public emit(event: string, data: any): void {
    this.getSocket()?.emit(event, data);
  }

  public get status(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
export default socketService;
