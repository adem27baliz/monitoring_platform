import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/live',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = 0;

  handleConnection(client: Socket) {
    this.connectedClients++;
    console.log(`[WS] Client connected: ${client.id} | Total: ${this.connectedClients}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    console.log(`[WS] Client disconnected: ${client.id} | Total: ${this.connectedClients}`);
  }

  /**
   * Pushes a new metric reading to all connected dashboard clients.
   */
  emitMetric(metric: any) {
    this.server.emit('metric', metric);
  }

  /**
   * Pushes a new anomaly event to all connected dashboard clients.
   */
  emitAnomaly(anomaly: any) {
    this.server.emit('anomaly', anomaly);
    console.log(`[WS] Anomaly broadcast | agent: ${anomaly.agentId} | confidence: ${anomaly.confidence}`);
  }
}
