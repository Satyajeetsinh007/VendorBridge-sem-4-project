from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Department, User, RFQ, Approval, Vendor, Quotation, PurchaseOrder, POItem
from .serializers import (
    DepartmentSerializer, UserSerializer, RFQSerializer,
    ApprovalSerializer, VendorSerializer, QuotationSerializer, PurchaseOrderSerializer, POItemSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


from django.utils import timezone

class RFQViewSet(viewsets.ModelViewSet):
    serializer_class = RFQSerializer

    def get_queryset(self):
        today = timezone.now().date()
        RFQ.objects.filter(
            deadline__lt=today
        ).exclude(
            status__in=['completed', 'closed']
        ).update(status='closed')
        return RFQ.objects.all().order_by('-created_at')


class ApprovalViewSet(viewsets.ModelViewSet):
    queryset = Approval.objects.all().order_by('-submitted_at')
    serializer_class = ApprovalSerializer


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().order_by('-created_at')
    serializer_class = QuotationSerializer


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer


@api_view(['POST'])
def seed_data(request):
    """
    Utility endpoint to populate initial sample Departments, Procurement Officers,
    Managers, and Vendors so the frontend can immediately be tested without manual DB seeding.
    """
    depts = [
        {'name': 'Engineering & Operations', 'code': 'ENG'},
        {'name': 'Information Technology', 'code': 'IT'},
        {'name': 'Logistics & Supply Chain', 'code': 'LOG'},
        {'name': 'Finance & Accounting', 'code': 'FIN'},
    ]
    created_depts = []
    for d in depts:
        dept_obj, _ = Department.objects.get_or_create(code=d['code'], defaults={'name': d['name']})
        created_depts.append(dept_obj)

    # Seed Sample Procurement Officer User
    eng_dept = created_depts[0]
    officer, _ = User.objects.get_or_create(
        email='officer@vendorbridge.com',
        defaults={
            'name': 'Alex Mercer',
            'role': User.RoleChoices.PROCUREMENT_OFFICER,
            'department': eng_dept
        }
    )

    # Seed Sample Manager User
    manager, _ = User.objects.get_or_create(
        email='manager@vendorbridge.com',
        defaults={
            'name': 'Jane Doe',
            'role': User.RoleChoices.MANAGER,
            'department': eng_dept
        }
    )

    # Clean up legacy vendor if present
    Vendor.objects.filter(vendor_code='VND-001').delete()

    # Seed 6 Vendors
    vendors_data = [
        {
            'vendor_code': 'VND-DELL',
            'name': 'Dell Technologies',
            'category': 'IT Hardware',
            'contact_person': 'Rajesh Sharma',
            'email': 'enterprise@dell.com',
            'phone': '+91-1800-425-3355',
            'gst_number': '27AABCD1234F1Z5',
            'website': 'https://www.dell.com',
            'address': 'DLF Cyber City, Building 10, Gurugram, Haryana 122002',
            'rating': 4.70,
            'status': 'verified',
        },
        {
            'vendor_code': 'VND-HP',
            'name': 'HP Inc.',
            'category': 'IT Hardware',
            'contact_person': 'Priya Nair',
            'email': 'sales@hp.com',
            'phone': '+91-1800-108-4747',
            'gst_number': '29AABHP5678G2Z3',
            'website': 'https://www.hp.com',
            'address': 'Embassy Golf Links, Koramangala, Bengaluru, Karnataka 560071',
            'rating': 4.50,
            'status': 'verified',
        },
        {
            'vendor_code': 'VND-LNV',
            'name': 'Lenovo',
            'category': 'Electronics',
            'contact_person': 'Amit Kapoor',
            'email': 'india-sales@lenovo.com',
            'phone': '+91-1800-419-7555',
            'gst_number': '06AALCL9012H3Z1',
            'website': 'https://www.lenovo.com',
            'address': 'Tower B, DLF IT Park, Noida, Uttar Pradesh 201301',
            'rating': 4.30,
            'status': 'active',
        },
        {
            'vendor_code': 'VND-GDJ',
            'name': 'Godrej Interio',
            'category': 'Furniture',
            'contact_person': 'Sneha Patil',
            'email': 'b2b@godrejinterio.com',
            'phone': '+91-22-6721-2121',
            'gst_number': '27AACG3456I4Z7',
            'website': 'https://www.godrejinterio.com',
            'address': 'Godrej One, Pirojshanagar, Vikhroli East, Mumbai, Maharashtra 400079',
            'rating': 4.60,
            'status': 'verified',
        },
        {
            'vendor_code': 'VND-DRN',
            'name': 'Durian Furniture',
            'category': 'Furniture',
            'contact_person': 'Vikram Mehta',
            'email': 'corporate@durian.in',
            'phone': '+91-22-4040-5050',
            'gst_number': '27AADDF7890J5Z9',
            'website': 'https://www.durian.in',
            'address': 'Andheri MIDC, Andheri East, Mumbai, Maharashtra 400093',
            'rating': 4.10,
            'status': 'active',
        },
        {
            'vendor_code': 'VND-ABC',
            'name': 'ABC Office Supplies',
            'category': 'Office Supplies',
            'contact_person': 'Deepak Joshi',
            'email': 'orders@abcoffice.in',
            'phone': '+91-11-2345-6789',
            'gst_number': '07AABCA1234K6Z2',
            'website': 'https://www.abcoffice.in',
            'address': 'Nehru Place Market, Block C, New Delhi, Delhi 110019',
            'rating': 3.90,
            'status': 'active',
        },
    ]

    created_vendors = []
    for v in vendors_data:
        vendor_obj, _ = Vendor.objects.get_or_create(
            vendor_code=v['vendor_code'],
            defaults=v
        )
        created_vendors.append(vendor_obj)

    return Response({
        'message': 'Sample seed data created successfully!',
        'departments_count': len(created_depts),
        'officer': {
            'id': str(officer.id),
            'email': officer.email,
            'name': officer.name,
            'role': officer.role
        },
        'manager': {
            'id': str(manager.id),
            'email': manager.email,
            'name': manager.name,
            'role': manager.role
        },
        'vendors_count': len(created_vendors),
        'vendors': [{'id': str(v.id), 'name': v.name, 'code': v.vendor_code} for v in created_vendors]
    }, status=status.HTTP_200_OK)
