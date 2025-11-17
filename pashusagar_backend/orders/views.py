from django.db.models import Q
from django.shortcuts import redirect
from django.conf import settings
import requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import Order
from .serializers import OrderSerializer, OrderSerializers
from notifications.models import Notification
from products.models import Appointment
from products.serializers import AppointmentSerializer


# ==============================
# INITIATE PAYMENT
# ==============================
class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order = serializer.save()

        # Calculate total amount
        amount = sum(item.product.price * item.quantity for item in order.items.all())
        amount_paisa = int(amount * 100)

        payload = {
            "return_url": "http://127.0.0.1:8000/api/verify-payment/",
            "website_url": "http://127.0.0.1:8000",
            "amount": amount_paisa,
            "purchase_order_id": f"Order_{order.id}",
            "purchase_order_name": f"Order {order.id}",
            "customer_info": {
                "name": request.user.username,
                "email": request.user.email,
                "phone": order.shipping_phone,
            },
        }

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        # Handle Khalti
        if order.payment_method == "Khalti":
            try:
                response = requests.post(
                    "https://a.khalti.com/api/v2/epayment/initiate/",
                    headers=headers,
                    json=payload,
                    timeout=30,
                )
                data = response.json()
            except requests.RequestException as exc:
                return Response(
                    {
                        "success": False,
                        "error": "Failed to reach Khalti.",
                        "details": str(exc),
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            if response.status_code == 200:
                pidx = data.get("pidx")
                payment_url = data.get("payment_url")
                order.khalti_pidx = pidx
                order.save()

                return Response(
                    {
                        "success": True,
                        "payment_url": payment_url,
                        "pidx": pidx,
                        "order_id": order.id,
                        "expires_in": data.get("expires_in"),
                        "expires_at": data.get("expires_at"),
                        "total_amount": amount,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {
                    "success": False,
                    "error": "Khalti payment initiation failed.",
                    "details": data,
                },
                status=response.status_code,
            )

        # COD
        return Response(
            {
                "success": True,
                "message": "Order created successfully (Cash on Delivery).",
                "order_id": order.id,
            },
            status=status.HTTP_200_OK,
        )


# ==============================
# VERIFY PAYMENT
# ==============================
class VerifyPaymentView(APIView):
    def get(self, request):
        pidx = request.query_params.get("pidx")
        if not pidx:
            return redirect("http://localhost:5173/")

        lookup_url = "https://a.khalti.com/api/v2/epayment/lookup/"
        headers = {"Authorization": f"Key {settings.KHALTI_SECRET_KEY}"}
        payload = {"pidx": pidx}

        response = requests.post(lookup_url, json=payload, headers=headers)
        data = response.json()

        order = Order.objects.filter(khalti_pidx=pidx).first()

        if order and data.get("status") == "Completed":
            order.payment_status = "Completed"
            order.save()

            Notification.objects.create(
                user=order.user,
                notification_type="order",
                message=f"Your order #{order.id} is now Completed.",
            )

            return redirect(f"http://localhost:5173/payment-success?order_id={order.id}")

        return redirect("http://localhost:5173/")


# ==============================
# USER ORDER HISTORY
# ==============================
class HistoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        orders = Order.objects.filter(
            user=user, payment_status="Completed"
        ).order_by("-created_at")

        appointments = Appointment.objects.filter(
            Q(customer=user)
        ).order_by("-appointment_date")

        return Response(
            {
                "orders": OrderSerializer(orders, many=True).data,
                "appointments": AppointmentSerializer(appointments, many=True).data,
            }
        )


# ==============================
# ADMIN ORDER LIST + UPDATE
# ==============================
class AdminOrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "role") or request.user.role != 0:
            return Response({"error": "Admin only"}, status=403)

        status_filter = request.query_params.get("status")
        pm_filter = request.query_params.get("payment_method")

        qs = Order.objects.all().order_by("-created_at")
        if status_filter:
            qs = qs.filter(payment_status=status_filter)
        if pm_filter:
            qs = qs.filter(payment_method=pm_filter)

        return Response(
            {
                "orders": OrderSerializers(qs, many=True).data,
                "total_orders": qs.count(),
            }
        )

    def patch(self, request):
        if not hasattr(request.user, "role") or request.user.role != 0:
            return Response({"error": "Admin only"}, status=403)

        order_id = request.data.get("order_id")
        new_status = request.data.get("status")

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

        order.payment_status = new_status
        order.save()

        Notification.objects.create(
            user=order.user,
            notification_type="order",
            message=f"Your order #{order.id} is now {new_status}.",
        )

        return Response(
            {"message": "Updated successfully", "order": OrderSerializers(order).data}
        )
 