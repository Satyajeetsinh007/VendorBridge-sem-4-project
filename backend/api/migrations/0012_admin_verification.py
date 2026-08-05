from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds admin verification fields:
    - User: is_admin, verification_status, rejection_reason
    - Vendor: verification_status, rejection_reason
    Existing records default to 'approved' so seeded data keeps working.
    """

    dependencies = [
        ('api', '0011_merge_auth_and_invoice_updates'),
    ]

    operations = [
        # ── User fields ─────────────────────────────────────────────────
        migrations.AddField(
            model_name='user',
            name='is_admin',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='verification_status',
            field=models.CharField(
                choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
                default='approved',  # existing rows stay working
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='rejection_reason',
            field=models.TextField(blank=True, null=True),
        ),

        # ── Vendor fields ────────────────────────────────────────────────
        migrations.AddField(
            model_name='vendor',
            name='verification_status',
            field=models.CharField(
                choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
                default='approved',  # existing rows stay working
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='vendor',
            name='rejection_reason',
            field=models.TextField(blank=True, null=True),
        ),
    ]
