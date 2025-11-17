# orders/urls.py
from django.urls import path
from .views import (
    InitiatePaymentView,
    VerifyPaymentView,
    HistoryListView,
    AdminOrderListView,
)

urlpatterns = [
    path("initiate-payment/", InitiatePaymentView.as_view(), name="initiate-payment"),
    path("verify-payment/", VerifyPaymentView.as_view(), name="verify-payment"),
    path("history/", HistoryListView.as_view(), name="history"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-orders"),
]
