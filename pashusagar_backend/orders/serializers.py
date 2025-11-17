# orders/serializers.py
from django.db import transaction
from rest_framework import serializers

from .models import Order, OrderItem
from products.models import Product, Appointment


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer used when reading orders (GET)."""

    product_details = serializers.SerializerMethodField()

    # Accept product ID when writing
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = OrderItem
        fields = ["product", "product_details", "quantity"]

    def get_product_details(self, obj):
        product = obj.product
        return {
            "id": product.id,
            "title": product.title,
            "price": float(product.price),
            "images": product.images.url if product.images else None,
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Replace product ID with expanded product information when returning data
        data["product"] = data.pop("product_details")
        return data


class OrderItemInputSerializer(serializers.Serializer):
    """Serializer used for incoming cart items."""

    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1, default=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True, write_only=True)
    user = serializers.SerializerMethodField(read_only=True)

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
        read_only_fields = ["id", "khalti_pidx", "created_at", "payment_status"]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        items_serializer = OrderItemSerializer(instance.items.all(), many=True)
        data["items"] = items_serializer.data
        return data

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        validated_data["user"] = self.context["request"].user

        print("DEBUG - Items data received:", items_data)
        print("DEBUG - Validated data:", validated_data)

        with transaction.atomic():
            order = Order.objects.create(**validated_data)

            for item_data in items_data:
                product = item_data.get("product")
                quantity = item_data.get("quantity", 1)

                # Safety net: if we somehow only received a raw ID, resolve it now.
                if isinstance(product, int):
                    product = Product.objects.filter(id=product).first()
                if product is None:
                    raise serializers.ValidationError(
                        "Each item must include a valid product."
                    )

                print(
                    f"DEBUG - Creating OrderItem: product_id={product.id}, quantity={quantity}"
                )

                OrderItem.objects.create(order=order, product=product, quantity=quantity)
                print(
                    f"DEBUG - Successfully created OrderItem for product {product.title}"
                )

        return order


class AppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source="customer.username")

    class Meta:
        model = Appointment
        fields = [
            "id",
            "customer",
            "customer_name",
            "pet_name",
            "appointment_date",
            "description",
            "is_confirmed",
        ]
