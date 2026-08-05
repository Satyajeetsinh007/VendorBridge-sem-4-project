from django.db import migrations


class Migration(migrations.Migration):
    """
    Merge migration to resolve the two parallel leaf nodes:
      - 0009_alter_purchaseorder_status -> 0010_remove_invoice_verified_at_and_more
      - 0009_user_password_vendor_password
    Both were branched from 0008. This migration joins them into a single leaf.
    """

    dependencies = [
        ('api', '0009_user_password_vendor_password'),
        ('api', '0010_remove_invoice_verified_at_and_more'),
    ]

    operations = [
    ]
