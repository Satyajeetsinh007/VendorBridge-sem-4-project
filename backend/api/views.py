from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Department, User, RFQ, Approval, Vendor, Quotation
from .serializers import (
    DepartmentSerializer, UserSerializer, RFQSerializer,
    ApprovalSerializer, VendorSerializer, QuotationSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class RFQViewSet(viewsets.ModelViewSet):
    queryset = RFQ.objects.all().order_by('-created_at')
    serializer_class = RFQSerializer


class ApprovalViewSet(viewsets.ModelViewSet):
    queryset = Approval.objects.all().order_by('-submitted_at')
    serializer_class = ApprovalSerializer


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().order_by('-created_at')
    serializer_class = QuotationSerializer


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

    # Seed Sample Vendor
    vendor, _ = Vendor.objects.get_or_create(
        vendor_code='VND-001',
        defaults={
            'name': 'Apex Technologies Pvt. Ltd.',
            'email': 'sales@apextech.com',
            'phone': '+91-9876543210',
            'address': '42 Industrial Park, Sector 18, Gurugram, Haryana 122015',
            'rating': 4.50,
            'status': Vendor.StatusChoices.ACTIVE
        }
    )

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
        'vendor': {
            'id': str(vendor.id),
            'vendor_code': vendor.vendor_code,
            'name': vendor.name,
            'email': vendor.email
        }
    }, status=status.HTTP_200_OK)
