import uuid
from django.db import models

# ==========================================
# 1. CORE ENTITIES
# ==========================================

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name} ({self.code})"


class User(models.Model):
    class RoleChoices(models.TextChoices):
        PROCUREMENT_OFFICER = 'procurement_officer', 'Procurement Officer'
        MANAGER = 'manager', 'Manager'
        VENDOR = 'vendor', 'Vendor'
        FINANCE = 'finance', 'Finance'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    role = models.CharField(max_length=30, choices=RoleChoices.choices)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.role}"


class Vendor(models.Model):
    class StatusChoices(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        BLACKLISTED = 'blacklisted', 'Blacklisted'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor_code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150)
    phone = models.CharField(max_length=30)
    address = models.TextField()
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.vendor_code})"


# ==========================================
# 2. PROCUREMENT FLOW
# ==========================================

# class PurchaseRequisition(models.Model):
#     class PriorityChoices(models.TextChoices):
#         LOW = 'low', 'Low'
#         MEDIUM = 'medium', 'Medium'
#         HIGH = 'high', 'High'

#     class StatusChoices(models.TextChoices):
#         DRAFT = 'draft', 'Draft'
#         
#         
#         

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     requisition_number = models.CharField(max_length=20, unique=True)
#     item_name = models.CharField(max_length=200)
#     category = models.CharField(max_length=100)
#     quantity = models.IntegerField()
#     department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='requisitions')
#     justification = models.TextField()
#     
#     
#     status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.DRAFT)
#     
#     created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_requisitions')
#     submitted_at = models.DateTimeField(null=True, blank=True)
#     decided_at = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.requisition_number} - {self.item_name}"


class RFQ(models.Model):
    class StatusChoices(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        OPEN = 'open', 'Open'
        CLOSED = 'closed', 'Closed'
        PENDING_APPROVAL = 'pending_approval', 'Pending Approval'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
    class PriorityChoices(models.TextChoices):

        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rfq_number = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='RFQ',null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PriorityChoices.choices, default=PriorityChoices.MEDIUM)
    manager_remarks = models.TextField(null=True, blank=True)
    # requisition = models.ForeignKey(PurchaseRequisition, on_delete=models.CASCADE, related_name='rfqs')
    quantity = models.IntegerField()
    deadline = models.DateField()
    specs_file_url = models.CharField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.DRAFT)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rfqs')
    required_by_date = models.DateField(default=2023-5-26)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.rfq_number} - {self.title}"


class RFQVendor(models.Model):
    class StatusChoices(models.TextChoices):
        INVITED = 'invited', 'Invited'
        RESPONDED = 'responded', 'Responded'
        DECLINED = 'declined', 'Declined'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name='invited_vendors')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='rfq_invitations')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.INVITED)
    invited_at = models.DateTimeField(auto_now_add=True)


class Quotation(models.Model):
    class StatusChoices(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        SELECTED = 'selected', 'Selected'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation_number = models.CharField(max_length=20, unique=True)
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name='quotations')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='quotations')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_days = models.IntegerField()
    notes = models.TextField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.SUBMITTED)
    submitted_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quotation_number} - {self.vendor.name}"


# ==========================================
# 3. SELECTION & APPROVAL
# ==========================================

class VendorSelection(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING_APPROVAL = 'pending_approval', 'Pending Approval'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name='vendor_selections')
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='vendor_selections')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='selections')
    selection_reason = models.TextField()
    selected_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='selections')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING_APPROVAL)
    selected_at = models.DateTimeField(auto_now_add=True)


class Approval(models.Model):
    class ApprovalTypeChoices(models.TextChoices):
        RFQ='rfq','RFQ'
        VENDOR_SELECTION = 'vendor_selection', 'Vendor Selection'

    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    approval_number = models.CharField(max_length=20)
    approval_type = models.CharField(max_length=30, choices=ApprovalTypeChoices.choices)
    reference_id = models.UUIDField()
    reference_type = models.CharField(max_length=50)
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approvals')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    remarks = models.TextField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)


# ==========================================
# 4. ORDERS & INVOICES
# ==========================================

class PurchaseOrder(models.Model):
    class StatusChoices(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        GENERATED = 'generated', 'Generated'
        ACKNOWLEDGED = 'acknowledged', 'Acknowledged'
        DELIVERED = 'delivered', 'Delivered'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    po_number = models.CharField(max_length=20, unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='purchase_orders')
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='purchase_orders')
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name='purchase_orders')
    delivery_address = models.TextField()
    terms_and_conditions = models.TextField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_value = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.DRAFT)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_pos')
    generated_at = models.DateTimeField(null=True, blank=True)
    expected_delivery_date = models.DateField()
    pdf_url = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.po_number} - {self.vendor.name}"


class POItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)


class Invoice(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=20, unique=True)
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='invoices')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='invoices')
    invoice_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    file_url = models.CharField(max_length=500)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_invoices')
    verified_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_number} - {self.vendor.name}"


class InvoiceItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=200)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)


# ==========================================
# 5. SYSTEM & AUDIT
# ==========================================

class ActivityLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.TextField()
    entity_type = models.CharField(max_length=50)
    entity_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    class TypeChoices(models.TextChoices):
        URGENT = 'urgent', 'Urgent'
        WARNING = 'warning', 'Warning'
        INFO = 'info', 'Info'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=10, choices=TypeChoices.choices, default=TypeChoices.INFO)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_entity_type = models.CharField(max_length=50, null=True, blank=True)
    related_entity_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
