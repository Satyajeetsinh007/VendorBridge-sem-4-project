from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, UserViewSet, RFQViewSet,
    ApprovalViewSet, VendorViewSet, QuotationViewSet, PurchaseOrderViewSet, InvoiceViewSet, seed_data
)

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='department')
router.register('users', UserViewSet, basename='user')
router.register('rfqs', RFQViewSet, basename='rfq')
router.register('approvals', ApprovalViewSet, basename='approval')
router.register('vendors', VendorViewSet, basename='vendor')
router.register('quotations', QuotationViewSet, basename='quotation')
router.register('purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register('invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
    path('seed/', seed_data, name='seed_data'),
]
