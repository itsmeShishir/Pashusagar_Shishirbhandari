from django.db import transaction
from rest_framework import serializers

from .models import Order, OrderItem
from products.models import Product
from products.models import Appointment  # For history
from products.serializers import AppointmentSerializer


# ========================
# Order Items (Output)
# ========================
class OrderItemSerializer(serializers.ModelSerializer):
    product_details = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product_details", "quantity"]

    def get_product_details(self, obj):
        product = obj.product
        return {
            "id": product.id,
            "title": product.title,
            "price": float(product.price),
            "images": product.images.url if product.images else None,
        }


# ========================
# Order Items (Input)
# ========================
class OrderItemInputSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)


# ========================
# ORDER SERIALIZER
# ========================
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True, write_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "payment_status",
            "payment_method",
            "khalti_pidx",
            "created_at",
            "items",
            "shipping_name",
            "shipping_phone",
            "shipping_address",
            "shipping_city",
            "shipping_state",
            "shipping_zip",
        ]
        read_only_fields = ["id", "created_at", "payment_status", "khalti_pidx"]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["items"] = OrderItemSerializer(instance.items.all(), many=True).data
        return data

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        validated_data["user"] = self.context["request"].user

        with transaction.atomic():
            order = Order.objects.create(**validated_data)

            for item in items_data:
                OrderItem.objects.create(
                    order=order,
                    product=item["product"],   # Already a Product instance
                    quantity=item["quantity"]
                )

        return order


class OrderSerializers(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "payment_method",
            "payment_status",
            "created_at",
            "items",   # MUST contain full product data
        ]
