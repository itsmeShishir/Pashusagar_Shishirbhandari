import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Use a fixed room name for consultation (e.g. "consultation")
        self.room_name = self.scope['url_route']['kwargs'].get('room_name', 'consultation')
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"WebSocket connected: {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print("WebSocket disconnected.")

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data.get('sender')
        recipient_id = data.get('recipient')
        message_text = data.get('message')

        # Get sender using its id (must be a number)
        sender = await User.objects.aget(id=sender_id)

        # Determine recipient:
        # If the provided recipient_id is not valid (e.g. a placeholder string), then get a veterinarian user.
        try:
            recipient = await User.objects.aget(id=int(recipient_id))
        except (ValueError, TypeError):
            # Get the first veterinarian (role == 2)
            recipient = await sync_to_async(User.objects.filter(role=2).first)()
            if recipient is None:
                # If no veterinarian exists, you can handle this accordingly.
                await self.send(text_data=json.dumps({
                    'error': 'No veterinarian available.'
                }))
                return

        # Save the message in the database
        message_instance = await Message.objects.acreate(
            sender=sender,
            recipient=recipient,
            content=message_text
        )

        # Broadcast the message to all clients in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'sender': sender.username,
                'recipient': recipient.username,
                'message': message_instance.content,
                'timestamp': str(message_instance.timestamp),
            }
        )

    async def chat_message(self, event):
        # Send the message event to WebSocket client
        await self.send(text_data=json.dumps(event))
