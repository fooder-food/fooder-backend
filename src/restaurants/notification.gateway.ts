import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:8080", "example2.com"],
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true,
})
export class NotificationGateway {
    @WebSocketServer()
    server;

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: string) {
        console.log('message',message);
        return 'hello worlds';
    }
}