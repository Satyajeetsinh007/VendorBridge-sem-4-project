from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, UserViewSet, RFQViewSet, ApprovalViewSet, seed_data

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='department')
router.register('users', UserViewSet, basename='user')
router.register('rfqs', RFQViewSet, basename='rfq')
router.register('approvals', ApprovalViewSet, basename='approval')

urlpatterns = [
    path('', include(router.urls)),
    path('seed/', seed_data, name='seed_data'),
]
