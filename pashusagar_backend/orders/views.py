# orders/views.py
from django.db.models import Q
from django.shortcuts import redirect
from django.conf import settings
import requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import Order, OrderItem
from .serializers import OrderSerializer
from notifications.models import Notification
from products.models import Appointment
from products.serializers import AppointmentSerializer

class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # The request.data should now include shipping_name, shipping_phone, etc.
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            
            try:
                # Calculate total payable amount in paisa
                amount = sum(
                    item.product.price * item.quantity for item in order.items.all()
                ) * 100
            except KeyError:
                return Response(
                    {"error": "Invalid product data in items"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Prepare payload for Khalti's "initiate" endpoint
            payload = {
                "return_url": "http://127.0.0.1:8000/api/verify-payment/",
                "website_url": "http://127.0.0.1:8000",
                "amount": int(amount),
                "purchase_order_id": f"Order_{order.id}",
                "purchase_order_name": f"Order {order.id}",
                "customer_info": {
                    "name": request.user.username,
                    "email": request.user.email,
                    "phone": order.shipping_phone or request.data.get("phone", ""),
                },
            }

            headers = {
                'Authorization': f'Key {settings.KHALTI_SECRET_KEY}',
                'Content-Type': 'application/json',
            }

            if order.payment_method == 'Khalti':
                # Attempt to initiate a Khalti payment only if payment_method=Khalti
                try:
                    khalti_response = requests.post(
                        "https://a.khalti.com/api/v2/epayment/initiate/",
                        headers=headers,
                        json=payload
                    )
                    response_data = khalti_response.json()

                    if khalti_response.status_code == 200:
                        pidx = response_data.get("pidx")
                        # Save the pidx
                        if pidx:
                            order.khalti_pidx = pidx
                            order.save()
                        
                        return Response(response_data, status=status.HTTP_200_OK)
                    else:
                        return Response(response_data, status=khalti_response.status_code)

                except requests.RequestException as e:
                    return Response({
                        "message": "Failed to initiate payment with Khalti.",
                        "details": str(e)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # If it's COD, just return success or do any extra logic
                # Mark order as completed, or keep as pending until you confirm delivery, etc.
                return Response({
                    "message": "Order created successfully (Cash on Delivery).",
                    "order_id": order.id
                }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyPaymentView(APIView):
    def get(self, request):
        pidx = request.query_params.get("pidx")
        if not pidx:
            return redirect("http://localhost:5173/")

        lookup_url = "https://a.khalti.com/api/v2/epayment/lookup/"
        headers = {
            'Authorization': f'Key {settings.KHALTI_SECRET_KEY}',
            'Content-Type': 'application/json',
        }
        payload = {"pidx": pidx}

        try:
            verification_response = requests.post(lookup_url, headers=headers, json=payload)
            print("Khalti status code:", verification_response.status_code)
            print("Khalti response:", verification_response.text)
            
            if verification_response.status_code == 200:
                data = verification_response.json()
                khalti_status = data.get("status")

                order = Order.objects.filter(khalti_pidx=pidx).first()
                if order and khalti_status == "Completed":
                    order.payment_status = "Completed"
                    order.save()

                    Notification.objects.create(
                        user=order.user,
                        notification_type='order',
                        message=(f"Your order #{order.id} is now {order.payment_status}.")
                    )

                    return redirect(f"http://localhost:5173/payment-success?order_id={order.id}")
                else:
                    return redirect("http://localhost:5173/")
            else:
                return redirect("http://localhost:5173/")
        except requests.RequestException as e:
            print("Exception calling Khalti lookup:", str(e))
            return redirect("http://localhost:5173/")


class HistoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user

        # Fetch only successfully paid orders
        orders = Order.objects.filter(user=user, payment_status="Completed").order_by('-created_at')
        orders_serializer = OrderSerializer(orders, many=True)

        # Fetch appointments (assuming no payment-based filtering)
        appointments = Appointment.objects.filter(Q(customer=user)).order_by('-appointment_date')
        appointments_serializer = AppointmentSerializer(appointments, many=True)

        return Response({
            'orders': orders_serializer.data,
            'appointments': appointments_serializer.data,
        }, status=status.HTTP_200_OK)
    

class AdminOrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        # Check if user is admin (role = 0)
        if not hasattr(request.user, "role") or request.user.role != 0:
            return Response(
                {"error": "Access denied. Admin privileges required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get query parameters for filtering
        status_filter = request.query_params.get("status", None)
        payment_method_filter = request.query_params.get("payment_method", None)

        # Base queryset
        orders = Order.objects.all().order_by("-created_at")

        # Apply filters
        if status_filter:
            orders = orders.filter(payment_status=status_filter)
        if payment_method_filter:
            orders = orders.filter(payment_method=payment_method_filter)

        # Serialize orders
        orders_serializer = OrderSerializer(orders, many=True)

        return Response(
            {
                "orders": orders_serializer.data,
                "total_orders": orders.count(),
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, format=None):
        # Allow admin to update order status
        if not hasattr(request.user, "role") or request.user.role != 0:
            return Response(
                {"error": "Access denied. Admin privileges required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        order_id = request.data.get("order_id")
        new_status = request.data.get("status")

        if not order_id or not new_status:
            return Response(
                {"error": "order_id and status are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(id=order_id)
            order.payment_status = new_status
            order.save()

            # Create notification for user
            Notification.objects.create(
                user=order.user,
                notification_type="order",
                message=f"Your order #{order.id} status has been updated to {new_status}.",
            )

            return Response(
                {
                    "message": f"Order {order_id} status updated to {new_status}",
                    "order": OrderSerializer(order).data,
                },
                status=status.HTTP_200_OK,
            )

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND
            )
