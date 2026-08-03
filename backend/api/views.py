from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Department, User, RFQ, Approval
from .serializers import DepartmentSerializer, UserSerializer, RFQSerializer, ApprovalSerializer

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


@api_view(['POST'])
def seed_data(request):
    """
    Utility endpoint to populate initial sample Departments, Procurement Officers,
    and Managers so the frontend can immediately be tested without manual DB seeding.
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

    return Response({
        'message': 'Sample seed data created successfully!',
        'departments_count': len(created_depts),
        'officer': {
            'id': officer.id,
            'email': officer.email,
            'name': officer.name,
            'role': officer.role
        },
        'manager': {
            'id': manager.id,
            'email': manager.email,
            'name': manager.name,
            'role': manager.role
        }
    }, status=status.HTTP_200_OK)
