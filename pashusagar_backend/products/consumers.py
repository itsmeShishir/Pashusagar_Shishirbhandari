import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Use a fixed room name for consultation (e.g. "consultation")
        self.room_name = self.scope["url_route"]["kwargs"].get(
            "room_name", "consultation"
        )
        self.room_group_name = f"chat_{self.room_name}"

        # Accept the connection first
        await self.accept()

        # Add to group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        print(f"WebSocket connected: {self.room_group_name}")

        # Send a welcome message
        await self.send(
            text_data=json.dumps(
                {
                    "type": "connection_established",
                    "message": "Connected to chat room successfully",
                }
            )
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print("WebSocket disconnected.")

    async def receive(self, text_data):
        try:
            print(f"Received message: {text_data}")
            data = json.loads(text_data)
            sender_id = data.get("sender")
            recipient_id = data.get("recipient")
            message_text = data.get("message")

            print(
                f"Parsed data - Sender: {sender_id}, Recipient: {recipient_id}, Message: {message_text}"
            )

            if not sender_id or not message_text:
                await self.send(
                    text_data=json.dumps(
                        {"error": "Sender ID and message are required."}
                    )
                )
                return

            # Get sender using its id (must be a number)
            try:
                sender = await database_sync_to_async(User.objects.get)(
                    id=int(sender_id)
                )
                print(f"Found sender: {sender.username}")
            except (User.DoesNotExist, ValueError, TypeError) as e:
                print(f"Sender error: {e}")
                await self.send(text_data=json.dumps({"error": "Invalid sender ID."}))
                return

            # Determine recipient:
            # If the provided recipient_id is not valid (e.g. a placeholder string), then get a veterinarian user.
            try:
                recipient = await database_sync_to_async(User.objects.get)(
                    id=int(recipient_id)
                )
                print(f"Found recipient: {recipient.username}")
            except (User.DoesNotExist, ValueError, TypeError) as e:
                print(f"Recipient error: {e}, trying to find a veterinarian")
                # Get the first veterinarian (role == 2)
                recipient = await database_sync_to_async(
                    User.objects.filter(role=2).first
                )()
                if recipient is None:
                    # If no veterinarian exists, you can handle this accordingly.
                    await self.send(
                        text_data=json.dumps({"error": "No veterinarian available."})
                    )
                    return
                print(f"Using veterinarian: {recipient.username}")

            # Save the message in the database
            message_instance = await database_sync_to_async(Message.objects.create)(
                sender=sender, recipient=recipient, content=message_text
            )
            print(f"Message saved with ID: {message_instance.id}")

            # Broadcast the message to all clients in the room
            message_data = {
                "type": "chat_message",
                "sender_id": sender.id,
                "sender": sender.username,
                "recipient_id": recipient.id,
                "recipient": recipient.username,
                "message": message_instance.content,
                "timestamp": message_instance.timestamp.isoformat(),
            }

            await self.channel_layer.group_send(self.room_group_name, message_data)
            print(f"Message broadcasted to group: {self.room_group_name}")

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            await self.send(text_data=json.dumps({"error": "Invalid JSON format."}))
        except Exception as e:
            print(f"Unexpected error: {e}")
            await self.send(
                text_data=json.dumps({"error": f"An error occurred: {str(e)}"})
            )

    async def chat_message(self, event):
        # Send the message event to WebSocket client
        await self.send(text_data=json.dumps(event))
