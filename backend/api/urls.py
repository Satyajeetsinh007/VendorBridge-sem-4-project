from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, UserViewSet, RFQViewSet,
    ApprovalViewSet, VendorViewSet, QuotationViewSet, PurchaseOrderViewSet,
    InvoiceViewSet, seed_data,
    # Auth
    signup_user, signup_vendor, login_user,
    # Admin
    admin_pending_users, admin_pending_vendors, admin_all_accounts,
    admin_verify_user, admin_verify_vendor,
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

    # Auth
    path('auth/signup/user/', signup_user, name='signup_user'),
    path('auth/signup/vendor/', signup_vendor, name='signup_vendor'),
    path('auth/login/', login_user, name='login_user'),

    # Admin
    path('admin/pending/users/', admin_pending_users, name='admin_pending_users'),
    path('admin/pending/vendors/', admin_pending_vendors, name='admin_pending_vendors'),
    path('admin/accounts/', admin_all_accounts, name='admin_all_accounts'),
    path('admin/verify/user/<uuid:user_id>/', admin_verify_user, name='admin_verify_user'),
    path('admin/verify/vendor/<uuid:vendor_id>/', admin_verify_vendor, name='admin_verify_vendor'),
]
