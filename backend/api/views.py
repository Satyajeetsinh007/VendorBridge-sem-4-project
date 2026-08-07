from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import random
from django.utils import timezone
from .models import Department, User, RFQ, Approval, Vendor, Quotation, PurchaseOrder, POItem, Invoice
from .serializers import (
    DepartmentSerializer, UserSerializer, RFQSerializer,
    ApprovalSerializer, VendorSerializer, QuotationSerializer,
    PurchaseOrderSerializer, POItemSerializer, InvoiceSerializer
)

# ==========================================
# AUTH ENDPOINTS
# ==========================================

@api_view(['POST'])
def signup_user(request):
    """
    Register a new internal user. Account starts as 'pending'.
    Rejected users may re-apply — their record resets to pending.
    Department required for all roles except manager.
    """
    try:
        data = request.data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        role = data.get('role', '').strip()
        department_id = data.get('department', None)

        if not all([name, email, password, role]):
            return Response({'error': 'Name, email, password, and role are required.'}, status=status.HTTP_400_BAD_REQUEST)

        valid_roles = [r[0] for r in User.RoleChoices.choices]
        if role not in valid_roles:
            return Response({'error': f'Invalid role. Choose from: {valid_roles}'}, status=status.HTTP_400_BAD_REQUEST)

        if role != 'manager' and not department_id:
            return Response({'error': 'Department is required for this role.'}, status=status.HTTP_400_BAD_REQUEST)

        department = None
        if department_id:
            try:
                department = Department.objects.get(id=department_id)
            except Exception:
                return Response({'error': 'Selected department is invalid or not found.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = User.objects.filter(email=email).first()
        if existing:
            if existing.verification_status == 'rejected':
                # Re-application: reset to pending with updated info
                existing.name = name
                existing.password = password
                existing.role = role
                existing.department = department
                existing.verification_status = 'pending'
                existing.rejection_reason = None
                existing.save()
                return Response({'message': 'Re-application submitted for admin review.', 'status': 'pending'}, status=status.HTTP_200_OK)
            elif existing.verification_status == 'pending':
                return Response({'error': 'An application with this email is already pending admin review.'}, status=status.HTTP_409_CONFLICT)
            else:
                return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_409_CONFLICT)

        user = User.objects.create(
            name=name, email=email, password=password,
            role=role, department=department, verification_status='pending',
        )
        return Response({
            'message': 'Application submitted! Awaiting admin approval.',
            'status': 'pending',
            'user': {'id': str(user.id), 'name': user.name, 'email': user.email, 'role': user.role}
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def signup_vendor(request):
    """
    Register a new vendor company. Account starts as 'pending'.
    Rejected vendors may re-apply with the same email.
    """
    try:
        data = request.data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        contact_person = data.get('contact_person', '').strip()
        phone = data.get('phone', '').strip()
        address = data.get('address', '').strip()
        category = data.get('category', '').strip()
        gst_number = data.get('gst_number', '').strip()
        website = data.get('website', '').strip()

        if not all([name, email, password, phone, address]):
            return Response({'error': 'Company name, email, password, phone, and address are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'An internal user account with this email already exists.'}, status=status.HTTP_409_CONFLICT)

        existing = Vendor.objects.filter(email=email).first()
        if existing:
            if existing.verification_status == 'rejected':
                existing.name = name
                existing.password = password
                existing.contact_person = contact_person or None
                existing.phone = phone
                existing.address = address
                existing.category = category or None
                existing.gst_number = gst_number or None
                existing.website = website or None
                existing.verification_status = 'pending'
                existing.rejection_reason = None
                existing.save()
                return Response({'message': 'Re-application submitted for admin review.', 'status': 'pending'}, status=status.HTTP_200_OK)
            elif existing.verification_status == 'pending':
                return Response({'error': 'A vendor application with this email is already pending.'}, status=status.HTTP_409_CONFLICT)
            else:
                return Response({'error': 'A vendor account with this email already exists.'}, status=status.HTTP_409_CONFLICT)

        rand_num = random.randint(1000, 9999)
        vendor_code = f'VND-{rand_num}'
        while Vendor.objects.filter(vendor_code=vendor_code).exists():
            rand_num = random.randint(1000, 9999)
            vendor_code = f'VND-{rand_num}'

        vendor = Vendor.objects.create(
            vendor_code=vendor_code, name=name, email=email, password=password,
            contact_person=contact_person or None, phone=phone, address=address,
            category=category or None, gst_number=gst_number or None,
            website=website or None, status=Vendor.StatusChoices.ACTIVE,
            verification_status='pending',
        )
        return Response({
            'message': 'Vendor application submitted! Awaiting admin approval.',
            'status': 'pending',
            'vendor': {'id': str(vendor.id), 'vendor_code': vendor.vendor_code, 'name': vendor.name, 'email': vendor.email}
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def login_user(request):
    """
    Login. Blocks login if verification_status != 'approved'.
    Admin users (is_admin=True) always pass through.
    Returns specific error codes: 'pending' or 'rejected'.
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '').strip()

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        if user.password != password:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_admin:
            if user.verification_status == 'pending':
                return Response({'error': 'pending', 'message': 'Your account is awaiting admin approval.'}, status=status.HTTP_403_FORBIDDEN)
            if user.verification_status == 'rejected':
                return Response({
                    'error': 'rejected',
                    'message': 'Your account was rejected by the admin.',
                    'reason': user.rejection_reason or 'No reason provided.'
                }, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'type': 'user', 'id': str(user.id), 'name': user.name,
            'email': user.email, 'role': user.role, 'is_admin': user.is_admin,
            'department': str(user.department.id) if user.department else None,
            'department_name': user.department.name if user.department else None,
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        pass

    try:
        vendor = Vendor.objects.get(email=email)
        if vendor.password != password:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        if vendor.verification_status == 'pending':
            return Response({'error': 'pending', 'message': 'Your vendor account is awaiting admin approval.'}, status=status.HTTP_403_FORBIDDEN)
        if vendor.verification_status == 'rejected':
            return Response({
                'error': 'rejected',
                'message': 'Your vendor account was rejected by the admin.',
                'reason': vendor.rejection_reason or 'No reason provided.'
            }, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'type': 'vendor', 'id': str(vendor.id), 'vendor_code': vendor.vendor_code,
            'name': vendor.name, 'email': vendor.email, 'role': 'vendor', 'is_admin': False,
        }, status=status.HTTP_200_OK)
    except Vendor.DoesNotExist:
        pass

    return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)


# ==========================================
# ADMIN ENDPOINTS
# ==========================================

@api_view(['GET'])
def admin_pending_users(request):
    """Return all internal users awaiting admin approval."""
    users = User.objects.filter(verification_status='pending').order_by('-created_at')
    return Response([{
        'id': str(u.id), 'name': u.name, 'email': u.email, 'role': u.role,
        'department': u.department.name if u.department else None,
        'created_at': u.created_at.isoformat(),
    } for u in users])


@api_view(['GET'])
def admin_pending_vendors(request):
    """Return all vendor accounts awaiting admin approval."""
    vendors = Vendor.objects.filter(verification_status='pending').order_by('-created_at')
    return Response([{
        'id': str(v.id), 'vendor_code': v.vendor_code, 'name': v.name,
        'email': v.email, 'category': v.category, 'phone': v.phone,
        'gst_number': v.gst_number, 'address': v.address,
        'created_at': v.created_at.isoformat(),
    } for v in vendors])


@api_view(['GET'])
def admin_all_accounts(request):
    """Full overview of all users and vendors with their verification status."""
    users = User.objects.filter(is_admin=False).order_by('-created_at')
    vendors = Vendor.objects.all().order_by('-created_at')
    return Response({
        'users': [{
            'id': str(u.id), 'type': 'user', 'name': u.name, 'email': u.email,
            'role': u.role, 'department': u.department.name if u.department else None,
            'verification_status': u.verification_status, 'rejection_reason': u.rejection_reason,
            'created_at': u.created_at.isoformat(),
        } for u in users],
        'vendors': [{
            'id': str(v.id), 'type': 'vendor', 'name': v.name, 'email': v.email,
            'vendor_code': v.vendor_code, 'category': v.category,
            'verification_status': v.verification_status, 'rejection_reason': v.rejection_reason,
            'created_at': v.created_at.isoformat(),
        } for v in vendors],
        'stats': {
            'pending_users': User.objects.filter(verification_status='pending', is_admin=False).count(),
            'pending_vendors': Vendor.objects.filter(verification_status='pending').count(),
            'approved_users': User.objects.filter(verification_status='approved', is_admin=False).count(),
            'approved_vendors': Vendor.objects.filter(verification_status='approved').count(),
            'rejected_users': User.objects.filter(verification_status='rejected').count(),
            'rejected_vendors': Vendor.objects.filter(verification_status='rejected').count(),
        }
    })


@api_view(['POST'])
def admin_verify_user(request, user_id):
    """Approve or reject a pending user. Rejection requires a reason."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action', '').strip()
    reason = request.data.get('reason', '').strip()

    if action not in ['approve', 'reject']:
        return Response({'error': 'Action must be "approve" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)
    if action == 'reject' and not reason:
        return Response({'error': 'A rejection reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user.verification_status = 'approved' if action == 'approve' else 'rejected'
    user.rejection_reason = None if action == 'approve' else reason
    user.save()
    return Response({'message': f'User {user.name} has been {action}d.', 'verification_status': user.verification_status})


@api_view(['POST'])
def admin_verify_vendor(request, vendor_id):
    """Approve or reject a pending vendor. Rejection requires a reason."""
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({'error': 'Vendor not found.'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action', '').strip()
    reason = request.data.get('reason', '').strip()

    if action not in ['approve', 'reject']:
        return Response({'error': 'Action must be "approve" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)
    if action == 'reject' and not reason:
        return Response({'error': 'A rejection reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

    vendor.verification_status = 'approved' if action == 'approve' else 'rejected'
    vendor.rejection_reason = None if action == 'approve' else reason
    vendor.save()
    return Response({'message': f'Vendor {vendor.name} has been {action}d.', 'verification_status': vendor.verification_status})


# ==========================================
# VIEWSETS
# ==========================================

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class RFQViewSet(viewsets.ModelViewSet):
    serializer_class = RFQSerializer

    def get_queryset(self):
        today = timezone.now().date()
        RFQ.objects.filter(deadline__lt=today).exclude(status__in=['completed', 'closed']).update(status='closed')
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


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer


# ==========================================
# SEED DATA
# ==========================================

@api_view(['POST'])
def seed_data(request):
    """
    Populate initial sample data: Departments, Users (Officer + Manager),
    Admin user, and 6 Vendors. All seeded accounts are pre-approved.
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

    eng_dept = created_depts[0]

    # Seed admin user
    admin_user, admin_created = User.objects.get_or_create(
        email='admin@vendorbridge.com',
        defaults={
            'name': 'System Admin',
            'role': User.RoleChoices.MANAGER,
            'password': 'admin123',
            'is_admin': True,
            'verification_status': 'approved',
        }
    )
    if not admin_created:
        admin_user.password = 'admin123'
        admin_user.is_admin = True
        admin_user.verification_status = 'approved'
        admin_user.save()

    # Seed Procurement Officer
    officer, officer_created = User.objects.get_or_create(
        email='officer@vendorbridge.com',
        defaults={
            'name': 'Alex Mercer',
            'role': User.RoleChoices.PROCUREMENT_OFFICER,
            'department': eng_dept,
            'password': 'changeme',
            'verification_status': 'approved',
        }
    )
    if not officer_created:
        officer.password = 'changeme'
        officer.verification_status = 'approved'
        officer.save()

    # Seed Manager
    manager, manager_created = User.objects.get_or_create(
        email='manager@vendorbridge.com',
        defaults={
            'name': 'Jane Doe',
            'role': User.RoleChoices.MANAGER,
            'department': eng_dept,
            'password': 'changeme',
            'verification_status': 'approved',
        }
    )
    if not manager_created:
        manager.password = 'changeme'
        manager.verification_status = 'approved'
        manager.save()

    # Seed Finance Member
    fin_dept = created_depts[3] if len(created_depts) > 3 else eng_dept
    finance_user, fin_created = User.objects.get_or_create(
        email='finance@vendorbridge.com',
        defaults={
            'name': 'Sarah Jenkins',
            'role': User.RoleChoices.FINANCE,
            'department': fin_dept,
            'password': 'finance123',
            'verification_status': 'approved',
        }
    )
    if not fin_created:
        finance_user.password = 'finance123'
        finance_user.verification_status = 'approved'
        finance_user.save()


    Vendor.objects.filter(vendor_code='VND-001').delete()

    vendors_data = [
        {'vendor_code': 'VND-DELL', 'name': 'Dell Technologies', 'category': 'IT Hardware',
         'contact_person': 'Rajesh Sharma', 'email': 'enterprise@dell.com', 'phone': '+91-1800-425-3355',
         'gst_number': '27AABCD1234F1Z5', 'website': 'https://www.dell.com',
         'address': 'DLF Cyber City, Building 10, Gurugram, Haryana 122002', 'rating': 4.70, 'status': 'verified'},
        {'vendor_code': 'VND-HP', 'name': 'HP Inc.', 'category': 'IT Hardware',
         'contact_person': 'Priya Nair', 'email': 'sales@hp.com', 'phone': '+91-1800-108-4747',
         'gst_number': '29AABHP5678G2Z3', 'website': 'https://www.hp.com',
         'address': 'Embassy Golf Links, Koramangala, Bengaluru, Karnataka 560071', 'rating': 4.50, 'status': 'verified'},
        {'vendor_code': 'VND-LNV', 'name': 'Lenovo', 'category': 'Electronics',
         'contact_person': 'Amit Kapoor', 'email': 'india-sales@lenovo.com', 'phone': '+91-1800-419-7555',
         'gst_number': '06AALCL9012H3Z1', 'website': 'https://www.lenovo.com',
         'address': 'Tower B, DLF IT Park, Noida, Uttar Pradesh 201301', 'rating': 4.30, 'status': 'active'},
        {'vendor_code': 'VND-GDJ', 'name': 'Godrej Interio', 'category': 'Furniture',
         'contact_person': 'Sneha Patil', 'email': 'b2b@godrejinterio.com', 'phone': '+91-22-6721-2121',
         'gst_number': '27AACG3456I4Z7', 'website': 'https://www.godrejinterio.com',
         'address': 'Godrej One, Pirojshanagar, Vikhroli East, Mumbai, Maharashtra 400079', 'rating': 4.60, 'status': 'verified'},
        {'vendor_code': 'VND-DRN', 'name': 'Durian Furniture', 'category': 'Furniture',
         'contact_person': 'Vikram Mehta', 'email': 'corporate@durian.in', 'phone': '+91-22-4040-5050',
         'gst_number': '27AADDF7890J5Z9', 'website': 'https://www.durian.in',
         'address': 'Andheri MIDC, Andheri East, Mumbai, Maharashtra 400093', 'rating': 4.10, 'status': 'active'},
        {'vendor_code': 'VND-ABC', 'name': 'ABC Office Supplies', 'category': 'Office Supplies',
         'contact_person': 'Deepak Joshi', 'email': 'orders@abcoffice.in', 'phone': '+91-11-2345-6789',
         'gst_number': '07AABCA1234K6Z2', 'website': 'https://www.abcoffice.in',
         'address': 'Nehru Place Market, Block C, New Delhi, Delhi 110019', 'rating': 3.90, 'status': 'active'},
    ]

    created_vendors = []
    for v in vendors_data:
        vendor_obj, _ = Vendor.objects.get_or_create(vendor_code=v['vendor_code'], defaults=v)
        created_vendors.append(vendor_obj)

    return Response({
        'message': 'Seed data created successfully!',
        'admin': {'email': admin_user.email, 'password': 'admin123'},
        'officer': {'email': officer.email, 'password': 'changeme'},
        'manager': {'email': manager.email, 'password': 'changeme'},
        'departments_count': len(created_depts),
        'vendors_count': len(created_vendors),
    }, status=status.HTTP_200_OK)
