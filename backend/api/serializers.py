import random
from rest_framework import serializers
from .models import Department, User, RFQ, Approval, Vendor, Quotation

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    department_details = DepartmentSerializer(source='department', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'department', 'department_details', 'created_at']


class RFQSerializer(serializers.ModelSerializer):
    department_details = DepartmentSerializer(source='department', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = RFQ
        fields = [
            'id',
            'rfq_number',
            'title',
            'description',
            'department',
            'department_details',
            'priority',
            'manager_remarks',
            'quantity',
            'deadline',
            'specs_file_url',
            'status',
            'created_by',
            'created_by_details',
            'required_by_date',
            'published_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['rfq_number', 'created_at', 'updated_at']

    def create(self, validated_data):
        if not validated_data.get('rfq_number'):
            # Auto-generate RFQ number like RFQ-2026-XXXX
            rand_num = random.randint(1000, 9999)
            validated_data['rfq_number'] = f"RFQ-2026-{rand_num}"
        return super().create(validated_data)


class ApprovalSerializer(serializers.ModelSerializer):
    approver_details = UserSerializer(source='approver', read_only=True)

    class Meta:
        model = Approval
        fields = [
            'id', 'approval_number', 'approval_type', 'reference_id',
            'reference_type', 'approver', 'approver_details', 'status',
            'remarks', 'submitted_at', 'decided_at'
        ]
        read_only_fields = ['approval_number', 'submitted_at']

    def create(self, validated_data):
        if not validated_data.get('approval_number'):
            rand_num = random.randint(1000, 9999)
            validated_data['approval_number'] = f"APR-2026-{rand_num}"
        return super().create(validated_data)


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'


class QuotationSerializer(serializers.ModelSerializer):
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    rfq_details = RFQSerializer(source='rfq', read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id', 'quotation_number', 'rfq', 'rfq_details',
            'vendor', 'vendor_details', 'unit_price', 'total_price',
            'delivery_days', 'payment_terms', 'notes', 'rating',
            'status', 'submitted_at', 'created_at'
        ]
        read_only_fields = ['quotation_number', 'created_at']

    def create(self, validated_data):
        if not validated_data.get('quotation_number'):
            rand_num = random.randint(1000, 9999)
            validated_data['quotation_number'] = f"QTN-2026-{rand_num}"
        return super().create(validated_data)

